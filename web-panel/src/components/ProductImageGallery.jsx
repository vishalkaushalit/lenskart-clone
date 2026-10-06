import { useRef, useState } from 'react';
import { Upload, Plus, X, Check } from 'lucide-react';
// Shared ordered gallery: the first image is the product or variant cover.
export default function ProductImageGallery({ images, setImages, choose, busy, title='Product Images' }) {
  const fileInput=useRef(null);
  const [selection,setSelected]=useState(0);
  const selected=Math.min(selection,Math.max(0,images.length-1));
  function remove(index) {setImages(previous=>previous.filter((_,i)=>i!==index));setSelected(0);}
  function mainImage() {setImages(previous=>[previous[selected],...previous.filter((_,i)=>i!==selected)]);setSelected(0);}
  return <section className="product-panel">
    <h2 className="product-panel-title">{title}</h2>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} className="sr-only" aria-label={`Upload ${title.toLowerCase()}`} onChange={(e)=>{choose([...e.target.files]);e.target.value='';}}/>
    {images.length===0&&<button disabled={busy} type="button" className="product-upload" onClick={()=>fileInput.current.click()} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();if(!busy) choose([...e.dataTransfer.files]);}}><Upload size={27}/><span>Click to upload or drag and drop</span><small>JPG, PNG, WebP (max 5 MB each)</small></button>}
    {images.length>0&&<div className="product-editor-gallery"><div className="product-thumb-strip">{images.map((image,i)=><button key={`${image.url}-${i}`} type="button" aria-label={`Preview image ${i+1}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}><img src={image.url} alt=""/></button>)}</div><div><img src={images[selected]?.url||images[0].url} alt="Selected image preview" className="product-large-image"/><button type="button" disabled={busy} onClick={mainImage} className="product-main-image"><Check size={16}/> {selected===0?'Main image':'Set as main image'}</button></div></div>}
    <div className="product-image-grid">{images.map((image,i)=><div key={`${image.url}-${i}`} className="product-image-tile"><button type="button" aria-label={`Set image ${i+1} as cover`} disabled={busy} onClick={()=>{setSelected(i);setImages((previous)=>[previous[i],...previous.filter((_,index)=>index!==i)]);setSelected(0);}} className={i===0?'is-cover':''}><img src={image.url} alt={`Product image ${i+1}`}/></button><button type="button" disabled={busy} onClick={()=>remove(i)} className="product-remove-image" aria-label={`Remove image ${i+1}`}><X size={12}/></button></div>)}<button type="button" disabled={busy||images.length>=8} className="product-image-add" aria-label="Add more images" onClick={()=>fileInput.current.click()}><Plus size={22}/></button></div>
    <p className="mt-3 text-xs text-slate-400">{images.length}/8 images · Click a thumbnail to set the main image</p>
  </section>;
}
