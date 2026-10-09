import ImageUploadField from './ImageUploadField';
import ProductImageGallery from './ProductImageGallery';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, BadgeIndianRupee, X, Trash2 } from 'lucide-react';
import NotificationPopup from './NotificationPopup';
import { apiRequest, productImageUrl } from '../api';

export default function ProductEditor({ product = null }) {
  const editing = Boolean(product);
  const [categories,setCategories]=useState([]);
  const categoryTree=useMemo(()=>{
    const children=new Map();
    for(const row of categories) {
      if(!row.parent||!row.active)continue;
      if(!children.has(row.parent))children.set(row.parent,[]);
      children.get(row.parent).push(row);
    }
    return categories.filter(row=>!row.parent&&row.active).map(root=>({...root,children:children.get(root._id)||[]}));
  },[categories]);
  const [categoryIds,setCategoryIds]=useState(product?.categoryIds|| (product?.categoryId?[product.categoryId]:[]));
  const [subcategoryIds,setSubcategoryIds]=useState(product?.subcategoryIds|| (product?.subcategoryId?[product.subcategoryId]:[]));
  useEffect(()=>{const controller=new AbortController();apiRequest('/admin/categories',{signal:controller.signal}).then(data=>setCategories(data.categories)).catch(error=>{if(!controller.signal.aborted)setNotification({type:'error',message:error.message});});return()=>controller.abort();},[]);
  const [faqs,setFaqs] = useState(product?.faqs||[]);
  const [reviews,setReviews] = useState(product?.reviews||[]);
  const [images, setImages] = useState(() => (product?.images || []).map((path)=>({url:productImageUrl(path),path})));
  const [highlightImages,setHighlightImages] = useState(()=>Object.fromEntries(['material','hinge','temple','nosepad'].map(key=>[key,product?.highlightImages?.[key]?{path:product.highlightImages[key],url:productImageUrl(product.highlightImages[key])}:null])));
  const previews = useRef([]);
  const uploads = useRef(new Map());
  const [tryOnUploading,setTryOnUploading] = useState(false);
  const [busy,setBusy] = useState(false);
  const [notification,setNotification] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>()=>previews.current.forEach((url)=>URL.revokeObjectURL(url)),[]);
  function choose(files) {
    if (files.length + images.length > 8 || files.some((file)=>!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 4*1024*1024)) {
      setNotification({type:'error',message:'Upload up to 8 JPG, PNG, or WebP images, no larger than 4 MB each.'}); return;
    }
    const next = files.map((file)=>({file,url:URL.createObjectURL(file)}));
    previews.current.push(...next.map((image)=>image.url)); setImages((previous)=>[...previous,...next]);
  }
  function chooseHighlight(key,file) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 4*1024*1024) {
      setNotification({type:'error',message:'Choose a JPG, PNG, or WebP image no larger than 4 MB.'}); return;
    }
    const url=URL.createObjectURL(file); previews.current.push(url);
    setHighlightImages(previous=>({...previous,[key]:{file,url}}));
  }
  async function imagePath(image) {
    if (!image) return '';
    if (image.path) return image.path;
    if (!uploads.current.has(image.url)) {
      const data=await apiRequest('/admin/products/images',{method:'POST',body:image.file,headers:{'Content-Type':image.file.type}});
      uploads.current.set(image.url,data.image);
    }
    return uploads.current.get(image.url);
  }
  async function submit(event) {
    event.preventDefault();
    if(tryOnUploading)return;
    if (!images.length) {setNotification({type:'error',message:'Upload at least one product image.'});return;}
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.categoryIds=categoryIds;fields.subcategoryIds=subcategoryIds;
    for (const key of (product?.hasVariants?['price','originalPrice']:['price','originalPrice','stock'])) fields[key]=Number(fields[key]);
    for (const key of ['features', 'lensTypes', 'assurances']) fields[key] = fields[key].split('\n').map((line)=>line.trim()).filter(Boolean);
    fields.faqs = faqs; fields.reviews = reviews.map(review=>({...review,rating:Number(review.rating)}));

    setBusy(true);
    try {
      const paths=[];
      for (const image of images) paths.push(await imagePath(image));
      fields.highlightImages = {};
      for (const key of ['material','hinge','temple','nosepad']) fields.highlightImages[key] = await imagePath(highlightImages[key]);
      const data=await apiRequest(`/admin/products${editing?`/${product.id}`:''}`,{method:editing?'PATCH':'POST',body:JSON.stringify({...fields,images:paths})});
      setNotification({type:'success',message:editing?'Product updated successfully.':'Product added successfully.',id:data.product.id});
    } catch(error) {setNotification({type:'error',message:error.message});}
    finally {setBusy(false);}
  }
  const input='product-field';
  function text(name,label,placeholder,required=true) {return <label className="product-label">{label}{required&&<span className="text-red-500"> *</span>}<input name={name} defaultValue={product?.[name]||''} placeholder={placeholder} required={required} maxLength={name==='name'?150:name==='shape'||name==='color'?50:100} className={input}/></label>;}
  function select(name,label,values) {return <label className="product-label">{label.replace(/\s*\*$/, '')}{label.endsWith('*')&&<span className="text-red-500"> *</span>}<select name={name} defaultValue={product?.[name]||values[0]} className={input}>{values.map((value)=><option key={value}>{value}</option>)}</select></label>;}
  const imagePanel=<div><ProductImageGallery images={images} setImages={setImages} choose={choose} busy={busy}/><div className="product-panel mt-4"><ImageUploadField name="tryOnImage" label="Virtual try-on image (optional)" initialValue={product?.tryOnImage||''} transparentOnly onUploading={setTryOnUploading}/><p className="mt-3 text-xs text-slate-500">Upload a tightly cropped, straight-on frame with transparent background and clear lens interiors. Keep the bridge centered. Gallery photos are not used for live try-on. Products with variants need a matching image on each variant.</p></div></div>;
  return <><form onSubmit={submit}><fieldset disabled={busy||notification?.type==='success'} className={`product-editor-grid ${editing?'is-editing':''}`}>
    {imagePanel}
    <section className="product-panel flex flex-col"><h2 className="product-panel-title"><BadgeIndianRupee size={16}/>Pricing &amp; Inventory</h2><div className="grid gap-5 sm:grid-cols-2">
      {(product?.hasVariants?['price','originalPrice']:['price','originalPrice','stock']).map((name)=><label key={name} className="product-label">{{price:'Price',originalPrice:'Compare Price',stock:'Stock Quantity'}[name]}<span className="text-red-500"> *</span><div className="relative mt-2">{name!=='stock'&&<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-normal text-slate-500">₹</span>}<input name={name} type="number" min="0" max={name==='stock'?undefined:1000000} step={name==='stock'?'1':'.01'} required defaultValue={product?.[name]??0} className={`${input} !mt-0 ${name!=='stock'?'!pl-8':''}`}/></div></label>)}
      {text('sku','SKU','Enter SKU')}
    </div>{product?.hasVariants&&<div className="mt-5 rounded-lg border border-slate-200 p-3 text-sm text-slate-600"><p>Total stock: {product.stock} (from active variants)</p><Link to={`/product/${product.id}/variants`} className="mt-2 inline-block text-blue-600">Manage variant colors, sizes and stock</Link></div>}<div className="mt-6"><p className="product-label">Status</p><div className="mt-3 flex gap-5">{['active','inactive'].map((status)=><label key={status} className="flex items-center gap-2 text-sm capitalize text-slate-500"><input type="radio" name="status" value={status} defaultChecked={(product?.status||'active')===status} className="accent-blue-600"/>{status}</label>)}</div></div>
</section>
    <section className="product-panel product-basic-panel md:col-span-2"><h2 className="product-panel-title"><Package size={16}/>Basic Information</h2><div className="product-basic-fields">
      {text('name','Product Name','Enter product name')}{text('slug','URL Slug','Generated automatically when empty',false)}{text('subtitle','Subtitle','Dark Night Full Rim Square',false)}
      {select('productType','Product Type *',['Eyeglasses','Sunglasses'])}
      <div className="sm:col-span-2"><h3 className="product-label">Categories &amp; Subcategories</h3><p className="mt-1 text-xs text-slate-400">Choose every collection where this product should appear.</p><div className="mt-3 max-h-48 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 overflow-auto rounded-lg border border-slate-200 p-3">{categoryTree.map(root=><div key={root._id}><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={categoryIds.includes(root._id)} onChange={event=>{setCategoryIds(previous=>event.target.checked?[...previous,root._id]:previous.filter(value=>value!==root._id));if(!event.target.checked)setSubcategoryIds(previous=>previous.filter(value=>!categories.some(row=>row._id===value&&row.parent===root._id)));}} className="accent-blue-600"/>{root.name}</label><div className="ml-6 mt-2 grid gap-2">{root.children.map(child=><label key={child._id} className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={subcategoryIds.includes(child._id)} onChange={event=>{if(event.target.checked){setCategoryIds(previous=>previous.includes(root._id)?previous:[...previous,root._id]);setSubcategoryIds(previous=>[...previous,child._id]);}else setSubcategoryIds(previous=>previous.filter(value=>value!==child._id));}} className="accent-blue-600"/>{child.name}</label>)}</div></div>)}{!categoryTree.length&&<p className="text-xs text-slate-400">Add categories from the Categories page first.</p>}</div></div>
      {text('brand','Brand','Enter brand')}
      <label className="product-label">Description<textarea name="description" defaultValue={product?.description||''} maxLength={5000} placeholder="Enter product description..." rows={3} className={input}/></label>
      <details className="product-extra-fields sm:col-span-2" open><summary>Frame information</summary><div className="mt-3 grid gap-4 sm:grid-cols-2">{text('shape','Shape','Square')}{!product?.hasVariants&&text('color','Frame Color','Black')}{select('category','Frame Range',['Classic','Premium'])}{!product?.hasVariants&&select('size','Frame Size',['M','S','L'])}{select('gender','Gender',['Unisex','Men','Women'])}</div></details>
      <label className="product-label">Key Features <span className="font-normal text-slate-400">(one per line)</span><textarea name="features" defaultValue={(product?.features||[]).join('\n')} rows={3} maxLength={4000} className={input}/></label>
      <details className="product-extra-fields sm:col-span-2"><summary>Storefront product details</summary><div className="mt-3 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">{['lensTypes','assurances'].map((name)=><label key={name} className="product-label">{{lensTypes:'Product / lens types',assurances:'Service assurances'}[name]} <span className="font-normal text-slate-400">(one per line)</span><textarea name={name} rows={3} maxLength={3600} defaultValue={(product?.[name]||[]).join('\n')} className={input}/></label>)}</div>
        <div className="grid gap-4 sm:grid-cols-2">{text('offerTitle','Offer title','Limited Period Offer',false)}
        <label className="product-label">Offer details<textarea name="offerText" maxLength={300} rows={2} defaultValue={product?.offerText||''} className={input}/></label></div>
        <label className="product-label">Delivery information<textarea name="deliveryInformation" maxLength={1000} rows={3} defaultValue={product?.deliveryInformation||''} className={input}/></label>
        <div className="grid gap-4 sm:grid-cols-2">{['material','hinge','temple','nosepad'].map((name)=><label key={name} className="product-label capitalize">{name} highlight<textarea name={name} maxLength={300} rows={2} defaultValue={product?.[name]||''} className={input}/></label>)}</div>
        <div className="grid gap-4 sm:grid-cols-2">{['material','hinge','temple','nosepad'].map(key=><div key={`${key}-image`} className="rounded-lg border border-slate-200 p-3"><label className="product-label capitalize">{key} highlight image<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600" onChange={event=>{chooseHighlight(key,event.target.files?.[0]);event.target.value='';}}/></label><p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP · max 4 MB</p>{highlightImages[key]&&<div className="mt-3"><img src={highlightImages[key].url} alt={`${key} highlight preview`} className="h-32 w-full rounded-lg bg-slate-50 object-contain"/><button type="button" onClick={()=>setHighlightImages(previous=>({...previous,[key]:null}))} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"><X size={13}/>Remove image</button></div>}</div>)}</div>
        <div className="grid items-start gap-4 lg:grid-cols-2"><div className="space-y-3"><h3 className="product-label">Frequently asked questions</h3>{faqs.map((faq,index)=><div key={index} className="relative rounded-lg border border-slate-200 p-3 pb-12 space-y-2"><button type="button" aria-label={`Delete question ${index+1}`} title="Delete question" className="delete-button absolute right-2 bottom-2" onClick={()=>setFaqs(previous=>previous.filter((_,i)=>i!==index))}><Trash2 size={18} aria-hidden="true" /></button><label className="product-label">Question<input required maxLength={200} value={faq.question} onChange={e=>setFaqs(previous=>previous.map((item,i)=>i===index?{...item,question:e.target.value}:item))} className={input}/></label><label className="product-label">Answer<textarea required maxLength={1000} value={faq.answer} onChange={e=>setFaqs(previous=>previous.map((item,i)=>i===index?{...item,answer:e.target.value}:item))} className={input}/></label></div>)}<button type="button" className="admin-button-secondary" disabled={faqs.length>=20} onClick={()=>setFaqs(previous=>[...previous,{question:'',answer:''}])}>Add question</button></div>
        <div className="space-y-3"><h3 className="product-label">Customer reviews</h3>{reviews.map((review,index)=><div key={index} className="relative rounded-lg border border-slate-200 p-3 pb-12 space-y-2"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)]">{['name','rating','date','text'].map(key=><label key={key} className={`product-label min-w-0 capitalize ${key==='text'?'sm:col-span-3':''}`}>{key==='text'?'Message':key}{key==='text'?<textarea required rows={3} maxLength={2000} value={review.text} onChange={e=>setReviews(previous=>previous.map((item,i)=>i===index?{...item,text:e.target.value}:item))} className={input}/>:<input required type={key==='rating'?'number':key==='date'?'date':'text'} min={key==='rating'?1:undefined} max={key==='rating'?5:undefined} step={key==='rating'?1:undefined} maxLength={key==='name'?100:2000} value={key==='date'?review.date?.slice(0,10)||'':review[key]} onChange={e=>setReviews(previous=>previous.map((item,i)=>i===index?{...item,[key]:e.target.value}:item))} className={input}/>}</label>)}</div><button type="button" aria-label={`Delete review ${index+1}`} title="Delete review" className="delete-button absolute right-2 bottom-2" onClick={()=>setReviews(previous=>previous.filter((_,i)=>i!==index))}><Trash2 size={18} aria-hidden="true" /></button></div>)}<button type="button" disabled={reviews.length>=100} className="admin-button-secondary" onClick={()=>setReviews(previous=>[...previous,{name:'',rating:5,date:'',text:''}])}>Add review</button><p className="text-xs text-slate-400">Add actual customer feedback.</p></div></div>
      </div></details>
    </div></section>
  </fieldset>    <div className="product-editor-actions"><Link to={editing?`/product/${product.id}`:'/product'} className="admin-button-secondary">Cancel</Link><button disabled={busy||tryOnUploading} className="admin-button-primary">{busy?'Saving...':editing?'Update Product':'Save Product'}</button></div></form>{notification&&<NotificationPopup notification={notification} onClose={()=>{if(notification.type==='success')navigate(`/product/${notification.id}`);else setNotification(null);}}/>}</>;
}
