import { LoaderProvider } from '../../shared/LoadingOverlay.jsx';
import { storePages } from '../../shared/storePages.js';
import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Loader from './components/Loader';
import PageMetadata from './seo/PageMetadata';
import StoreLayout from './routes';
import ProtectedRoute from './components/ProtectedRoute';

const modules = import.meta.glob('./pages/*.jsx');
const components = Object.fromEntries(Object.entries(modules).map(([path, load]) => [path.split('/').pop().replace('.jsx', ''), lazy(load)]));
function pageRoute(page) {
  const Component = components[page.component];
  if (page.component && !Component) throw new Error(`Missing storefront component: ${page.component}`);
  return <Route key={page.path} path={page.path} element={Component ? <Component /> : <p>{page.message}</p>} />;
}
export default function App() {
  return <LoaderProvider className="store"><PageMetadata /><Suspense fallback={<Loader label="Loading page" />}><Routes>
    <Route element={<StoreLayout />}>
      {storePages.filter(page => page.layout === 'store' && !page.protected).map(pageRoute)}
      <Route element={<ProtectedRoute />}>
        {storePages.filter(page => page.layout === 'store' && page.protected).map(pageRoute)}
      </Route>
      <Route path="*" element={<h1>Page not found</h1>} />
    </Route>
    <Route element={<main className="store-page-surface store-auth-layout"><Outlet /></main>}>
      {storePages.filter(page => page.layout === 'auth').map(pageRoute)}
    </Route>
  </Routes></Suspense></LoaderProvider>;
}
