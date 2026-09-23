import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ churches: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const [churches, inbox] = await Promise.all([
        api.get('/churches'),
        api.get('/admin/inbox').catch(() => ({ total: 0 })),
      ]);
      setStats({ churches: churches.length, pending: inbox.total || 0 });
    }
    load().catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and statistics" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Churches" value={stats.churches} icon="⛪" color="primary" />
        <StatCard title="Pending Approval" value={stats.pending} icon="⏳" color="amber" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/inbox" className="admin-card block transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-gray-900">📥 Approval Inbox</h2>
          <p className="mt-2 text-sm text-gray-500">
            Review all pending events, media, announcements, gallery, and promotions in one place.
          </p>
          {stats.pending > 0 && (
            <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {stats.pending} waiting
            </span>
          )}
        </Link>
        <Link to="/admin/churches/new" className="admin-card block transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-gray-900">⛪ Add New Church</h2>
          <p className="mt-2 text-sm text-gray-500">
            Use the setup wizard to create a church and optional church admin account.
          </p>
        </Link>
      </div>
    </div>
  );
}
