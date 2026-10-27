import { editableStorePages } from '../../shared/storePages.js';

export const seoPages = editableStorePages.map(page => [page.path, page.label, page.title, page.description, page.noindex]);
export const seoPageKey = path => path === '/' ? 'home' : encodeURIComponent(path.slice(1));
