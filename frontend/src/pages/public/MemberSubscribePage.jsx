import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { subscribeToPush } from '../../utils/push';

export default function MemberSubscribePage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({
    consent: false,
    email_opt_in: true,
    sms_opt_in: false,
    push_opt_in: false,
    phone: '',
    notify_events: true,
    notify_announcements: true,
    notify_media: true,
    notify_gallery: true,
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get(`/subscribers/invite/${token}`).then(setInvite).catch(() => setError('Invalid or expired invite link.'));
  }, [token]);

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/subscribers/invite/${token}/complete`, { ...form, consent: 'true' });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Failed to complete subscription');
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-gray-500">Use the subscribe form on your church&apos;s page, or open the link from your invite email.</p>
        <Link to={`/church/${slug}`} className="btn-primary mt-6 inline-flex">Go to church page</Link>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="text-4xl">✅</span>
        <h1 className="mt-4 font-display text-2xl font-bold">You&apos;re all set!</h1>
        <p className="mt-2 text-gray-600">Your notification preferences have been saved.</p>
        <Link to={`/church/${invite?.church_slug || slug}`} className="btn-primary mt-6 inline-flex">Visit church page</Link>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-gray-900">Complete your subscription</h1>
      <p className="mt-2 text-gray-600">
        {invite.church_name} invited <strong>{invite.email}</strong> to receive updates.
      </p>

      <form onSubmit={handleComplete} className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <input className="input-field" placeholder="Phone for SMS (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ['notify_events', 'Events'],
            ['notify_announcements', 'Announcements'],
            ['notify_media', 'Media'],
            ['notify_gallery', 'Gallery'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.email_opt_in} onChange={(e) => setForm({ ...form, email_opt_in: e.target.checked })} /> Email</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.sms_opt_in} onChange={(e) => setForm({ ...form, sms_opt_in: e.target.checked })} /> SMS</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.push_opt_in} onChange={(e) => setForm({ ...form, push_opt_in: e.target.checked })} /> Push</label>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" required />
          I agree to receive notifications from {invite.church_name}.
        </label>

        <button type="submit" className="btn-primary w-full">Confirm subscription</button>
      </form>
    </div>
  );
}

export function UnsubscribePage() {
  const { token } = useParams();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.post(`/subscribers/unsubscribe/${token}`).then(() => setDone(true)).catch(() => setError('Invalid unsubscribe link.'));
  }, [token]);

  if (error) return <div className="py-20 text-center text-red-600">{error}</div>;
  if (!done) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Unsubscribed</h1>
      <p className="mt-2 text-gray-600">You will no longer receive notifications from this church.</p>
    </div>
  );
}
