import React from "react";

const RecentOrders = () => {
  return (
    <>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Recent Orders
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </a>
        </div>

        {/* Horizontal scroll on small screens */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Order ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="whitespace-nowrap py-3 pr-4 font-medium">
                  #ORD-10245
                </td>
                <td className="whitespace-nowrap py-3 pr-4">John Doe</td>
                <td className="whitespace-nowrap py-3 pr-4">$149.00</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    Out for Delivery
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                  Sep 29, 2026 02:24 PM
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-3 pr-4 font-medium">
                  #ORD-10244
                </td>
                <td className="whitespace-nowrap py-3 pr-4">Alice Smith</td>
                <td className="whitespace-nowrap py-3 pr-4">$89.00</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    Preparing
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                  Sep 29, 2026 11:12 AM
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-3 pr-4 font-medium">
                  #ORD-10243
                </td>
                <td className="whitespace-nowrap py-3 pr-4">Robert Johnson</td>
                <td className="whitespace-nowrap py-3 pr-4">$199.00</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Confirmed
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                  Sep 29, 2026 09:45 AM
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-3 pr-4 font-medium">
                  #ORD-10242
                </td>
                <td className="whitespace-nowrap py-3 pr-4">Emma Wilson</td>
                <td className="whitespace-nowrap py-3 pr-4">$59.00</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Delivered
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                  Sep 28, 2026 07:21 PM
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RecentOrders;
