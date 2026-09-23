import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import { toDatetimeLocal, fromDatetimeLocal } from '../../utils/announcementDates';
import { BLOG_CATEGORIES, formatBlogDate, formatReadTime } from '../../utils/blogUtils';
import { stripHtml } from '../../utils/sanitizeHtml';

const CATEGORIES = BLOG_CATEGORIES.filter((c) => c !== 'All');

function emptyForm() {
  return {
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category: 'Devotional',
    author_name: '',
    author_avatar: '',
    author_bio: '',
    published_at: toDatetimeLocal(new Date()),
  };
}

export default function ChurchAdminBlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user?.church_id) return;
    api
      .get(`/blog/church/${user.church_id}?approved=false`)
      .then(setPosts)
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

  const openEdit = (post) => {
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      category: post.category || 'Devotional',
      author_name: post.author_name || '',
      author_avatar: post.author_avatar || '',
      author_bio: post.author_bio || '',
      published_at: toDatetimeLocal(post.published_at || post.created_at),
    });
    setEditingId(post.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        cover_image: form.cover_image || undefined,
        category: form.category,
        author_name: form.author_name || undefined,
        author_avatar: form.author_avatar || undefined,
        author_bio: form.author_bio || undefined,
        published_at: fromDatetimeLocal(form.published_at) || new Date().toISOString(),
      };

      if (editingId) {
        await api.put(`/blog/${editingId}`, payload);
      } else {
        await api.post('/blog', { ...payload, church_id: user.church_id });
      }

      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (post) => {
    const next = !(post.is_active ?? true);
    if (!confirm(`${next ? 'Publish' : 'Hide'} "${post.title}" on your blog?`)) return;
    try {
      await api.patch(`/blog/${post.id}/active`, { is_active: next });
      load();
    } catch (err) {
      alert(err.message || 'Failed to update article');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await api.delete(`/blog/${id}`);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete article');
    }
  };

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle="Write devotionals, community stories, and family articles"
        action={
          <button
            onClick={showForm && !editingId ? resetForm : openCreate}
            className="btn-admin bg-emerald-600 hover:bg-emerald-700"
          >
            {showForm ? 'Cancel' : '+ New Article'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit article' : 'New article'}
          </h2>

          <input
            className="input-field"
            placeholder="Article title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Publish date</label>
              <input
                className="input-field"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                required
              />
            </div>
          </div>

          <ImageUpload
            label="Cover image"
            value={form.cover_image}
            onChange={(url) => setForm({ ...form, cover_image: url })}
          />

          <textarea
            className="input-field"
            placeholder="Short excerpt (optional — auto-generated from content if empty)"
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />

          <RichTextEditor
            label="Article content"
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            minHeight={220}
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">Author (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="input-field"
                placeholder="Author name"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              />
              <ImageUpload
                label="Author photo"
                value={form.author_avatar}
                onChange={(url) => setForm({ ...form, author_avatar: url })}
              />
            </div>
            <textarea
              className="input-field mt-4"
              placeholder="Author bio"
              rows={2}
              value={form.author_bio}
              onChange={(e) => setForm({ ...form, author_bio: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !stripHtml(form.content)}
              className="btn-admin bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Article'}
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
      ) : posts.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No articles yet.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const active = post.is_active ?? true;
            return (
              <div
                key={post.id}
                className={`admin-card flex flex-col gap-4 sm:flex-row sm:items-start ${!active ? 'opacity-75' : ''}`}
              >
                {post.cover_image && (
                  <img src={post.cover_image} alt="" className="h-24 w-36 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {post.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {active ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatBlogDate(post.published_at || post.created_at)} · {formatReadTime(post.read_time_minutes)}
                    {post.author_name ? ` · ${post.author_name}` : ''}
                  </p>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <button type="button" onClick={() => openEdit(post)} className="text-sm font-medium text-primary-600">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(post)}
                    className={`text-sm font-medium ${active ? 'text-amber-600' : 'text-emerald-600'}`}
                  >
                    {active ? 'Hide' : 'Publish'}
                  </button>
                  <button type="button" onClick={() => handleDelete(post.id)} className="text-sm text-red-500">
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
