// User-provided Total Frame Front Width chart. Midpoints represent closed
// ranges; XL uses its lower bound because the chart has no maximum.
const sizes = {
  S: { min: 120, max: 129, width: 124.5, label: '120–129 mm' },
  M: { min: 130, max: 137, width: 133.5, label: '130–137 mm' },
  L: { min: 138, max: 145, width: 141.5, label: '138–145 mm' },
  XL: { min: 146, max: Infinity, width: 146, label: '146 mm and above' },
};
export function frameSizing(size) {
  const entry = sizes[size];
  return entry ? { ...entry, factor: entry.width / sizes.M.width, size } : { factor: 1, label: '', size: size || '' };
}

export function compareFrameFit(size, savedWidth) {
  const entry = sizes[size];
  if (!entry || !Number.isFinite(savedWidth) || savedWidth <= 0) return null;
  // Size charts round to whole mm; half-mm boundaries avoid gaps.
  if (savedWidth < entry.min - 0.5) return 'Not fit · wider than your reference';
  if (savedWidth > entry.max + 0.5) return 'Not fit · narrower than your reference';
  return 'Estimated fit';
}

export function formatFrameSize(size) {
  if (!size) return 'Not specified';
  const label = frameSizing(size).label;
  return label ? `${size} (${label})` : size;
}
