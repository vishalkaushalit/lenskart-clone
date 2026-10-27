import { useId, useState } from 'react';
import { Globe, Pencil, X } from 'lucide-react';
import { frontendUrl, productImageUrl } from '../api';

export default function SearchEngineListing({ value, onChange, defaultImage = '', defaultTitle = '', defaultDescription = '', path = '/', handle, onHandleChange, disabled = false, editorMode = false }) {
  const locked = disabled;
  const [expanded, setExpanded] = useState(editorMode);
  const id = useId();
  const description = defaultDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const title = value.title || defaultTitle || 'Page title';
  const url = `${frontendUrl}${path}`;
  const previewImage = value.image || defaultImage;
  const [failedImage, setFailedImage] = useState('');
  const displayUrl = new URL(url);
  const breadcrumb = [displayUrl.host, ...path.split('/').filter(Boolean)].join(' › ');
  function toggleEditor() {
    if (!expanded) onChange({ ...value, title: value.title || defaultTitle.slice(0, 120), description: value.description || description });
    setExpanded(!expanded);
  }
  function field(key, next) { onChange({ ...value, [key]: next }); }
  return <section className="product-panel min-w-0" aria-label="Search engine listing">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-semibold text-slate-900">Search engine listing</h2>
      {!editorMode && <button type="button" aria-label={expanded ? 'Close SEO editor' : 'Edit website SEO'} title={expanded ? 'Close SEO editor' : 'Edit website SEO'} aria-expanded={expanded} aria-controls={id} onClick={toggleEditor} disabled={locked} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${expanded ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{expanded ? <X size={16} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}</button>}
    </div>
    <p className="mt-2 text-sm text-slate-500">Preview how this page might appear in search results.</p>
    <div className="seo-preview" aria-label="Search result preview">
      <div className="seo-preview-site">
        <span className="seo-preview-icon" aria-hidden="true"><Globe size={18} /></span>
        <div className="seo-preview-site-text">
          <p className="seo-preview-name">Lenskart Clone</p>
          <p className="seo-preview-url" title={url}>{breadcrumb}</p>
        </div>
      </div>
      <div className="seo-preview-result">
        <div className="seo-preview-copy">
          <a className="seo-preview-title" href={url} target="_blank" rel="noopener noreferrer">{title} | Lenskart Clone</a>
          <p className="seo-preview-description">{value.description || description || 'Add a title and description to see a preview of this page.'}</p>
        </div>
        {previewImage && failedImage !== previewImage && <img className="seo-preview-thumbnail" src={productImageUrl(previewImage)} alt="Product search preview" onError={() => setFailedImage(previewImage)} />}
      </div>
    </div>
    <div id={id} hidden={!expanded} className="mt-5 space-y-5 border-t border-slate-200 pt-5">
      <label className="product-label block">Page title<input className="product-field" value={value.title} maxLength={120} disabled={locked} onChange={event => field('title', event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">{value.title.length} characters · About 70 recommended, including the store name</span></label>
      <label className="product-label block">Meta description<textarea className="product-field" rows={4} value={value.description} maxLength={320} disabled={locked} onChange={event => field('description', event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">{value.description.length} of 320 characters used</span></label>
      {onHandleChange ? <label className="product-label block">URL handle<div className="mt-2 text-xs font-normal text-slate-500">{frontendUrl}/products/</div><input name="slug" className="product-field" value={handle} maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="Generated from product name" disabled={locked} onChange={event => onHandleChange(event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">Changing the handle changes the product URL. Existing links are not redirected automatically.</span></label> : <label className="product-label block">Page URL<input className="product-field" value={url} readOnly /></label>}
      <p className="text-xs text-slate-500">Leave fields blank to use page content. Search engines may display a different title or description.</p>
    </div>
  </section>;
}
