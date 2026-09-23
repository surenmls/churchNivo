import { useState } from 'react';
import { api, ApiError } from '../api/client';

export default function ContactForm({
  endpoint,
  submitLabel = 'Send Message',
  buttonClassName,
  buttonStyle,
  showSubject = false,
}) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        message: form.message,
      };
      if (showSubject) payload.subject = form.subject;

      const data = await api.post(endpoint, payload);
      setSuccess(
        data.emailSent
          ? (data.message || 'Message sent! Check your email for confirmation.')
          : (data.message || 'Message saved successfully.')
      );
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <input
        className="input-field"
        placeholder="Your Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        className="input-field"
        type="email"
        placeholder="Your Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      {showSubject && (
        <input
          className="input-field"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      )}
      <textarea
        className="input-field resize-none"
        rows={4}
        placeholder="Your Message"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={buttonClassName || 'btn-primary w-full'}
        style={buttonStyle}
      >
        {loading ? 'Sending...' : submitLabel}
      </button>
    </form>
  );
}
