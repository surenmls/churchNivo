import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import MediaCard from '../../components/public/MediaCard';

export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/media/approved').then(setMedia).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="section-title">Media Library</h1>
          <p className="mt-4 text-lg text-gray-600">Sermons, worship, and resources from member churches</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : media.length === 0 ? (
          <p className="text-center text-gray-500">No approved media at this time.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {media.map((item) => (
              <MediaCard key={item.id} item={item} showChurch />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
