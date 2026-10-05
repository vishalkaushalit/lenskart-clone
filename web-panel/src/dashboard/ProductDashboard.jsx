import Loader from '../components/Loader';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Trash2, Plus, RefreshCw, Search, Eye } from 'lucide-react';
import Pagination from '../components/Pagination';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import DashboardLayout from '../components/DashboardLayout';
import ProductDialog from '../components/ProductDialog';
import NotificationPopup from '../components/NotificationPopup';
import { apiRequest } from '../api';

export default function ProductDashboard() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [action, setAction] = useState(null);
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setFailed(false);
      try { const data = await apiRequest('/admin/products', { signal: controller.signal }); if (!controller.signal.aborted) setCatalog(data.products); }
      catch (error) { if (!controller.signal.aborted) { setFailed(true); setNotification({ type:'error', message:error.message }); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [attempt]);
  const products = catalog.filter((p) => (!type || p.productType === type) && (!brand || p.brand === brand) && (!status || p.status === status) && `${p.name} ${p.sku} ${p.brand} ${p.productType}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(products.length / 20));
  const currentPage = Math.min(page, totalPages);
  const shown = products.slice((currentPage - 1) * 20, currentPage * 20);
  const assetUrl = (path) => path.startsWith('/') ? new URL(path, import.meta.env.VITE_API_URL || 'http://localhost:5001/api').href : path;
  const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm';
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Products" description="Manage your product catalog"><div className="flex gap-2"><button disabled={loading} onClick={() => setAttempt((n) => n + 1)} className="admin-button-secondary"><RefreshCw size={16} />Refresh</button><Link to="/product/add" className="admin-button-primary"><Plus size={18} />Add Product</Link></div></PageHeader>
    <div className="grid gap-3 rounded-xl border border-slate-100 bg-white p-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_.8fr_1.5fr]">
      <select aria-label="Product type" value={type} onChange={(e) => {setType(e.target.value);setPage(1);}} className={selectClass}><option value="">All Categories</option>{['Eyeglasses','Sunglasses'].map((v) => <option key={v}>{v}</option>)}</select>
      <select aria-label="Brand" value={brand} onChange={(e) => {setBrand(e.target.value);setPage(1);}} className={selectClass}><option value="">All brands</option>{[...new Set(catalog.map((p) => p.brand))].map((v) => <option key={v}>{v}</option>)}</select>
      <select aria-label="Status" value={status} onChange={(e) => {setStatus(e.target.value);setPage(1);}} className={selectClass}><option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={16} className="shrink-0 text-slate-400"/><input aria-label="Search products" placeholder="Search products..." value={search} onChange={(e) => {setParams({search:e.target.value},{replace:true});setPage(1);}} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" /></label>
    </div>
    <DataTable label="Products" footer={!loading && !failed && <Pagination page={currentPage} total={products.length} onPageChange={setPage} label="products" />}>

      <thead><tr><th><input type="checkbox" aria-label="Select all products on this page" checked={shown.length>0&&shown.every((p)=>selected.includes(p.id))} onChange={(e)=>setSelected((previous)=>e.target.checked?[...new Set([...previous,...shown.map((p)=>p.id)])]:previous.filter((id)=>!shown.some((p)=>p.id===id)))} className="accent-blue-600"/></th>{['Image','Product Name','Category','Price','Stock','Status','Actions'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={8} className="text-center"><Loader label="Loading products"/></td></tr> : failed ? <tr><td colSpan={8} className="text-center"><button onClick={() => setAttempt((n)=>n+1)}>Try again</button></td></tr> : !shown.length ? <tr><td colSpan={8} className="text-center">No products found.</td></tr> : shown.map((p) => <tr key={p.id}><td><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.includes(p.id)} onChange={(e)=>setSelected((previous)=>e.target.checked?[...previous,p.id]:previous.filter((id)=>id!==p.id))} className="accent-blue-600"/></td><td><Link to={`/product/${p.id}`}><img src={assetUrl(p.image)} alt={p.name} className="h-12 w-16 object-contain" /></Link></td><td><Link to={`/product/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link><p className="text-xs text-slate-400">{p.sku} · {p.brand}</p></td><td>{p.productType}</td><td>₹{p.price.toLocaleString('en-IN')}</td><td>{p.stock}</td><td><span className={`rounded-full px-3 py-1 text-xs capitalize ${p.status==='active'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-600'}`}>{p.status}</span></td><td><div className="flex gap-3"><Link aria-label={`View details for ${p.name}`} title="Product details" to={`/product/${p.id}`} className="rounded-lg bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"><Eye size={16} /></Link><Link aria-label={`Edit ${p.name}`} to={`/product/${p.id}/edit`} className="rounded-lg bg-blue-50 p-2 text-blue-600"><Pencil size={16} /></Link><button aria-label={`Delete ${p.name}`} onClick={()=>setAction({type:'delete',product:p})} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button></div></td></tr>)}</tbody>
    </DataTable>
  </main>{action && <ProductDialog action={action} onClose={()=>setAction(null)} onError={(message)=>setNotification({type:'error',message})} onSuccess={(message)=>{setAction(null);setNotification({type:'success',message});setAttempt((n)=>n+1);}} />}{notification && <NotificationPopup notification={notification} onClose={()=>setNotification(null)} />}</DashboardLayout>;
}
