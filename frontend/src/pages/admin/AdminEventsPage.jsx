import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const churches = await api.get('/churches');
      const allEvents = await Promise.all(
        churches.map((c) => api.get(`/events/church/${c.id}?approved=false`))
      );
      const pending = allEvents
        .flat()
        .filter((e) => e.platform_requested && !e.platform_approved)
        .sort((a, b) => new Date(b.platform_requested_at || b.created_at) - new Date(a.platform_requested_at || a.created_at));
      setEvents(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    await api.patch(`/events/${id}/platform-approve`, { platform_approved: true });
    load();
  };

  const handleReject = async (id) => {
    if (!confirm('Decline this platform listing request?')) return;
    await api.patch(`/events/${id}/platform-approve`, { platform_approved: false });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Platform Event Listings"
        subtitle="Approve events for the ChurchNivo homepage and /events directory"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="admin-card py-16 text-center text-gray-500">
          No platform listing requests pending. Church admins can request from their Events page.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="admin-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(event.event_at || event.date).toLocaleString()}
                  {event.platform_requested_at && (
                    <> · Requested {new Date(event.platform_requested_at).toLocaleDateString()}</>
                  )}
                </p>
                {event.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => handleApprove(event.id)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-800"
                >
                  Approve for main site
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(event.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
