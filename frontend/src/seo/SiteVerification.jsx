import { useLocation } from 'react-router-dom';
import { installGoogleTracking, trackGooglePage } from '../analytics/googleTracking';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/api';
export default function SiteVerification() {
  const { pathname }=useLocation();
  const [ready,setReady]=useState(false);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest('/site-seo/settings', { signal: controller.signal }).then(settings => {
      if (controller.signal.aborted) return;
      installGoogleTracking(settings);
      setReady(true);
      for (const [name, key] of [['google-site-verification','googleVerification'],['facebook-domain-verification','metaVerification']]) {
        let tag=document.head.querySelector(`meta[name="${name}"]`);
        if (!settings[key]) { tag?.remove(); continue; }
        if (!tag) { tag=document.createElement('meta');tag.name=name;document.head.appendChild(tag); }
        tag.content=settings[key];
      }
    }).catch(() => { /* Preserve server-rendered tags if the optional read fails. */ });
    return () => controller.abort();
  }, []);
  useEffect(()=>{if(ready)trackGooglePage(pathname.replace(/\/(?:[a-f0-9]{24}|\d+)(?=\/|$)/gi,'/:id'));},[pathname,ready]);
  return null;
}
