export function prefixRoutes(settings = {}, pages = []) {
  const collection=pages.find(row=>row.path==='/collection');
  return [
    { path: '/products/:id', urlPath: `${settings.productPrefix || '/products'}/:id`, redirects: (settings.productPrefixHistory || []).map(prefix => `${prefix}/:id`), redirectOld: true },
    { path: '/products/:id/reviews', urlPath: `${settings.productPrefix || '/products'}/:id/reviews`, redirects: (settings.productPrefixHistory || []).map(prefix => `${prefix}/:id/reviews`), redirectOld: true },
    { path: '/collection', urlPath: settings.collectionPrefix || collection?.urlPath || '/collection', redirects: [...(settings.collectionPrefixHistory || []),...(collection?.redirects || []),...(collection?.urlPath?[collection.urlPath]:[])], redirectOld: true },
  ];
}
export function resolveStorePath(path, routes) {
  for (const row of routes) {
    for (const pattern of [row.path, row.urlPath, ...(row.redirects || [])].filter(Boolean)) {
      const names = [];
      const expression = pattern.split('/').map(part => part.startsWith(':') ? (names.push(part), '([^/]+)') : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/');
      const match = path.match(new RegExp(`^${expression}$`));
      if (match) {
        const fill = value => names.reduce((result, name, index) => result.replace(name, match[index + 1]), value);
        return { row, path: fill(row.path), destination: fill(row.urlPath || row.path) };
      }
    }
  }
  return { path, destination: path };
}
