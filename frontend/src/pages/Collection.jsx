import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Filter, Glasses, Grid2X2, Heart, PanelsTopLeft, BadgePercent, Sparkles, Star, X } from 'lucide-react';
import { collectionProducts, filterGroups, matchesFilters } from '../data/collection';
import CollectionSort from '../components/CollectionSort';
import './Collection.css';

const money = new Intl.NumberFormat('en-IN');
const colors = { Black: '#242424', Brown: '#594744', Grey: '#b1b8bc', Gold: '#c5ae77', Pink: '#dc8b9d' };

export default function Collection() {
  const [params] = useSearchParams();
  const [sort, setSort] = useState('recommended');
  const [tab, setTab] = useState('All');
  const [draft, setDraft] = useState({});
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('collection-favorites') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const [selectedColors, setSelectedColors] = useState({});
  const drawer = useRef(null);
  const query = (params.get('search') || '').trim().toLowerCase();
  const products = collectionProducts.filter((product) => (tab === 'All' || product.category === tab) && matchesFilters(product, filters) && (!query || `${product.name} ${product.shape} ${product.color}`.toLowerCase().includes(query)));
  if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
  if (sort === 'bestsellers') products.sort((a, b) => b.sales - a.sales);
  if (sort === 'newest') products.sort((a, b) => b.addedAt - a.addedAt);
  const count = Object.values(filters).flat().length;

  function toggle(group, value) {
    setDraft((previous) => { const values = previous[group] || []; return { ...previous, [group]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] }; });
  }
  function favorite(id) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem('collection-favorites', JSON.stringify(next)); } catch { /* Keep working when storage is unavailable. */ }
  }
  function apply() { setFilters(draft); drawer.current?.close(); }
  function reset() { setDraft({}); setFilters({}); }
  const sortControl = <CollectionSort value={sort} onChange={setSort} />;
  const filterControls = <>
    <div className="collection-filter-title"><span><Filter size={20} /> Filters {count > 0 && `(${count})`}</span><button onClick={reset}>Reset</button></div>
    {Object.entries(filterGroups).map(([group, options]) => <details className="collection-filter-group" key={group}><summary>{group}<ChevronDown size={20} /></summary><div>{options.map((value) => <label key={value}><input type="checkbox" checked={(draft[group] || []).includes(value)} onChange={() => toggle(group, value)} />{value}</label>)}</div></details>)}
    <button className={`collection-apply${Object.values(draft).some((values) => values.length > 0) ? ' has-selection' : ''}`} onClick={apply}>Apply</button>
  </>;

  return <section className="collection-page">
    <aside className="collection-sidebar" aria-label="Collection filters">{sortControl}{filterControls}</aside>
    <div className="collection-main">
      <div className="collection-intro">
        <nav aria-label="Breadcrumb" className="collection-breadcrumb"><Link to="/">Eyewear</Link><span>/</span><span>Eyeglasses</span><span>/</span><span>Promotions</span><span>/</span><strong>Eyeglasses</strong></nav>
        <h1>Eyeglasses <span>{products.length} Items</span></h1>
        <div className="collection-mobile-controls">{sortControl}<button onClick={() => drawer.current.showModal()}><Filter size={18} />Filters {count > 0 && `(${count})`}</button></div>
        <div className="collection-tabs" aria-label="Collection type">{['All', 'Classic', 'Premium'].map((label) => <button key={label} aria-pressed={tab === label} className={tab === label ? 'selected' : ''} onClick={() => setTab(label)}>{label === 'All' ? <Grid2X2 size={21} /> : label === 'Premium' ? <Sparkles size={21} /> : <Glasses size={25} />}{label}</button>)}</div>
      </div>
      {count > 0 && <div className="collection-active-filters">{Object.entries(filters).flatMap(([group, values]) => values.map((value) => <button key={`${group}-${value}`} aria-label={`Remove ${value} filter`} onClick={() => { const next = { ...filters, [group]: filters[group].filter((item) => item !== value) }; setFilters(next); setDraft(next); }}>{value}<X size={14} /></button>))}</div>}
      <div className="collection-grid">
        {products.map((product) => <article className="collection-card" key={product.id}>
          <div className="collection-product-image">
            <span className="collection-rating"><Star size={13} fill="currentColor" />{product.rating}</span>
            <button className="collection-heart" aria-label={`${favorites.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${favorites.includes(product.id) ? 'from' : 'to'} wishlist`} aria-pressed={favorites.includes(product.id)} onClick={() => favorite(product.id)}><Heart size={23} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button>
            {product.powered && <span className="collection-powered">POWERED</span>}
            <img src={product.image} alt={`${product.color} ${product.shape.toLowerCase()} eyeglasses`} loading="lazy" />
            <div className="collection-image-tools"><button className="collection-similar" onClick={() => { const next = { 'Shape & Style': [product.shape] }; setFilters(next); setDraft(next); setTab('All'); }}><PanelsTopLeft size={15} />View Similar</button><span className="collection-dots" aria-hidden="true">• <span>• •</span></span><div className="collection-swatches">{[product.color, product.color === 'Pink' ? 'Black' : 'Pink'].map((color) => <button key={color} title={color} aria-label={`Select ${color} for ${product.name}`} aria-pressed={(selectedColors[product.id] || product.color) === color} className={(selectedColors[product.id] || product.color) === color ? 'chosen' : ''} style={{ '--swatch': colors[color] }} onClick={() => setSelectedColors((previous) => ({ ...previous, [product.id]: color }))} />)}<span>+2</span></div></div>
          </div>
          <div className="collection-product-info"><h2>{product.name}</h2><span className="collection-size"><b>{product.size}</b>Size</span><span className="collection-selected-color">{selectedColors[product.id] || product.color}</span><p className="collection-price"><strong>₹{money.format(product.price)}</strong> with Free BLU lenses</p><p className="collection-discount"><del>₹{money.format(product.originalPrice)}</del> <span>(25% OFF)</span></p></div>
          <div className="collection-offer"><BadgePercent size={16} fill="currentColor" />Use code SINGLE for this price</div>
        </article>)}
      </div>
      {!products.length && <div className="collection-empty"><Glasses size={40} /><h2>No frames found</h2><p>Try another collection or clear your filters.</p><button onClick={() => { reset(); setTab('All'); }}>Clear filters</button>{query && <Link to="/collection">Clear search</Link>}</div>}
    </div>
    <dialog ref={drawer} className="collection-drawer" aria-labelledby="collection-filter-heading"><div className="collection-drawer-heading"><h2 id="collection-filter-heading">Filter eyeglasses</h2><button aria-label="Close filters" onClick={() => drawer.current.close()}><X size={23} /></button></div>{filterControls}</dialog>
  </section>;
}
