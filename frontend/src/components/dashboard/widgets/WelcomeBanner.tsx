import { CalendarDays, Building2, Clock3, Sparkles } from "lucide-react";

import useAuth from "../../../hooks/useAuth";

const WelcomeBanner = () => {
  const { user } = useAuth();

  const currentDate = new Date();

  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = currentDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getGreeting = () => {
    const hour = currentDate.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-lg">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={20} />

            <span className="text-sm font-medium text-blue-100">
              Vehicle Compliance Management System
            </span>
          </div>

          <h1 className="text-3xl font-bold lg:text-4xl">
            {getGreeting()}
            {user?.name ? `, ${user.name}` : ""} 👋
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Welcome back to your fleet dashboard. Manage vehicles, monitor
            compliance, upload documents, and never miss a renewal again.
          </p>
        </div>

        {/* Right */}
        <div className="grid gap-4 sm:grid-cols-2 lg:w-auto">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays size={18} />

              <span className="text-sm font-medium">Today</span>
            </div>

            <p className="text-sm text-blue-100">{formattedDate}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <Clock3 size={18} />

              <span className="text-sm font-medium">Current Time</span>
            </div>

            <p className="text-sm text-blue-100">{currentTime}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <Building2 size={18} />

              <span className="text-sm font-medium">Company</span>
            </div>

            <p className="text-sm text-blue-100">
              {user?.companyId ? "Company Connected" : "Company setup pending"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;
