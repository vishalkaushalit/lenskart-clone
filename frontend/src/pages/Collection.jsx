import {useCategories} from '../context/CategoryContext';
import { matchesSearch } from "../state/productSearch";
import Loader from '../components/Loader';
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  Glasses,
  Grid2X2,
  Sparkles,
  X,
} from "lucide-react";
import { filterGroups, matchesFilters } from "../data/collection";
import { apiRequest } from "../api/api";
import { useStore } from "../context/StoreContext";
import PopupMessage from "../components/PopupMessage";
import SimilarProductsPopup from "../components/SimilarProductsPopup";
import ProductCard from "../components/ProductCard";
import CollectionSort from "../components/CollectionSort";
import "./Collection.css";

export default function Collection() {
  const [params] = useSearchParams();
  return <CollectionResults key={params.get("search") || ""} />;
}

function CollectionResults() {
  const [params,setParams] = useSearchParams();
  const {categories}=useCategories();
  const categoryValue=params.get('category')||'';
  const subcategoryValue=params.get('subcategory')||'';
  const categoryId=categories.find(row=>!row.parent&&(row.slug===categoryValue||row._id===categoryValue))?._id||'';
  const subcategoryId=categories.find(row=>row.parent===categoryId&&(row.slug===subcategoryValue||row._id===subcategoryValue))?._id||'';
  const [similarProduct,setSimilarProduct]=useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/products?all=1",{signal:controller.signal});
        if (!controller.signal.aborted)
          setCatalog(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);
  const assetUrl = (path) =>
    path?.startsWith("/")
      ? new URL(
          path,
          import.meta.env.VITE_API_URL || "http://localhost:5001/api",
        ).href
      : path;
  const [sort, setSort] = useState("recommended");
  const [tab, setTab] = useState("All");
  const [draft, setDraft] = useState({});
  const [filters, setFilters] = useState({});
  const { favorites, toggleFavorite, notify } = useStore();
  const drawer = useRef(null);
  const currentCategory=categories.find(row=>row._id===categoryId);
  const currentSubcategory=categories.find(row=>row._id===subcategoryId);
  const query = (params.get("search") || "").trim();
  const brandQuery=(params.get("brand")||"").toLowerCase();
  const shapeQuery=(params.get("shape")||"").toLowerCase();
  const products = useMemo(() => {
  const results = catalog.filter(
    (product) =>
      (tab === "All" || product.category === tab) &&
      (!categoryValue||Boolean(categoryId))&&(!subcategoryValue||Boolean(subcategoryId))&&
      (!brandQuery||product.brand.toLowerCase()===brandQuery) &&
      (!shapeQuery||product.shape.toLowerCase()===shapeQuery) &&
      (!categoryId||(product.categoryIds||[product.categoryId]).includes(categoryId))&&(!subcategoryId||(product.subcategoryIds||[product.subcategoryId]).includes(subcategoryId))&&
      matchesFilters(product, filters) &&
      matchesSearch(product, query),
  );
  if (sort === "price-low") results.sort((a, b) => a.price - b.price);
  if (sort === "price-high") results.sort((a, b) => b.price - a.price);
  if (sort === "bestsellers") results.sort((a, b) => b.sales - a.sales);
  if (sort === "newest")
    results.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  return results;
  },[catalog,tab,categoryValue,categoryId,subcategoryValue,subcategoryId,brandQuery,shapeQuery,filters,query,sort]);
  const availableFilters = useMemo(() => {
  const options = { ...filterGroups };
  for (const [group, field] of Object.entries({
    Gender: "gender",
    "Shape & Style": "shape",
    "Frame Size": "size",
    Brand: "brand",
    "Frame Color": "color",
  })) {
    options[group] = [
      ...new Set(catalog.map((product) => product[field]).filter(Boolean)),
    ];
  }
  return options;
  },[catalog]);
  const count = Object.values(filters).flat().length;

  function toggle(group, value) {
    setDraft((previous) => {
      const values = previous[group] || [];
      return {
        ...previous,
        [group]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  }
  function apply() {
    setFilters(draft);
    notify("Filters applied.");
    drawer.current?.close();
  }
  function reset() {
    notify("Filters cleared.");
    setDraft({});
    setFilters({});
    const next=new URLSearchParams(params);for(const key of ['category','subcategory','brand','shape'])next.delete(key);setParams(next);
  }
  const sortControl = <CollectionSort value={sort} onChange={setSort} />;
  const filterControls = (
    <>
      <div className="collection-filter-title">
        <span>
          <Filter size={20} /> Filters {count > 0 && `(${count})`}
        </span>
        <button onClick={reset}>Reset</button>
      </div>
      {Object.entries(availableFilters).map(([group, options]) => (
        <details className="collection-filter-group" key={group}>
          <summary>
            {group}
            <ChevronDown size={20} />
          </summary>
          <div>
            {options.map((value) => (
              <label key={value}>
                <input
                  type="checkbox"
                  checked={(draft[group] || []).includes(value)}
                  onChange={() => toggle(group, value)}
                />
                {value}
              </label>
            ))}
          </div>
        </details>
      ))}
      <button
        className={`collection-apply${Object.values(draft).some((values) => values.length > 0) ? " has-selection" : ""}`}
        onClick={apply}
      >
        Apply
      </button>
    </>
  );

  return (
    <section className="collection-page">
      <aside className="collection-sidebar" aria-label="Collection filters">
        {sortControl}
        {filterControls}
      </aside>
      <div className="collection-main">
        <div className="collection-intro">
          <nav aria-label="Breadcrumb" className="collection-breadcrumb">
            <Link to="/">Eyewear</Link>
            <span>/</span>
            {currentSubcategory && currentCategory ? <>
              <Link to={`/collection?category=${currentCategory.slug}`}>{currentCategory.name}</Link>
              <span aria-hidden="true">/</span>
              <strong aria-current="page">{currentSubcategory.name}</strong>
            </> : <strong aria-current="page">{params.get('brand') || currentCategory?.name || 'All Products'}</strong>}
          </nav>
          <h1>
            {query ? `Search results for “${query}”` : params.get('brand')||currentSubcategory?.name||currentCategory?.name||'All Products'} <span>{products.length} Items</span>
          </h1>
          {query && <Link to="/collection">Clear search</Link>}
          <div className="collection-mobile-controls">
            {sortControl}
            <button onClick={() => drawer.current.showModal()}>
              <Filter size={18} />
              Filters {count > 0 && `(${count})`}
            </button>
          </div>
          <div className="collection-tabs" aria-label="Collection type">
            {["All", "Classic", "Premium"].map((label) => (
              <button
                key={label}
                aria-pressed={tab === label}
                className={tab === label ? "selected" : ""}
                onClick={() => setTab(label)}
              >
                {label === "All" ? (
                  <Grid2X2 size={21} />
                ) : label === "Premium" ? (
                  <Sparkles size={21} />
                ) : (
                  <Glasses size={25} />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
        {count > 0 && (
          <div className="collection-active-filters">
            {Object.entries(filters).flatMap(([group, values]) =>
              values.map((value) => (
                <button
                  key={`${group}-${value}`}
                  aria-label={`Remove ${value} filter`}
                  onClick={() => {
                    const next = {
                      ...filters,
                      [group]: filters[group].filter((item) => item !== value),
                    };
                    setFilters(next);
                    setDraft(next);
                  }}
                >
                  {value}
                  <X size={14} />
                </button>
              )),
            )}
          </div>
        )}
        {loading && (
          <Loader label="Loading products"/>
        )}
        {error && (
          <div className="collection-empty">
            <PopupMessage message={error} />
            <button onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="collection-grid">
            {products.map(product=><ProductCard key={product.id} product={product} assetUrl={assetUrl} favorite={favorites.includes(product.id)} onFavorite={()=>toggleFavorite(product)} onSimilar={()=>setSimilarProduct(product)}/>)}
          </div>
        )}
        {!loading && !error && !products.length && (
          <div className="collection-empty">
            <Glasses size={40} />
            <h2>No frames found</h2>
            <p>{query ? `No products match “${query}”. Try a brand, color, or frame shape.` : "Try another collection or clear your filters."}</p>
            <button
              onClick={() => {
                reset();
                setTab("All");
              }}
            >
              Clear filters
            </button>
            {query && <Link to="/collection">Clear search</Link>}
          </div>
        )}
      </div>
      <dialog
        ref={drawer}
        className="collection-drawer"
        aria-labelledby="collection-filter-heading"
      >
        <div className="collection-drawer-heading">
          <h2 id="collection-filter-heading">Filter eyeglasses</h2>
          <button
            aria-label="Close filters"
            onClick={() => drawer.current.close()}
          >
            <X size={23} />
          </button>
        </div>

        {filterControls}
      </dialog>
    {similarProduct&&<SimilarProductsPopup product={similarProduct} onClose={()=>setSimilarProduct(null)}/>}
    </section>
  );
}
