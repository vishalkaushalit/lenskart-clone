const count = value => Number(value).toLocaleString('en-IN');
const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const cards = [
  ['users', 'Total Users', '👤', 'bg-blue-50'],
  ['activeUsers', 'Active Users', '✅', 'bg-emerald-50'],
  ['inactiveUsers', 'Inactive Users', '❌', 'bg-red-50'],
  ['products', 'Total Products', '📦', 'bg-purple-50'],
  ['orders', 'Total Orders', '🛒', 'bg-blue-50'],
  ['pending', 'Pending Orders', '⏰', 'bg-amber-50'],
  ['completed', 'Completed Orders', '✔️', 'bg-emerald-50'],
  ['revenue', 'Revenue', '💰', 'bg-teal-50'],
];
export default function StatDashboard({ stats, changes }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
    {cards.map(([key, label, icon, background]) => <div key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 sm:text-2xl ${background}`} aria-hidden="true">{icon}</div>
      <div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><p className="text-base font-bold text-slate-900 sm:text-lg">{key === 'revenue' ? currency(stats[key]) : count(stats[key])}</p>
        <p className="text-xs text-slate-500">{key === 'activeUsers' ? 'Currently logged in' : key === 'inactiveUsers' ? 'Not logged in or disabled' : ['users', 'products'].includes(key) ? 'Store total' : key === 'revenue' ? 'Delivered orders in period' : 'Selected period'}</p>
        {Object.hasOwn(changes, key) && <p className="mt-1 text-xs text-slate-500">{changes[key] == null ? 'No prior-period baseline' : `${changes[key] > 0 ? '+' : ''}${changes[key]}% vs previous period`}</p>}
      </div>
    </div>)}
  </div>;
}
