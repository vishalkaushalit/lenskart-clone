import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../api";

export default function UserActionDialog({ action, currentUserId, onClose, onSuccess, onError }) {
  const { type, user } = action;
  const creating = type === "create";
  const deleting = type === "delete";
  const dialogRef = useRef(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [phone, setPhone] = useState(user.phone || "");
  const [status, setStatus] = useState(user.accountStatus || "active");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await apiRequest(creating ? "/users" : `/users/${user.id}`, deleting ? { method: "DELETE" } : {
        method: creating ? "POST" : "PATCH", body: JSON.stringify({ name, email, role, phone, status, ...(creating ? { password } : {}) }),
      });
      onSuccess(data.user);
    } catch (error) {
      onError(error.message);
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="user-action-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-black/40">
      <div className="flex items-center justify-between gap-4">
        <h2 id="user-action-title" className="text-xl font-bold">{deleting ? "Delete user" : creating ? "Add user" : "Edit user"}</h2>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {deleting ? (
          <p className="text-sm text-slate-600">Delete <strong>{user.name}</strong> ({user.email})? This removes their account and cannot be undone.</p>
        ) : (
          <>
            <div>
              <label htmlFor="edit-user-name" className="mb-2 block text-sm font-semibold">Name</label>
              <input id="edit-user-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={busy} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label htmlFor="edit-user-email" className="mb-2 block text-sm font-semibold">Email</label>
              <input id="edit-user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={busy} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </div>
            <div><label htmlFor="user-phone" className="mb-2 block text-sm font-semibold">Phone</label><input id="user-phone" type="tel" value={phone} maxLength={30} onChange={(event) => setPhone(event.target.value)} disabled={busy} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></div>
            <div><label htmlFor="user-status" className="mb-2 block text-sm font-semibold">Account access</label><select id="user-status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy || user.id === currentUserId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="active">Enabled</option><option value="inactive">Disabled</option></select></div>
            {creating && <div><label htmlFor="user-password" className="mb-2 block text-sm font-semibold">Password</label><input id="user-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required disabled={busy} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" /></div>}
            <div>
              <label htmlFor="edit-user-role" className="mb-2 block text-sm font-semibold">Role</label>
              <select id="edit-user-role" value={role} onChange={(event) => setRole(event.target.value)} disabled={busy || user.id === currentUserId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 disabled:opacity-50">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={busy} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${deleting ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>{busy ? (deleting ? "Deleting..." : "Saving...") : (deleting ? "Delete user" : "Save changes")}</button>
        </div>
      </form>
    </dialog>
  );
}
