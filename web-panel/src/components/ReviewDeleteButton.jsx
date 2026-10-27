import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { apiRequest } from '../api';
export default function ReviewDeleteButton({ review, onDeleted, disabled = false }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, [open]);
  async function remove() {
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/admin/reviews/${review._id}`, { method: 'DELETE' });
      setOpen(false);
      onDeleted();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className="delete-button admin-action-delete"
        title="Delete review"
        aria-label={`Delete review by ${review.name}`}
        onClick={() => {
          setError('');
          setOpen(true);
        }}
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
      {open && (
        <dialog
          ref={dialog}
          aria-labelledby={`delete-${review._id}`}
          onCancel={(event) => {
            event.preventDefault();
            if (!busy) setOpen(false);
          }}
          className="app-popup border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-black/40"
        >
          <div className="flex items-center justify-between">
            <h2 id={`delete-${review._id}`} className="text-lg font-bold">
              Delete review
            </h2>
            <button type="button" disabled={busy} aria-label="Close" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <p className="my-5 text-sm text-slate-600">
            Delete the review by {review.name}? This cannot be undone.
          </p>
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              className="admin-button-secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="button" disabled={busy} className="delete-button" onClick={remove}>
              <Trash2 size={18} aria-hidden="true" />
              {busy ? 'Deleting…' : 'Delete review'}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
