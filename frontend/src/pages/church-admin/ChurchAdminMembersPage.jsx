import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

export default function ChurchAdminMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user?.church_id) return;
    api.get(`/subscribers/church/${user.church_id}/list`).then(setMembers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/subscribers/church/${user.church_id}/invite`, form);
      setForm({ name: '', email: '', phone: '' });
      setShowForm(false);
      load();
      alert('Invite email sent (if SMTP is configured).');
    } catch (err) {
      alert(err.message || 'Failed to send invite');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    await api.delete(`/subscribers/${id}`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Members & Subscribers"
        subtitle="Manage who receives church notifications"
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-admin bg-emerald-600 hover:bg-emerald-700">
            {showForm ? 'Cancel' : '+ Invite Member'}
          </button>
        }
      />

      <p className="mb-6 text-sm text-gray-500">
        Members can also self-register on your public church page. Admin invites send an email to complete preferences.
      </p>

      {showForm && (
        <form onSubmit={handleInvite} className="mb-8 admin-card space-y-4">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700">Send Invite</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No subscribers yet.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Channels</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.email}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {[m.email_opt_in && 'Email', m.sms_opt_in && 'SMS', m.push_opt_in && 'Push'].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      m.status === 'active' ? 'bg-green-100 text-green-800' : m.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleRemove(m.id)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
