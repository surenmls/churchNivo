import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { churchResolverMiddleware, requireResolvedChurch } from '../middleware/churchResolver.js';
import { sendContactEmail } from '../services/email.js';
import {
  subscribeWelcomeEmail,
  subscribeAdminNotifyEmail,
} from '../services/emailTemplates.js';
import { generateTokens, ensureNotificationSettings } from '../services/notifications.js';
import { env } from '../config/env.js';

const router = Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
});

router.post(
  '/church/:slug',
  subscribeLimiter,
  churchResolverMiddleware,
  requireResolvedChurch,
  [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('consent').equals('true').withMessage('Consent is required'),
    body('email_opt_in').optional().isBoolean(),
    body('sms_opt_in').optional().isBoolean(),
    body('push_opt_in').optional().isBoolean(),
    body('notify_events').optional().isBoolean(),
    body('notify_announcements').optional().isBoolean(),
    body('notify_media').optional().isBoolean(),
    body('notify_gallery').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const church = req.resolvedChurch;
      const {
        name, email, phone, email_opt_in = true, sms_opt_in = false, push_opt_in = false,
        notify_events = true, notify_announcements = true, notify_media = true, notify_gallery = true,
      } = req.body;

      if (sms_opt_in && !phone) {
        return res.status(400).json({ error: 'Phone number required for SMS notifications' });
      }

      const unsubscribeToken = uuidv4();
      const smsVerified = sms_opt_in ? new Date() : null;

      const result = await query(
        `INSERT INTO church_subscribers (
          church_id, name, email, phone, status, source, email_opt_in, sms_opt_in, push_opt_in,
          notify_events, notify_announcements, notify_media, notify_gallery,
          unsubscribe_token, sms_verified_at
        ) VALUES ($1,$2,$3,$4,'active','self',$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (church_id, email) DO UPDATE SET
          name = $2, phone = $3, status = 'active',
          email_opt_in = $5, sms_opt_in = $6, push_opt_in = $7,
          notify_events = $8, notify_announcements = $9, notify_media = $10, notify_gallery = $11,
          sms_verified_at = CASE WHEN $6 THEN COALESCE(church_subscribers.sms_verified_at, $13) ELSE NULL END,
          updated_at = NOW()
        RETURNING *`,
        [
          church.id, name, email, phone || null, email_opt_in, sms_opt_in, push_opt_in,
          notify_events, notify_announcements, notify_media, notify_gallery,
          unsubscribeToken, smsVerified,
        ]
      );

      await ensureNotificationSettings(church.id);

      const subscriber = result.rows[0];
      const prefs = [
        notify_events && 'Events',
        notify_announcements && 'Announcements',
        notify_media && 'Media',
        notify_gallery && 'Gallery',
      ].filter(Boolean).join(', ');

      const channels = [
        email_opt_in && 'Email',
        sms_opt_in && 'SMS',
        push_opt_in && 'Push',
      ].filter(Boolean).join(', ');

      let welcomeSent = false;
      if (email_opt_in) {
        const welcome = await sendContactEmail({
          to: email,
          subject: `Welcome to ${church.name} updates`,
          html: subscribeWelcomeEmail({
            name,
            churchName: church.name,
            churchSlug: church.slug,
            unsubscribeToken: subscriber.unsubscribe_token,
          }),
        });
        welcomeSent = welcome.sent;
      }

      const adminEmail = church.contact_email || env.platformContactEmail;
      await sendContactEmail({
        to: adminEmail,
        subject: `[${church.name}] New subscriber: ${name}`,
        html: subscribeAdminNotifyEmail({
          churchName: church.name,
          name,
          email,
          phone,
          preferences: `${prefs || 'All topics'} via ${channels || 'Email'}`,
        }),
      });

      res.status(201).json({
        message: welcomeSent
          ? 'You are subscribed! Check your email for a welcome message.'
          : 'You are subscribed to church updates.',
        subscriber: { id: subscriber.id, email: subscriber.email },
        emailSent: welcomeSent,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/invite/:token', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT s.*, c.name as church_name, c.slug as church_slug
       FROM church_subscribers s JOIN churches c ON c.id = s.church_id
       WHERE s.invite_token = $1`,
      [req.params.token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid invite link' });
    const sub = result.rows[0];
    res.json({
      name: sub.name,
      email: sub.email,
      church_name: sub.church_name,
      church_slug: sub.church_slug,
      status: sub.status,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/invite/:token/complete',
  subscribeLimiter,
  [
    body('consent').equals('true'),
    body('email_opt_in').optional().isBoolean(),
    body('sms_opt_in').optional().isBoolean(),
    body('push_opt_in').optional().isBoolean(),
    body('phone').optional().trim(),
    body('notify_events').optional().isBoolean(),
    body('notify_announcements').optional().isBoolean(),
    body('notify_media').optional().isBoolean(),
    body('notify_gallery').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT * FROM church_subscribers WHERE invite_token = $1', [req.params.token]);
      if (existing.rows.length === 0) return res.status(404).json({ error: 'Invalid invite link' });

      const sub = existing.rows[0];
      const { email_opt_in = true, sms_opt_in = false, push_opt_in = false, phone,
        notify_events = true, notify_announcements = true, notify_media = true, notify_gallery = true } = req.body;

      const result = await query(
        `UPDATE church_subscribers SET status = 'active', email_opt_in = $1, sms_opt_in = $2, push_opt_in = $3,
         phone = COALESCE($4, phone), notify_events = $5, notify_announcements = $6, notify_media = $7,
         notify_gallery = $8, sms_verified_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
         invite_token = NULL, updated_at = NOW()
         WHERE id = $9 RETURNING *`,
        [email_opt_in, sms_opt_in, push_opt_in, phone, notify_events, notify_announcements, notify_media, notify_gallery, sub.id]
      );

      res.json({ message: 'Subscription confirmed.', subscriber: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/unsubscribe/:token', async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE church_subscribers SET status = 'unsubscribed', email_opt_in = false, sms_opt_in = false,
       push_opt_in = false, updated_at = NOW()
       WHERE unsubscribe_token = $1 RETURNING id`,
      [req.params.token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid unsubscribe link' });
    res.json({ message: 'You have been unsubscribed.' });
  } catch (err) {
    next(err);
  }
});

router.get('/church/:churchId/list', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      `SELECT id, name, email, phone, status, source, email_opt_in, sms_opt_in, push_opt_in,
              notify_events, notify_announcements, notify_media, notify_gallery, created_at
       FROM church_subscribers WHERE church_id = $1 ORDER BY created_at DESC`,
      [churchId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/church/:churchId/invite',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.churchId, 10);
      if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { name, email, phone } = req.body;
      const inviteToken = uuidv4();
      const unsubscribeToken = uuidv4();

      const church = await query('SELECT name, slug FROM churches WHERE id = $1', [churchId]);
      if (church.rows.length === 0) return res.status(404).json({ error: 'Church not found' });

      const result = await query(
        `INSERT INTO church_subscribers (church_id, name, email, phone, status, source, invite_token, unsubscribe_token)
         VALUES ($1,$2,$3,$4,'pending','admin',$5,$6)
         ON CONFLICT (church_id, email) DO UPDATE SET name = $2, phone = $3, status = 'pending',
           source = 'admin', invite_token = $5, updated_at = NOW()
         RETURNING *`,
        [churchId, name, email, phone || null, inviteToken, unsubscribeToken]
      );

      const inviteUrl = `${env.frontendUrl}/church/${church.rows[0].slug}/subscribe?token=${inviteToken}`;

      await sendContactEmail({
        to: email,
        subject: `You're invited to get updates from ${church.rows[0].name}`,
        html: `
          <p>Hi ${name},</p>
          <p>${church.rows[0].name} would like to send you updates about events, announcements, and more.</p>
          <p><a href="${inviteUrl}">Complete your subscription preferences</a></p>
          <p style="color:#888;font-size:12px;">If you did not expect this, you can ignore this email.</p>
        `,
      });

      res.status(201).json({ message: 'Invite sent.', invite_url: inviteUrl, subscriber: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query('SELECT church_id FROM church_subscribers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await query('DELETE FROM church_subscribers WHERE id = $1', [id]);
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
