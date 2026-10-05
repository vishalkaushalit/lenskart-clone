
import { Menu, Bell } from "lucide-react";

const DashboardHeader = () => {
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-4 sm:px-6">
        {/* Hamburger — toggles the checkbox */}
        <label
          htmlFor="sidebar-toggle"
          className="shrink-0 cursor-pointer rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </label>

        <div className="w-full flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 sm:flex">
          {/* <span className="text-slate-400">🔍</span> */}
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            className="relative rounded-full p-1.5 text-xl text-slate-600 hover:bg-slate-100 sm:p-0 sm:hover:bg-transparent"
            aria-label="Notifications"
          >
            <Bell />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Admin"
              className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
            />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">Admin</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
