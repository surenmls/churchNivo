import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import StorageUsage from '../../components/admin/StorageUsage';

export default function ChurchAdminGalleryPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    cover_image_url: '',
    is_featured: false,
    featured_order: 0,
    is_default_landing: false,
  });
  const [photoForm, setPhotoForm] = useState({ title: '', image_url: '', file_size_bytes: 0 });
  const [canUpload, setCanUpload] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadAlbums = () => {
    if (!user?.church_id) return;
    api
      .get(`/gallery/albums/church/${user.church_id}?approved=false`)
      .then(setAlbums)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadPhotos = (albumId) => {
    api
      .get(`/gallery/church/${user.church_id}?album_id=${albumId}&approved=false`)
      .then(setPhotos)
      .catch(console.error);
  };

  useEffect(() => {
    loadAlbums();
  }, [user]);

  useEffect(() => {
    if (!user?.church_id) return;
    api.get(`/storage/church/${user.church_id}`).then((u) => setCanUpload(u.can_upload)).catch(console.error);
  }, [user, albums, photos]);

  useEffect(() => {
    if (selectedAlbum) loadPhotos(selectedAlbum.id);
  }, [selectedAlbum]);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gallery/albums', {
        church_id: user.church_id,
        ...albumForm,
        year: parseInt(albumForm.year, 10) || null,
      });
      setAlbumForm({
        title: '',
        year: new Date().getFullYear(),
        cover_image_url: '',
        is_featured: false,
        featured_order: 0,
        is_default_landing: false,
      });
      setShowAlbumForm(false);
      loadAlbums();
    } catch (err) {
      alert(err.message || 'Failed to create album');
    }
  };

  const handleUpdateAlbum = async (album, updates) => {
    try {
      await api.put(`/gallery/albums/${album.id}`, updates);
      loadAlbums();
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum({ ...selectedAlbum, ...updates });
      }
    } catch (err) {
      alert(err.message || 'Failed to update album');
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!confirm('Delete this album and all its photos?')) return;
    await api.delete(`/gallery/albums/${id}`);
    if (selectedAlbum?.id === id) setSelectedAlbum(null);
    loadAlbums();
  };

  const handleCreatePhoto = async (e) => {
    e.preventDefault();
    if (!selectedAlbum || !photoForm.image_url) return;
    try {
      await api.post('/gallery', {
        church_id: user.church_id,
        album_id: selectedAlbum.id,
        title: photoForm.title,
        image_url: photoForm.image_url,
        file_size_bytes: photoForm.file_size_bytes,
      });
      setPhotoForm({ title: '', image_url: '', file_size_bytes: 0 });
      setShowPhotoForm(false);
      loadPhotos(selectedAlbum.id);
      loadAlbums();
    } catch (err) {
      alert(err.message || 'Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Delete this photo?')) return;
    await api.delete(`/gallery/${id}`);
    loadPhotos(selectedAlbum.id);
    loadAlbums();
  };

  return (
    <div>
      <PageHeader
        title="Photo Gallery"
        subtitle="Albums and photos publish immediately on your church site"
        action={
          <button onClick={() => setShowAlbumForm(!showAlbumForm)} className="btn-admin bg-emerald-600 hover:bg-emerald-700">
            {showAlbumForm ? 'Cancel' : '+ New Album'}
          </button>
        }
      />

      {user?.church_id && (
        <div className="mb-8">
          <StorageUsage churchId={user.church_id} compact />
        </div>
      )}

      {showAlbumForm && (
        <form onSubmit={handleCreateAlbum} className="mb-8 admin-card space-y-4">
          <input
            className="input-field"
            placeholder="Album name (e.g. Christmas 2025)"
            value={albumForm.title}
            onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="input-field"
              type="number"
              placeholder="Year"
              value={albumForm.year}
              onChange={(e) => setAlbumForm({ ...albumForm, year: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={albumForm.is_featured}
                onChange={(e) => setAlbumForm({ ...albumForm, is_featured: e.target.checked })}
              />
              Featured on gallery page
            </label>
          </div>
          <ImageUpload
            label="Cover thumbnail"
            value={albumForm.cover_image_url}
            onChange={(url) => setAlbumForm({ ...albumForm, cover_image_url: url })}
          />
          <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700">Publish Album</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Albums</h2>
            {albums.length === 0 ? (
              <div className="admin-card py-8 text-center text-gray-500">No albums yet. Create one to get started.</div>
            ) : (
              <div className="space-y-3">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className={`admin-card cursor-pointer transition ${
                      selectedAlbum?.id === album.id ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="flex gap-4">
                      {album.cover_image_url && (
                        <img src={album.cover_image_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{album.title}</p>
                            <p className="text-xs text-gray-500">
                              {album.year || 'No year'} · {album.photo_count || 0} photos
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={album.is_featured}
                              onChange={(e) => handleUpdateAlbum(album, { is_featured: e.target.checked })}
                              onClick={(e) => e.stopPropagation()}
                            />
                            Featured
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={album.is_default_landing}
                              onChange={(e) => handleUpdateAlbum(album, { is_default_landing: e.target.checked })}
                              onClick={(e) => e.stopPropagation()}
                            />
                            Default
                          </label>
                          <input
                            type="number"
                            className="w-16 rounded border px-2 py-0.5"
                            value={album.featured_order}
                            onChange={(e) => handleUpdateAlbum(album, { featured_order: parseInt(e.target.value, 10) || 0 })}
                            onClick={(e) => e.stopPropagation()}
                            title="Featured order"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAlbum(album.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <ImageUpload
                        label="Update cover thumbnail"
                        value={album.cover_image_url || ''}
                        onChange={(url) => handleUpdateAlbum(album, { cover_image_url: url })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedAlbum ? `Photos in "${selectedAlbum.title}"` : 'Select an album'}
              </h2>
              {selectedAlbum && (
                <button
                  onClick={() => canUpload && setShowPhotoForm(!showPhotoForm)}
                  disabled={!canUpload}
                  className={`text-sm font-medium ${canUpload ? 'text-emerald-600 hover:text-emerald-700' : 'cursor-not-allowed text-gray-400'}`}
                >
                  {showPhotoForm ? 'Cancel' : '+ Add Photo'}
                </button>
              )}
            </div>

            {!selectedAlbum ? (
              <div className="admin-card py-12 text-center text-gray-500">Select an album to manage photos.</div>
            ) : (
              <>
                {showPhotoForm && (
                  <form onSubmit={handleCreatePhoto} className="mb-6 admin-card space-y-4">
                    <input
                      className="input-field"
                      placeholder="Photo title (optional)"
                      value={photoForm.title}
                      onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                    />
                    <ImageUpload
                      label="Photo"
                      value={photoForm.image_url}
                      countQuota
                      onChange={(url, meta) => setPhotoForm({ ...photoForm, image_url: url, file_size_bytes: meta?.size || 0 })}
                    />
                    <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={!photoForm.image_url || !canUpload}>
                      Add Photo
                    </button>
                  </form>
                )}

                {photos.length === 0 ? (
                  <div className="admin-card py-8 text-center text-gray-500">No photos in this album.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {photos.map((item) => (
                      <div key={item.id} className="admin-card overflow-hidden p-0">
                        <img src={item.image_url} alt={item.title || 'Photo'} className="aspect-video w-full object-cover" />
                        <div className="p-3">
                          <p className="truncate text-sm font-medium">{item.title || 'Untitled'}</p>
                          <button onClick={() => handleDeletePhoto(item.id)} className="mt-2 text-xs text-red-500 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
