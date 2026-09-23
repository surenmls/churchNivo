import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

export default function ChurchAdminContactPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.church_id) return;
    api
      .get(`/contact/church/${user.church_id}/messages`)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const markRead = async (id) => {
    await api.patch(`/contact/messages/${id}/read`, {});
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        subtitle="Messages sent via your public contact form (emailed to your church contact address)"
      />

      {messages.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">
          No contact messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`admin-card ${!msg.is_read ? 'border-l-4 border-emerald-500' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{msg.name}</p>
                  <a href={`mailto:${msg.email}`} className="text-sm text-emerald-600 hover:underline">
                    {msg.email}
                  </a>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleString()}
                  {!msg.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead(msg.id)}
                      className="ml-3 text-emerald-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              {msg.subject && (
                <p className="mt-2 text-sm font-medium text-gray-700">{msg.subject}</p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
