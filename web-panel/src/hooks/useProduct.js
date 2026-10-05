import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
export default function useProduct(id) {
  const [result, setResult] = useState({ loading: true, product: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setResult({ loading:true, product:null, error:'' });
      try {
        const data = await apiRequest(`/admin/products/${id}`, { signal:controller.signal });
        if (!controller.signal.aborted) setResult({loading:false,product:data.product,error:''});
      } catch(error) { if (!controller.signal.aborted) setResult({loading:false,product:null,error:error.message}); }
    }
    load(); return () => controller.abort();
  }, [id, attempt]);
  return {...result, retry:()=>setAttempt((n)=>n+1)};
}
