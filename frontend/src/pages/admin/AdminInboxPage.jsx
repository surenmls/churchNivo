import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

const TYPE_LABELS = {
  platform_event: 'Platform Event',
  event: 'Event',
  media: 'Media',
  announcement: 'Announcement',
  gallery_album: 'Gallery Album',
  gallery_photo: 'Gallery Photo',
  promotion: 'Promotion',
};

const TYPE_ICONS = {
  platform_event: '🌐',
  event: '📅',
  media: '🎬',
  announcement: '📣',
  gallery_album: '🖼️',
  gallery_photo: '📷',
  promotion: '📢',
};

export default function AdminInboxPage() {
  const [inbox, setInbox] = useState({ items: [], counts: {}, total: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/inbox')
      .then(setInbox)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (type, id) => {
    await api.patch(`/admin/inbox/${type}/${id}/approve`, {});
    load();
  };

  const filtered =
    filter === 'all' ? inbox.items : inbox.items.filter((i) => i.type === filter);

  return (
    <div>
      <PageHeader
        title="Approval Inbox"
        subtitle={`${inbox.total} item${inbox.total !== 1 ? 's' : ''} waiting for review`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${inbox.total})`} />
        {Object.entries(inbox.counts || {}).map(([type, count]) => (
          <FilterBtn
            key={type}
            active={filter === type}
            onClick={() => setFilter(type)}
            label={`${TYPE_LABELS[type] || type} (${count})`}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card py-16 text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-4 text-gray-500">Nothing pending approval. You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={`${item.type}-${item.id}`} className="admin-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="text-2xl">{TYPE_ICONS[item.type] || '📄'}</span>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {TYPE_LABELS[item.type]} · {item.church_name}
                    {item.meta && ` · ${item.meta}`}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {item.church_slug && (
                  <a
                    href={`/church/${item.church_slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Preview
                  </a>
                )}
                <button
                  onClick={() => handleApprove(item.type, item.id)}
                  className="btn-admin bg-green-600 text-sm hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
