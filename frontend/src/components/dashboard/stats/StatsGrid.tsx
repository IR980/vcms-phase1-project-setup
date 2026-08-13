import { Truck, FileWarning, Users, ShieldCheck } from "lucide-react";

import StatsCard from "./StatsCard";

const StatsGrid = () => {
  /**
   * Dummy data
   * Replace with API later.
   */

  const stats = [
    {
      title: "Total Vehicles",
      value: 126,
      icon: Truck,
      color: "blue" as const,
      trend: 8,
      trendLabel: "vs last month",
    },

    {
      title: "Expiring Documents",
      value: 18,
      icon: FileWarning,
      color: "red" as const,
      trend: -4,
      trendLabel: "vs last week",
    },

    {
      title: "Drivers",
      value: 82,
      icon: Users,
      color: "green" as const,
      trend: 12,
      trendLabel: "new drivers",
    },

    {
      title: "Compliance",
      value: "94%",
      icon: ShieldCheck,
      color: "purple" as const,
      trend: 5,
      trendLabel: "improved",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatsCard key={item.title} {...item} />
      ))}
    </div>
  );
};

export default StatsGrid;
