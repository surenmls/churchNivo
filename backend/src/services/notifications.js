import webpush from 'web-push';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { sendContactEmail } from './email.js';
import { sendSms, isSmsConfigured } from './sms.js';

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return Boolean(env.vapid.publicKey && env.vapid.privateKey);
  if (env.vapid.publicKey && env.vapid.privateKey) {
    webpush.setVapidDetails(env.vapid.subject, env.vapid.publicKey, env.vapid.privateKey);
    vapidConfigured = true;
    return true;
  }
  return false;
}

export function getVapidPublicKey() {
  return env.vapid.publicKey || null;
}

async function logNotification({ churchId, subscriberId, channel, type, subject, status, error }) {
  await query(
    `INSERT INTO notification_log (church_id, subscriber_id, channel, notification_type, subject, status, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [churchId, subscriberId || null, channel, type, subject || null, status, error || null]
  );
}

async function getSettings(churchId) {
  const result = await query(
    'SELECT * FROM church_notification_settings WHERE church_id = $1',
    [churchId]
  );
  if (result.rows.length === 0) {
    await query('INSERT INTO church_notification_settings (church_id) VALUES ($1) ON CONFLICT DO NOTHING', [churchId]);
    const again = await query('SELECT * FROM church_notification_settings WHERE church_id = $1', [churchId]);
    return again.rows[0];
  }
  return result.rows[0];
}

function topicField(type) {
  const map = {
    announcement: 'notify_announcements',
    media: 'notify_media',
    gallery: 'notify_gallery',
    event: 'notify_events',
    event_reminder: 'notify_events',
    weekly_digest: 'notify_events',
  };
  return map[type] || 'notify_announcements';
}

async function getSubscribersForTopic(churchId, type) {
  const field = topicField(type);
  const result = await query(
    `SELECT * FROM church_subscribers
     WHERE church_id = $1 AND status = 'active' AND ${field} = true`,
    [churchId]
  );
  return result.rows;
}

export async function ensureNotificationSettings(churchId) {
  await query(
    'INSERT INTO church_notification_settings (church_id) VALUES ($1) ON CONFLICT (church_id) DO NOTHING',
    [churchId]
  );
}

export async function notifyContentPublished(churchId, type, { title, body, url }) {
  const settings = await getSettings(churchId);
  const settingKey = {
    announcement: 'notify_on_announcement',
    media: 'notify_on_media',
    gallery: 'notify_on_gallery',
  }[type];

  if (settingKey && !settings[settingKey]) return { skipped: true };

  const churchResult = await query('SELECT name, slug FROM churches WHERE id = $1', [churchId]);
  if (churchResult.rows.length === 0) return;
  const church = churchResult.rows[0];

  const subject = type === 'announcement'
    ? `New announcement: ${title}`
    : type === 'media'
      ? `New media: ${title}`
      : `New gallery album: ${title}`;

  const html = `
    <h2>${church.name}</h2>
    <p><strong>${subject}</strong></p>
    ${body ? `<p>${body}</p>` : ''}
    <p><a href="${url}">View on our website</a></p>
    <p style="color:#888;font-size:12px;">You subscribed to updates from ${church.name}.</p>
  `;

  notifySubscribers(churchId, type, { subject, html, text: `${subject}\n${url}`, url }).catch(console.error);
}

export async function notifySubscribers(churchId, type, { subject, html, text, url }) {
  const subscribers = await getSubscribersForTopic(churchId, type);

  for (const sub of subscribers) {
    if (sub.email_opt_in && sub.email) {
      try {
        const result = await sendContactEmail({ to: sub.email, subject, html });
        await logNotification({
          churchId,
          subscriberId: sub.id,
          channel: 'email',
          type,
          subject,
          status: result.sent ? 'sent' : 'skipped',
          error: result.reason,
        });
      } catch (err) {
        await logNotification({
          churchId,
          subscriberId: sub.id,
          channel: 'email',
          type,
          subject,
          status: 'failed',
          error: err.message,
        });
      }
    }

    if (sub.sms_opt_in && sub.phone && sub.sms_verified_at && isSmsConfigured()) {
      try {
        await sendSms(sub.phone, text || subject);
        await logNotification({ churchId, subscriberId: sub.id, channel: 'sms', type, subject, status: 'sent' });
      } catch (err) {
        await logNotification({
          churchId,
          subscriberId: sub.id,
          channel: 'sms',
          type,
          subject,
          status: 'failed',
          error: err.message,
        });
      }
    }

    if (sub.push_opt_in && configureVapid()) {
      const pushRows = await query(
        'SELECT * FROM push_subscriptions WHERE church_id = $1 AND (subscriber_id = $2 OR subscriber_id IS NULL)',
        [churchId, sub.id]
      );
      for (const push of pushRows.rows) {
        try {
          await webpush.sendNotification(
            { endpoint: push.endpoint, keys: { p256dh: push.p256dh, auth: push.auth } },
            JSON.stringify({ title: subject, body: text || subject, url })
          );
          await logNotification({ churchId, subscriberId: sub.id, channel: 'push', type, subject, status: 'sent' });
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await query('DELETE FROM push_subscriptions WHERE id = $1', [push.id]);
          }
          await logNotification({
            churchId,
            subscriberId: sub.id,
            channel: 'push',
            type,
            subject,
            status: 'failed',
            error: err.message,
          });
        }
      }
    }
  }
}

export async function sendWeeklyDigest(churchId) {
  const settings = await getSettings(churchId);
  if (!settings.weekly_digest_enabled) return;

  const churchResult = await query('SELECT name, slug FROM churches WHERE id = $1', [churchId]);
  if (churchResult.rows.length === 0) return;
  const church = churchResult.rows[0];
  const baseUrl = env.frontendUrl;

  const [announcements, events, media] = await Promise.all([
    query(
      `SELECT title FROM announcements WHERE church_id = $1 AND is_approved = true
       AND published_at > NOW() - INTERVAL '7 days' ORDER BY published_at DESC LIMIT 3`,
      [churchId]
    ),
    query(
      `SELECT title, COALESCE(event_at, date) AS date FROM events
       WHERE church_id = $1 AND is_approved = true AND is_active = true
       AND COALESCE(event_at, date) >= NOW()
       AND COALESCE(event_at, date) < NOW() + INTERVAL '7 days'
       ORDER BY COALESCE(event_at, date) ASC LIMIT 5`,
      [churchId]
    ),
    query(
      `SELECT title FROM media WHERE church_id = $1 AND is_approved = true AND is_active = true
       AND created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 3`,
      [churchId]
    ),
  ]);

  if (announcements.rows.length === 0 && events.rows.length === 0 && media.rows.length === 0) return;

  const lines = [`This week at ${church.name}`, ''];
  if (events.rows.length) {
    lines.push('Upcoming events:');
    events.rows.forEach((e) => lines.push(`• ${e.title} — ${new Date(e.date).toLocaleString()}`));
    lines.push('');
  }
  if (announcements.rows.length) {
    lines.push('Announcements:');
    announcements.rows.forEach((a) => lines.push(`• ${a.title}`));
    lines.push('');
  }
  if (media.rows.length) {
    lines.push('New media:');
    media.rows.forEach((m) => lines.push(`• ${m.title}`));
  }

  const url = `${baseUrl}/church/${church.slug}`;
  const subject = `This week at ${church.name}`;
  const html = `
    <h2>This week at ${church.name}</h2>
    ${events.rows.length ? `<h3>Upcoming Events</h3><ul>${events.rows.map((e) => `<li>${e.title} — ${new Date(e.date).toLocaleString()}</li>`).join('')}</ul>` : ''}
    ${announcements.rows.length ? `<h3>Announcements</h3><ul>${announcements.rows.map((a) => `<li>${a.title}</li>`).join('')}</ul>` : ''}
    ${media.rows.length ? `<h3>New Media</h3><ul>${media.rows.map((m) => `<li>${m.title}</li>`).join('')}</ul>` : ''}
    <p><a href="${url}">Visit our page</a></p>
  `;

  await notifySubscribers(churchId, 'weekly_digest', { subject, html, text: lines.join('\n'), url });
  await query(
    'UPDATE church_notification_settings SET last_weekly_digest_at = NOW() WHERE church_id = $1',
    [churchId]
  );
}

export async function processEventReminders() {
  const churches = await query('SELECT id FROM churches WHERE is_active = true');
  for (const { id: churchId } of churches.rows) {
    const settings = await getSettings(churchId);
    const churchResult = await query('SELECT name, slug FROM churches WHERE id = $1', [churchId]);
    if (churchResult.rows.length === 0) continue;
    const church = churchResult.rows[0];
    const baseUrl = env.frontendUrl;

    if (settings.event_reminder_24h) {
      const events24 = await query(
        `SELECT e.* FROM events e
         WHERE e.church_id = $1 AND e.is_approved = true AND e.is_active = true
         AND COALESCE(e.event_at, e.date) BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
         AND NOT EXISTS (SELECT 1 FROM event_reminder_log r WHERE r.event_id = e.id AND r.reminder_type = '24h')`,
        [churchId]
      );
      for (const event of events24.rows) {
        const url = `${baseUrl}/church/${church.slug}/events`;
        const subject = `Reminder: ${event.title} tomorrow`;
        const when = new Date(event.event_at || event.date).toLocaleString();
        await notifySubscribers(churchId, 'event_reminder', {
          subject,
          html: `<p><strong>${event.title}</strong> is tomorrow at ${when}.</p><p><a href="${url}">View events</a></p>`,
          text: `${subject} — ${when}\n${url}`,
          url,
        });
        await query(
          'INSERT INTO event_reminder_log (event_id, reminder_type) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [event.id, '24h']
        );
      }
    }

    if (settings.event_reminder_1h) {
      const events1 = await query(
        `SELECT e.* FROM events e
         WHERE e.church_id = $1 AND e.is_approved = true AND e.is_active = true
         AND COALESCE(e.event_at, e.date) BETWEEN NOW() + INTERVAL '45 minutes' AND NOW() + INTERVAL '75 minutes'
         AND NOT EXISTS (SELECT 1 FROM event_reminder_log r WHERE r.event_id = e.id AND r.reminder_type = '1h')`,
        [churchId]
      );
      for (const event of events1.rows) {
        const url = `${baseUrl}/church/${church.slug}/events`;
        const subject = `Starting soon: ${event.title}`;
        const when = new Date(event.event_at || event.date).toLocaleString();
        await notifySubscribers(churchId, 'event_reminder', {
          subject,
          html: `<p><strong>${event.title}</strong> starts in about 1 hour (${when}).</p><p><a href="${url}">View events</a></p>`,
          text: `${subject} — ${when}\n${url}`,
          url,
        });
        await query(
          'INSERT INTO event_reminder_log (event_id, reminder_type) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [event.id, '1h']
        );
      }
    }
  }
}

export async function processWeeklyDigests() {
  const day = new Date().getDay();
  const churches = await query(
    `SELECT church_id FROM church_notification_settings
     WHERE weekly_digest_enabled = true AND weekly_digest_day = $1
     AND (last_weekly_digest_at IS NULL OR last_weekly_digest_at < NOW() - INTERVAL '6 days')`,
    [day]
  );
  for (const { church_id } of churches.rows) {
    await sendWeeklyDigest(church_id);
  }
}

export function generateTokens() {
  return { invite: uuidv4(), unsubscribe: uuidv4() };
}

export async function savePushSubscription({ churchId, subscriberId, subscription }) {
  const { endpoint, keys } = subscription;
  await query(
    `INSERT INTO push_subscriptions (church_id, subscriber_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE SET subscriber_id = $2, p256dh = $4, auth = $5`,
    [churchId, subscriberId || null, endpoint, keys.p256dh, keys.auth]
  );
}
