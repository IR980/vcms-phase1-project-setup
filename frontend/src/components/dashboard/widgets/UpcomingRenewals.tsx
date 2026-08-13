import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarClock, ChevronRight } from "lucide-react";

interface RenewalItem {
  id: string;
  vehicleNumber: string;
  documentType: "Insurance" | "RC" | "Fitness" | "PUC" | "Permit" | "Road Tax";
  expiryDate: string;
  daysLeft: number;
}

const UpcomingRenewals = () => {
  const navigate = useNavigate();

  /**
   * Temporary Dummy Data
   * Replace with API response.
   */
  const renewals: RenewalItem[] = [
    {
      id: "1",
      vehicleNumber: "UP16AB1234",
      documentType: "Insurance",
      expiryDate: "10 Aug 2026",
      daysLeft: 3,
    },
    {
      id: "2",
      vehicleNumber: "DL01XY7788",
      documentType: "Fitness",
      expiryDate: "08 Aug 2026",
      daysLeft: 1,
    },
    {
      id: "3",
      vehicleNumber: "HR26AA5521",
      documentType: "PUC",
      expiryDate: "07 Aug 2026",
      daysLeft: 0,
    },
    {
      id: "4",
      vehicleNumber: "RJ14CC9988",
      documentType: "Permit",
      expiryDate: "03 Aug 2026",
      daysLeft: -4,
    },
  ];

  const getStatus = (days: number) => {
    if (days < 0)
      return {
        label: "Overdue",
        badge: "bg-red-100 text-red-700",
      };

    if (days === 0)
      return {
        label: "Today",
        badge: "bg-orange-100 text-orange-700",
      };

    if (days <= 7)
      return {
        label: "Due Soon",
        badge: "bg-yellow-100 text-yellow-700",
      };

    return {
      label: "Upcoming",
      badge: "bg-green-100 text-green-700",
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Upcoming Renewals
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Documents requiring attention.
          </p>
        </div>

        <AlertTriangle className="text-yellow-500" />
      </div>

      <div className="space-y-4">
        {renewals.map((item) => {
          const status = getStatus(item.daysLeft);

          return (
            <button
              key={item.id}
              onClick={() => navigate(`/vehicles/${item.id}`)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-500 hover:bg-slate-50"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <CalendarClock size={22} />
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-slate-800">
                    {item.vehicleNumber}
                  </h3>

                  <p className="text-sm text-slate-500">{item.documentType}</p>

                  <p className="mt-1 text-xs text-slate-400">
                    Expires on {item.expiryDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
                  >
                    {status.label}
                  </span>

                  <p className="mt-2 text-xs text-slate-500">
                    {item.daysLeft < 0
                      ? `${Math.abs(item.daysLeft)} day(s) overdue`
                      : `${item.daysLeft} day(s) left`}
                  </p>
                </div>

                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingRenewals;
