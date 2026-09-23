import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ChurchAdminNotificationsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.church_id) return;
    Promise.all([
      api.get(`/notifications/settings/${user.church_id}`),
      api.get(`/notifications/stats/${user.church_id}`),
      api.get(`/notifications/log/${user.church_id}`),
    ])
      .then(([s, st, l]) => {
        setSettings(s);
        setStats(st);
        setLogs(l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.put(`/notifications/settings/${user.church_id}`, settings);
      setSettings(updated);
      setMessage('Notification settings saved.');
    } catch (err) {
      setMessage(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Auto-alerts for content and events" />

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${message.includes('saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.subscribers.active}</p>
            <p className="text-xs text-gray-500">Active subscribers</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.subscribers.email_subscribers}</p>
            <p className="text-xs text-gray-500">Email</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.subscribers.sms_subscribers}</p>
            <p className="text-xs text-gray-500">SMS</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.subscribers.push_subscribers}</p>
            <p className="text-xs text-gray-500">Push</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-card space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Auto-notify when content is published</h2>
          <div className="mt-4 space-y-3">
            {[
              ['notify_on_announcement', 'New announcements'],
              ['notify_on_media', 'New media / sermons (after approval)'],
              ['notify_on_gallery', 'New gallery albums (after approval)'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <span className="text-sm">{label}</span>
                <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Event reminders</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm">24 hours before event</span>
              <input type="checkbox" checked={settings.event_reminder_24h} onChange={() => toggle('event_reminder_24h')} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm">1 hour before event</span>
              <input type="checkbox" checked={settings.event_reminder_1h} onChange={() => toggle('event_reminder_1h')} />
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Weekly digest</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm">Send weekly email digest</span>
              <input type="checkbox" checked={settings.weekly_digest_enabled} onChange={() => toggle('weekly_digest_enabled')} />
            </label>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Send on</label>
              <select
                className="input-field w-40"
                value={settings.weekly_digest_day}
                onChange={(e) => setSettings({ ...settings, weekly_digest_day: parseInt(e.target.value, 10) })}
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      <div className="mt-8 admin-card">
        <h2 className="text-lg font-semibold text-gray-900">Recent notifications</h2>
        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No notifications sent yet.</p>
        ) : (
          <div className="mt-4 max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-400">
                  <th className="py-2">When</th>
                  <th className="py-2">Channel</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2 capitalize">{log.channel}</td>
                    <td className="py-2">{log.notification_type}</td>
                    <td className="py-2">
                      <span className={log.status === 'sent' ? 'text-green-600' : log.status === 'failed' ? 'text-red-600' : 'text-gray-500'}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
