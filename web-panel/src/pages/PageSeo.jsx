import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { apiRequest } from '../api';

const empty = { title: '', description: '', image: '' };
export default function PageSeo() {
  const [path, setPath] = useState('/');
  const [loadedPath, setLoadedPath] = useState('');
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load(event) {
    event.preventDefault();
    setBusy(true); setMessage(''); setError(''); setLoadedPath('');
    try {
      const { seo } = await apiRequest(`/admin/seo?path=${encodeURIComponent(path)}`);
      setForm(seo || empty); setLoadedPath(path);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    try {
      await apiRequest('/admin/seo', { method: 'PUT', body: JSON.stringify({ path: loadedPath, title: form.title, description: form.description, image: form.image }) });
      setMessage('SEO settings saved. Reload the storefront page to see the changes.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 p-3';
  return <DashboardLayout><main className="admin-page space-y-6">
    <PageHeader title="Page SEO" description="Customize metadata for a storefront page. Blank fields use automatic defaults." />
    <form onSubmit={load} className="max-w-2xl space-y-3 rounded-xl bg-white p-6">
      <label className="block">Page path<input className={inputClass} value={path} onChange={event => { setPath(event.target.value); setLoadedPath(''); }} required maxLength={300} disabled={busy} placeholder="/products/frame-slug" /></label>
      <p className="text-sm text-slate-500">Use / for Home, /collection, /eyeglasses, or the exact product/reviews path from the storefront URL. Omit the domain, query and trailing slash.</p>
      <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-white">{busy ? 'Please wait…' : 'Load page settings'}</button>
    </form>
    {loadedPath && <form onSubmit={save} className="max-w-2xl space-y-4 rounded-xl bg-white p-6">
      <h2 className="font-semibold">Metadata for {loadedPath}</h2>
      <label className="block">SEO title<input className={inputClass} value={form.title} maxLength={120} disabled={busy} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
      <p className="text-sm text-slate-500">The storefront adds “ | Lenskart Clone” to the title. Account and checkout pages remain excluded from indexing.</p>
      <label className="block">Meta description<textarea className={inputClass} rows={4} value={form.description} maxLength={320} disabled={busy} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <label className="block">Social image URL<input className={inputClass} type="url" value={form.image} maxLength={2000} disabled={busy} placeholder="https://example.com/image.jpg" onChange={event => setForm({ ...form, image: event.target.value })} /></label>
      <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-white">{busy ? 'Saving…' : 'Save SEO settings'}</button>
    </form>}
    {message && <p role="status">{message}</p>}{error && <p role="alert" className="text-red-600">{error}</p>}
  </main></DashboardLayout>;
}
