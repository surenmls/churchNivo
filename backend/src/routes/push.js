import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { getVapidPublicKey, savePushSubscription } from '../services/notifications.js';

const router = Router();

router.get('/vapid-public-key', (req, res) => {
  const key = getVapidPublicKey();
  if (!key) return res.json({ configured: false, publicKey: null });
  res.json({ configured: true, publicKey: key });
});

router.post(
  '/subscribe',
  [
    body('church_id').isInt(),
    body('subscriber_id').optional().isInt(),
    body('subscription.endpoint').notEmpty(),
    body('subscription.keys.p256dh').notEmpty(),
    body('subscription.keys.auth').notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, subscriber_id, subscription } = req.body;
      await savePushSubscription({ churchId: church_id, subscriberId: subscriber_id, subscription });
      if (subscriber_id) {
        await query('UPDATE church_subscribers SET push_opt_in = true WHERE id = $1', [subscriber_id]);
      }
      res.status(201).json({ message: 'Push subscription saved' });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ message: 'Unsubscribed from push' });
  } catch (err) {
    next(err);
  }
});

export default router;
