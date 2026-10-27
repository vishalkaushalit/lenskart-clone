import DashboardDateFilter from '../components/DashboardDateFilter';
import { useSearchParams } from 'react-router-dom';
import NotificationPopup from '../components/NotificationPopup';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const loginNotification = searchParams.get('login') === 'success';
  function dismissLoginNotification() {
    const next = new URLSearchParams(searchParams);
    next.delete('login');
    setSearchParams(next, { replace: true });
  }
  const [recentPage, setRecentPage] = useState(1);
  const [salesDays, setSalesDays] = useState('all');
  const [statusDays, setStatusDays] = useState('all');
  const [recentDays, setRecentDays] = useState('all');
  const [recentStatus, setRecentStatus] = useState('all');
  const days = 'all';
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const data = await apiRequest(
          `/admin/dashboard?days=${days}&salesDays=${salesDays}&statusDays=${statusDays}&recentDays=${recentDays}&recentStatus=${recentStatus}&recentPage=${recentPage}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setResult({ loading: false, data, error: '' });
          const last = Math.max(1, Math.ceil(data.recentPagination.total / 10));
          if (recentPage > last) setRecentPage(last);
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setResult((previous) => ({ ...previous, loading: false, error: error.message }));
      } finally {
        pending = false;
      }
    }
    load();
    const timer = setInterval(load, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [days, salesDays, statusDays, recentDays, recentStatus, attempt, recentPage]);
  function refresh() {
    setResult((previous) => ({ ...previous, loading: true, error: '' }));
    setAttempt((value) => value + 1);
  }
  return (
    <DashboardLayout>
      <main className="admin-page">
        <PageHeader title="Dashboard" description="Overview of your store">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={result.loading}
              onClick={refresh}
              className="admin-button-secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </PageHeader>
        {result.loading && <Loader label="Loading dashboard" />}
        {result.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {result.error}
            {result.data && <p>Showing the last loaded data.</p>}
            <button type="button" onClick={refresh} className="ml-3 underline">
              Try again
            </button>
          </div>
        )}
        {result.data && (
          <>
            <StatDashboard stats={result.data.stats} changes={result.data.changes} />
            <ChartDashboard
              salesFilter={
                <DashboardDateFilter
                  label="Sales overview date range"
                  value={salesDays}
                  onChange={setSalesDays}
                />
              }
              statusFilter={
                <DashboardDateFilter
                  label="Order status date range"
                  value={statusDays}
                  onChange={setStatusDays}
                />
              }
              sales={result.data.sales}
              statuses={result.data.statuses}
            />
            <RecentOrders
              filters={
                <>
                  <DashboardDateFilter
                    label="Recent orders date range"
                    value={recentDays}
                    onChange={(value) => {
                      setRecentDays(value);
                      setRecentPage(1);
                    }}
                  />
                  <select
                    aria-label="Recent orders status"
                    value={recentStatus}
                    onChange={(event) => {
                      setRecentStatus(event.target.value);
                      setRecentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs capitalize text-slate-700"
                  >
                    {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All statuses' : status}
                        </option>
                      ),
                    )}
                  </select>
                </>
              }
              orders={result.data.recentOrders}
              pagination={result.data.recentPagination}
              onPageChange={(page) => {
                setRecentPage(page);
                setResult((previous) => ({ ...previous, loading: true }));
              }}
              loading={result.loading}
            />
          </>
        )}
        {!result.loading && loginNotification && (
          <NotificationPopup
            notification={{ type: 'success', message: 'Logged in successfully.' }}
            duration={3000}
            onClose={dismissLoginNotification}
          />
        )}
      </main>
    </DashboardLayout>
  );
}
