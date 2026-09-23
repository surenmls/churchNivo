import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { churchResolverMiddleware, requireResolvedChurch } from '../middleware/churchResolver.js';
import { sendContactEmail } from '../services/email.js';
import { contactAdminEmail, contactConfirmationEmail } from '../services/emailTemplates.js';
import { env } from '../config/env.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages. Please try again later.' },
});

router.post(
  '/platform',
  contactLimiter,
  [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().notEmpty().isLength({ max: 5000 }),
    body('subject').optional().trim().isLength({ max: 255 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, message, subject } = req.body;
      const subjectLine = subject || 'Platform inquiry';

      const result = await query(
        `INSERT INTO contact_messages (church_id, name, email, subject, message)
         VALUES (NULL, $1, $2, $3, $4) RETURNING id`,
        [name, email, subjectLine, message]
      );

      const adminHtml = contactAdminEmail({ name, email, message, subject: subjectLine });
      const adminResult = await sendContactEmail({
        to: env.platformContactEmail,
        replyTo: email,
        subject: `[ChurchNivo] ${subjectLine}`,
        html: adminHtml,
      });

      const confirmResult = await sendContactEmail({
        to: email,
        subject: 'We received your message — ChurchNivo',
        html: contactConfirmationEmail({ name }),
      });

      res.status(201).json({
        message: adminResult.sent
          ? 'Thank you! Your message has been sent. Check your email for a confirmation.'
          : 'Thank you! Your message has been saved. We will respond soon.',
        id: result.rows[0].id,
        emailSent: adminResult.sent,
        confirmationSent: confirmResult.sent,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/church/:slug',
  contactLimiter,
  churchResolverMiddleware,
  requireResolvedChurch,
  [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().notEmpty().isLength({ max: 5000 }),
    body('subject').optional().trim().isLength({ max: 255 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const church = req.resolvedChurch;
      const { name, email, message, subject } = req.body;
      const subjectLine = subject || `Message for ${church.name}`;

      const result = await query(
        `INSERT INTO contact_messages (church_id, name, email, subject, message)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [church.id, name, email, subjectLine, message]
      );

      const recipient = church.contact_email || env.platformContactEmail;

      const adminResult = await sendContactEmail({
        to: recipient,
        replyTo: email,
        subject: `[${church.name}] New contact from ${name}`,
        html: contactAdminEmail({
          churchName: church.name,
          name,
          email,
          message,
          subject: subjectLine,
        }),
      });

      const confirmResult = await sendContactEmail({
        to: email,
        subject: `We received your message — ${church.name}`,
        html: contactConfirmationEmail({ name, churchName: church.name }),
      });

      res.status(201).json({
        message: adminResult.sent
          ? 'Thank you! Your message has been sent to the church. Check your email for confirmation.'
          : 'Thank you! Your message has been saved. The church will respond soon.',
        id: result.rows[0].id,
        emailSent: adminResult.sent,
        confirmationSent: confirmResult.sent,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/church/:churchId/messages',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.churchId, 10);
      if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        `SELECT id, name, email, subject, message, is_read, created_at
         FROM contact_messages WHERE church_id = $1
         ORDER BY created_at DESC LIMIT 100`,
        [churchId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/messages/:id/read',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const msg = await query('SELECT church_id FROM contact_messages WHERE id = $1', [id]);
      if (msg.rows.length === 0) return res.status(404).json({ error: 'Message not found' });

      if (req.user.role === 'church_admin' && req.user.church_id !== msg.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await query('UPDATE contact_messages SET is_read = true WHERE id = $1', [id]);
      res.json({ message: 'Marked as read' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
