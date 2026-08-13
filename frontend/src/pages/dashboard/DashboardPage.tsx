import WelcomeBanner from "../../components/dashboard/widgets/WelcomeBanner";
import StatsGrid from "../../components/dashboard/stats/StatsGrid";

import QuickActions from "../../components/dashboard/widgets/QuickActions";
import UpcomingRenewals from "../../components/dashboard/widgets/UpcomingRenewals";
import RecentVehicles from "../../components/dashboard/widgets/RecentVehicles";
import RecentActivities from "../../components/dashboard/widgets/RecentActivities";

import VehicleStatusChart from "../../components/dashboard/charts/VehicleStatusChart";
import ComplianceChart from "../../components/dashboard/charts/ComplianceChart";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* KPI Statistics */}
      <StatsGrid />

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <VehicleStatusChart />

        <ComplianceChart />
      </div>

      {/* Quick Actions + Upcoming Renewals */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions />

        <div className="lg:col-span-2">
          <UpcomingRenewals />
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentVehicles />

        <RecentActivities />
      </div>
    </div>
  );
};

export default DashboardPage;
