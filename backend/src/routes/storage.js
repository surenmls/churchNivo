import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { getChurchStorage, applyPlanTier, reconcileUsage } from '../services/storageQuota.js';
import { PLAN_TIERS } from '../services/plans.js';

const router = Router();

router.get('/plans', (req, res) => {
  res.json(
    Object.entries(PLAN_TIERS).map(([tier, plan]) => ({
      tier,
      label: plan.label,
      max_photos: plan.max_photos,
      max_storage_bytes: plan.max_storage_bytes,
    }))
  );
});

router.get('/church/:churchId', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);

    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const usage = await getChurchStorage(churchId);
    if (!usage) return res.status(404).json({ error: 'Church not found' });

    res.json(usage);
  } catch (err) {
    next(err);
  }
});

router.put(
  '/church/:churchId/plan',
  authMiddleware,
  roleMiddleware('super_admin'),
  [
    body('plan_tier').isIn(['free', 'starter', 'pro']),
    body('max_photos').optional().isInt({ min: 1 }),
    body('max_storage_bytes').optional().isInt({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.churchId, 10);
      const { plan_tier, max_photos, max_storage_bytes } = req.body;

      const usage = await applyPlanTier(churchId, plan_tier, { max_photos, max_storage_bytes });
      if (!usage) return res.status(404).json({ error: 'Church not found' });

      res.json(usage);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/church/:churchId/reconcile',
  authMiddleware,
  roleMiddleware('super_admin'),
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.churchId, 10);
      await reconcileUsage(churchId);
      const usage = await getChurchStorage(churchId);
      res.json(usage);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
