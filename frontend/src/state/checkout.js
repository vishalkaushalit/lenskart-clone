import { resolveVariant } from './productVariants.js';
import { cartKey } from './shopping.js';
export function checkoutRows(items, cart) {
  const byId = new Map(items.map(item => [item.id,item]));
  return cart.filter(entry=>byId.has(entry.id)).map(entry=>({ ...byId.get(entry.id), key:cartKey(entry), product:resolveVariant(byId.get(entry.id).product,entry.options,entry.variantId), entry }));
}
