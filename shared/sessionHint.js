export const sessionHintKey = 'store-session-present';
export function hasSessionHint() {
  try { return localStorage.getItem(sessionHintKey) === '1'; }
  catch { return true; }
}
export function rememberSession(present) {
  try {
    if (present) localStorage.setItem(sessionHintKey, '1');
    else localStorage.removeItem(sessionHintKey);
  } catch { /* Cookie sessions work when browser storage is unavailable. */ }
}
