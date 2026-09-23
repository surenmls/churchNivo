import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import { HOME_TEMPLATES } from '../../components/church/churchHomeTemplates';

const PLAN_OPTIONS = [
  { tier: 'free', label: 'Free', photos: 50, storage: '100 MB' },
  { tier: 'starter', label: 'Starter', photos: 200, storage: '500 MB' },
  { tier: 'pro', label: 'Pro', photos: 1000, storage: '5 GB' },
];

export default function AdminChurchesPage() {
  const [churches, setChurches] = useState([]);
  const [storageMap, setStorageMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadChurches = async () => {
    try {
      const data = await api.get('/churches');
      setChurches(data);
      const usageEntries = await Promise.all(
        data.map(async (c) => {
          try {
            const usage = await api.get(`/storage/church/${c.id}`);
            return [c.id, usage];
          } catch {
            return [c.id, null];
          }
        })
      );
      setStorageMap(Object.fromEntries(usageEntries));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChurches();
  }, []);

  const handlePlanChange = async (churchId, planTier) => {
    try {
      await api.put(`/storage/church/${churchId}/plan`, { plan_tier: planTier });
      loadChurches();
    } catch (err) {
      alert(err.message || 'Failed to update plan');
    }
  };

  const handleTemplateChange = async (churchId, home_template) => {
    try {
      await api.put(`/churches/${churchId}`, { home_template });
      setChurches((prev) => prev.map((c) => (c.id === churchId ? { ...c, home_template } : c)));
    } catch (err) {
      alert(err.message || 'Failed to update home layout');
    }
  };

  return (
    <div>
      <PageHeader
        title="Churches"
        subtitle="Manage churches and storage plans"
        action={
          <Link to="/admin/churches/new" className="btn-admin">
            + Add Church
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Home layout</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {churches.map((church) => {
                const usage = storageMap[church.id];
                return (
                  <tr key={church.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{church.name}</p>
                      <p className="text-xs text-gray-500">{church.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        value={church.home_template || 'classic'}
                        onChange={(e) => handleTemplateChange(church.id, e.target.value)}
                        title="Public home page layout"
                      >
                        {Object.values(HOME_TEMPLATES).map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        value={usage?.plan_tier || 'free'}
                        onChange={(e) => handlePlanChange(church.id, e.target.value)}
                      >
                        {PLAN_OPTIONS.map((p) => (
                          <option key={p.tier} value={p.tier}>{p.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {usage ? `${usage.storage.used_label} / ${usage.storage.max_label}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {usage ? `${usage.photos.used} / ${usage.photos.max}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${church.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {church.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
