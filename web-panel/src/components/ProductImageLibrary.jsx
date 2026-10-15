import { useState } from 'react';

const assets = import.meta.glob('../../../frontend/src/assets/images/{eyeglasses,sunglasses}/*.webp', { eager: true, query: '?url', import: 'default' });
const groups = ['eyeglasses', 'sunglasses'];

export default function ProductImageLibrary({ choose, busy, count }) {
  const [group, setGroup] = useState('eyeglasses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function select(path, url) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Unable to load this image. Please try again.');
      const blob = await response.blob();
      choose([new File([blob], `${group}-${path.split('/').pop()}`, { type: 'image/webp' })]);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }
  return <section className="product-panel mt-4">
    <h2 className="product-panel-title">Choose from image library</h2>
    <label className="product-label">Image category
      <select className="product-field" value={group} disabled={busy || loading} onChange={event => setGroup(event.target.value)}>
        {groups.map(value => <option key={value} value={value}>{value === 'eyeglasses' ? 'Eyeglasses' : 'Sunglasses'}</option>)}
      </select>
    </label>
    <div className="product-library-grid">
      {Object.entries(assets).filter(([path]) => path.includes(`/${group}/`)).map(([path, url]) => {
        const name = path.split('/').pop().replace('.webp', '').replace('cateye', 'cat eye');
        return <button key={path} type="button" className="product-library-tile" disabled={busy || loading || count >= 8} onClick={() => select(path, url)} aria-label={`Add ${group} ${name} image`}>
          <img src={url} alt={`${group} ${name}`} loading="lazy" />
          <span className="text-xs capitalize">{name}</span>
        </button>;
      })}
    </div>
    <p className="mt-3 text-xs text-slate-500" role="status">{loading ? 'Adding image…' : 'Select an image to add it to the gallery. Images upload when you save the product.'}</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
  </section>;
}
