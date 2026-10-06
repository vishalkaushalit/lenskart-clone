export function matchesSearch(values, query) {
  const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const text = normalize(values.filter(value => value != null).join(' '));
  return normalize(query).split(/\s+/).filter(Boolean).every(term => text.includes(term));
}

export function searchDestination(pathname) {
  for (const [path, label] of [['/product', 'products'], ['/users', 'users'], ['/categories', 'categories'], ['/orders', 'orders'], ['/coupons', 'coupons']]) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return { path, label };
  }
  return { path: '/product', label: 'products' };
}
