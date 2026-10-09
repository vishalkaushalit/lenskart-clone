import {useState} from 'react';
import {Upload, X} from 'lucide-react';
import {apiRequest,productImageUrl} from '../api';
export default function ImageUploadField({name='image',label='Image',initialValue='',required=false,onUploading,onChange,transparentOnly=false}){
 const [image,setImage]=useState(initialValue);const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
 async function choose(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024){setError('Choose a JPG, PNG or WebP image no larger than 4 MB.');return;}
  setUploading(true);onUploading?.(true);
  try{
   if(transparentOnly){
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
   const data=await apiRequest('/admin/products/images',{method:'POST',body:file,headers:{'Content-Type':file.type}});setImage(data.image);onChange?.(data.image);}catch(error){setError(error.message);}finally{setUploading(false);onUploading?.(false);}
 }
 return <div className="space-y-2"><label className="product-label">{label}{required&&<span className="text-red-500"> *</span>}<span className="mt-2 flex items-center gap-2"><Upload size={16}/><input type="file" accept={transparentOnly?'image/png,image/webp':'image/jpeg,image/png,image/webp'} required={required&&!image} disabled={uploading} onChange={choose} className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600"/></span></label><input type="hidden" name={name} value={image}/><p className="text-xs text-slate-400">{uploading?'Uploading…':transparentOnly?'Transparent front-view PNG or WebP · max 4 MB':'JPG, PNG, WebP · max 4 MB'}</p>{error&&<p role="alert" className="text-xs text-red-600">{error}</p>}{image&&<div><img src={productImageUrl(image)} alt={`${label} preview`} className="h-32 w-full rounded-lg bg-slate-50 object-contain"/><button type="button" disabled={uploading} onClick={()=>{setImage('');onChange?.('');}} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"><X size={13}/>Remove image</button></div>}</div>;
}
