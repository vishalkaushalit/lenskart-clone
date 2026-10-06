const palette = { pending: '#fbbf24', confirmed: '#3b82f6', shipped: '#a855f7', delivered: '#10b981', cancelled: '#ef4444' };
const number = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const date = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${value}T12:00:00Z`));
export default function ChartDashboard({ sales, statuses }) {
  const maximum = Math.max(1, ...sales.map(point => point.revenue));
  const points = sales.map((point, index) => ({ ...point, x: 65 + index / Math.max(1, sales.length - 1) * 515, y: 195 - point.revenue / maximum * 170 }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const labels = new Set(Array.from({ length: Math.min(5, sales.length) }, (_, index) => Math.round(index * (sales.length - 1) / Math.max(1, Math.min(5, sales.length) - 1))));
  const total = statuses.reduce((sum, entry) => sum + entry.count, 0);
  const circumference = 2 * Math.PI * 60;
  const segments = statuses.map((entry, index) => ({ ...entry, offset: statuses.slice(0, index).reduce((sum, previous) => sum + previous.count, 0) / (total || 1) * circumference, length: entry.count / (total || 1) * circumference }));
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-2">
      <h2 className="text-base font-semibold text-slate-800">Sales Overview</h2><p className="mb-4 text-xs text-slate-500">Delivered-order revenue by order date · INR · India time</p>
      <svg viewBox="0 0 610 240" className="h-48 w-full sm:h-64" role="img" aria-label="Daily delivered-order revenue for the selected period">
        {[0, 1, 2, 3, 4].map(index => <g key={index}><text x="0" y={199 - index * 42.5} fontSize="11" fill="#64748b">₹{number.format(maximum * index / 4)}</text><line x1="65" x2="580" y1={195 - index * 42.5} y2={195 - index * 42.5} stroke="#e2e8f0" /></g>)}
        {points.length > 0 && <><path d={`${line} L 580 195 L 65 195 Z`} fill="#3b82f6" opacity=".12" /><path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" />{points.map(point => <circle key={point.date} cx={point.x} cy={point.y} r="3" fill="#3b82f6"><title>{date(point.date)}: {money.format(point.revenue)}</title></circle>)}</>}
        {points.filter((_, index) => labels.has(index)).map(point => <text key={point.date} x={point.x} y="222" textAnchor="middle" fontSize="11" fill="#64748b">{date(point.date)}</text>)}
      </svg>
      {!sales.some(point => point.revenue > 0) && <p className="text-center text-sm text-slate-500">No delivered-order revenue in this period.</p>}
    </section>
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="mb-4 text-base font-semibold text-slate-800">Order Status</h2>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6 lg:flex-col"><div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`${total} orders by status`}><circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="20" />{segments.filter(entry => entry.count > 0).map(entry => <circle key={entry.status} cx="80" cy="80" r="60" fill="none" stroke={palette[entry.status]} strokeWidth="20" strokeDasharray={`${entry.length} ${circumference}`} strokeDashoffset={-entry.offset}><title>{entry.status}: {entry.count}</title></circle>)}</svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-lg font-bold text-slate-900 sm:text-xl">{total.toLocaleString('en-IN')}</p><p className="text-xs text-slate-500">Total Orders</p></div>
      </div><div className="w-full space-y-3 text-sm">{statuses.map(entry => <div key={entry.status} className="flex justify-between gap-2"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[entry.status] }} /><span className="capitalize text-slate-600">{entry.status}</span></span><span className="font-medium text-slate-700">{entry.count.toLocaleString('en-IN')} ({total ? Math.round(entry.count / total * 100) : 0}%)</span></div>)}</div></div>
    </section>
  </div>;
}
