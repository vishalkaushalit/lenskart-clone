import { useEffect } from 'react';
import { stickyColumnTop } from '../utils/stickyColumns';

export default function useStickyColumns(firstRef, secondRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const columns = [firstRef.current, secondRef.current].filter(Boolean);
    if (!columns.length) return;
    const header = document.querySelector('header');
    function update() {
      const headerHeight = header?.getBoundingClientRect().height || 0;
      for (const column of columns) {
        column.style.setProperty('--column-sticky-top', `${stickyColumnTop(headerHeight, window.innerHeight, column.getBoundingClientRect().height)}px`);
      }
    }
    update();
    const observer = new ResizeObserver(update);
    columns.forEach(column => observer.observe(column));
    if (header) observer.observe(header);
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [firstRef, secondRef, enabled]);
}
