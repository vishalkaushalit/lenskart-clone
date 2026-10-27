import { useId, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
export default function TextFileUpload({ filename, accept, value, disabled, onFile, onRemove }) {
  const input=useRef(null);
  const id=useId();
  return <div className="space-y-3">
    <label htmlFor={id} className="product-label block">Upload {filename}</label>
    <input id={id} ref={input} type="file" accept={accept} disabled={disabled} className="sr-only" onChange={event=>{onFile(event.target.files?.[0]);event.target.value='';}} />
    <button type="button" disabled={disabled} className="product-upload disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>input.current?.click()} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(!disabled)onFile(event.dataTransfer.files?.[0]);}}><Upload size={27} aria-hidden="true"/><span className="text-blue-700">{value?`Replace ${filename}`:`Upload ${filename}`}</span><small>Click to upload or drag and drop · {filename.endsWith('.xml')?'XML, max 200 KB':'TXT, max 100 KB'}</small></button>
    {value&&<div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2"><span className="text-sm text-slate-700">{filename} · {new TextEncoder().encode(value).length.toLocaleString()} bytes</span><button type="button" disabled={disabled} className="delete-button" aria-label={`Remove ${filename} override`} title="Remove file override" onClick={onRemove}><Trash2 size={18} aria-hidden="true"/></button></div>}
  </div>;
}
