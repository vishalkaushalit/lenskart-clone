// Outer eye corners anchor a front-facing frame; this is a visual preview, not sizing.
export function tryOnPlacement(landmarks, width, height, aspect, scale = 1, offset = 0) {
  const left = landmarks?.[33];
  const right = landmarks?.[263];
  if (!left || !right || ![left.x, left.y, right.x, right.y, width, height, aspect, scale, offset].every(Number.isFinite) || aspect <= 0) return null;
  const dx = (right.x - left.x) * width;
  const dy = (right.y - left.y) * height;
  const span = Math.hypot(dx, dy);
  if (span < 12) return null;
  const frameWidth = span * 1.48 * scale;
  return { x: (left.x + right.x) * width / 2, y: (left.y + right.y) * height / 2 + offset * height, width: frameWidth, height: frameWidth / aspect, angle: Math.atan2(dy, dx) };
}
