import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import { getMediaEmbed, normalizeMediaUrl } from '../../utils/mediaEmbed';

function emptyForm() {
  return { title: '', url: '', type: 'video' };
}

export default function ChurchAdminMediaPage() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user?.church_id) return;
    api
      .get(`/media/church/${user.church_id}?approved=false`)
      .then(setMedia)
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
      url: item.url || '',
      type: item.type || 'video',
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = normalizeMediaUrl(form.url);
      const type = getMediaEmbed(url) ? 'video' : form.type;
      const payload = { title: form.title, url, type };

      if (editingId) {
        await api.put(`/media/${editingId}`, payload);
      } else {
        await api.post('/media', {
          ...payload,
          church_id: user.church_id,
        });
      }

      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save media');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    const next = !(item.is_active ?? true);
    const label = next ? 'activate' : 'deactivate';
    if (!confirm(`${next ? 'Show' : 'Hide'} "${item.title}" on your public site?`)) return;

    try {
      await api.patch(`/media/${item.id}/active`, { is_active: next });
      load();
    } catch (err) {
      alert(err.message || `Failed to ${label} media`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media item permanently?')) return;
    try {
      await api.delete(`/media/${id}`);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete media');
    }
  };

  return (
    <div>
      <PageHeader
        title="Media"
        subtitle="Manage sermons and media — publish, hide, edit, or remove"
        action={
          <button
            onClick={showForm && !editingId ? resetForm : openCreate}
            className="btn-admin bg-emerald-600 hover:bg-emerald-700"
          >
            {showForm ? 'Cancel' : '+ Add Media'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit media' : 'New media'}
          </h2>
          <input
            className="input-field"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="https://www.youtube.com/watch?v=..."
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500">
            YouTube and Vimeo links play inside your church site. Paste the full watch URL.
          </p>
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="link">Link</option>
            <option value="document">Document</option>
          </select>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-admin bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Media'}
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
      ) : media.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No media yet.</div>
      ) : (
        <div className="space-y-4">
          {media.map((item) => {
            const active = item.is_active ?? true;
            return (
              <div
                key={item.id}
                className={`admin-card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
                  !active ? 'opacity-75' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                      {item.type}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block truncate text-sm text-primary-600 hover:underline"
                  >
                    {item.url}
                  </a>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`text-sm font-medium ${
                      active ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    {active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
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
