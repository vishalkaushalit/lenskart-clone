import { Link } from '../storeRouter';
import Loader from '../components/Loader';
import { useCategories } from '../context/CategoryContext';

const categoryImage = (path) =>
  path?.startsWith('/')
    ? new URL(
        path,
        import.meta.env.VITE_API_URL ||
          (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api'),
      ).href
    : path;

function SubcategoryList({ categories, parentId, rootSlug, path = [] }) {
  const children = categories.filter((category) => category.parent === parentId);
  if (!children.length) return null;
  return (
    <ul className="grid gap-2">
      {children.map((child) => {
        const childPath = [...path, child.slug];
        return (
          <li key={child._id}>
            <Link
              to={`/collections/${rootSlug}/${childPath.map(encodeURIComponent).join('/')}`}
              className="block rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-ink"
            >
              {child.name}
            </Link>
            <div className="ml-4 mt-2 border-l border-slate-200 pl-3">
              <SubcategoryList
                categories={categories}
                parentId={child._id}
                rootSlug={rootSlug}
                path={childPath}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Collections() {
  const { categories, loading, error, retry } = useCategories();
  const roots = categories.filter((category) => !category.parent);

  return (
    <section className="store-container py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Explore eyewear</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">All Collections</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Browse every collection and shop by category or style.
          </p>
        </div>
        <Link
          to="/products"
          className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          View all products
        </Link>
      </header>

      {loading && <Loader label="Loading collections" />}
      {error && (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
          <p role="alert">Unable to load collections: {error}</p>
          <button
            type="button"
            className="mt-3 font-semibold underline"
            onClick={retry}
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !error && !roots.length && (
        <p className="rounded-xl bg-white p-8 text-center text-slate-600">
          No collections are available right now.
        </p>
      )}
      {!loading && !error && roots.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roots.map((root) => {
            const childCount = categories.filter((category) => {
              let current = category;
              while (current.parent) {
                if (current.parent === root._id) return true;
                current = categories.find((row) => row._id === current.parent);
                if (!current) return false;
              }
              return false;
            }).length;
            return (
              <article
                key={root._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <Link
                  to={`/collections/${root.slug}`}
                  className="group flex min-h-36 items-center gap-4 p-5"
                >
                  {root.image && (
                    <img
                      src={categoryImage(root.image)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={112}
                      height={112}
                      className="h-24 w-24 shrink-0 rounded-xl bg-slate-50 object-contain p-2"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block text-lg font-bold text-ink group-hover:underline">
                      {root.name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {childCount
                        ? `${childCount} ${childCount === 1 ? 'collection' : 'collections'}`
                        : 'Browse collection'}
                    </span>
                  </span>
                </Link>
                {childCount > 0 && (
                  <div className="border-t border-slate-100 p-4">
                    <SubcategoryList
                      categories={categories}
                      parentId={root._id}
                      rootSlug={root.slug}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
