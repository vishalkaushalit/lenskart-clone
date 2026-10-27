import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import PopupMessage from '../components/PopupMessage';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import SearchEngineListing from '../components/SearchEngineListing';
import { apiRequest } from '../api';
import { seoPages } from '../seoPages';

function Editor({ page }) {
  const [path, label, title, description] = page;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/admin/seo?path=${encodeURIComponent(path)}`, { signal: controller.signal }).then(({ seo }) => {
      if (!controller.signal.aborted) setForm({ title: seo?.title || title, description: seo?.description || description, image: seo?.image || '' });
    }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [path, title, description, attempt]);
  async function save(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      await apiRequest('/admin/seo', { method: 'PUT', body: JSON.stringify({ path, title: form.title, description: form.description, image: form.image }) });
      setMessage('SEO settings saved. Reload the storefront to see the changes.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <>
    <PageHeader title={`Edit SEO: ${label}`} description={`Update the search engine listing for ${path}`}><Link to="/seo" className="admin-button-secondary">Back to listings</Link></PageHeader>
    {!form && !error && <Loader label="Loading editor" />}
    {form && <form onSubmit={save} className="space-y-4">
      <SearchEngineListing editorMode value={form} onChange={setForm} defaultTitle={title} defaultDescription={description} path={path} disabled={saving} />
      <p className="text-xs text-slate-500">Account and checkout pages remain excluded from search indexing.</p>
      <div className="product-editor-actions"><Link to="/seo" className="admin-button-secondary">Cancel</Link><button disabled={saving} className="admin-button-primary">{saving ? 'Saving…' : 'Save changes'}</button></div>
    </form>}
    {error && <div className="space-y-3"><PopupMessage message={error} />{!form && <button type="button" className="admin-button-secondary ml-3" onClick={() => { setError(''); setAttempt(attempt + 1); }}>Retry</button>}</div>}
    {message && <p role="status" className="text-sm text-green-700">{message}</p>}
  </>;
}

export default function PageSeoEdit() {
  const { pageKey } = useParams();
  const page = seoPages.find(([path]) => (path === '/' ? 'home' : path.slice(1)) === pageKey);
  return <DashboardLayout><main className="admin-page space-y-6">
    {page ? <Editor key={pageKey} page={page} /> : <p role="alert">Page not found. Choose a page from the listings.</p>}
  </main></DashboardLayout>;
}
