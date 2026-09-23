import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.env.PORT || '1990', 10);

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/church_platform',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:1989',
  allowedOrigins: (process.env.FRONTEND_URL || 'http://localhost:1989')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  apiPublicUrl: process.env.API_PUBLIC_URL || `http://localhost:${port}`,
  baseDomain: process.env.BASE_DOMAIN || 'localhost',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  uploadMaxMb: parseInt(process.env.UPLOAD_MAX_MB || '5', 10),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || (process.env.SMTP_USER
      ? `ChurchNivo <${process.env.SMTP_USER}>`
      : 'ChurchNivo <noreply@churchnivo.com>'),
  },
  platformContactEmail: process.env.PLATFORM_CONTACT_EMAIL || 'support@churchnivo.com',
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@churchnivo.com',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
};
