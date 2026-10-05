import ImageUploadField from './ImageUploadField';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../api';

export default function ProductDialog({ action, onClose, onSuccess, onError }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [uploading,setUploading]=useState(false);
  const product = action.product || {};
  const deleting = action.type === 'delete';
  useEffect(() => { const node = dialog.current; node.showModal(); return () => node.close(); }, []);
  async function submit(event) {
    event.preventDefault(); if(uploading)return;setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of ['price', 'originalPrice', 'stock']) fields[key] = Number(fields[key]);
    try {
      await apiRequest(`/admin/products${product.id ? `/${product.id}` : ''}`, { method: deleting ? 'DELETE' : product.id ? 'PATCH' : 'POST', ...(deleting ? {} : { body: JSON.stringify({ ...fields, images: product.images?.length && fields.image === product.image ? product.images : [fields.image] }) }) });
      onSuccess(deleting ? 'Product deleted.' : product.id ? 'Product updated.' : 'Product added.');
    } catch (error) { onError(error.message); setBusy(false); }
  }
  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  return <dialog ref={dialog} aria-labelledby="product-dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy&&!uploading) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-black/40">
    <div className="flex items-center justify-between"><h2 id="product-dialog-title" className="text-xl font-bold">{deleting ? 'Delete product' : product.id ? 'Edit product' : 'Add product'}</h2><button disabled={busy||uploading} onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <form onSubmit={submit} className="mt-5 space-y-4">
      {deleting ? <p>Delete {product.name}? This cannot be undone.</p> : <fieldset disabled={busy||uploading} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {['name','sku','brand','shape','color'].map(field=><label key={field} className="text-sm font-medium capitalize">{field}<input name={field} defaultValue={product[field]||''} required maxLength={100} className={inputClass}/></label>)}
        <div className="sm:col-span-2"><ImageUploadField label="Product image" initialValue={product.image||''} required onUploading={setUploading}/></div>
        {['price', 'originalPrice', 'stock'].map((field) => <label key={field} className="text-sm font-medium">{{price:'Price (₹)',originalPrice:'Original price (₹)',stock:'Stock'}[field]}<input name={field} type="number" min="0" max={field === 'stock' ? undefined : 1000000} step={field === 'stock' ? '1' : '0.01'} defaultValue={product[field] ?? 0} required className={inputClass} /></label>)}
        {Object.entries({ productType:['Eyeglasses','Sunglasses'],category:['Classic','Premium'],size:['M','S','L'],gender:['Unisex','Men','Women'],status:['active','inactive'] }).map(([field, options]) => <label key={field} className="text-sm font-medium capitalize">{field === 'productType' ? 'Product type' : field}<select name={field} defaultValue={product[field] || options[0]} className={inputClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>)}
      </fieldset>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy||uploading} onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={busy||uploading} className={`rounded-lg px-4 py-2 text-white ${deleting ? 'bg-red-600' : 'bg-blue-600'}`}>{busy ? 'Saving...' : deleting ? 'Delete' : 'Save product'}</button></div>
    </form>
  </dialog>;
}
