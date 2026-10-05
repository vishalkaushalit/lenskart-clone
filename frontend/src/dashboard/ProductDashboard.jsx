import AsideBarDashboard from "../components/AsideBarDashboard";
import DashboardHeader from "../components/DashboardHeader";

const ProductDashboard = () => {
  // Sample data — replace with real products later
  const products = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop",
      name: "Ray-Ban Wayfarer Sunglasses",
      category: "Sunglasses",
      price: "$149.00",
      stock: 120,
      status: "Active",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=80&h=80&fit=crop",
      name: "Oakley Holbrook",
      category: "Sunglasses",
      price: "$189.00",
      stock: 85,
      status: "Active",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=80&h=80&fit=crop",
      name: "Vogue Eyewear Frame",
      category: "Eyeglasses",
      price: "$99.00",
      stock: 200,
      status: "Active",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=80&h=80&fit=crop",
      name: "Titanium Round Frame",
      category: "Eyeglasses",
      price: "$129.00",
      stock: 150,
      status: "Active",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=80&h=80&fit=crop",
      name: "Blue Light Blocking Glasses",
      category: "Eyeglasses",
      price: "$79.00",
      stock: 95,
      status: "Inactive",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Hidden checkbox that controls the sidebar (peer) */}
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />

      {/* Overlay — shows when checkbox is checked (mobile only) */}
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 z-30 hidden bg-black/40 peer-checked:block lg:hidden"
        aria-hidden="true"
      />

      <AsideBarDashboard />

      {/* ================= MAIN ================= */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <DashboardHeader />

        {/* Content */}
        <main className="flex-1 space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
          {/* ============ PAGE TITLE ============ */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Products
              </h1>
              <p className="text-sm text-slate-500">
                Manage your product catalog
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]">
              <span className="text-base leading-none">+</span>
              Add Product
            </button>
          </div>

          {/* ============ FILTERS ============ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Category */}
              <select
                aria-label="Filter by category"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-auto sm:min-w-[180px]"
              >
                <option>All Categories</option>
                <option>Sunglasses</option>
                <option>Eyeglasses</option>
              </select>

              {/* Brand */}
              <select
                aria-label="Filter by brand"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-auto sm:min-w-[180px]"
              >
                <option>All Brands</option>
                <option>Ray-Ban</option>
                <option>Oakley</option>
                <option>Vogue</option>
              </select>

              {/* Status */}
              <select
                aria-label="Filter by status"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-auto sm:min-w-[160px]"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              {/* Search */}
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 sm:ml-auto sm:max-w-xs">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* ============ PRODUCTS TABLE ============ */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            {/* Horizontal scroll on small screens */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all products"
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold">Image</th>
                    <th className="px-4 py-3 font-semibold">Product Name</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.name}`}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.name}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-600">{p.category}</td>

                      {/* Price */}
                      <td className="px-4 py-3 text-slate-700">{p.price}</td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-slate-700">{p.stock}</td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {p.status === "Active" ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Edit ${p.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            ✏️
                          </button>
                          <button
                            aria-label={`Delete ${p.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============ PAGINATION ============ */}
            <div className="flex flex-col items-center gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">1–5</span>{" "}
                of <span className="font-medium text-slate-700">568</span>{" "}
                products
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition ${
                      n === 1
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                {/* Ellipsis */}
                <span className="px-1 text-slate-400">…</span>

                {/* Next */}
                <button
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDashboard;
