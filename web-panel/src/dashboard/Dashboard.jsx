import DashboardLayout from "../components/DashboardLayout";
import StatDashboard from "../components/StatDashboard";
import ChartDashboard from "../components/ChartDashboard";
import RecentOrders from "../components/RecentOrders";

const Dashboard = () => {
  return (
    <DashboardLayout>
        <main className="flex-1 space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
          {/* Title */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500">Overview of your store</p>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:px-4">
              📅 Last 7 days ▾
            </button>
          </div>
          <StatDashboard />
          <ChartDashboard />
          <RecentOrders />
        </main>
    </DashboardLayout>
  );
};

export default Dashboard;
