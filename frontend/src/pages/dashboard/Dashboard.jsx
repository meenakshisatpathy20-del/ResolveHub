import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardStats from "../../components/dashboard/DashboardStats";
import RecentDisputes from "../../components/dashboard/RecentDisputes";
import QuickActions from "../../components/dashboard/QuickActions";
import NotificationPanel from "../../components/dashboard/NotificationPanel";

function Dashboard() {
  return (
    <div className="space-y-6">

      <DashboardHeader />

      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">

          <RecentDisputes />

        </div>

        <NotificationPanel />

      </div>

      <QuickActions />

    </div>
  );
}

export default Dashboard;