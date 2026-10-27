/* eslint-disable react-refresh/only-export-components -- Router adapter intentionally exports components and navigation hooks. */
import { useContext, forwardRef, useCallback } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import { PageRoutesContext } from './seo/PageRoutesContext';
import { resolveStorePath } from '../../shared/urlPrefixes.js';
export * from 'react-router-dom';
function destination(to, routes) {
  if (typeof to === 'object' && to !== null) return {...to, pathname: to.pathname ? destination(to.pathname, routes) : to.pathname};
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//')) return to;
  const [,path,suffix]=to.match(/^([^?#]*)(.*)$/);
  return resolveStorePath(path,routes).destination+suffix;
}
export const Link=forwardRef(function Link({to,...props},ref){const routes=useContext(PageRoutesContext);return <RouterLink ref={ref} to={destination(to,routes)} {...props}/>;});
export const NavLink=forwardRef(function NavLink({to,...props},ref){const routes=useContext(PageRoutesContext);return <RouterNavLink ref={ref} to={destination(to,routes)} {...props}/>;});
export function useNavigate(){const navigate=useRouterNavigate();const routes=useContext(PageRoutesContext);return useCallback((to,options)=>navigate(destination(to,routes),options),[navigate,routes]);}
