import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const churches = await api.get('/churches');
      const allItems = await Promise.all(
        churches.map((c) => api.get(`/announcements/church/${c.id}?approved=false`))
      );
      const flat = allItems.flat().map((item, _, arr) => {
        const church = churches.find((c) => c.id === item.church_id);
        return { ...item, church_name: church?.name };
      });
      setItems(flat.sort((a, b) => new Date(b.published_at) - new Date(a.published_at)));
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
    await api.patch(`/announcements/${id}/approve`, { is_approved: true });
    load();
  };

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Review and approve church announcements" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Church</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.church_name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        item.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!item.is_approved && (
                      <button onClick={() => handleApprove(item.id)} className="text-sm font-medium text-green-600 hover:text-green-800">
                        Approve
                      </button>
                    )}
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
