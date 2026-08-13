import { useNavigate } from "react-router-dom";
import {
  Car,
  FileText,
  Bell,
  ScanSearch,
  UserPlus,
  ChevronRight,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
  link: string;
}

const RecentActivities = () => {
  const navigate = useNavigate();

  /**
   * Temporary Dummy Data
   * Replace with API later
   */
  const activities: Activity[] = [
    {
      id: "1",
      title: "Vehicle Added",
      description: "UP16AB1234 was added to the fleet.",
      time: "5 min ago",
      icon: Car,
      color: "bg-blue-100 text-blue-600",
      link: "/vehicles/1",
    },
    {
      id: "2",
      title: "Document Uploaded",
      description: "Insurance document uploaded.",
      time: "30 min ago",
      icon: FileText,
      color: "bg-green-100 text-green-600",
      link: "/documents",
    },
    {
      id: "3",
      title: "AI OCR Completed",
      description: "Vehicle document scanned successfully.",
      time: "1 hour ago",
      icon: ScanSearch,
      color: "bg-purple-100 text-purple-600",
      link: "/ocr",
    },
    {
      id: "4",
      title: "Reminder Sent",
      description: "Insurance expiry reminder sent.",
      time: "Yesterday",
      icon: Bell,
      color: "bg-yellow-100 text-yellow-700",
      link: "/reminders",
    },
    {
      id: "5",
      title: "Driver Assigned",
      description: "Driver assigned to UP16AB1234.",
      time: "2 days ago",
      icon: UserPlus,
      color: "bg-pink-100 text-pink-600",
      link: "/drivers",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Recent Activities
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest actions across your fleet.
          </p>
        </div>

        <button
          onClick={() => navigate("/activities")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-6 top-12 h-full w-px bg-slate-200" />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${activity.color}`}
                >
                  <Icon size={20} />
                </div>

                {/* Content */}
                <button
                  onClick={() => navigate(activity.link)}
                  className="flex flex-1 items-start justify-between rounded-xl p-2 text-left transition hover:bg-slate-50"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {activity.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {activity.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {activity.time}
                    </p>
                  </div>

                  <ChevronRight size={18} className="mt-1 text-slate-400" />
                </button>
              </div>
            );
          })}
        </div>

        {activities.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            No recent activities found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
