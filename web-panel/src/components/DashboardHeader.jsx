import { searchDestination } from "../search";

import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Bell, Search, X, ArrowLeft } from "lucide-react";
import AdminAccountMenu from "./AdminAccountMenu";

const DashboardHeader = ({ sidebarButtonRef, sidebarOpen, onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const { path: target, label } = searchDestination(location.pathname);
  const title = location.pathname === "/product/add" ? "Add Product" : /^\/product\/[^/]+\/edit$/.test(location.pathname) ? "Edit Product" : /^\/product\/[^/]+$/.test(location.pathname) ? "Product Details" : "";

  function handleSearch(event) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("search") || "").trim();
    const next = new URLSearchParams(location.pathname === target ? searchParams : undefined);
    next.delete("page");
    if (query) next.set("search", query); else next.delete("search");
    navigate(`${target}${next.size ? `?${next}` : ""}`);
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-4 sm:px-6">
        <button
          ref={sidebarButtonRef}
          type="button"
          onClick={onOpenSidebar}
          className="shrink-0 cursor-pointer rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="dashboard-sidebar"
        >
          <Menu />
        </button>

        {title ? <div className="flex min-w-0 items-center gap-3"><Link to="/product" aria-label="Back to products" className="rounded-lg p-1 text-blue-600"><ArrowLeft size={20}/></Link><h1 className="text-lg font-bold text-slate-800">{title}</h1></div> : <form role="search" aria-label="Admin search" onSubmit={handleSearch} key={`${location.pathname}-${search}`} className="flex min-w-0 flex-1 max-w-md items-center gap-2 rounded-lg border border-transparent bg-slate-100 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <button type="submit" aria-label={`Search ${label}`} className="shrink-0 rounded p-1 text-slate-500 hover:text-blue-600"><Search size={18} /></button>
          <input name="search" type="search" aria-label={`Search ${label}`} defaultValue={search} maxLength={100} placeholder={`Search ${label}...`} className="min-w-0 w-full bg-transparent py-1 text-sm outline-none placeholder:text-slate-400" />
          {search && <button type="button" aria-label="Clear search" onClick={() => { const next = new URLSearchParams(searchParams); next.delete("search"); next.delete("page"); navigate(`${target}${next.size ? `?${next}` : ""}`); }} className="shrink-0 rounded p-1 text-slate-500 hover:text-blue-600"><X size={16} /></button>}
        </form>}

        {/* Right side */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            className="relative rounded-full p-1.5 text-xl text-slate-600 hover:bg-slate-100 sm:p-0 sm:hover:bg-transparent"
            aria-label="Notifications"
          >
            <Bell />
          </button>
          <AdminAccountMenu />
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
