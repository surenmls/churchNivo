import { env } from '../config/env.js';

export function isSmsConfigured() {
  return Boolean(env.twilio.accountSid && env.twilio.authToken && env.twilio.phoneNumber);
}

export async function sendSms(to, body) {
  if (!isSmsConfigured()) {
    console.log('[sms] Twilio not configured — message logged only');
    return { sent: false, reason: 'sms_not_configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`;
  const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: env.twilio.phoneNumber,
      Body: body,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'SMS send failed');
  }

  return { sent: true };
}
