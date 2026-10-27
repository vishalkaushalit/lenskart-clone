import Pagination from '../components/Pagination';
import useTablePagination from '../hooks/useTablePagination';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { seoPages, seoPageKey } from '../seoPages';

export default function PageSeo() {
  const pagination = useTablePagination(seoPages);
  return <DashboardLayout><main className="admin-page space-y-6">
    <PageHeader title="Search engine listings" description="Manage search appearance for your storefront pages." />
    <p className="text-sm text-slate-600">Product search listings are edited on each <Link to="/product" className="text-blue-700 underline">product's editing page</Link>.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="admin-table seo-pages-table w-full min-w-[600px] text-left">
          <caption className="sr-only">Storefront pages and search indexing settings</caption>
          <thead><tr><th scope="col">S.No.</th><th scope="col">Page</th><th scope="col">URL</th><th scope="col">Search indexing</th><th scope="col" className="text-right">Actions</th></tr></thead>
          <tbody>{pagination.rows.map(([url, label, , , noindex], index) => <tr key={url} >
            <td className="tabular-nums text-slate-500">{pagination.offset + index + 1}</td>
            <td className="font-medium text-slate-900">{label}</td>
            <td className="font-mono text-slate-500">{url}</td>
            <td><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${!noindex ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{!noindex ? 'Indexable' : 'Noindex'}</span></td>
            <td className="text-right"><Link to={`/seo/${seoPageKey(url)}/edit`} aria-label={`Edit SEO for ${label}`} title={`Edit SEO for ${label}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={16} aria-hidden="true" /></Link></td>
          </tr>)}</tbody>
        </table>
        </div>
        <Pagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onPageChange={pagination.setPage} label="pages" />
      </div>
  </main></DashboardLayout>;
}
