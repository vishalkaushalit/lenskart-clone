import { PageRoutesContext } from './seo/PageRoutesContext';
import { apiRequest } from './api/api';
import SiteVerification from './seo/SiteVerification';
import { LoaderProvider } from '../../shared/LoadingOverlay.jsx';
import { storePages } from '../../shared/storePages.js';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation, useParams, generatePath } from 'react-router-dom';
import Loader from './components/Loader';
import PageMetadata from './seo/PageMetadata';
import StoreLayout from './routes';
import ProtectedRoute from './components/ProtectedRoute';

const modules = import.meta.glob('./pages/*.jsx');
const components = Object.fromEntries(Object.entries(modules).map(([path, load]) => [path.split('/').pop().replace('.jsx', ''), lazy(load)]));
function RedirectPage({to}) { const location=useLocation();const params=useParams();return <Navigate replace to={generatePath(to,params)+location.search+location.hash}/>; }
function pageRoute(page, settings) {
  const Component = components[page.component];
  if (page.component && !Component) throw new Error(`Missing storefront component: ${page.component}`);
  const element=Component ? <Component /> : <p>{page.message}</p>;
  const config=settings.find(row=>!row.redirectOnly&&row.path===page.path);
  const target=config?.urlPath || page.path;
  return [...new Set([page.path,target,...(config?.redirects || [])])].map(path=><Route key={path} path={path} element={path!==target&&(config?.redirectOld || config?.redirects?.includes(path))?<RedirectPage to={target}/>:element}/>);
}
export default function App() {
  const [settings,setSettings]=useState(null);
  useEffect(()=>{const controller=new AbortController();apiRequest('/seo/routes',{signal:controller.signal}).then(({pages})=>{if(!controller.signal.aborted)setSettings(pages);}).catch(()=>{if(!controller.signal.aborted)setSettings([]);});return()=>controller.abort();},[]);
  return <LoaderProvider className="store">{!settings?<Loader label="Loading store"/>:<PageRoutesContext.Provider value={settings}><SiteVerification /><PageMetadata /><Suspense fallback={<Loader label="Loading page" />}><Routes>
    <Route element={<StoreLayout />}>
      {settings.filter(row=>row.redirectOnly).map(row=><Route key={row.path} path={row.path} element={<RedirectPage to={row.urlPath}/>}/>)}
      {storePages.filter(page => page.layout === 'store' && !page.protected).map(page=>pageRoute(page,settings))}
      {settings.filter(row=>row.path==='/collection/:category'&&!row.redirectOnly).flatMap(row=>[...new Set([row.path,row.urlPath,...(row.redirects||[])])].filter(Boolean).map(path=><Route key={path} path={path} element={path!==row.urlPath&&(row.redirectOld||row.redirects?.includes(path))?<RedirectPage to={row.urlPath}/>:<components.Collection/>}/>))}
      <Route element={<ProtectedRoute />}>
        {storePages.filter(page => page.layout === 'store' && page.protected).map(page=>pageRoute(page,settings))}
      </Route>
      <Route path="*" element={<h1>Page not found</h1>} />
    </Route>
    <Route element={<main className="store-page-surface store-auth-layout"><Outlet /></main>}>
      {storePages.filter(page => page.layout === 'auth').map(page=>pageRoute(page,settings))}
    </Route>
  </Routes></Suspense></PageRoutesContext.Provider>}</LoaderProvider>;
}
