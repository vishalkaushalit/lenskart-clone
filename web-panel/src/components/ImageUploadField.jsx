import {useState} from 'react';
import {Upload, X} from 'lucide-react';
import {apiRequest,productImageUrl} from '../api';
export default function ImageUploadField({name='image',label='Image',initialValue='',required=false,onUploading}){
 const [image,setImage]=useState(initialValue);const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
 async function choose(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Choose a JPG, PNG or WebP image no larger than 5 MB.');return;}
  setUploading(true);onUploading?.(true);
  try{const data=await apiRequest('/admin/products/images',{method:'POST',body:file,headers:{'Content-Type':file.type}});setImage(data.image);}catch(error){setError(error.message);}finally{setUploading(false);onUploading?.(false);}
 }
 return <div className="space-y-2"><label className="product-label">{label}{required&&<span className="text-red-500"> *</span>}<span className="mt-2 flex items-center gap-2"><Upload size={16}/><input type="file" accept="image/jpeg,image/png,image/webp" required={required&&!image} disabled={uploading} onChange={choose} className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600"/></span></label><input type="hidden" name={name} value={image}/><p className="text-xs text-slate-400">{uploading?'Uploading…':'JPG, PNG, WebP · max 5 MB'}</p>{error&&<p role="alert" className="text-xs text-red-600">{error}</p>}{image&&<div><img src={productImageUrl(image)} alt={`${label} preview`} className="h-32 w-full rounded-lg bg-slate-50 object-contain"/><button type="button" disabled={uploading} onClick={()=>setImage('')} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"><X size={13}/>Remove image</button></div>}</div>;
}
