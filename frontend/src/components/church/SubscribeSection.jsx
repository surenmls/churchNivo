import { useState } from 'react';
import { api } from '../../api/client';
import { subscribeToPush } from '../../utils/push';

export default function SubscribeSection({ church, themeColor }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false,
    email_opt_in: true,
    sms_opt_in: false,
    push_opt_in: false,
    notify_events: true,
    notify_announcements: true,
    notify_media: true,
    notify_gallery: true,
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriberId, setSubscriberId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) {
      setStatus('Please agree to receive notifications.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const result = await api.post(`/subscribers/church/${church.slug}`, {
        ...form,
        consent: 'true',
      });
      setSubscriberId(result.subscriber?.id);
      const baseStatus = result.emailSent ? 'success-email' : 'success';

      if (form.push_opt_in && result.subscriber?.id) {
        try {
          await subscribeToPush(church.id, result.subscriber.id);
          setStatus(baseStatus);
        } catch {
          setStatus('subscribed-no-push');
        }
      } else {
        setStatus(baseStatus);
      }
    } catch (err) {
      setStatus(err.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success' || status === 'success-email' || status === 'subscribed-no-push') {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <span className="text-3xl">✅</span>
        <h3 className="mt-3 font-display text-xl font-bold text-gray-900">You&apos;re subscribed!</h3>
        <p className="mt-2 text-gray-600">
          You&apos;ll receive updates about events, announcements, and more from {church.name}.
        </p>
        {status === 'success-email' && (
          <p className="mt-2 text-sm text-green-700">Check your inbox for a welcome email.</p>
        )}
        {status === 'subscribed-no-push' && (
          <p className="mt-2 text-sm text-amber-600">Email/SMS enabled. Push notifications could not be enabled in this browser.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h3 className="font-display text-xl font-bold text-gray-900">Stay Connected</h3>
      <p className="mt-2 text-sm text-gray-500">
        Get notified about events, announcements, new media, and gallery updates.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field sm:col-span-2" placeholder="Phone (for SMS, optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Notify me about</p>
          {[
            ['notify_events', 'Events & reminders'],
            ['notify_announcements', 'Announcements'],
            ['notify_media', 'Sermons & media'],
            ['notify_gallery', 'Photo galleries'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Channels</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.email_opt_in} onChange={(e) => setForm({ ...form, email_opt_in: e.target.checked })} />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.sms_opt_in} onChange={(e) => setForm({ ...form, sms_opt_in: e.target.checked })} />
            SMS (requires phone number)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.push_opt_in} onChange={(e) => setForm({ ...form, push_opt_in: e.target.checked })} />
            Browser push notifications
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" required />
          I agree to receive notifications from {church.name}. I can unsubscribe at any time.
        </label>

        {status && status !== 'success' && <p className="text-sm text-red-600">{status}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: themeColor || '#4f46e5' }}
        >
          {loading ? 'Subscribing...' : 'Subscribe to Updates'}
        </button>
      </form>
    </div>
  );
}
