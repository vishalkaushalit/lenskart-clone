export function pageNoindex(override, fallback = false) {
  return typeof override === 'boolean' ? override : Boolean(fallback);
}
export function sitemapPages(pages, overrides = []) {
  const byPath = new Map(overrides.map(row => [row.path, row]));
  return pages.filter(page => !pageNoindex(byPath.get(page.path)?.noindex, page.noindex)).map(page=>({...page,path:byPath.get(page.path)?.urlPath || page.path}));
}
