import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.js';
import churchRoutes from './routes/churches.js';
import eventRoutes from './routes/events.js';
import mediaRoutes from './routes/media.js';
import promotionRoutes from './routes/promotions.js';
import pastorRoutes from './routes/pastors.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import announcementRoutes from './routes/announcements.js';
import blogPostRoutes from './routes/blogPosts.js';
import galleryRoutes from './routes/gallery.js';
import storageRoutes from './routes/storage.js';
import searchRoutes from './routes/search.js';
import subscriberRoutes from './routes/subscribers.js';
import pushRoutes from './routes/push.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import { startNotificationScheduler } from './services/scheduler.js';
import { verifyEmailConfig, isEmailConfigured } from './services/email.js';
import { isStorageConfigured, publicObjectUrl } from './services/objectStorage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.isProduction
    ? { directives: { imgSrc: ["'self'", 'data:', 'blob:', ...(env.supabase.url ? [env.supabase.url] : [])] } }
    : false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}
app.use('/uploads', express.static(env.uploadDir));

app.get('/media/*', (req, res) => {
  const objectPath = req.params[0];
  if (!objectPath || objectPath.split('/').includes('..') || !isStorageConfigured()) {
    return res.status(404).end();
  }
  res.set('Cache-Control', 'public, max-age=86400');
  res.redirect(302, publicObjectUrl(objectPath));
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      email: { configured: isEmailConfigured() },
    });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/churches', churchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/pastors', pastorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/blog', blogPostRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

if (env.isProduction) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  res.status(err.status || 500).json({
    error: env.isProduction ? 'Internal server error' : err.message,
  });
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  if (env.isProduction) {
    console.log('Serving frontend from frontend/dist');
  }
  startNotificationScheduler();
  verifyEmailConfig();
});
