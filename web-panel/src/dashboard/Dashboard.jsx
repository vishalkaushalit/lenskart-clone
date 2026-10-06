import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardLayout from '../components/DashboardLayout';
import StatDashboard from '../components/StatDashboard';
import ChartDashboard from '../components/ChartDashboard';
import RecentOrders from '../components/RecentOrders';
import Loader from '../components/Loader';
import { apiRequest } from '../api';

export default function Dashboard() {
  const [recentPage,setRecentPage]=useState(1);
  const [days, setDays] = useState('7');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const data = await apiRequest(`/admin/dashboard?days=${days}&recentPage=${recentPage}`, { signal: controller.signal });
        if (!controller.signal.aborted) {setResult({ loading: false, data, error: '' });const last=Math.max(1,Math.ceil(data.recentPagination.total/5));if(recentPage>last)setRecentPage(last);}
      } catch (error) {
        if (!controller.signal.aborted) setResult(previous => ({ ...previous, loading: false, error: error.message }));
      } finally { pending = false; }
    }
    load();
    const timer = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [days, attempt, recentPage]);
  function refresh() { setResult(previous => ({ ...previous, loading: true, error: '' })); setAttempt(value => value + 1); }
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Dashboard" description="Overview of your store"><div className="flex flex-wrap gap-2">
      <select aria-label="Dashboard date range" value={days} onChange={event => { setDays(event.target.value);setRecentPage(1); setResult({ loading: true, data: null, error: '' }); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{['7', '30', '90'].map(value => <option key={value} value={value}>Last {value} days</option>)}</select>
      <button type="button" disabled={result.loading} onClick={refresh} className="admin-button-secondary"><RefreshCw size={16} />Refresh</button>
    </div></PageHeader>
    {result.loading && <Loader label="Loading dashboard" />}
    {result.error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}{result.data && <p>Showing the last loaded data.</p>}<button type="button" onClick={refresh} className="ml-3 underline">Try again</button></div>}
    {result.data && <><StatDashboard stats={result.data.stats} changes={result.data.changes} /><ChartDashboard sales={result.data.sales} statuses={result.data.statuses} /><RecentOrders orders={result.data.recentOrders} pagination={result.data.recentPagination} onPageChange={page=>{setRecentPage(page);setResult(previous=>({...previous,loading:true}));}} loading={result.loading} /></>}
  </main></DashboardLayout>;
}
