import { Link } from "react-router-dom";

const AsideBarDashboard = () => {
  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-[#0b1739] text-slate-300 transition-transform duration-300 peer-checked:translate-x-0 lg:static lg:translate-x-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 text-white">
          <span className="text-lg font-bold tracking-wide">ShopAdmin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white"
          >
            Dashboard
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Users
          </a>
          <Link
            to="/product"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Products
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Coupons
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Orders
          </a>
          <a
            href="#"
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
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Logout
          </a>
        </nav>
      </aside>
    </>
  );
};

export default AsideBarDashboard;
