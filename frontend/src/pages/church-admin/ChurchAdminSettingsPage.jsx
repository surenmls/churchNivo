import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import ChurchFontPicker from '../../components/church/ChurchFontPicker';
import { parseServiceTimes } from '../../components/church/churchUtils';
import RichTextEditor from '../../components/RichTextEditor';
import HeroSlidesEditor from '../../components/admin/HeroSlidesEditor';
import { parseHeroSlides } from '../../components/church/buildHeroSlides';

const SECTION_LABELS = {
  about: 'About',
  events: 'Events',
  media: 'Media',
  contact: 'Contact',
  gallery: 'Gallery',
  announcements: 'Announcements',
  blog: 'Blog',
};

const EMPTY_SERVICE = { day: 'Sunday', time: '10:00 AM', label: 'Worship Service' };

export default function ChurchAdminSettingsPage() {
  const { user } = useAuth();
  const [church, setChurch] = useState(null);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({});
  const [services, setServices] = useState([EMPTY_SERVICE]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.church_id) return;

    async function load() {
      const slugRes = await api.get('/churches');
      const myChurch = slugRes.find((c) => c.id === user.church_id);
      const fullChurch = myChurch ? await api.get(`/churches/${myChurch.slug}`) : null;

      const sectionData = await api.get(`/churches/${user.church_id}/sections`);

      setChurch(fullChurch);
      setForm({
        name: fullChurch?.name || '',
        tagline: fullChurch?.tagline || '',
        description: fullChurch?.description || '',
        mission: fullChurch?.mission || '',
        address: fullChurch?.address || '',
        contact_email: fullChurch?.contact_email || '',
        phone: fullChurch?.phone || '',
        website: fullChurch?.website || '',
        facebook_url: fullChurch?.facebook_url || '',
        instagram_url: fullChurch?.instagram_url || '',
        youtube_url: fullChurch?.youtube_url || '',
        donation_url: fullChurch?.donation_url || '',
        city: fullChurch?.city || '',
        denomination: fullChurch?.denomination || '',
        gallery_featured_count: fullChurch?.gallery_featured_count || 5,
        theme_color: fullChurch?.theme_color || '#4f46e5',
        font_family: fullChurch?.font_family || 'modern',
        logo: fullChurch?.logo || '',
        banner: fullChurch?.banner || '',
        hero_slides: parseHeroSlides(fullChurch?.hero_slides),
      });
      const parsed = parseServiceTimes(fullChurch?.service_times);
      setServices(parsed.length > 0 ? parsed : [EMPTY_SERVICE]);
      setSections(sectionData);
      setLoading(false);
    }
    load().catch(console.error);
  }, [user]);

  const handleSaveChurch = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put(`/churches/${user.church_id}`, {
        ...form,
        hero_slides: form.hero_slides?.filter((s) => s.image) || [],
        service_times: JSON.stringify(services.filter((s) => s.day && s.time)),
      });
      setMessage('Church profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSection = async (sectionKey, enabled) => {
    const updated = sections.map((s) =>
      s.section_key === sectionKey ? { ...s, enabled } : s
    );
    setSections(updated);
    await api.put(`/churches/${user.church_id}/sections`, { sections: updated });
  };

  const updateService = (index, field, value) => {
    setServices(services.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addService = () => setServices([...services, { ...EMPTY_SERVICE }]);
  const removeService = (index) => setServices(services.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Customize your public church page" />

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSaveChurch} className="space-y-8">
        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>
          <input className="input-field" placeholder="Church Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Tagline (short headline)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          <RichTextEditor
            label="About your church"
            placeholder="Tell visitors who you are, your history, and what makes your church special..."
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            minHeight={160}
          />
          <RichTextEditor
            label="Mission statement"
            placeholder="Your mission in a sentence or two..."
            value={form.mission}
            onChange={(mission) => setForm({ ...form, mission })}
            minHeight={100}
          />
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          <ImageUpload label="Logo" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
          <ImageUpload label="Banner" value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} />
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Theme Color</label>
            <input type="color" value={form.theme_color} onChange={(e) => setForm({ ...form, theme_color: e.target.value })} className="h-10 w-16 cursor-pointer rounded border" />
            <span className="text-sm text-gray-500">{form.theme_color}</span>
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Font Style</label>
            <ChurchFontPicker
              value={form.font_family}
              onChange={(font_family) => setForm({ ...form, font_family })}
            />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Hero Carousel</h2>
          <HeroSlidesEditor
            slides={form.hero_slides || []}
            onChange={(hero_slides) => setForm({ ...form, hero_slides })}
          />
        </div>

        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Service Times</h2>
            <button type="button" onClick={addService} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">+ Add Service</button>
          </div>
          {services.map((service, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-4">
              <input className="input-field" placeholder="Day" value={service.day} onChange={(e) => updateService(index, 'day', e.target.value)} />
              <input className="input-field" placeholder="Time" value={service.time} onChange={(e) => updateService(index, 'time', e.target.value)} />
              <input className="input-field" placeholder="Label" value={service.label} onChange={(e) => updateService(index, 'label', e.target.value)} />
              {services.length > 1 && (
                <button type="button" onClick={() => removeService(index)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
          ))}
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Gallery Display</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Featured albums on gallery page</label>
            <input
              type="number"
              min={1}
              max={10}
              className="input-field w-24"
              value={form.gallery_featured_count}
              onChange={(e) => setForm({ ...form, gallery_featured_count: parseInt(e.target.value, 10) || 5 })}
            />
          </div>
          <p className="text-xs text-gray-500">How many featured album cards to show at the top of your public gallery (default 5).</p>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Location & Giving</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input-field" placeholder="Denomination" value={form.denomination} onChange={(e) => setForm({ ...form, denomination: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Donation / Give URL" value={form.donation_url} onChange={(e) => setForm({ ...form, donation_url: e.target.value })} />
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact & Social</h2>
          <input className="input-field" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input-field" placeholder="Contact Email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <input className="input-field" placeholder="Facebook URL" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} />
            <input className="input-field" placeholder="Instagram URL" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
            <input className="input-field" placeholder="YouTube URL" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
          </div>
        </div>

        <button type="submit" className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </form>

      <div className="mt-8 admin-card">
        <h2 className="text-lg font-semibold text-gray-900">Page Sections</h2>
        <p className="mt-1 text-sm text-gray-500">Show or hide sections on your public church page</p>
        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <label key={section.section_key} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-900">
                {SECTION_LABELS[section.section_key] || section.section_key}
              </span>
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(e) => handleToggleSection(section.section_key, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </div>

      {church && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Preview your page: <a href={`/church/${church.slug}`} target="_blank" rel="noreferrer" className="font-semibold underline">/church/{church.slug}</a>
        </div>
      )}
    </div>
  );
}
