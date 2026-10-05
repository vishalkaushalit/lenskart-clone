export function checkoutRows(items, cart) {
  return items.map(item => ({ ...item, entry: cart.find(entry => entry.id === item.id) })).filter(item => item.entry);
}
