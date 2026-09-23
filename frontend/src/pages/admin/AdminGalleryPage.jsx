import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [tab, setTab] = useState('albums');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const churches = await api.get('/churches');
      const [allAlbums, allPhotos] = await Promise.all([
        Promise.all(churches.map((c) => api.get(`/gallery/albums/church/${c.id}?approved=false`))),
        Promise.all(churches.map((c) => api.get(`/gallery/church/${c.id}?approved=false`))),
      ]);
      setAlbums(
        allAlbums.flat().map((item) => ({
          ...item,
          church_name: churches.find((c) => c.id === item.church_id)?.name,
        }))
      );
      setPhotos(
        allPhotos.flat().map((item) => ({
          ...item,
          church_name: churches.find((c) => c.id === item.church_id)?.name,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApproveAlbum = async (id) => {
    await api.patch(`/gallery/albums/${id}/approve`, { is_approved: true });
    load();
  };

  const handleApprovePhoto = async (id) => {
    await api.patch(`/gallery/${id}/approve`, { is_approved: true });
    load();
  };

  return (
    <div>
      <PageHeader title="Gallery" subtitle="Review and approve church albums and photos" />

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('albums')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'albums' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          Albums ({albums.filter((a) => !a.is_approved).length} pending)
        </button>
        <button
          type="button"
          onClick={() => setTab('photos')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'photos' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          Photos ({photos.filter((p) => !p.is_approved).length} pending)
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : tab === 'albums' ? (
        albums.length === 0 ? (
          <div className="admin-card py-12 text-center text-gray-500">No albums.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <div key={album.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {album.cover_image_url && (
                  <img src={album.cover_image_url} alt={album.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4">
                  <p className="font-medium text-gray-900">{album.title}</p>
                  <p className="text-sm text-gray-500">{album.church_name} · {album.year || 'No year'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        album.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {album.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {!album.is_approved && (
                      <button onClick={() => handleApproveAlbum(album.id)} className="text-sm font-medium text-green-600 hover:text-green-800">
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : photos.length === 0 ? (
        <div className="admin-card py-12 text-center text-gray-500">No photos.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img src={item.image_url} alt={item.title || 'Gallery'} className="aspect-video w-full object-cover" />
              <div className="p-4">
                <p className="font-medium text-gray-900">{item.title || 'Untitled'}</p>
                <p className="text-sm text-gray-500">{item.church_name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  {!item.is_approved && (
                    <button onClick={() => handleApprovePhoto(item.id)} className="text-sm font-medium text-green-600 hover:text-green-800">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
