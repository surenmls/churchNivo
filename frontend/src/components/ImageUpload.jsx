import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ImageUpload({ value, onChange, label = 'Upload image', countQuota = false, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      if (countQuota) formData.append('count_quota', 'true');

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url, { size: data.size });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      {value && (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="h-32 w-32 rounded-2xl border border-gray-200 object-cover shadow-sm" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : value ? 'Replace image' : 'Choose file'}
        </button>
        <span className="text-xs text-gray-400">JPEG, PNG, WebP, GIF · max 5MB</span>
      </div>

      <input
        className="input-field"
        placeholder="Or paste image URL"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
