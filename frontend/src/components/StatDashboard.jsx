import React from "react";

const StatDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            👤
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Total Users
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">
              1,248
            </p>
            <p className="text-xs font-semibold text-emerald-600">+12%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            ✅
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Active Users
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">
              1,102
            </p>
            <p className="text-xs font-semibold text-emerald-600">+10%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            ❌
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Inactive Users
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">146</p>
            <p className="text-xs font-semibold text-red-500">-3%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            📦
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Total Products
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">568</p>
            <p className="text-xs font-semibold text-emerald-600">+8%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            🛒
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Total Orders
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">
              2,340
            </p>
            <p className="text-xs font-semibold text-emerald-600">+15%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            ⏰
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Pending Orders
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">246</p>
            <p className="text-xs font-semibold text-red-500">-4%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            ✔️
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Completed Orders
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">
              2,094
            </p>
            <p className="text-xs font-semibold text-emerald-600">+16%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            💰
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">
              Revenue
            </p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">
              $48,520
            </p>
            <p className="text-xs font-semibold text-emerald-600">+18%</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatDashboard;
