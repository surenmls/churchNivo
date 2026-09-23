import ImageUpload from '../ImageUpload';

const EMPTY_SLIDE = { image: '', caption: '', link: '', focus: 'top' };

const FOCUS_OPTIONS = [
  { value: 'top', label: 'Top — best for people / group photos' },
  { value: 'center', label: 'Center — balanced crop' },
  { value: 'bottom', label: 'Bottom — show lower part of photo' },
];

export default function HeroSlidesEditor({ slides, onChange }) {
  const list = slides?.length ? slides : [];

  const updateSlide = (index, patch) => {
    const next = list.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    onChange(next);
  };

  const addSlide = () => onChange([...list, { ...EMPTY_SLIDE }]);

  const removeSlide = (index) => onChange(list.filter((_, i) => i !== index));

  const moveSlide = (index, direction) => {
    const next = [...list];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Photos shown in the hero carousel. Crop each photo to{' '}
        <strong>1920 × 580 px</strong> (wide landscape) before upload. Keep faces in the{' '}
        <strong>top-center</strong> area and set photo focus to <strong>Top</strong>.
      </p>

      {list.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No carousel photos yet. Add your first slide below.
        </div>
      )}

      {list.map((slide, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-700">Slide {index + 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveSlide(index, -1)}
                disabled={index === 0}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveSlide(index, 1)}
                disabled={index === list.length - 1}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          <ImageUpload
            label="Photo"
            value={slide.image}
            onChange={(url) => updateSlide(index, { image: url })}
          />
          <input
            className="input-field"
            placeholder="Caption (e.g. Easter Sunday 2026)"
            value={slide.caption}
            onChange={(e) => updateSlide(index, { caption: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photo focus</label>
            <select
              className="input-field"
              value={slide.focus || 'top'}
              onChange={(e) => updateSlide(index, { focus: e.target.value })}
            >
              {FOCUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <input
            className="input-field"
            placeholder="Optional link (e.g. /events or full URL)"
            value={slide.link}
            onChange={(e) => updateSlide(index, { link: e.target.value })}
          />
        </div>
      ))}

      <button type="button" onClick={addSlide} className="btn-secondary w-full sm:w-auto">
        + Add carousel photo
      </button>
    </div>
  );
}
