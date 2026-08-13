import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Truck } from "lucide-react";

interface Vehicle {
  id: string;

  vehicleNumber: string;

  company: string;

  driver: string;

  status: "Active" | "Inactive" | "Maintenance";

  updatedAt: string;
}

const RecentVehicles = () => {
  const navigate = useNavigate();

  /**
   * Dummy Data
   * Replace with API later
   */
  const vehicles: Vehicle[] = [
    {
      id: "1",
      vehicleNumber: "UP16AB1234",
      company: "ABC Logistics",
      driver: "Ramesh Kumar",
      status: "Active",
      updatedAt: "Today",
    },
    {
      id: "2",
      vehicleNumber: "DL01XY7788",
      company: "XYZ Transport",
      driver: "Suresh Singh",
      status: "Maintenance",
      updatedAt: "Yesterday",
    },
    {
      id: "3",
      vehicleNumber: "HR26AA5521",
      company: "Fleet India",
      driver: "Mohit Sharma",
      status: "Inactive",
      updatedAt: "2 Days Ago",
    },
  ];

  const statusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";

      case "Maintenance":
        return "bg-yellow-100 text-yellow-700";

      case "Inactive":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Recent Vehicles
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest registered vehicles
          </p>
        </div>

        <button
          onClick={() => navigate("/vehicles")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vehicle
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Company
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Driver
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Updated
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                      <Truck size={18} />
                    </div>

                    <span className="font-medium text-slate-800">
                      {vehicle.vehicleNumber}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-slate-600">{vehicle.company}</td>

                <td className="px-6 py-4 text-slate-600">{vehicle.driver}</td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                      vehicle.status,
                    )}`}
                  >
                    {vehicle.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {vehicle.updatedAt}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                      className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Example */}
      {vehicles.length === 0 && (
        <div className="p-10 text-center text-slate-500">
          No vehicles found.
        </div>
      )}
    </div>
  );
};

export default RecentVehicles;
