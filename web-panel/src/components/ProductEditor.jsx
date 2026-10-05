import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, BadgeIndianRupee, Upload, Plus, X, Check } from 'lucide-react';
import NotificationPopup from './NotificationPopup';
import { apiRequest, productImageUrl } from '../api';

export default function ProductEditor({ product = null }) {
  const editing = Boolean(product);
  const [faqs,setFaqs] = useState(product?.faqs||[]);
  const [reviews,setReviews] = useState(product?.reviews||[]);
  const [images, setImages] = useState(() => (product?.images || []).map((path)=>({url:productImageUrl(path),path})));
  const [selected, setSelected] = useState(0);
  const [highlightImages,setHighlightImages] = useState(()=>Object.fromEntries(['material','hinge','temple','nosepad'].map(key=>[key,product?.highlightImages?.[key]?{path:product.highlightImages[key],url:productImageUrl(product.highlightImages[key])}:null])));
  const previews = useRef([]);
  const uploads = useRef(new Map());
  const fileInput = useRef(null);
  const [busy,setBusy] = useState(false);
  const [notification,setNotification] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>()=>previews.current.forEach((url)=>URL.revokeObjectURL(url)),[]);
  function choose(files) {
    if (files.length + images.length > 8 || files.some((file)=>!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024)) {
      setNotification({type:'error',message:'Upload up to 8 JPG, PNG, or WebP images, no larger than 5 MB each.'}); return;
    }
    const next = files.map((file)=>({file,url:URL.createObjectURL(file)}));
    previews.current.push(...next.map((image)=>image.url)); setImages((previous)=>[...previous,...next]);
  }
  function chooseHighlight(key,file) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
      setNotification({type:'error',message:'Choose a JPG, PNG, or WebP image no larger than 5 MB.'}); return;
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
  function remove(index) { setImages((previous)=>previous.filter((_,i)=>i!==index)); setSelected(0); }
  function mainImage() { setImages((previous)=>[previous[selected],...previous.filter((_,i)=>i!==selected)]); setSelected(0); }
  async function submit(event) {
    event.preventDefault();
    if (!images.length) {setNotification({type:'error',message:'Upload at least one product image.'});return;}
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of ['price','originalPrice','stock']) fields[key]=Number(fields[key]);
    for (const key of ['features', 'lensTypes', 'availableColors', 'availableSizes', 'assurances']) fields[key] = fields[key].split('\n').map((line)=>line.trim()).filter(Boolean);
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
  const imagePanel=<section className={`product-panel ${editing?'xl:order-first':'xl:order-last'}`}>
    <h2 className="product-panel-title">Product Images</h2>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} className="sr-only" aria-label="Upload product images" onChange={(e)=>{choose([...e.target.files]);e.target.value='';}}/>
    {!editing&&<button disabled={busy} type="button" className="product-upload" onClick={()=>fileInput.current.click()} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();if(!busy) choose([...e.dataTransfer.files]);}}><Upload size={27}/><span>Click to upload or drag and drop</span><small>JPG, PNG, WebP (max 5 MB each)</small></button>}
    {editing&&images.length>0&&<div className="product-editor-gallery"><div className="product-thumb-strip">{images.map((image,i)=><button key={image.url} type="button" aria-label={`Preview image ${i+1}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}><img src={image.url} alt=""/></button>)}</div><div><img src={images[selected]?.url||images[0].url} alt="Selected product preview" className="product-large-image"/><button type="button" disabled={busy} onClick={mainImage} className="product-main-image"><Check size={16}/> {selected===0?'Main image':'Set as main image'}</button></div></div>}
    <div className="product-image-grid">{images.map((image,i)=><div key={image.url} className="product-image-tile"><button type="button" aria-label={`Set image ${i+1} as cover`} disabled={busy} onClick={()=>{setSelected(i);setImages((previous)=>[previous[i],...previous.filter((_,index)=>index!==i)]);setSelected(0);}} className={i===0?'is-cover':''}><img src={image.url} alt={`Product image ${i+1}`}/></button><button type="button" disabled={busy} onClick={()=>remove(i)} className="product-remove-image" aria-label={`Remove image ${i+1}`}><X size={12}/></button></div>)}<button type="button" disabled={busy||images.length>=8} className="product-image-add" aria-label="Add more images" onClick={()=>fileInput.current.click()}><Plus size={22}/></button></div>
    <p className="mt-3 text-xs text-slate-400">{images.length}/8 images · Click a thumbnail to set the main image</p>
    {!editing&&images[0]&&<div className="mt-4"><p className="mb-2 text-xs font-medium text-blue-500">Main image</p><img src={images[0].url} alt="Main product image" className="h-20 w-20 rounded-lg border-2 border-blue-500 object-contain"/></div>}
  </section>;
  return <><form onSubmit={submit}><fieldset disabled={busy||notification?.type==='success'} className={`product-editor-grid ${editing?'is-editing':''}`}>
    {editing&&imagePanel}
    <section className="product-panel"><h2 className="product-panel-title"><Package size={16}/>Basic Information</h2><div className="space-y-4">
      {text('name','Product Name','Enter product name')}{text('subtitle','Subtitle','Dark Night Full Rim Square',false)}
      {select('productType','Category *',['Eyeglasses','Sunglasses'])}
      {text('brand','Brand','Enter brand')}
      <label className="product-label">Description<textarea name="description" defaultValue={product?.description||''} maxLength={5000} placeholder="Enter product description..." rows={4} className={input}/></label>
      <details className="product-extra-fields" open><summary>Frame information</summary><div className="mt-3 grid gap-4 sm:grid-cols-2">{text('shape','Shape','Square')}{text('color','Frame Color','Black')}{select('category','Collection',['Classic','Premium'])}{select('size','Frame Size',['M','S','L'])}{select('gender','Gender',['Unisex','Men','Women'])}</div></details>
      <label className="product-label">Key Features <span className="font-normal text-slate-400">(one per line)</span><textarea name="features" defaultValue={(product?.features||[]).join('\n')} rows={3} maxLength={4000} className={input}/></label>
      <details className="product-extra-fields" open><summary>Storefront product details</summary><div className="mt-3 space-y-4">
        {['lensTypes','availableColors','availableSizes','assurances'].map((name)=><label key={name} className="product-label">{{lensTypes:'Product / lens types',availableColors:'Available frame colors',availableSizes:'Available sizes (XS, S, M, M/L, L, XL)',assurances:'Service assurances'}[name]} <span className="font-normal text-slate-400">(one per line)</span><textarea name={name} rows={3} maxLength={3600} defaultValue={(product?.[name]||[]).join('\n')} className={input}/></label>)}
        {text('offerTitle','Offer title','Limited Period Offer',false)}
        <label className="product-label">Offer details<textarea name="offerText" maxLength={300} rows={2} defaultValue={product?.offerText||''} className={input}/></label>
        <label className="product-label">Delivery information<textarea name="deliveryInformation" maxLength={1000} rows={3} defaultValue={product?.deliveryInformation||''} className={input}/></label>
        {['material','hinge','temple','nosepad'].map((name)=><label key={name} className="product-label capitalize">{name} highlight<textarea name={name} maxLength={300} rows={2} defaultValue={product?.[name]||''} className={input}/></label>)}
        <div className="grid gap-4 sm:grid-cols-2">{['material','hinge','temple','nosepad'].map(key=><div key={`${key}-image`} className="rounded-lg border border-slate-200 p-3"><label className="product-label capitalize">{key} highlight image<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600" onChange={event=>{chooseHighlight(key,event.target.files?.[0]);event.target.value='';}}/></label><p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP · max 5 MB</p>{highlightImages[key]&&<div className="mt-3"><img src={highlightImages[key].url} alt={`${key} highlight preview`} className="h-32 w-full rounded-lg bg-slate-50 object-contain"/><button type="button" onClick={()=>setHighlightImages(previous=>({...previous,[key]:null}))} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"><X size={13}/>Remove image</button></div>}</div>)}</div>
        <div className="space-y-3"><h3 className="product-label">Frequently asked questions</h3>{faqs.map((faq,index)=><div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2"><label className="product-label">Question<input required maxLength={200} value={faq.question} onChange={e=>setFaqs(previous=>previous.map((item,i)=>i===index?{...item,question:e.target.value}:item))} className={input}/></label><label className="product-label">Answer<textarea required maxLength={1000} value={faq.answer} onChange={e=>setFaqs(previous=>previous.map((item,i)=>i===index?{...item,answer:e.target.value}:item))} className={input}/></label><button type="button" className="text-xs text-red-500" onClick={()=>setFaqs(previous=>previous.filter((_,i)=>i!==index))}>Remove question</button></div>)}<button type="button" className="admin-button-secondary" disabled={faqs.length>=20} onClick={()=>setFaqs(previous=>[...previous,{question:'',answer:''}])}>Add question</button></div>
        <div className="space-y-3"><h3 className="product-label">Customer reviews</h3>{reviews.map((review,index)=><div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2">{['name','rating','date','text'].map(key=><label key={key} className="product-label capitalize">{key}<input required type={key==='rating'?'number':key==='date'?'date':'text'} min={key==='rating'?1:undefined} max={key==='rating'?5:undefined} step={key==='rating'?1:undefined} maxLength={key==='name'?100:2000} value={key==='date'?review.date?.slice(0,10)||'':review[key]} onChange={e=>setReviews(previous=>previous.map((item,i)=>i===index?{...item,[key]:e.target.value}:item))} className={input}/></label>)}<button type="button" className="text-xs text-red-500" onClick={()=>setReviews(previous=>previous.filter((_,i)=>i!==index))}>Remove review</button></div>)}<button type="button" disabled={reviews.length>=100} className="admin-button-secondary" onClick={()=>setReviews(previous=>[...previous,{name:'',rating:5,date:'',text:''}])}>Add review</button><p className="text-xs text-slate-400">Add actual customer feedback.</p></div>
      </div></details>
    </div></section>
    <section className="product-panel flex flex-col"><h2 className="product-panel-title"><BadgeIndianRupee size={16}/>Pricing &amp; Inventory</h2><div className="grid gap-5 sm:grid-cols-2">
      {['price','originalPrice','stock'].map((name)=><label key={name} className="product-label">{{price:'Price',originalPrice:'Compare Price',stock:'Stock Quantity'}[name]}<span className="text-red-500"> *</span><div className="relative mt-2">{name!=='stock'&&<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-normal text-slate-500">₹</span>}<input name={name} type="number" min="0" max={name==='stock'?undefined:1000000} step={name==='stock'?'1':'.01'} required defaultValue={product?.[name]??0} className={`${input} !mt-0 ${name!=='stock'?'!pl-8':''}`}/></div></label>)}
      {text('sku','SKU','Enter SKU')}
    </div><div className="mt-6"><p className="product-label">Status</p><div className="mt-3 flex gap-5">{['active','inactive'].map((status)=><label key={status} className="flex items-center gap-2 text-sm capitalize text-slate-500"><input type="radio" name="status" value={status} defaultChecked={(product?.status||'active')===status} className="accent-blue-600"/>{status}</label>)}</div></div>
    <div className="mt-auto flex flex-wrap justify-end gap-3 pt-8"><Link to={editing?`/product/${product.id}`:'/product'} className="admin-button-secondary">Cancel</Link><button disabled={busy} className="admin-button-primary">{busy?'Saving...':editing?'Update Product':'Save Product'}</button></div></section>
    {!editing&&imagePanel}
  </fieldset></form>{notification&&<NotificationPopup notification={notification} onClose={()=>{if(notification.type==='success')navigate(`/product/${notification.id}`);else setNotification(null);}}/>}</>;
}
