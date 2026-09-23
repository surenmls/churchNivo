import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import StorageUsage from '../../components/admin/StorageUsage';

export default function ChurchAdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, media: 0, hidden: 0 });
  const [church, setChurch] = useState(null);

  useEffect(() => {
    if (!user?.church_id) return;

    async function load() {
      const [events, media, churches] = await Promise.all([
        api.get(`/events/church/${user.church_id}?approved=false`),
        api.get(`/media/church/${user.church_id}?approved=false`),
        api.get('/churches'),
      ]);

      const myChurch = churches.find((c) => c.id === user.church_id);
      setChurch(myChurch);
      setStats({
        events: events.length,
        media: media.length,
        hidden: events.filter((i) => i.is_active === false).length,
      });
    }
    load().catch(console.error);
  }, [user]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={church ? `Managing ${church.name}` : 'Your church overview'}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Events" value={stats.events} icon="📅" color="primary" />
        <StatCard title="Media Items" value={stats.media} icon="🎬" color="green" />
        <StatCard title="Hidden Events" value={stats.hidden} icon="👁️" color="amber" />
      </div>

      {user?.church_id && (
        <div className="mt-8">
          <StorageUsage churchId={user.church_id} />
        </div>
      )}

      {church && (
        <div className="mt-8 admin-card">
          <h2 className="text-lg font-semibold text-gray-900">{church.name}</h2>
          <p className="mt-2 text-sm text-gray-500">{church.description}</p>
          <p className="mt-2 text-sm text-gray-400">Public URL: /church/{church.slug}</p>
        </div>
      )}
    </div>
  );
}
