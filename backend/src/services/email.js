import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      ...(env.smtp.host.includes('gmail.com') && {
        requireTLS: true,
        tls: { minVersion: 'TLSv1.2' },
      }),
    });
  }

  return transporter;
}

export function isEmailConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export async function verifyEmailConfig() {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const transport = getTransporter();
    await transport.verify();
    console.log(`[email] Gmail/SMTP ready (${env.smtp.user})`);
    return { ok: true };
  } catch (err) {
    console.error('[email] SMTP verification failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

export async function sendContactEmail({ to, subject, html, text, replyTo }) {
  const transport = getTransporter();

  if (!transport) {
    console.log('[email] SMTP not configured — message saved to database only');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    await transport.sendMail({
      from: env.smtp.from,
      to,
      replyTo,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    console.log(`[email] Sent: "${subject}" → ${to}`);
    return { sent: true };
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" → ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}
