import { editableStorePages } from '../../../shared/storePages.js';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../api/api';

const brand = 'Lenskart Clone';
const pages = Object.fromEntries(editableStorePages.map(page => [page.path, [page.title, page.description, page.noindex]]));

function setMeta(attribute, key, value) {
  const matches = [...document.head.querySelectorAll(`meta[${attribute}="${key}"]`)];
  const element = matches.shift() || document.createElement('meta');
  matches.forEach(duplicate => duplicate.remove());
  element.setAttribute(attribute, key);
  element.setAttribute('content', value);
  if (!element.parentNode) document.head.appendChild(element);
}

function applyMetadata({ title, description, url, noindex = false, image }) {
  document.title = `${title} | ${brand}`;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setMeta('property', 'og:title', document.title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', brand);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:title', document.title);
  setMeta('name', 'twitter:description', description);
  if (image) image = new URL(image, import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).href;
  for (const [attribute, key] of [['property', 'og:image'], ['name', 'twitter:image']]) {
    if (image) setMeta(attribute, key, image);
    else document.head.querySelectorAll(`meta[${attribute}="${key}"]`).forEach(node => node.remove());
  }
  const links = [...document.head.querySelectorAll('link[rel="canonical"]')];
  const canonical = links.shift() || document.createElement('link');
  links.forEach(link => link.remove());
  canonical.rel = 'canonical';
  canonical.href = url;
  if (!canonical.parentNode) document.head.appendChild(canonical);
}

export default function PageMetadata() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const productMatch = path.match(/^\/products\/([^/]+)(\/reviews)?$/);
    let [title, description, noindex] = pages[path] || ['Page Not Found', 'The page you requested could not be found.', true];
    if (/^\/thank-you\/[^/]+$/.test(path)) [title, description, noindex] = ['Order Confirmation', 'View your order confirmation and receipt.', true];
    if (/^\/orders\/[^/]+\/track$/.test(path)) [title, description, noindex] = ['Track Your Order', 'View the delivery status of your order.', true];
    if (productMatch) [title, description, noindex] = [productMatch[2] ? 'Product Reviews' : 'Eyewear Details', 'Explore eyewear details and customer reviews.', false];
    // Filtered/search URLs are kept out of the index; canonical URLs omit queries.
    const filtered = ['/collection', '/eyeglasses'].includes(path) && Boolean(search);
    const metadata = { title, description, noindex: noindex || filtered, url: new URL(path, window.location.origin).href };
    const controller = new AbortController();
    let overrides = {};
    let current = metadata;
    let productOverrides = {};
    function render(next = current) {
      current = next;
      applyMetadata({ ...current, ...Object.fromEntries(['title', 'description', 'image'].filter(key => overrides[key]).map(key => [key, overrides[key]])), ...productOverrides });
    }
    render();
    apiRequest(`/seo?path=${encodeURIComponent(path)}`, { signal: controller.signal }).then(({ seo }) => {
      if (!controller.signal.aborted) { overrides = seo || {}; render(); }
    }).catch(() => { /* Saved overrides are optional; keep automatic metadata available. */ });
    if (!productMatch) return () => controller.abort();
    apiRequest(`/products/${productMatch[1]}`, { signal: controller.signal }).then(({ product }) => {
      if (controller.signal.aborted || !product) return;
      if (!productMatch[2]) productOverrides = Object.fromEntries([['title', product.seoTitle], ['description', product.seoDescription], ['image', product.seoImage]].filter(([, value]) => value));
      const text = String(product.description || product.subtitle || `Explore ${product.name}, including frame details, available options and customer reviews.`).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      const imageBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api');
      render({ ...metadata, title: `${product.name}${productMatch[2] ? ' Reviews' : ''}`, description: productMatch[2] ? `Read customer reviews and ratings for ${product.name}.` : text, image: product.image ? new URL(product.image, imageBase).href : undefined });
    }).catch(() => {
      if (!controller.signal.aborted) render({ ...metadata, noindex: true });
    });
    return () => controller.abort();
  }, [pathname, search]);
  return null;
}
