import StatusBadge from './StatusBadge';
import Pagination from './Pagination';
import useTablePagination from '../hooks/useTablePagination';
import VariantDeleteButton from './VariantDeleteButton';
import { creationDate } from '../date';
import ActionLink from './ActionLink';
import ProductImageGallery from './ProductImageGallery';
import { useEffect, useRef, useState } from 'react';
import { apiRequest, productImageUrl } from '../api';
const empty = { size:'M', color:'', price:'', originalPrice:'', stock:0, status:'active', images:[] };
export default function ProductVariants({ product, onChange, mode='list', initialVariant=null, onCancel }) {
  const [form,setForm] = useState(initialVariant?{...initialVariant,price:initialVariant.price??'',originalPrice:initialVariant.originalPrice??''}:empty);
  const [editing,setEditing] = useState(initialVariant?.id||null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [images,setImages] = useState(()=>initialVariant?.images.map(path=>({path,url:productImageUrl(path)}))||[]);
  const previews = useRef([]);
  const uploads = useRef(new Map());
  useEffect(()=>{const urls=previews.current;return ()=>urls.forEach(url=>URL.revokeObjectURL(url));},[]);
  const paging=useTablePagination(product.variants||[],5,product.id);
  const update = (key,value) => setForm(previous=>({...previous,[key]:value}));
  function choose(files) {
    if (files.length+images.length>8 || files.some(file=>file.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type))) {setError('Choose up to 8 JPG, PNG or WebP images, at most 5 MB each.');return;}
    const next=files.map(file=>({file,url:URL.createObjectURL(file)}));
    previews.current.push(...next.map(image=>image.url));setImages(previous=>[...previous,...next]);setError('');
  }
  async function save(event) {
    event.preventDefault();setBusy(true);setError('');
    try {
      const paths=[];
      for (const image of images) {
        if(image.path)paths.push(image.path);
        else {if(!uploads.current.has(image.url)){const data=await apiRequest('/admin/products/images',{method:'POST',body:image.file,headers:{'Content-Type':image.file.type}});uploads.current.set(image.url,data.image);}paths.push(uploads.current.get(image.url));}
      }
      await apiRequest(`/admin/products/${product.id}/variants${editing?`/${editing}`:''}`,{method:editing?'PATCH':'POST',body:JSON.stringify({...form,images:paths,price:form.price===''?null:Number(form.price),originalPrice:form.originalPrice===''?null:Number(form.originalPrice),stock:Number(form.stock)})});setForm(empty);setImages([]);setEditing(null);onChange();}
    catch(error){setError(error.message);}finally{setBusy(false);}
  }
  return <section aria-label="Product variants" className={mode==='list'?'product-panel variant-manager':'variant-manager'}>{mode==='list'&&<><h2 className="product-panel-title">Size &amp; color variants</h2><p className="mb-3 text-xs text-slate-500">Each combination has its own stock and images. Leave either price blank to use its product value. Inactive variants are hidden from shoppers. Once variants are added, their stock replaces the product stock.</p></>}
    {mode==='list'&&<div className="variant-table overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Sr. No.','Size','Color','Price','Compare Price','Stock','Images','Status','Created On','Actions'].map((label,index)=><th className="p-2" key={index}>{label}</th>)}</tr></thead><tbody>{paging.rows.map((variant,index)=><tr key={variant.id} className="border-t border-slate-100"><td className="p-2 font-medium text-slate-700">{paging.offset+index+1}</td><td className="p-2">{variant.size}</td><td className="p-2">{variant.color}</td><td className="p-2">₹{variant.price??product.price}</td><td className="p-2">₹{Math.max(variant.originalPrice??product.originalPrice??product.price,variant.price??product.price)}</td><td className="p-2">{variant.stock}</td><td className="p-2"><div className="flex items-center gap-2">{variant.images[0]?<img src={productImageUrl(variant.images[0])} alt={`${variant.color} ${variant.size}`} className="h-9 w-9 rounded object-contain"/>:<span className="text-xs text-slate-400">Product images</span>}{variant.images.length>1&&<span className="text-xs text-slate-500">+{variant.images.length-1}</span>}</div></td><td className="p-2"><StatusBadge status={variant.status}/></td><td className="whitespace-nowrap p-2">{creationDate(variant.createdAt)}</td><td className="p-2"><div className="flex gap-2"><ActionLink to={`/product/${product.id}/variants/${variant.id}`} action="view" label="View variant"/><ActionLink to={`/product/${product.id}/variants/${variant.id}/edit`} action="edit" label="Edit variant"/><VariantDeleteButton productId={product.id} variant={variant} onDeleted={onChange}/></div></td></tr>)}</tbody></table></div>}
    {mode==='list'&&<Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="variants"/>}
    {mode!=='list'&&<form onSubmit={save}><fieldset disabled={busy} className="product-editor-grid"><div className="variant-form-gallery"><ProductImageGallery key={editing||'new'} title="Variant Images" images={images} setImages={setImages} choose={choose} busy={busy}/><p className="mt-2 text-xs text-slate-500">Leave the gallery empty to use the product images.</p></div><section className="product-panel variant-form-fields"><h3 className="product-panel-title">{editing?'Edit variant':'Add variant'}</h3><div className="grid gap-5 sm:grid-cols-2">
      <label className="product-label">Size<select className="product-field" value={form.size} onChange={event=>update('size',event.target.value)}>{['XS','S','M','M/L','L','XL'].map(size=><option key={size}>{size}</option>)}</select></label>
      <label className="product-label">Color<input required maxLength={50} className="product-field" value={form.color} onChange={event=>update('color',event.target.value)} /></label>
      <label className="product-label">Price (optional)<input type="number" min="0" max="1000000" step="0.01" placeholder={String(product.price)} className="product-field" value={form.price} onChange={event=>update('price',event.target.value)}/></label>
      <label className="product-label">Compare Price (optional)<input type="number" min={form.price===''?product.price:Number(form.price)} max="1000000" step="0.01" placeholder={String(product.originalPrice??product.price)} className="product-field" value={form.originalPrice} onChange={event=>update('originalPrice',event.target.value)}/></label>
      <label className="product-label">Stock<input required type="number" min="0" step="1" className="product-field" value={form.stock} onChange={event=>update('stock',event.target.value)}/></label>
      <label className="product-label">Status<select className="product-field" value={form.status} onChange={event=>update('status',event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    </div><p className="mt-5 text-xs text-slate-500">Leave either price blank to use its product value. Inactive variants are hidden from shoppers.</p></section></fieldset><div className="product-editor-actions">{error&&<p role="alert" className="text-red-600">{error}</p>}<button type="button" disabled={busy} className="admin-button-secondary" onClick={onCancel}>Cancel</button><button disabled={busy} className="admin-button-primary">{busy?'Saving…':editing?'Save variant':'Add variant'}</button></div></form>}
  </section>;
}
