import { PageRoutesContext } from './PageRoutesContext';
import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { editableStorePages } from '../../../shared/storePages.js';
import { resolveStorePath } from '../../../shared/urlPrefixes.js';
import { apiRequest } from '../api/api';
import FaqSchema from './FaqSchema';

function Content({ path }) {
  const [faqs, setFaqs] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/seo?path=${encodeURIComponent(path)}`, { signal: controller.signal }).then(({ seo }) => {
      if (!controller.signal.aborted) setFaqs(seo?.faqs ?? editableStorePages.find(page => page.path === path)?.faqs ?? []);
    }).catch(() => { /* Optional page content must not block the main page. */ });
    return () => controller.abort();
  }, [path]);
  if (!faqs.length) return null;
  return <section className="store-container py-8 sm:py-12" aria-label="Frequently asked questions">
    <h2 className="mb-5 text-xl font-semibold text-ink">Frequently asked questions</h2>
    <div className="space-y-3">{faqs.map((faq, index) => <details key={index} className="rounded-lg border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-medium">{faq.question}</summary><p className="mt-3 whitespace-pre-line text-sm leading-6">{faq.answer}</p></details>)}</div>
    <FaqSchema faqs={faqs} />
  </section>;
}
export default function PageFaq() {
  const routes=useContext(PageRoutesContext);
  const { pathname } = useLocation();
  const actualPath=pathname.replace(/\/+$/, '') || '/';
  const path=routes.find(row=>row.path===actualPath||row.urlPath===actualPath||row.redirects?.includes(actualPath))?.path || resolveStorePath(actualPath,routes).path;
  const pagePath=path.startsWith('/collection/')?'/collection':path;
  return editableStorePages.some(page => page.path === pagePath) ? <Content key={pagePath} path={pagePath} /> : null;
}
