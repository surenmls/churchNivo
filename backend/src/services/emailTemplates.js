import { env } from '../config/env.js';

function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout({ title, body, footer }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:#f9fafb;padding:24px;border-radius:12px 12px 0 0;border:1px solid #e5e7eb;border-bottom:none;">
        <h1 style="margin:0;font-size:20px;color:#111827;">${esc(title)}</h1>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;background:#fff;">
        ${body}
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">${footer || 'Sent via ChurchNivo'}</p>
      </div>
    </div>
  `;
}

export function contactAdminEmail({ churchName, name, email, message, subject }) {
  const title = churchName ? `New message for ${churchName}` : 'New platform contact message';
  return layout({
    title,
    body: `
      <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
      ${subject ? `<p><strong>Subject:</strong> ${esc(subject)}</p>` : ''}
      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;line-height:1.6;">
        ${esc(message).replace(/\n/g, '<br>')}
      </div>
      <p style="margin-top:16px;font-size:13px;color:#6b7280;">Reply directly to this email to respond to ${esc(name)}.</p>
    `,
  });
}

export function contactConfirmationEmail({ name, churchName }) {
  const who = churchName || 'ChurchNivo';
  return layout({
    title: 'We received your message',
    body: `
      <p>Hi ${esc(name)},</p>
      <p>Thank you for contacting <strong>${esc(who)}</strong>. We have received your message and will get back to you as soon as possible.</p>
      <p style="color:#6b7280;font-size:14px;">This is an automated confirmation — please do not reply to this email unless you need to add more information.</p>
    `,
  });
}

export function subscribeWelcomeEmail({ name, churchName, churchSlug, unsubscribeToken }) {
  const unsubscribeUrl = `${env.frontendUrl}/unsubscribe/${unsubscribeToken}`;
  const churchUrl = `${env.frontendUrl}/church/${churchSlug}`;

  return layout({
    title: `Welcome to ${churchName} updates`,
    body: `
      <p>Hi ${esc(name)},</p>
      <p>You are now subscribed to updates from <strong>${esc(churchName)}</strong>.</p>
      <p>You will receive emails about events, announcements, media, and gallery updates based on your preferences.</p>
      <p style="margin-top:20px;">
        <a href="${churchUrl}" style="display:inline-block;background:#059669;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Visit ${esc(churchName)}
        </a>
      </p>
      <p style="margin-top:20px;font-size:13px;color:#6b7280;">
        <a href="${unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a> at any time.
      </p>
    `,
  });
}

export function subscribeAdminNotifyEmail({ churchName, name, email, phone, preferences }) {
  return layout({
    title: `New subscriber — ${churchName}`,
    body: `
      <p><strong>${esc(name)}</strong> subscribed to church updates.</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
      <p style="margin-top:12px;font-size:14px;color:#6b7280;">Preferences: ${esc(preferences)}</p>
    `,
  });
}
