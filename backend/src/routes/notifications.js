import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ensureNotificationSettings } from '../services/notifications.js';

const router = Router();

router.get('/settings/:churchId', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await ensureNotificationSettings(churchId);
    const result = await query('SELECT * FROM church_notification_settings WHERE church_id = $1', [churchId]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put(
  '/settings/:churchId',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  validate,
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.churchId, 10);
      if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const {
        notify_on_announcement, notify_on_media, notify_on_gallery,
        event_reminder_24h, event_reminder_1h,
        weekly_digest_enabled, weekly_digest_day,
      } = req.body;

      await ensureNotificationSettings(churchId);
      const result = await query(
        `UPDATE church_notification_settings SET
          notify_on_announcement = COALESCE($1, notify_on_announcement),
          notify_on_media = COALESCE($2, notify_on_media),
          notify_on_gallery = COALESCE($3, notify_on_gallery),
          event_reminder_24h = COALESCE($4, event_reminder_24h),
          event_reminder_1h = COALESCE($5, event_reminder_1h),
          weekly_digest_enabled = COALESCE($6, weekly_digest_enabled),
          weekly_digest_day = COALESCE($7, weekly_digest_day),
          updated_at = NOW()
         WHERE church_id = $8 RETURNING *`,
        [
          notify_on_announcement, notify_on_media, notify_on_gallery,
          event_reminder_24h, event_reminder_1h,
          weekly_digest_enabled, weekly_digest_day,
          churchId,
        ]
      );
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/log/:churchId', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      `SELECT id, channel, notification_type, subject, status, error_message, created_at
       FROM notification_log WHERE church_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [churchId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/stats/:churchId', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const [subs, logs] = await Promise.all([
      query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'active')::int AS active,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
          COUNT(*) FILTER (WHERE email_opt_in)::int AS email_subscribers,
          COUNT(*) FILTER (WHERE sms_opt_in)::int AS sms_subscribers,
          COUNT(*) FILTER (WHERE push_opt_in)::int AS push_subscribers
         FROM church_subscribers WHERE church_id = $1`,
        [churchId]
      ),
      query(
        `SELECT channel, status, COUNT(*)::int AS count
         FROM notification_log WHERE church_id = $1 AND created_at > NOW() - INTERVAL '30 days'
         GROUP BY channel, status`,
        [churchId]
      ),
    ]);
    res.json({ subscribers: subs.rows[0], notifications_30d: logs.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
