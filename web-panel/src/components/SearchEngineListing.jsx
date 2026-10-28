import ImageUploadField from './ImageUploadField';
import { useId, useState } from 'react';
import { ArrowRight, Globe, Pencil, X } from 'lucide-react';
import { frontendUrl, productImageUrl } from '../api';

export default function SearchEngineListing({
  value,
  onChange,
  defaultImage = '',
  defaultTitle = '',
  defaultDescription = '',
  path = '/',
  currentUrlPath = path,
  handle,
  onHandleChange,
  disabled = false,
  editorMode = false,
  onUploading,
}) {
  const [uploading, setUploading] = useState(false);
  const locked = disabled || uploading;
  const [expanded, setExpanded] = useState(editorMode);
  const id = useId();
  const description = defaultDescription
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const title = value.title || defaultTitle || 'Page title';
  const url = `${frontendUrl}${value.urlPath || path}`;
  const nextUrlPath = value.urlPath ?? path;
  const urlChanged = !onHandleChange && nextUrlPath !== currentUrlPath;
  const oldUrl = `${frontendUrl}${currentUrlPath}`;
  const newUrl = `${frontendUrl}${nextUrlPath}`;
  const previewImage = value.image || defaultImage;
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [failedImage, setFailedImage] = useState('');
  const displayUrl = new URL(url);
  const breadcrumb = [displayUrl.host, ...path.split('/').filter(Boolean)].join(' › ');
  function toggleEditor() {
    if (!expanded)
      onChange({
        ...value,
        title: value.title || defaultTitle.slice(0, 120),
        description: value.description || description,
      });
    setExpanded(!expanded);
  }
  function field(key, next) {
    onChange({ ...value, [key]: next });
  }
  return (
    <section className="product-panel seo-editor min-w-0" aria-label="Search engine listing">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-semibold text-slate-900">Search engine listing</h2>
        {!editorMode && (
          <button
            type="button"
            aria-label={expanded ? 'Close SEO editor' : 'Edit website SEO'}
            title={expanded ? 'Close SEO editor' : 'Edit website SEO'}
            aria-expanded={expanded}
            aria-controls={id}
            onClick={toggleEditor}
            disabled={locked}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${expanded ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
          >
            {expanded ? (
              <X size={16} aria-hidden="true" />
            ) : (
              <Pencil size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Preview how this page might appear in search results.
      </p>
      <div className={`seo-editor-layout ${expanded ? 'is-expanded' : ''}`}>
        <div className="seo-preview" aria-label="Search result preview">
          <div className="seo-preview-site">
            <span className="seo-preview-icon" aria-hidden="true">
              {faviconFailed ? (
                <Globe size={18} />
              ) : (
                <img
                  src={`${frontendUrl}/favicon.ico`}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                  onError={() => setFaviconFailed(true)}
                />
              )}
            </span>
            <div className="seo-preview-site-text">
              <p className="seo-preview-name">Lenskart Clone</p>
              <p className="seo-preview-url" title={url}>
                {breadcrumb}
              </p>
            </div>
          </div>
          <div className="seo-preview-result">
            <div className="seo-preview-copy">
              <a className="seo-preview-title" href={url} target="_blank" rel="noopener noreferrer">
                {title} | Lenskart Clone
              </a>
              <p className="seo-preview-description">
                {value.description ||
                  description ||
                  'Add a title and description to see a preview of this page.'}
              </p>
            </div>
            {previewImage && failedImage !== previewImage && (
              <img
                className="seo-preview-thumbnail"
                src={productImageUrl(previewImage)}
                alt="Product search preview"
                onError={() => setFailedImage(previewImage)}
              />
            )}
          </div>
        </div>
        <div id={id} hidden={!expanded} className="seo-editor-fields min-w-0 space-y-5">
          <div className="grid items-start gap-5 md:grid-cols-2">
            <label className="product-label block min-w-0">
              Page title
              <input
                className="product-field"
                value={value.title}
                maxLength={120}
                disabled={locked}
                onChange={(event) => field('title', event.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                {value.title.length} characters · About 70 recommended, including the store name
              </span>
            </label>
            {onHandleChange ? (
              <label className="product-label block min-w-0">
                URL handle
                <div className="mt-2 text-xs font-normal text-slate-500">
                  {frontendUrl}/products/
                </div>
                <input
                  name="slug"
                  className="product-field"
                  value={handle}
                  maxLength={120}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  placeholder="Generated from product name"
                  disabled={locked}
                  onChange={(event) => onHandleChange(event.target.value)}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Changing the handle changes the product URL. Existing links are not redirected
                  automatically.
                </span>
              </label>
            ) : (
              <label className="product-label block min-w-0">
                Page URL
                <input
                  className="product-field"
                  value={value.urlPath ?? path}
                  maxLength={300}
                  disabled={locked}
                  onChange={(event) => field('urlPath', event.target.value)}
                />
                <span className="mt-1 block break-all text-xs font-normal text-slate-500">
                  {url}
                </span>
              </label>
            )}
          </div>
          {urlChanged && (
            <section
              aria-label="URL redirect preview"
              className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid items-center gap-3 text-sm sm:grid-cols-[1fr_auto_1fr]">
                <div className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">Old URL</span>
                  <p className="break-all font-sans text-slate-800">{oldUrl}</p>
                </div>
                <ArrowRight size={18} className="text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">New URL</span>
                  <p className="break-all font-sans text-slate-800">{newUrl}</p>
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium text-black">
                <input
                  type="checkbox"
                  checked={value.redirectOld ?? true}
                  disabled={locked}
                  onChange={(event) => field('redirectOld', event.target.checked)}
                />
                Redirect the old URL to the new URL (301)
              </label>
            </section>
          )}
          <label className="product-label block">
            Meta description
            <textarea
              className="product-field"
              rows={4}
              value={value.description}
              maxLength={320}
              disabled={locked}
              onChange={(event) => field('description', event.target.value)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {value.description.length} of 320 characters used
            </span>
          </label>
          <label className="product-label block">
            Meta keywords
            <input
              className="product-field"
              value={value.keywords || ''}
              maxLength={1000}
              disabled={locked}
              placeholder="eyeglasses, square frames, metal frames"
              onChange={(event) => field('keywords', event.target.value)}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Separate keywords with commas.
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              className="mt-1 accent-blue-600"
              checked={Boolean(value.noindex)}
              disabled={locked}
              onChange={(event) => field('noindex', event.target.checked)}
            />
            <span>
              <span className="block text-sm font-semibold text-black">
                Hide this page from search engines (noindex)
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                When enabled, adds noindex and excludes this page from the automatic sitemap. Save
                changes to apply.
              </span>
            </span>
          </label>
          <ImageUploadField
            uploadArea
            name="seoImage"
            label="Social sharing image (optional)"
            value={value.image || ''}
            fallbackValue={defaultImage}
            disabled={disabled}
            onChange={(image) => field('image', image)}
            onUploading={(active) => {
              setUploading(active);
              onUploading?.(active);
            }}
          />
          <p className="text-xs text-slate-500">
            Leave fields blank to use page content. Search engines may display a different title or
            description.
          </p>
        </div>
      </div>
    </section>
  );
}
