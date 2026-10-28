import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { prefixRoutes } from '../../../shared/urlPrefixes.js';
import { seoPageKey } from '../seoPages';
import DeleteRecordButton from './DeleteRecordButton';
import Pagination from './Pagination';
import DataTable from './DataTable';
export default function RedirectSettings({ settings, onChange, notify }) {
  const [pages, setPages] = useState([]),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  const [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1);
  const [removed, setRemoved] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest('/admin/seo/all', { signal: controller.signal })
      .then((data) => setPages(data.pages || []))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, [attempt]);
  const custom = settings.redirects || [];
  const automatic = [
    ...prefixRoutes(settings, pages)
      .filter((row) => row.path !== '/collection/:category')
      .map((row) => ({ ...row, editHref: '/seo/settings' })),
    ...pages
      .filter((row) => row.path !== '/collection')
      .map((row) => ({ ...row, editHref: `/seo/${seoPageKey(row.path)}/edit` })),
  ]
    .flatMap((row) =>
      [...new Set([...(row.redirectOld ? [row.path] : []), ...(row.redirects || [])])]
        .filter((path) => path !== (row.urlPath || row.path))
        .map((path) => ({
          from: path,
          to: row.urlPath || row.path,
          automatic: true,
          editHref: row.editHref,
        })),
    )
    .filter((row) => !removed.includes(row.from));
  const rows = [
    ...custom,
    ...automatic.filter((row) => !custom.some((item) => item.from === row.from)),
  ];
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)));
  function add() {
    const source = from.trim(),
      target = to.trim();
    if (
      !source.startsWith('/') ||
      !target.startsWith('/') ||
      source === target ||
      custom.some((row) => row.from === source)
    ) {
      notify('Enter distinct local paths and a unique old URL.', 'error');
      return;
    }
    onChange([...custom, { from: source, to: target }]);
    setFrom('');
    setTo('');
    setPage(Math.ceil((custom.length + 1) / 10));
    notify('Redirect added. Save changes to publish.');
  }
  return (
    <section className="product-panel seo-editor space-y-5">
      <div>
        <h2 className="product-panel-title">URL redirections</h2>
        <p className="mt-2 text-sm text-slate-500">
          Send visitors and search engines from an old URL to a new URL using a permanent 301
          redirect. Enter paths such as /old-frames and /collection. Query parameters are preserved.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="product-label">
          Redirect from
          <input
            className="product-field"
            value={from}
            maxLength={300}
            placeholder="/old-frames"
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="product-label">
          Redirect to
          <input
            className="product-field"
            value={to}
            maxLength={300}
            placeholder="/collection"
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </div>
      <button type="button" className="admin-button-secondary" onClick={add}>
        Add redirect
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}{' '}
          <button
            type="button"
            onClick={() => {
              setError('');
              setAttempt((value) => value + 1);
            }}
          >
            Retry loading automatic redirects
          </button>
        </p>
      )}
      <DataTable
        label="URL redirections"
        footer={
          <Pagination page={current} total={rows.length} onPageChange={setPage} label="redirects" />
        }
      >
        <thead>
          <tr>
            {['Sr. No.', 'Old URL', 'New URL', 'Type', 'Actions'].map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice((current - 1) * 10, current * 10).map((row, index) => (
            <tr key={`${row.automatic ? 'auto' : 'custom'}-${row.from}`}>
              <td>{(current - 1) * 10 + index + 1}</td>
              <td className="break-all font-sans">{row.from}</td>
              <td className="break-all font-sans">{row.to}</td>
              <td>{row.automatic ? 'Automatic 301' : 'Custom 301'}</td>
              <td>
                <div className="flex items-center gap-2">
                  {row.automatic && (
                    <Link
                      to={row.editHref}
                      className="admin-button-secondary inline-flex text-blue-700"
                      aria-label={`Edit URL settings for redirect from ${row.from}`}
                      title="Edit source page URL or prefix"
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Link>
                  )}
                  {row.automatic ? (
                    <DeleteRecordButton
                      path={`/admin/site-seo/redirects?from=${encodeURIComponent(row.from)}`}
                      label={`redirect from ${row.from}`}
                      onDeleted={() => {
                        setRemoved((value) => [...value, row.from]);
                        notify(
                          'Automatic redirect deleted. Reload the storefront to refresh its routes.',
                        );
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="admin-button-secondary text-red-600"
                      aria-label={`Delete redirect from ${row.from}`}
                      title="Delete redirect"
                      onClick={() => {
                        onChange(custom.filter((item) => item.from !== row.from));
                        notify('Redirect removed. Save changes to publish.');
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={5}>No redirects configured.</td>
            </tr>
          )}
        </tbody>
      </DataTable>
    </section>
  );
}
