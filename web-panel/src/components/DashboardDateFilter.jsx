export default function DashboardDateFilter({ label, value, onChange }) {
  return <select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><option value="all">All time</option>{['7','30','90'].map(days => <option key={days} value={days}>Last {days} days</option>)}</select>;
}
