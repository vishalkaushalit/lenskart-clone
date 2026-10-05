import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export default function AdminAccountMenu() {
  const { user } = useOutletContext();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button ref={buttonRef} type="button" aria-label="Admin account" aria-expanded={open} aria-controls="admin-account-dropdown" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-slate-100 sm:gap-3">
        <img src="https://i.pravatar.cc/100?img=12" alt="" className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9" />
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
          <span className="block text-xs text-slate-500">Super Admin</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div id="admin-account-dropdown" className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"><UserRound size={18} aria-hidden="true" />Profile</Link>
          <Link to="/logout" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={18} aria-hidden="true" />Logout</Link>
        </div>
      )}
    </div>
  );
}
