export const savedTryOnKey = 'lenskart.savedTryOn.v1';
export function readSavedTryOn(storage) {
  try {
    const value = JSON.parse(storage.getItem(savedTryOnKey));
    if (!value || typeof value.name !== 'string' || typeof value.snapshot !== 'string' || !value.snapshot.startsWith('data:image/jpeg;base64,') || value.snapshot.length > 1500000 || !Number.isFinite(value.widthMm) || value.widthMm <= 0 || !Number.isFinite(value.scale) || value.scale < 0.75 || value.scale > 1 || typeof value.date !== 'string') return null;
    return value;
  } catch { return null; }
}
export function saveTryOn(storage, value) {
  storage.setItem(savedTryOnKey, JSON.stringify(value));
}
