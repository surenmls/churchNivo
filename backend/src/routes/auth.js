import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const result = await query(
        'SELECT id, name, email, password, role, church_id FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          church_id: user.church_id,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/register',
  [
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['user']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const role = 'user';

      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const result = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, church_id',
        [name, email, hashed, role]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
