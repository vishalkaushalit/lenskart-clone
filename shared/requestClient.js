// Share pending reads, without caching responses or deduplicating writes.
export function createRequestClient(baseUrl, fetchRequest = (...args) => fetch(...args)) {
  const pending = new Map();
  return function request(path, options = {}) {
    const { signal, ...settings } = options;
    if (signal?.aborted) return Promise.reject(signal.reason || new DOMException('Aborted', 'AbortError'));
    const method = (settings.method || 'GET').toUpperCase();
    const headers = new Headers(settings.headers);
    const config = { ...settings, method, credentials: 'include', headers };
    const share = method === 'GET' && settings.body == null;
    const key = JSON.stringify([path, { ...config, headers: [...headers.entries()] }]);
    // A read started after a mutation must not join an older read.
    if (!['GET', 'HEAD'].includes(method)) pending.clear();
    let entry = share ? pending.get(key) : null;
    if (!entry) {
      const controller = new AbortController();
      entry = { controller, subscribers: 0, settled: false };
      const current = entry;
      current.promise = Promise.resolve().then(async () => {
        if (controller.signal.aborted) throw controller.signal.reason;
        const response = await fetchRequest(`${baseUrl}${path}`, { ...config, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          const error = new Error(data.message || 'Request failed.');
          error.status = response.status;
          throw error;
        }
        return data;
      }).finally(() => {
        current.settled = true;
        if (pending.get(key) === current) pending.delete(key);
      });
      if (share) pending.set(key, current);
    }
    const current = entry;
    current.subscribers++;
    return new Promise((resolve, reject) => {
      let finished = false;
      function detach() {
        if (finished) return false;
        finished = true;
        signal?.removeEventListener('abort', abort);
        current.subscribers--;
        // Strict Mode's immediate remount can subscribe before abandonment.
        queueMicrotask(() => {
          if (!current.settled && current.subscribers === 0) {
            if (pending.get(key) === current) pending.delete(key);
            current.controller.abort();
          }
        });
        return true;
      }
      function abort() {
        if (detach()) reject(signal.reason || new DOMException('Aborted', 'AbortError'));
      }
      signal?.addEventListener('abort', abort, { once: true });
      current.promise.then(
        data => { if (detach()) resolve(data); },
        error => { if (detach()) reject(error); },
      );
    });
  };
}
