import "./ProductPopup.css";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { CircleCheck, CircleAlert, X } from "lucide-react";

export default function NotificationPopup({ notification, onClose }) {
  const dialogRef = useRef(null);
  const success = notification.type === "success";

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const Icon = success ? CircleCheck : CircleAlert;

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="notification-title" aria-describedby="notification-message" onKeyDown={(event) => event.stopPropagation()} onCancel={(event) => { event.stopPropagation(); event.preventDefault(); onClose(); }} className="app-popup border border-slate-200 bg-white p-6 text-center text-slate-800 shadow-xl backdrop:bg-black/40">
      <button type="button" onClick={onClose} aria-label="Close notification" className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${success ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}><Icon size={32} /></div>
      <h2 id="notification-title" className="text-xl font-bold">{success ? "Success" : "Something went wrong"}</h2>
      <p id="notification-message" className="mt-3 break-words text-sm text-slate-600">{notification.message}</p>
      <button type="button" autoFocus onClick={onClose} className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${success ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}>OK</button>
    </dialog>, document.body
  );
}
