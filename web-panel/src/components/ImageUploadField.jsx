import {useRef,useState} from 'react';
import {isGlbAsset, inspectGlb} from '../../../shared/tryOnAsset.js';
import {Upload, X} from 'lucide-react';
import {apiRequest,productImageUrl} from '../api';
export default function ImageUploadField({name='image',label='Image',initialValue='',required=false,onUploading,onChange,transparentOnly=false,disabled=false,value,fallbackValue=''}){
 const [failedImage,setFailedImage]=useState('');
 const fileInput=useRef(null);
 const [storedImage,setImage]=useState(initialValue);const image=value===undefined?storedImage:value;const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
 const previewImage=image||fallbackValue;
 async function choose(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;setError('');
  const glb=transparentOnly&&/\.glb$/i.test(file.name);
  if((!glb&&!['image/jpeg','image/png','image/webp'].includes(file.type))||file.size>4*1024*1024){setError(transparentOnly?'Choose a PNG, WebP or GLB no larger than 4 MB.':'Choose a JPG, PNG or WebP image no larger than 4 MB.');return;}
  setUploading(true);onUploading?.(true);
  try{
   if(glb)inspectGlb(await file.arrayBuffer());
   if(transparentOnly&&!glb){
    if(!['image/png','image/webp'].includes(file.type))throw new Error('Use a transparent PNG or WebP for try-on.');
    const bitmap=await createImageBitmap(file);
    try{
     const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
     if(bitmap.width<100||bitmap.width/bitmap.height<1.5)throw new Error('Use a tightly cropped front view of the frame, at least 100 pixels wide.');
     const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);
     const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
     let transparent=false;let visible=false;
     for(let index=3;index<pixels.length;index+=4){if(pixels[index]<20)transparent=true;if(pixels[index]>100)visible=true;}
     if(!transparent||!visible)throw new Error('The try-on image needs a transparent background and a visible frame.');
    }finally{bitmap.close();}
   }
   const data=await apiRequest(transparentOnly?'/admin/products/try-on':'/admin/products/images',{method:'POST',body:file,headers:{'Content-Type':glb?'model/gltf-binary':file.type,'X-File-Name':encodeURIComponent(file.name)}});setImage(data.image);onChange?.(data.image);}catch(error){setError(error.message);}finally{setUploading(false);onUploading?.(false);}
 }
 return <div className="space-y-2"><label className="product-label">{label}{required&&<span className="text-red-500"> *</span>}<span className="mt-2 flex items-center gap-2"><Upload size={16}/><input ref={fileInput} type="file" accept={transparentOnly?'.png,.webp,.glb,image/png,image/webp,model/gltf-binary':'image/jpeg,image/png,image/webp'} required={required&&!image} disabled={uploading||disabled} onChange={choose} className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600"/></span></label><input type="hidden" name={name} value={image}/><p className="text-xs text-slate-400">{uploading?'Uploading…':transparentOnly?'Transparent front-view PNG/WebP or self-contained GLB model · max 4 MB':'JPG, PNG, WebP · max 4 MB'}</p>{error&&<p role="alert" className="text-xs text-red-600">{error}</p>}{previewImage&&<div>{isGlbAsset(previewImage)?<p className="rounded-lg bg-slate-50 p-4 text-sm">3D GLB model uploaded. Save to use it in virtual try-on.</p>:failedImage===previewImage?<p role="alert" className="rounded-lg bg-slate-50 p-4 text-sm text-red-600">This saved image is unavailable. Upload it again and save the form. New uploads require a connected public Vercel Blob store.</p>:<img src={productImageUrl(previewImage)} alt={`${label} preview`} onError={()=>setFailedImage(previewImage)} className="h-32 w-full rounded-lg bg-slate-50 object-contain"/>}<button type="button" disabled={uploading||disabled} onClick={()=>fileInput.current?.click()} className="mt-2 mr-4 inline-flex items-center gap-1 text-xs text-blue-600"><Upload size={13}/>{isGlbAsset(previewImage)?'Replace model':'Replace image'}</button>{image&&<button type="button" disabled={uploading||disabled} onClick={()=>{setImage('');onChange?.('');}} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"><X size={13}/>{isGlbAsset(previewImage)?'Remove model':'Remove image'}</button>}{!image&&fallbackValue&&<p className="mt-2 text-xs text-slate-500">Using the main product image. Upload an image to override it.</p>}</div>}</div>;
}
