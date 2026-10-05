import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize = 20, total, onPageChange, label = 'items', disabled = false }) {
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.max(1, Math.min(page, pages));
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);
  const buttonClass = 'flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';
  return <div className="flex flex-col items-center gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-between">
    <p className="text-xs text-slate-500">Showing <span className="font-medium text-slate-700">{total ? (current - 1) * pageSize + 1 : 0}–{Math.min(current * pageSize, total)}</span> of <span className="font-medium text-slate-700">{total.toLocaleString()}</span> {label}</p>
    <nav aria-label={`${label} pagination`} className="flex items-center gap-1">
      <button type="button" aria-label="Previous page" disabled={disabled || current <= 1} onClick={() => onPageChange(current - 1)} className={buttonClass}><ChevronLeft size={16} /></button>
      {numbers.map((number) => <button type="button" key={number} aria-label={`Page ${number}`} aria-current={current === number ? 'page' : undefined} disabled={disabled} onClick={() => onPageChange(number)} className={`${buttonClass} ${current === number ? '!border-blue-600 !bg-blue-600 !text-white' : ''}`}>{number}</button>)}
      <button type="button" aria-label="Next page" disabled={disabled || current >= pages} onClick={() => onPageChange(current + 1)} className={buttonClass}><ChevronRight size={16} /></button>
    </nav>
  </div>;
}
