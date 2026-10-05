import { useEffect, useRef, useState } from "react";
import AsideBarDashboard from "./AsideBarDashboard";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({ children }) {
  const sidebarButtonRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    function handleResize(event) {
      setIsDesktop(event.matches);
      setSidebarOpen(false);
    }
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || isDesktop) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = sidebarButtonRef.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [sidebarOpen, isDesktop]);

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-800">
      {sidebarOpen && !isDesktop && (
        <button type="button" onClick={() => setSidebarOpen(false)} tabIndex={-1} aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
      )}
      <AsideBarDashboard isOpen={sidebarOpen} isDesktop={isDesktop} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col" inert={sidebarOpen && !isDesktop}>
        <DashboardHeader sidebarButtonRef={sidebarButtonRef} sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
