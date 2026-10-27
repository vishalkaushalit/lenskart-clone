import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import NotificationPopup from '../components/NotificationPopup';
import { apiRequest, frontendUrl } from '../api';
const defaults={websiteUrl:'',googleVerification:'',metaVerification:'',sitemap:'',robots:''};
export default function SiteSeoSettings(){
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
    if(file.size>(key==='sitemap'?200000:key==='robots'?100000:2000)){notify('This file is too large.','error');return;}
    if((key==='sitemap'&&!/\.xml$/i.test(file.name))||(key==='robots'&&!/\.txt$/i.test(file.name))){notify('Select the matching XML or TXT file.','error');return;}
    try{field(key,await file.text());notify('File loaded. Save changes to publish.');}catch{notify('Unable to read this file.','error');}
  }
  async function save(event){event.preventDefault();setBusy(true);try{const {settings}=await apiRequest('/admin/site-seo',{method:'PUT',body:JSON.stringify(Object.fromEntries(Object.keys(defaults).map(key=>[key,form[key]])))});setForm({...defaults,...settings});notify('Site SEO settings saved.');}catch(err){notify(err.message,'error');}finally{setBusy(false);}}
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Site SEO settings" description="Website verification and search engine files"><Link to="/seo" className="admin-button-secondary">Back to listings</Link></PageHeader>
    {!form&&!error&&<Loader label="Loading settings"/>}
    {error&&<div role="alert">{error}<button type="button" className="admin-button-secondary ml-3" onClick={()=>{setError('');setAttempt(value=>value+1);}}>Retry</button></div>}
    {form&&<form onSubmit={save} className="space-y-5"><fieldset disabled={busy} className="space-y-5">
      <section className="product-panel seo-editor space-y-5"><h2 className="product-panel-title">Google &amp; Meta verification</h2>
        <label className="product-label block">Website URL<input className="product-field" type="url" value={form.websiteUrl} placeholder={frontendUrl} maxLength={2000} onChange={event=>field('websiteUrl',event.target.value)}/><span className="mt-2 block text-xs font-normal text-slate-500">Use your public website origin, e.g. https://example.com, for sitemap URLs.</span></label>
        <div className="grid gap-5 md:grid-cols-2">{[['googleVerification','Google Search Console verification'],['metaVerification','Meta / Facebook domain verification']].map(([key,label])=><label key={key} className="product-label block">{label}<textarea className="product-field" rows={3} value={form[key]} maxLength={2000} placeholder="Paste the verification token or full meta tag" onChange={event=>field(key,event.target.value)}/><span className="mt-2 block text-xs font-normal text-slate-500">Or upload a file containing the verification meta tag (max 2 KB).</span><input className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700" type="file" accept=".txt,.html,text/plain,text/html" onChange={event=>{upload(key,event.target.files?.[0]);event.target.value='';}}/></label>)}</div>
        <p className="text-xs text-slate-500">Paste the verification token or meta tag supplied by Google or Meta. Save, then verify in that service. These fields are for domain verification tags.</p>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-2">{[['sitemap','Sitemap','sitemap.xml','.xml,application/xml,text/xml',200000],['robots','Robots','robots.txt','.txt,text/plain',100000]].map(([key,label,file,accept,max])=><section key={key} className="product-panel seo-editor space-y-4">
        <h2 className="product-panel-title">{label}</h2><p className="text-sm text-slate-500">{key==='sitemap'?'Default: automatically lists indexable pages and active products. Upload XML to override.':'Default: allows public pages and links to the sitemap. Upload TXT to override.'}</p>
        <label className="product-label block">Upload {file}<input className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700" type="file" accept={accept} onChange={event=>{upload(key,event.target.files?.[0]);event.target.value='';}}/></label>
        <label className="product-label block">File preview<textarea className="product-field font-mono text-xs" rows={10} maxLength={max} value={form[key]} placeholder="Automatic default is active" onChange={event=>field(key,event.target.value)}/></label>
        <div className="flex flex-wrap gap-3"><a href={`${frontendUrl}/${file}`} target="_blank" rel="noopener noreferrer" className="admin-button-secondary">View live {file}</a>{form[key]&&<button type="button" className="admin-button-secondary" onClick={()=>{field(key,'');notify('Override removed. Save changes to restore the default.');}}>Restore default</button>}</div>
      </section>)}</div>
    </fieldset><div className="product-editor-actions"><Link to="/seo" className="admin-button-secondary">Cancel</Link><button disabled={busy} className="admin-button-primary">{busy?'Saving…':'Save changes'}</button></div></form>}
    {notice&&<NotificationPopup key={notice.id} notification={notice} duration={3000} onClose={()=>setNotice(null)}/>}
  </main></DashboardLayout>;
}
