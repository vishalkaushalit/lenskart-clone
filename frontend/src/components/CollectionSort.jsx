import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

const options = [
  ['recommended', 'Recommended (Default)', 'Recommended'],
  ['bestsellers', 'Bestsellers', 'Bestsellers'],
  ['newest', 'New Arrivals', 'New Arrivals'],
  ['price-low', 'Price: Low To High', 'Price: Low To High'],
  ['price-high', 'Price: High To Low', 'Price: High To Low'],
];

export default function CollectionSort({ value, onChange }) {
  const [position, setPosition] = useState(null);
  const button = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const selected = options.find(([key]) => key === value) || options[0];

  useEffect(() => {
    if (!position) return;
    menu.current?.querySelector('[aria-checked="true"]')?.focus();
    function outside(event) {
      if (!button.current?.contains(event.target) && !menu.current?.contains(event.target)) setPosition(null);
    }
    function close(event) {
      if (event?.target && menu.current?.contains(event.target)) return;
      setPosition(null);
    }
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [position]);

  function open() {
    if (position) { setPosition(null); return; }
    const rect = button.current.getBoundingClientRect();
    const width = Math.min(230, window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom - 16;
    setPosition({ left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)), width, ...(below < 190 ? { bottom: window.innerHeight - rect.top + 8, maxHeight: Math.max(120, rect.top - 20) } : { top: rect.bottom + 8, maxHeight: below }) });
  }
  function keyboard(event) {
    const items = [...menu.current.querySelectorAll('button')];
    const current = items.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); setPosition(null); button.current.focus(); }
    if (event.key === 'Tab') setPosition(null);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[index].focus();
    }
  }
  return <div className="collection-sort"><span><ArrowDownUp size={19} />Sort By</span>
    <button ref={button} type="button" className={`collection-sort-trigger ${position ? 'open' : ''}`} aria-label={`Sort by: ${selected[2]}`} aria-haspopup="menu" aria-expanded={Boolean(position)} aria-controls={position ? id : undefined} onClick={open} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); open(); } }}><span>{selected[2]}</span><ChevronDown size={18} /></button>
    {position && createPortal(<div ref={menu} id={id} role="menu" aria-label="Sort collection" className="collection-sort-menu" style={position} onKeyDown={keyboard}>{options.map(([key, label]) => <button type="button" role="menuitemradio" aria-checked={value === key} key={key} onClick={() => { onChange(key); setPosition(null); button.current.focus(); }}>{label}</button>)}</div>, document.body)}
  </div>;
}
