import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function ProductSearch({ className, placeholder, iconSize = 20 }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get('search') || '';
  function submit(event) {
    event.preventDefault();
    const value = event.currentTarget.elements.search.value.trim();
    navigate(value ? `/collection?${new URLSearchParams({ search: value })}` : '/collection');
  }
  return <form role="search" className={className} onSubmit={submit}>
    <button type="submit" aria-label="Search products" className="shrink-0 cursor-pointer text-ink"><Search size={iconSize} /></button>
    <input key={query} name="search" defaultValue={query} type="search" aria-label="Search products" placeholder={placeholder} className="min-w-0 w-full bg-transparent text-[14px] outline-none placeholder:text-[#73739d]" />
  </form>;
}
