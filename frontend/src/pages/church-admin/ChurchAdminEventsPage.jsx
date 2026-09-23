import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import {
  toDatetimeLocal,
  fromDatetimeLocal,
  getEventStatus,
  formatEventWindow,
  formatEventOccurrence,
  getEventOccurrence,
  getPlatformListingStatus,
} from '../../utils/eventDates';

function emptyForm() {
  const now = toDatetimeLocal(new Date());
  return {
    title: '',
    description: '',
    event_at: now,
    starts_at: now,
    ends_at: '',
  };
}

export default function ChurchAdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user?.church_id) return;
    api
      .get(`/events/church/${user.church_id}?approved=false`)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      event_at: toDatetimeLocal(getEventOccurrence(item)),
      starts_at: toDatetimeLocal(item.starts_at || item.created_at),
      ends_at: toDatetimeLocal(item.ends_at),
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_at: fromDatetimeLocal(form.event_at) || new Date().toISOString(),
        starts_at: fromDatetimeLocal(form.starts_at) || new Date().toISOString(),
        ends_at: fromDatetimeLocal(form.ends_at),
      };

      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
      } else {
        await api.post('/events', {
          ...payload,
          church_id: user.church_id,
        });
      }

      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    const next = !(item.is_active ?? true);
    const label = next ? 'activate' : 'deactivate';
    if (!confirm(`${next ? 'Show' : 'Hide'} "${item.title}" on your public site?`)) return;

    try {
      await api.patch(`/events/${item.id}/active`, { is_active: next });
      load();
    } catch (err) {
      alert(err.message || `Failed to ${label} event`);
    }
  };

  const handlePlatformRequest = async (item) => {
    if (!confirm(`Request to list "${item.title}" on the ChurchNivo home page and events directory?`)) return;
    try {
      await api.patch(`/events/${item.id}/platform-request`, {});
      load();
    } catch (err) {
      alert(err.message || 'Failed to submit platform listing request');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await api.delete(`/events/${id}`);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Publish on your church site; optionally request listing on the main ChurchNivo homepage"
        action={
          <button
            onClick={showForm && !editingId ? resetForm : openCreate}
            className="btn-admin bg-emerald-600 hover:bg-emerald-700"
          >
            {showForm ? 'Cancel' : '+ Add Event'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit event' : 'New event'}
          </h2>

          <input
            className="input-field"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input-field"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Event date & time</label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.event_at}
              onChange={(e) => setForm({ ...form, event_at: e.target.value })}
              required
            />
            <p className="mt-1 text-xs text-gray-500">When the event actually takes place.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Show on site from</label>
              <input
                className="input-field"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Show on site until <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                className="input-field"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Start and end dates control how long the event appears on your website. The event date is shown to visitors as when it happens.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-admin bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Event'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No events yet.</div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getEventStatus(event);
            const platformStatus = getPlatformListingStatus(event);
            const active = event.is_active ?? true;
            const canRequestPlatform =
              active &&
              (event.is_active ?? true) &&
              event.is_approved !== false &&
              !event.platform_approved &&
              !event.platform_requested;

            return (
              <div
                key={event.id}
                className={`admin-card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
                  !active ? 'opacity-75' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    {platformStatus && (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${platformStatus.className}`}>
                        {platformStatus.label}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Occurs:</span> {formatEventOccurrence(event)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{formatEventWindow(event)}</p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    Edit
                  </button>
                  {canRequestPlatform && (
                    <button
                      type="button"
                      onClick={() => handlePlatformRequest(event)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      List on main site
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(event)}
                    className={`text-sm font-medium ${
                      active ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    {active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
