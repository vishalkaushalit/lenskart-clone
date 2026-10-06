import ActionLink from '../components/ActionLink';
import { creationDate } from '../date';
import { matchesSearch } from "../search";
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trash2, Plus, RefreshCw, Search, Layers } from 'lucide-react';
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
  const [categories,setCategories]=useState([]);
  const [categoryId,setCategoryId]=useState('');
  const categoryGroups=useMemo(()=>{
    const children=new Map();
    for(const row of categories){if(!row.parent)continue;if(!children.has(row.parent))children.set(row.parent,[]);children.get(row.parent).push(row);}
    return categories.filter(row=>!row.parent).map(root=>({...root,children:children.get(root._id)||[]}));
  },[categories]);
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const pageValue = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  function setPage(value) { setParams(previous => { const next = new URLSearchParams(previous); next.set("page", String(value)); return next; }, { replace: true }); }
  const [action, setAction] = useState(null);
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setFailed(false);
      try { const [data,taxonomy] = await Promise.all([apiRequest('/admin/products',{signal:controller.signal}),apiRequest('/admin/categories',{signal:controller.signal})]); if (!controller.signal.aborted) {setCatalog(data.products);setCategories(taxonomy.categories);} }
      catch (error) { if (!controller.signal.aborted) { setFailed(true); setNotification({ type:'error', message:error.message }); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [attempt]);
  const products = catalog.filter((p) => (!categoryId||(p.categoryIds||[p.categoryId]).includes(categoryId)||(p.subcategoryIds||[p.subcategoryId]).includes(categoryId)) && (!type || p.productType === type) && (!brand || p.brand === brand) && (!status || p.status === status) && matchesSearch([p.name, p.sku, p.brand, p.productType, p.shape, p.color, p.category, p.gender, p.status], search));
  const totalPages = Math.max(1, Math.ceil(products.length / 20));
  const currentPage = Math.min(page, totalPages);
  const shown = products.slice((currentPage - 1) * 20, currentPage * 20);
  const assetUrl = (path) => path.startsWith('/') ? new URL(path, import.meta.env.VITE_API_URL || 'http://localhost:5001/api').href : path;
  const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm';
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Products" description="Manage your product catalog"><div className="flex gap-2"><button disabled={loading} onClick={() => setAttempt((n) => n + 1)} className="admin-button-secondary"><RefreshCw size={16} />Refresh</button><Link to="/product/add" className="admin-button-primary"><Plus size={18} />Add Product</Link></div></PageHeader>
    <div className="grid gap-3 rounded-xl border border-slate-100 bg-white p-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_.8fr_1.5fr]">
      <select aria-label="Category" value={categoryId} onChange={e=>{setCategoryId(e.target.value);setPage(1);}} className={selectClass}><option value="">All categories / subcategories</option>{categoryGroups.map(root=><Fragment key={root._id}><option value={root._id}>{root.name}</option>{root.children.map(child=><option key={child._id} value={child._id}>{'\u00a0\u00a0\u00a0\u00a0'}{child.name}</option>)}</Fragment>)}</select><select aria-label="Product type" value={type} onChange={(e) => {setType(e.target.value);setPage(1);}} className={selectClass}><option value="">All Categories</option>{['Eyeglasses','Sunglasses'].map((v) => <option key={v}>{v}</option>)}</select>
      <select aria-label="Brand" value={brand} onChange={(e) => {setBrand(e.target.value);setPage(1);}} className={selectClass}><option value="">All brands</option>{[...new Set(catalog.map((p) => p.brand))].map((v) => <option key={v}>{v}</option>)}</select>
      <select aria-label="Status" value={status} onChange={(e) => {setStatus(e.target.value);setPage(1);}} className={selectClass}><option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={16} className="shrink-0 text-slate-400"/><input aria-label="Search products" type="search" maxLength={100} placeholder="Search products..." value={search} onChange={(e) => {setParams(previous => { const next = new URLSearchParams(previous); if (e.target.value) next.set("search", e.target.value); else next.delete("search"); next.delete("page"); return next; }, {replace:true});}} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" /></label>
    </div>
    <DataTable label="Products" footer={!loading && !failed && <Pagination page={currentPage} total={products.length} onPageChange={setPage} label="products" />}>

      <thead><tr><th scope="col">Sr. No.</th>{['Image','Product Name','Category','Price','Stock','Status','Created On','Actions'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={9} className="text-center"><Loader label="Loading products"/></td></tr> : failed ? <tr><td colSpan={9} className="text-center"><button onClick={() => setAttempt((n)=>n+1)}>Try again</button></td></tr> : !shown.length ? <tr><td colSpan={9} className="text-center">No products found.</td></tr> : shown.map((p,index) => <tr key={p.id}><td className="font-medium text-slate-700">{(currentPage-1)*20+index+1}</td><td><Link to={`/product/${p.id}`}><img src={assetUrl(p.image)} alt={p.name} className="h-12 w-16 object-contain" /></Link></td><td><Link to={`/product/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link><p className="text-xs text-slate-400">{p.sku} · {p.brand}</p></td><td>{p.productType}</td><td>₹{p.price.toLocaleString('en-IN')}</td><td>{p.stock}</td><td><StatusBadge status={p.status}/></td><td className="whitespace-nowrap">{creationDate(p.createdAt)}</td><td><div className="flex gap-3"><ActionLink to={`/product/${p.id}`} action="view" label={`View details for ${p.name}`}/><Link aria-label={`View variants for ${p.name}`} title="View variants" to={`/product/${p.id}/variants`} className="admin-action-link"><Layers size={16} aria-hidden="true" /></Link><ActionLink to={`/product/${p.id}/edit`} action="edit" label={`Edit ${p.name}`}/><button aria-label={`Delete ${p.name}`} title="Delete product" onClick={()=>setAction({type:'delete',product:p})} className="delete-button admin-action-delete"><Trash2 size={16} aria-hidden="true" /></button></div></td></tr>)}</tbody>
    </DataTable>
  </main>{action && <ProductDialog action={action} onClose={()=>setAction(null)} onError={(message)=>setNotification({type:'error',message})} onSuccess={(message)=>{setAction(null);setNotification({type:'success',message});setAttempt((n)=>n+1);}} />}{notification && <NotificationPopup notification={notification} onClose={()=>setNotification(null)} />}</DashboardLayout>;
}
