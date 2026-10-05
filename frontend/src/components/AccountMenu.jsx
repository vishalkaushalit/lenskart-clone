import PopupMessage from "./PopupMessage";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AccountMenu({ mobile = false, onNavigate }) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const adminUrl = import.meta.env.VITE_ADMIN_URL;
  const panelId = mobile ? "mobile-account-dropdown" : "account-dropdown";

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

  async function handleLogout() {
    setSigningOut(true);
    setError("");
    try {
      await logout();
      setOpen(false);
      onNavigate?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setSigningOut(false);
    }
  }

  const triggerClass = mobile
    ? "mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-ink py-3 text-[14px] font-semibold text-white"
    : "flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink";

  if (loading) {
    return <button type="button" disabled className={triggerClass} aria-label="Checking account"><UserRound size={24} /></button>;
  }

  if (!user) {
    return (
      <Link to="/login" onClick={onNavigate} className={triggerClass} aria-label="Login or signup">
        <UserRound size={24} aria-hidden="true" />
        {mobile && "Login/Signup"}
      </Link>
    );
  }

  return (
    <div ref={containerRef} className={mobile ? "relative w-full" : "relative shrink-0"}>
      <button
        ref={buttonRef}
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <UserRound size={24} aria-hidden="true" />
        My Account
        <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div id={panelId} className={`${mobile ? "mt-2 w-full" : "absolute right-0 top-full mt-3 w-64"} z-50 rounded-xl border border-black/10 bg-white p-4 text-ink shadow-xl`}>
          <Link to="/profile" onClick={() => { setOpen(false); onNavigate?.(); }} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100">Profile</Link>
          {user.role === "admin" && (
            adminUrl ? (
              <a href={`${adminUrl.replace(/\/$/, "")}/dashboard`} onClick={() => { setOpen(false); onNavigate?.(); }} className="mt-3 block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100">Dashboard</a>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">The web-panel URL is not configured.</p>
            )
          )}
          <button type="button" disabled={signingOut} onClick={handleLogout} className="mt-3 w-full rounded-lg border-t border-black/10 px-3 py-2 text-left text-sm font-semibold hover:bg-gray-100 disabled:opacity-50">
            {signingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
      {error && <PopupMessage message={error} onClose={() => setError("")} />}
    </div>
  );
}
