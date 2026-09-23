import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import { stripHtml } from '../../utils/sanitizeHtml';

const EMPTY_PASTOR = { name: '', title: 'Lead Pastor', photo: '', bio: '' };

export default function ChurchAdminPastorsPage() {
  const { user } = useAuth();
  const [pastors, setPastors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PASTOR);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user?.church_id) return;
    api.get(`/pastors/church/${user.church_id}`)
      .then(setPastors)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const resetForm = () => {
    setForm(EMPTY_PASTOR);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (pastor) => {
    setForm({
      name: pastor.name,
      title: pastor.title || 'Lead Pastor',
      photo: pastor.photo || '',
      bio: pastor.bio || '',
    });
    setEditingId(pastor.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/pastors/${editingId}`, form);
      } else {
        await api.post('/pastors', { ...form, church_id: user.church_id });
      }
      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save pastor');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this pastor profile?')) return;
    await api.delete(`/pastors/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Pastors & Leaders"
        subtitle="Manage pastor profiles shown on your About page"
        action={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-admin bg-emerald-600 hover:bg-emerald-700"
          >
            + Add Pastor
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Pastor' : 'New Pastor'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input-field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" placeholder="Title (e.g. Senior Pastor)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <ImageUpload label="Pastor photo" value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} />
          <RichTextEditor
            label="Bio"
            placeholder="Share their story, background, and heart for ministry..."
            value={form.bio}
            onChange={(bio) => setForm({ ...form, bio })}
            minHeight={180}
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700">
              {editingId ? 'Update Pastor' : 'Add Pastor'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : pastors.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">
          No pastors added yet. Add your first pastor to display them on the About page.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pastors.map((pastor) => (
            <div key={pastor.id} className="admin-card overflow-hidden p-0">
              {pastor.photo ? (
                <img src={pastor.photo} alt={pastor.name} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-4xl">✝</div>
              )}
              <div className="p-5">
                <p className="text-xs font-semibold uppercase text-emerald-600">{pastor.title}</p>
                <h3 className="mt-1 font-semibold text-gray-900">{pastor.name}</h3>
                {pastor.bio && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-500">{stripHtml(pastor.bio)}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <button onClick={() => handleEdit(pastor)} className="text-sm font-medium text-primary-600 hover:text-primary-800">Edit</button>
                  <button onClick={() => handleDelete(pastor.id)} className="text-sm font-medium text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
