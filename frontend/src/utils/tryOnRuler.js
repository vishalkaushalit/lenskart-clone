// A chart-based visual ruler, not a calibrated camera measurement.
export function drawTryOnRuler(context, placement, millimetres, mirrored = true, forehead = null) {
  if (!Number.isFinite(millimetres) || millimetres <= 0) return;
  const width = placement.width;
  const foreheadY =
    forehead && Number.isFinite(forehead.x) && Number.isFinite(forehead.y)
      ? -(forehead.x - placement.x) * Math.sin(placement.angle) +
        (forehead.y - placement.y) * Math.cos(placement.angle)
      : -placement.height * 0.9;
  const y = Math.max(-placement.y + 40, foreheadY - 18);
  context.save();
  context.strokeStyle = '#ffffff';
  context.fillStyle = '#ffffff';
  context.lineWidth = 2;
  context.shadowColor = 'rgba(0,0,0,0.85)';
  context.shadowBlur = 4;
  context.beginPath();
  context.moveTo(-width / 2, y);
  context.lineTo(width / 2, y);
  for (let mm = 0; mm <= millimetres; mm += 10) {
    const x = -width / 2 + (width * mm) / millimetres;
    context.moveTo(x, y);
    context.lineTo(x, y + (mm % 50 === 0 ? 12 : 7));
  }
  context.moveTo(width / 2, y);
  context.lineTo(width / 2, y + 12);
  context.stroke();
  // The video is mirrored; counter-mirror text so labels remain readable.
  context.save();
  context.translate(0, y - 10);
  if (mirrored) context.scale(-1, 1);
  context.font = '600 12px sans-serif';
  context.textAlign = 'center';
  context.fillText(`Estimated frame width · ${millimetres.toFixed(1)} mm`, 0, 0);
  context.restore();
  context.restore();
}
