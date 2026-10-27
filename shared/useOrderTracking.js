import { useCallback, useEffect, useState } from 'react';

// Share polling behavior while each application supplies its authenticated client.
export function useOrderTracking(id, request, basePath) {
  const [result, setResult] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    let terminal = false;
    let timer;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      setRefreshing(true);
      try {
        const { order } = await request(`${basePath}/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          terminal = ['delivered', 'cancelled'].includes(order.status);
          if (terminal) clearInterval(timer);
          setResult({ id, order, checkedAt: new Date(), loading: false });
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setResult((previous) =>
            previous.id === id && previous.order
              ? { ...previous, error: error.message }
              : { id, loading: false, error: error.message },
          );
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    }
    load();
    timer = setInterval(() => {
      if (!document.hidden && !terminal) load();
    }, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [id, request, basePath, attempt]);
  return { result, refreshing, refresh };
}
