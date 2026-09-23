import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import PageHeader from '../../components/admin/PageHeader';
import { HOME_TEMPLATES } from '../../components/church/churchHomeTemplates';

const STEPS = ['Church details', 'Admin account', 'Review'];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminChurchWizardPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    contact_email: '',
    address: '',
    city: '',
    admin_name: '',
    admin_email: '',
    admin_password: 'password123',
    create_admin: true,
    home_template: 'classic',
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleNameChange = (name) => {
    setForm({ ...form, name, slug: form.slug || slugify(name) });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        contact_email: form.contact_email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        home_template: form.home_template,
      };
      if (form.create_admin) {
        payload.admin = {
          name: form.admin_name,
          email: form.admin_email,
          password: form.admin_password,
        };
      }
      const res = await api.post('/admin/churches/setup', payload);
      setResult(res);
      setStep(3);
    } catch (err) {
      alert(err.message || 'Failed to create church');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add New Church" subtitle="Step-by-step church setup wizard" />

      {step < 3 && (
        <div className="mb-8 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                i === step ? 'border-primary-500 bg-primary-50 text-primary-700' : i < step ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>
      )}

      <div className="admin-card max-w-2xl">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Church details</h2>
            <input className="input-field" placeholder="Church name *" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
            <input className="input-field" placeholder="URL slug * (e.g. grace-community)" value={form.slug} onChange={(e) => update('slug', e.target.value)} required />
            <textarea className="input-field" placeholder="Description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
            <input className="input-field" type="email" placeholder="Contact email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="input-field" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
              <input className="input-field" placeholder="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Home page layout</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.values(HOME_TEMPLATES).map((t) => (
                  <label
                    key={t.id}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      form.home_template === t.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="home_template"
                      value={t.id}
                      checked={form.home_template === t.id}
                      onChange={(e) => update('home_template', e.target.value)}
                      className="sr-only"
                    />
                    <p className="font-semibold text-gray-900">{t.label}</p>
                    <p className="mt-1 text-xs text-gray-500">{t.description}</p>
                  </label>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="btn-admin" disabled={!form.name || !form.slug}>
              Next →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Church admin account</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.create_admin} onChange={(e) => update('create_admin', e.target.checked)} />
              Create a church admin login now
            </label>
            {form.create_admin && (
              <>
                <input className="input-field" placeholder="Admin name *" value={form.admin_name} onChange={(e) => update('admin_name', e.target.value)} />
                <input className="input-field" type="email" placeholder="Admin email *" value={form.admin_email} onChange={(e) => update('admin_email', e.target.value)} />
                <input className="input-field" type="text" placeholder="Temporary password *" value={form.admin_password} onChange={(e) => update('admin_password', e.target.value)} />
                <p className="text-xs text-gray-500">Share these credentials with the church admin. They can change password later.</p>
              </>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Back</button>
              <button type="button" onClick={() => setStep(2)} className="btn-admin">Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review & create</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Church</dt><dd className="font-medium">{form.name}</dd></div>
              <div><dt className="text-gray-500">Public URL</dt><dd className="font-medium">/church/{form.slug}</dd></div>
              {form.create_admin && (
                <div><dt className="text-gray-500">Admin login</dt><dd className="font-medium">{form.admin_email}</dd></div>
              )}
            </dl>
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              The church admin will see an onboarding wizard on first login to add branding and content.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button type="button" onClick={handleSubmit} className="btn-admin bg-green-600 hover:bg-green-700" disabled={saving}>
                {saving ? 'Creating...' : 'Create Church'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{result.church.name} is ready!</h2>
            <p className="mt-2 text-gray-600">Public page: <a href={`/church/${result.church.slug}`} className="text-primary-600 underline" target="_blank" rel="noreferrer">/church/{result.church.slug}</a></p>
            {result.admin && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4 text-left text-sm">
                <p className="font-medium">Church admin credentials:</p>
                <p className="mt-1">Email: {result.admin.email}</p>
                <p>Password: {form.admin_password}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/admin/churches" className="btn-secondary">All Churches</Link>
              <Link to="/admin/inbox" className="btn-admin">Approval Inbox</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
