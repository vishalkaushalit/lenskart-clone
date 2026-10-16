const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
export function tryOnPose(landmarks, aspect = 4 / 3) {
  const left = landmarks?.[33]; const right = landmarks?.[263];
  if (!left || !right) return { yaw: 0, pitch: 0 };
  const span = Math.hypot(right.x - left.x, (right.y - left.y) / aspect);
  const yaw = span > 0 && Number.isFinite(left.z) && Number.isFinite(right.z)
    ? clamp(Math.atan2(right.z - left.z, span), 1.1) : 0;
  const top = landmarks?.[10]; const bottom = landmarks?.[152];
  const vertical = top && bottom ? (bottom.y - top.y) / aspect : 0;
  const pitch = vertical > 0 && Number.isFinite(top.z) && Number.isFinite(bottom.z)
    ? clamp(Math.atan2(bottom.z - top.z, vertical), 0.65) : 0;
  return { yaw, pitch };
}
