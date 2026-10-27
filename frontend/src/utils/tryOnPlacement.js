// Eye corners anchor placement; face side landmarks determine frame width.
export function tryOnPlacement(
  landmarks,
  width,
  height,
  aspect,
  scale = 1,
  offset = 0,
  depthAware = false,
) {
  const left = landmarks?.[33];
  const right = landmarks?.[263];
  if (
    !left ||
    !right ||
    ![left.x, left.y, right.x, right.y, width, height, aspect, scale, offset].every(
      Number.isFinite,
    ) ||
    aspect <= 0
  )
    return null;
  const dx = (right.x - left.x) * width;
  const dy = (right.y - left.y) * height;
  const span = Math.hypot(dx, dy);
  if (span < 12) return null;
  // GLB rotation already foreshortens the model. Size it from the full
  // tracked eye span so turning does not also shrink its underlying scale.
  const depth =
    depthAware && Number.isFinite(left.z) && Number.isFinite(right.z)
      ? (right.z - left.z) * width
      : 0;
  const trackedSpan = Math.hypot(span, depth);
  const sideLeft = landmarks?.[234];
  const sideRight = landmarks?.[454];
  let baseWidth = trackedSpan * 1.48;
  if (
    sideLeft &&
    sideRight &&
    [sideLeft.x, sideLeft.y, sideRight.x, sideRight.y].every(Number.isFinite)
  ) {
    const faceDepth =
      depthAware && Number.isFinite(sideLeft.z) && Number.isFinite(sideRight.z)
        ? (sideRight.z - sideLeft.z) * width
        : 0;
    const faceSpan = Math.hypot(
      (sideRight.x - sideLeft.x) * width,
      (sideRight.y - sideLeft.y) * height,
      faceDepth,
    );
    // Ignore unreliable outlines rather than allowing sudden oversized frames.
    if (faceSpan >= trackedSpan * 1.05 && faceSpan <= trackedSpan * 2.4)
      baseWidth = faceSpan * 1.04;
  }
  const frameWidth = baseWidth * scale;
  return {
    x: ((left.x + right.x) * width) / 2,
    y: ((left.y + right.y) * height) / 2 + offset * height,
    width: frameWidth,
    height: frameWidth / aspect,
    angle: Math.atan2(dy, dx),
  };
}
