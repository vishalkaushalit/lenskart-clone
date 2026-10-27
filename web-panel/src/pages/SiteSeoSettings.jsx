import RedirectSettings from '../components/RedirectSettings';
import TextFileUpload from '../components/TextFileUpload';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import NotificationPopup from '../components/NotificationPopup';
import { apiRequest, frontendUrl } from '../api';
const defaults={redirects:[],productPrefix:'/products',collectionPrefix:'/collection',websiteUrl:'',googleVerification:'',metaVerification:'',trackingMode:'off',gtmId:'',ga4Id:'',googleAdsId:'',sitemap:'',robots:''};
export default function SiteSeoSettings(){
  const [params,setParams]=useSearchParams();
  const tab=params.get('tab')==='redirects'?'redirects':'general';
  const [form,setForm]=useState(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState(null);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  function notify(message,type='success'){setNotice(previous=>({message,type,id:(previous?.id || 0)+1}));}
  useEffect(()=>{const controller=new AbortController();apiRequest('/admin/site-seo',{signal:controller.signal}).then(({settings})=>{if(!controller.signal.aborted)setForm({...defaults,...settings});}).catch(err=>{if(!controller.signal.aborted)setError(err.message);});return()=>controller.abort();},[attempt]);
  function field(key,value){setForm(previous=>({...previous,[key]:value}));}
  async function upload(key,file){
    if(!file)return;
    if(file.size>(key==='sitemap'?200000:100000)){notify('This file is too large.','error');return;}
    if((key==='sitemap'&&!/\.xml$/i.test(file.name))||(key==='robots'&&!/\.txt$/i.test(file.name))){notify('Select the matching XML or TXT file.','error');return;}
    setBusy(true);
    try{field(key,await file.text());notify('File loaded. Save changes to publish.');}catch{notify('Unable to read this file.','error');}finally{setBusy(false);}
  }
  async function save(event){event.preventDefault();setBusy(true);try{const {settings}=await apiRequest('/admin/site-seo',{method:'PUT',body:JSON.stringify(Object.fromEntries(Object.keys(defaults).map(key=>[key,form[key]])))});setForm({...defaults,...settings});notify('Site SEO settings saved.');}catch(err){notify(err.message,'error');}finally{setBusy(false);}}
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Site SEO settings" description="Website verification and search engine files"><Link to="/seo" className="admin-button-secondary">Back to listings</Link></PageHeader>
    <div role="tablist" aria-label="Settings sections" className="mb-5 flex gap-3">{[['general','General'],['redirects','Redirections']].map(([key,label])=><button key={key} type="button" role="tab" aria-selected={tab===key} aria-controls={`settings-${key}`} className={tab===key?'admin-button-primary':'admin-button-secondary'} onClick={()=>setParams(key==='redirects'?{tab:'redirects'}:{})}>{label}</button>)}</div>
    {!form&&!error&&<Loader label="Loading settings"/>}
    {error&&<div role="alert">{error}<button type="button" className="admin-button-secondary ml-3" onClick={()=>{setError('');setAttempt(value=>value+1);}}>Retry</button></div>}
    {form&&<form onSubmit={save} className="space-y-5"><fieldset disabled={busy} className="space-y-5"><div id={`settings-${tab}`} role="tabpanel" className="space-y-5">{tab==='general'?<>
      <section className="product-panel seo-editor space-y-5"><h2 className="product-panel-title">Store URL prefixes</h2>
        <div className="grid gap-5 md:grid-cols-2">{[['productPrefix','Products','/products'],['collectionPrefix','Collections','/collection']].map(([key,label,placeholder])=><label key={key} className="product-label block">{label}<input required className="product-field" value={form[key]} placeholder={placeholder} maxLength={61} pattern="/[a-z][a-z0-9-]{0,59}" onChange={event=>field(key,event.target.value)}/><span className="mt-2 block text-xs font-normal text-slate-500">{(form.websiteUrl || frontendUrl)+form[key]}{key==='productPrefix'?'/product-slug':'?category=collection-slug'}</span></label>)}</div>
        <p className="text-sm text-slate-500">Changes apply across the store. Old prefixes permanently redirect (301), keeping product slugs and collection filters. The automatic sitemap updates after saving. Reload the storefront to load new routes.</p>
      </section>
      <section className="product-panel seo-editor space-y-5"><h2 className="product-panel-title">Google &amp; Meta verification</h2>
        <label className="product-label block">Website URL<input className="product-field" type="url" value={form.websiteUrl} placeholder={frontendUrl} maxLength={2000} onChange={event=>field('websiteUrl',event.target.value)}/><span className="mt-2 block text-xs font-normal text-slate-500">Use your public website origin, e.g. https://example.com, for sitemap URLs.</span></label>
        <div className="grid gap-5 md:grid-cols-2">{[['googleVerification','Google Search Console verification'],['metaVerification','Meta / Facebook domain verification']].map(([key,label])=><label key={key} className="product-label block">{label}<textarea className="product-field" rows={3} value={form[key]} maxLength={2000} placeholder="Paste the verification token or full meta tag" onChange={event=>field(key,event.target.value)}/></label>)}</div>
        <p className="text-xs text-slate-500">Paste the verification token or meta tag supplied by Google or Meta. Save, then verify in that service. These fields are for domain verification tags.</p>
      </section>
      <section className="product-panel seo-editor space-y-5"><h2 className="product-panel-title">Google tracking</h2>
        <label className="product-label block">Installation method<select className="product-field" value={form.trackingMode} onChange={event=>field('trackingMode',event.target.value)}><option value="off">Disabled</option><option value="gtm">Google Tag Manager</option><option value="direct">Direct Google tag (GA4 / Google Ads)</option></select></label>
        {form.trackingMode==='gtm'&&<label className="product-label block">GTM container ID<input className="product-field" value={form.gtmId} required pattern="GTM-[A-Z0-9]+" maxLength={40} placeholder="GTM-XXXXXXX" onChange={event=>field('gtmId',event.target.value.trim().toUpperCase())}/><span className="mt-2 block text-xs font-normal text-slate-500">Configure and publish Analytics, Ads and SPA page-view triggers inside your GTM container.</span></label>}
        {form.trackingMode==='direct'&&<div className="grid gap-5 md:grid-cols-2">{[['ga4Id','GA4 measurement ID','G-XXXXXXXXXX','G-[A-Z0-9]+'],['googleAdsId','Google Ads tag ID','AW-123456789','AW-[0-9]+']].map(([key,label,placeholder,pattern])=><label key={key} className="product-label block">{label}<input className="product-field" value={form[key]} maxLength={40} pattern={pattern} placeholder={placeholder} onChange={event=>field(key,event.target.value.trim().toUpperCase())}/></label>)}</div>}
        <p className="text-xs text-slate-500">Enter IDs only. Tracking loads on the storefront after saving and reloading. Direct mode sends GA4 page views and installs the Ads base tag; conversion events need a separate configuration. Use one installation method to avoid duplicate tags. For direct GA4, disable enhanced-measurement page views based on browser history to avoid duplicate navigation events.</p>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-2">{[['sitemap','Sitemap','sitemap.xml','.xml,application/xml,text/xml',200000],['robots','Robots','robots.txt','.txt,text/plain',100000]].map(([key,label,file,accept,max])=><section key={key} className="product-panel seo-editor space-y-4">
        <h2 className="product-panel-title">{label}</h2><p className="text-sm text-slate-500">{key==='sitemap'?'Default: automatically lists indexable pages and active products. Upload XML to override.':'Default: allows public pages and links to the sitemap. Upload TXT to override.'}</p>
        <TextFileUpload filename={file} accept={accept} value={form[key]} disabled={busy} onFile={selected=>upload(key,selected)} onRemove={()=>{field(key,'');notify('File override removed. Save changes to restore the automatic default.');}} />
        <label className="product-label block">File preview<textarea className="product-field font-mono text-xs" rows={10} maxLength={max} value={form[key]} placeholder="Automatic default is active" onChange={event=>field(key,event.target.value)}/></label>
        <div className="flex flex-wrap gap-3"><a href={`${frontendUrl}/${file}`} target="_blank" rel="noopener noreferrer" className="admin-button-secondary">View live {file}</a>{form[key]&&<button type="button" className="admin-button-secondary" onClick={()=>{field(key,'');notify('Override removed. Save changes to restore the default.');}}>Restore default</button>}</div>
      </section>)}</div>
    </>:<RedirectSettings settings={form} onChange={value=>field('redirects',value)} notify={notify}/>}</div></fieldset><div className="product-editor-actions"><Link to="/seo" className="admin-button-secondary">Cancel</Link><button disabled={busy} className="admin-button-primary">{busy?'Saving…':'Save changes'}</button></div></form>}
    {notice&&<NotificationPopup key={notice.id} notification={notice} duration={3000} onClose={()=>setNotice(null)}/>}
  </main></DashboardLayout>;
}
