import PageHeader from "../components/PageHeader";
import DashboardLayout from "../components/DashboardLayout";
import StatDashboard from "../components/StatDashboard";
import ChartDashboard from "../components/ChartDashboard";
import RecentOrders from "../components/RecentOrders";

const Dashboard = () => {
  return (
    <DashboardLayout>
        <main className="admin-page">
          {/* Title */}
          <PageHeader title="Dashboard" description="Overview of your store">
            <button className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:px-4">
              📅 Last 7 days ▾
            </button>
          </PageHeader>
          <StatDashboard />
          <ChartDashboard />
          <RecentOrders />
        </main>
    </DashboardLayout>
  );
};

export default Dashboard;
