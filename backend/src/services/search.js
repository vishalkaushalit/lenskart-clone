export function searchTerms(value = '') {
  if (typeof value !== 'string' || value.length > 100) throw Object.assign(new Error('Search must contain at most 100 characters.'), { status: 400 });
  return value.trim().split(/\s+/).filter(Boolean).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

export function textSearch(terms, fields) {
  return terms.length ? { $and: terms.map(term => ({ $or: fields.map(field => ({ [field]: { $regex: term, $options: 'i' } })) })) } : {};
}
