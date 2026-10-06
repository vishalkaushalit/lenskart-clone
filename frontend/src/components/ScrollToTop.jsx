import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const {pathname, search}=useLocation();
  useLayoutEffect(()=>{
    const previous=window.history.scrollRestoration;
    window.history.scrollRestoration='manual';
    return ()=>{window.history.scrollRestoration=previous;};
  },[]);
  // Reset before painting, including navigation between collection query URLs.
  useLayoutEffect(()=>{
    window.scrollTo({top:0,left:0,behavior:'instant'});
  },[pathname,search]);
  return null;
}
