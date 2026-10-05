export default function PageHeader({ title, description, children }) {
  return <div className="flex flex-wrap items-center justify-between gap-4">
    <div><h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>;
}
