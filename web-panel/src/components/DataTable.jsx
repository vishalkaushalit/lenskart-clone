export default function DataTable({ label, minWidth = 820, header, footer, children }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white">
      {header && <div className="border-b border-slate-200 px-4 py-4">{header}</div>}
      <div className="overflow-x-auto rounded-t-2xl">
        <table aria-label={label} className="admin-table w-full text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
      {footer}
    </div>
  );
}
