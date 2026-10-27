import NotificationPopup from '../components/NotificationPopup';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import PopupMessage from '../components/PopupMessage';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import SearchEngineListing from '../components/SearchEngineListing';
import { apiRequest } from '../api';
import { seoPages } from '../seoPages';

function FaqToggle({ question, index, children }) {
  const [open, setOpen] = useState(!question);
  return <details open={open} onToggle={event => setOpen(event.currentTarget.open)} className="seo-faq-toggle rounded-lg border border-slate-200" onInvalidCapture={event => { event.currentTarget.open = true; setOpen(true); }}>
    <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold text-black"><span className="min-w-0 break-words">{question || `Question ${index + 1}`}</span><ChevronDown size={18} className="seo-faq-chevron shrink-0" aria-hidden="true" /></summary>
    <div className="space-y-3 border-t border-slate-200 p-4">{children}</div>
  </details>;
}

function Editor({ page }) {
  const [path, label, title, description, defaultNoindex, keywords, faqs] = page;
  const [form, setForm] = useState(null);
  const [savedUrlPath, setSavedUrlPath] = useState(path);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  function notify(message, type = 'success') { setNotice({ message, type, id: Date.now() }); }
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/admin/seo?path=${encodeURIComponent(path)}`, { signal: controller.signal }).then(({ seo }) => {
      if (!controller.signal.aborted) {
        setSavedUrlPath(seo?.urlPath || path);
        setForm({ urlPath: seo?.urlPath || path, redirectOld: seo?.redirectOld ?? true, noindex: seo?.noindex ?? defaultNoindex, keywords: seo?.keywords ?? keywords, faqs: seo?.faqs ?? faqs, title: seo?.title || title, description: seo?.description || description, image: seo?.image || '' });
      }
    }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [path, title, description, defaultNoindex, keywords, faqs, attempt]);
  async function save(event) {
    event.preventDefault();
    if (saving || uploading) return;
    setSaving(true); setError(''); setNotice(null);
    try {
      await apiRequest('/admin/seo', { method: 'PUT', body: JSON.stringify({ path, title: form.title, description: form.description, image: form.image, keywords: form.keywords, faqs: form.faqs, noindex: form.noindex, urlPath: form.urlPath, redirectOld: form.redirectOld }) });
      setSavedUrlPath(form.urlPath || path);
      notify('SEO settings saved successfully.');
    } catch (err) { notify(err.message, 'error'); }
    finally { setSaving(false); }
  }
  return <>
    <PageHeader title={`Edit SEO: ${label}`} description={`Update the search engine listing for ${path}`}><Link to="/seo" className="admin-button-secondary">Back to listings</Link></PageHeader>
    {!form && !error && <Loader label="Loading editor" />}
    {form && <form onSubmit={save} onInvalidCapture={() => notify('Please complete the required fields before saving.', 'error')} className="space-y-4">
      <SearchEngineListing onUploading={setUploading} editorMode value={form} onChange={setForm} defaultTitle={title} defaultDescription={description} path={path} currentUrlPath={savedUrlPath} disabled={saving || uploading} />
      <section className="product-panel seo-editor space-y-4"><h2 className="product-panel-title">Frequently asked questions</h2><p className="text-sm text-slate-500">Questions and answers appear on this page. FAQ schema is generated automatically from this content.</p>
        <fieldset disabled={saving || uploading} className="space-y-4">{form.faqs.map((faq, index) => <FaqToggle key={index} question={faq.question} index={index}>
          <label className="product-label block">Question {index + 1}<input className="product-field" required maxLength={200} value={faq.question} onChange={event => setForm({ ...form, faqs: form.faqs.map((row, i) => i === index ? { ...row, question: event.target.value } : row) })} /></label>
          <label className="product-label block">Answer<textarea className="product-field" required rows={3} maxLength={1000} value={faq.answer} onChange={event => setForm({ ...form, faqs: form.faqs.map((row, i) => i === index ? { ...row, answer: event.target.value } : row) })} /></label>
          <button type="button" className="delete-button" aria-label={`Delete FAQ ${index + 1}`} title="Delete FAQ" onClick={() => { setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== index) }); notify('FAQ removed. Save changes to apply.'); }}><Trash2 size={18} aria-hidden="true" /></button>
        </FaqToggle>)}<button type="button" className="admin-button-secondary" disabled={form.faqs.length >= 20} onClick={() => { setForm({ ...form, faqs: [...form.faqs, { question: '', answer: '' }] }); notify('FAQ added. Enter a question and answer, then save.'); }}>Add FAQ</button></fieldset>
      </section>
      <p className="text-xs text-slate-500">The noindex checkbox controls this page’s search indexing preference. Search engines apply changes after recrawling.</p>
      <div className="product-editor-actions"><Link to="/seo" className="admin-button-secondary">Cancel</Link><button disabled={saving || uploading} className="admin-button-primary">{saving ? 'Saving…' : 'Save changes'}</button></div>
    </form>}
    {error && <div className="space-y-3"><PopupMessage message={error} />{!form && <button type="button" className="admin-button-secondary ml-3" onClick={() => { setError(''); setAttempt(attempt + 1); }}>Retry</button>}</div>}
    {notice && <NotificationPopup key={notice.id} notification={notice} duration={3000} onClose={() => setNotice(null)} />}
  </>;
}

export default function PageSeoEdit() {
  const { pageKey } = useParams();
  const page = seoPages.find(([path]) => (path === '/' ? 'home' : path.slice(1)) === pageKey);
  return <DashboardLayout><main className="admin-page space-y-6">
    {page ? <Editor key={pageKey} page={page} /> : <p role="alert">Page not found. Choose a page from the listings.</p>}
  </main></DashboardLayout>;
}
