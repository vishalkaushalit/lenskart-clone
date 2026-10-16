import { useEffect, useId, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { apiRequest } from '../api';

export default function DeleteRecordButton({ path, label, onDeleted, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const node = dialog.current; node.showModal();
    return () => node.close();
  }, [open]);
  async function remove() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      await apiRequest(path, { method: 'DELETE' });
      setOpen(false); onDeleted();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <><button type="button" disabled={disabled} className="delete-button admin-action-delete" title={`Delete ${label}`} aria-label={`Delete ${label}`} onClick={() => { setError(''); setOpen(true); }}><Trash2 size={16} aria-hidden="true" /></button>
    {open && <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) setOpen(false); }} className="app-popup border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-black/40">
      <div className="flex items-center justify-between gap-3"><h2 id={titleId} className="text-lg font-bold">Delete {label}</h2><button type="button" disabled={busy} onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button></div>
      <p className="my-5 text-sm text-slate-600">Delete {label}? This cannot be undone.</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} className="admin-button-secondary" onClick={() => setOpen(false)}>Cancel</button><button type="button" disabled={busy} className="delete-button" onClick={remove}><Trash2 size={16} aria-hidden="true" />{busy ? 'Deleting…' : 'Delete'}</button></div>
    </dialog>}
  </>;
}
