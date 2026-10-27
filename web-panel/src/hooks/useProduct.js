import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
export default function useProduct(id) {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState({ loading: true, product: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setResult({ loading: true, product: null, error: '' });
      try {
        const data = await apiRequest(`/admin/products/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted)
          setResult({ loading: false, product: data.product, error: '', requestId: id });
      } catch (error) {
        if (!controller.signal.aborted)
          setResult({ loading: false, product: null, error: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, [id, attempt]);
  useEffect(() => {
    if (result.requestId === id && result.product?.slug && id !== result.product.slug) {
      const prefix = `/product/${id}`;
      if (location.pathname === prefix || location.pathname.startsWith(`${prefix}/`))
        navigate(
          {
            pathname: `/product/${result.product.slug}${location.pathname.slice(prefix.length)}`,
            search: location.search,
            hash: location.hash,
          },
          { replace: true },
        );
    }
  }, [
    result.product,
    result.requestId,
    id,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);
  return { ...result, retry: () => setAttempt((n) => n + 1) };
}
