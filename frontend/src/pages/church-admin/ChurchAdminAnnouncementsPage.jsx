import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import {
  toDatetimeLocal,
  fromDatetimeLocal,
  getAnnouncementStatus,
  formatAnnouncementWindow,
} from '../../utils/announcementDates';

const ANNOUNCEMENT_IMAGE_HINT =
  'Recommended: 1200 × 675 px (16:9 landscape). JPG or WebP, max 5 MB. Keep text and faces centered.';

function emptyForm() {
  return {
    title: '',
    content: '',
    image: '',
    starts_at: toDatetimeLocal(new Date()),
    expires_at: '',
  };
}

export default function ChurchAdminAnnouncementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user?.church_id) return;
    api
      .get(`/announcements/church/${user.church_id}?approved=false`)
      .then(setItems)
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
      content: item.content || '',
      image: item.image || '',
      starts_at: toDatetimeLocal(item.starts_at || item.published_at),
      expires_at: toDatetimeLocal(item.expires_at),
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCopy = (item) => {
    setForm({
      title: item.title || '',
      content: item.content || '',
      image: item.image || '',
      starts_at: toDatetimeLocal(new Date()),
      expires_at: '',
    });
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        image: form.image || undefined,
        starts_at: fromDatetimeLocal(form.starts_at) || new Date().toISOString(),
        expires_at: fromDatetimeLocal(form.expires_at),
      };

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload);
      } else {
        await api.post('/announcements', {
          ...payload,
          church_id: user.church_id,
        });
      }

      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Publish, schedule, edit, or repost news for your congregation"
        action={
          <button
            onClick={() => (showForm ? resetForm() : openCreate())}
            className="btn-admin bg-emerald-600 hover:bg-emerald-700"
          >
            {showForm ? 'Cancel' : '+ Add Announcement'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit announcement' : 'New announcement'}
          </h2>

          <input
            className="input-field"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input-field"
            placeholder="Content"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <ImageUpload
            label="Image (optional)"
            hint={ANNOUNCEMENT_IMAGE_HINT}
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start date & time</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                required
              />
              <p className="mt-1 text-xs text-gray-400">When this appears on your public page</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Expiry date & time (optional)</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-400">Leave empty to keep it visible until you remove it</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Announcement'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No announcements yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const status = getAnnouncementStatus(item);
            return (
              <div key={item.id} className="admin-card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="h-20 w-32 shrink-0 rounded-lg border border-gray-200 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    {item.content && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.content}</p>}
                    <p className="mt-2 text-xs text-gray-400">{formatAnnouncementWindow(item)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <button onClick={() => openEdit(item)} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                    Edit
                  </button>
                  <button onClick={() => openCopy(item)} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
                    Copy
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-sm text-red-500 hover:text-red-700">
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
