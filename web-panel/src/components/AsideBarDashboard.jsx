import PopupMessage from "./PopupMessage";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { apiRequest, frontendUrl } from "../api";

const AsideBarDashboard = ({ isOpen, isDesktop, onClose }) => {
  const closeButtonRef = useRef(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const navigationClass = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`;

  useEffect(() => {
    if (isOpen && !isDesktop) closeButtonRef.current?.focus();
  }, [isOpen, isDesktop]);

  function handleKeyDown(event) {
    if (!isOpen || isDesktop) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key === "Tab") {
      const controls = event.currentTarget.querySelectorAll('a[href], button:not([disabled])');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  async function handleLogout() {
    setSigningOut(true);
    setError("");
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      window.location.assign(`${frontendUrl}/login`);
    } catch (error) {
      setError(error.message);
      setSigningOut(false);
    }
  }
  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <aside
        id="dashboard-sidebar"
        role={isOpen && !isDesktop ? "dialog" : undefined}
        aria-modal={isOpen && !isDesktop ? true : undefined}
        aria-label="Dashboard navigation"
        inert={!isDesktop && !isOpen}
        onKeyDown={handleKeyDown}
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 max-w-[85vw] shrink-0 flex-col bg-[#0b1739] text-slate-300 transition-transform duration-300 ${isOpen ? "visible translate-x-0" : "invisible -translate-x-full"} lg:sticky lg:top-0 lg:visible lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-6 text-white">
          <span className="text-lg font-bold tracking-wide">ShopAdmin</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close sidebar" className="rounded-md p-1 hover:bg-white/10 lg:hidden"><X size={22} /></button>
        </div>

        {/* Nav */}
        <nav aria-label="Admin navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={navigationClass}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/users"
            onClick={onClose}
            className={navigationClass}
          >
            Users
          </NavLink>
          <NavLink
            to="/product"
            onClick={onClose}
            className={navigationClass}
          >
            Products
          </NavLink>
          <NavLink to="/categories" onClick={onClose} className={navigationClass}>Categories</NavLink>
          <NavLink to="/coupons" onClick={onClose} className={navigationClass}>Coupons</NavLink>
          <NavLink to="/orders" onClick={onClose} className={navigationClass}>Orders</NavLink>
          <a
            href={`${import.meta.env.BASE_URL}orders`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Track Orders
          </a>

          <div className="my-6 border-t border-white/10" />

          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Settings
          </a>
          <button type="button" disabled={signingOut} onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50">
            {signingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>
      </aside>
      {error && <PopupMessage message={error} onClose={() => setError("")} />}
    </>
  );
};

export default AsideBarDashboard;
