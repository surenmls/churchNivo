import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import ChurchFontPicker from '../../components/church/ChurchFontPicker';
import RichTextEditor from '../../components/RichTextEditor';

const STEPS = ['Welcome', 'Profile', 'Branding', 'First event', 'Done'];

export default function ChurchAdminOnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [church, setChurch] = useState(null);
  const [form, setForm] = useState({
    tagline: '',
    description: '',
    mission: '',
    logo: '',
    banner: '',
    theme_color: '#4f46e5',
    font_family: 'modern',
  });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.church_id) return;
    api.get('/churches').then((churches) => {
      const mine = churches.find((c) => c.id === user.church_id);
      if (mine) {
        api.get(`/churches/${mine.slug}`).then((full) => {
          setChurch(full);
          setForm({
            tagline: full.tagline || '',
            description: full.description || '',
            mission: full.mission || '',
            logo: full.logo || '',
            banner: full.banner || '',
            theme_color: full.theme_color || '#4f46e5',
            font_family: full.font_family || 'modern',
          });
          if (full.onboarding_completed) navigate('/church-admin/dashboard', { replace: true });
        });
      }
    });
  }, [user, navigate]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/churches/${user.church_id}`, form);
      setStep((s) => s + 1);
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (eventForm.title && eventForm.date) {
      await api.post('/events', {
        church_id: user.church_id,
        title: eventForm.title,
        description: eventForm.description,
        date: new Date(eventForm.date).toISOString(),
      });
    }
    setStep(4);
  };

  const finish = async () => {
    await api.patch(`/churches/${user.church_id}/complete-onboarding`, {});
    navigate('/church-admin/dashboard', { replace: true });
  };

  if (!church) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-emerald-700">Setup wizard · Step {step + 1} of {STEPS.length}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gray-900">{STEPS[step]}</h1>
        </div>

        <div className="admin-card">
          {step === 0 && (
            <div className="space-y-4 text-center">
              <span className="text-5xl">⛪</span>
              <h2 className="text-xl font-bold">Welcome to ChurchNivo!</h2>
              <p className="text-gray-600">
                Let&apos;s set up <strong>{church.name}</strong> in a few quick steps. You can always change these later in Settings.
              </p>
              <button type="button" onClick={() => setStep(1)} className="btn-admin bg-emerald-600 hover:bg-emerald-700 w-full">
                Get started →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tell visitors about your church</h2>
              <input className="input-field" placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              <RichTextEditor
                label="About your church"
                placeholder="Tell visitors who you are..."
                value={form.description}
                onChange={(description) => setForm({ ...form, description })}
              />
              <RichTextEditor
                label="Mission statement"
                placeholder="Your mission in a sentence or two..."
                value={form.mission}
                onChange={(mission) => setForm({ ...form, mission })}
                minHeight={100}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary">Back</button>
                <button type="button" onClick={saveProfile} className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving ? 'Saving...' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Branding</h2>
              <ImageUpload label="Logo" value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} />
              <ImageUpload label="Banner" value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Theme color</label>
                <input type="color" value={form.theme_color} onChange={(e) => setForm({ ...form, theme_color: e.target.value })} />
              </div>
              <div>
                <label className="mb-3 block text-sm font-medium">Font style</label>
                <ChurchFontPicker
                  value={form.font_family}
                  onChange={(font_family) => setForm({ ...form, font_family })}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button type="button" onClick={saveProfile} className="btn-admin bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving ? 'Saving...' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Add your first event (optional)</h2>
              <p className="text-sm text-gray-500">Events need super-admin approval before they appear publicly.</p>
              <input className="input-field" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              <textarea className="input-field" placeholder="Description" rows={2} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              <input className="input-field" type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button type="button" onClick={() => setStep(4)} className="btn-secondary">Skip</button>
                <button type="button" onClick={saveEvent} className="btn-admin bg-emerald-600 hover:bg-emerald-700">
                  Add event & continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <span className="text-5xl">🎉</span>
              <h2 className="text-xl font-bold">You&apos;re ready to go!</h2>
              <p className="text-gray-600">
                Preview your page at{' '}
                <a href={`/church/${church.slug}`} target="_blank" rel="noreferrer" className="font-medium text-emerald-600 underline">
                  /church/{church.slug}
                </a>
              </p>
              <ul className="text-left text-sm text-gray-600">
                <li>• Add announcements, media, and gallery from the sidebar</li>
                <li>• Content you create will be reviewed before going live</li>
                <li>• Invite members from the Members page</li>
              </ul>
              <button type="button" onClick={finish} className="btn-admin bg-emerald-600 hover:bg-emerald-700 w-full">
                Go to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
