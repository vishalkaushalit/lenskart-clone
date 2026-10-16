export function stickyColumnTop(headerHeight, viewportHeight, columnHeight, gap = 16) {
  return Math.min(headerHeight + gap, viewportHeight - columnHeight - gap);
}
