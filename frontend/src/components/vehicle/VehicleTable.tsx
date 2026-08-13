import { Eye, Pencil, Trash2, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Loader from "../common/Loader";
import VehicleStatusBadge from "./VehicleStatusBadge";

import type{ Vehicle } from "../../types/vehicle.types";

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

const VehicleTable = ({
  vehicles,
  loading = false,
  onDelete,
}: VehicleTableProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12">
        <Loader />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Truck size={52} className="mx-auto text-slate-400" />

        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          No Vehicles Found
        </h2>

        <p className="mt-2 text-slate-500">
          Create your first vehicle to start managing your fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-sm font-semibold text-slate-700">
            <th className="px-6 py-4">Vehicle No.</th>
            <th className="px-6 py-4">Company</th>
            <th className="px-6 py-4">Manufacturer</th>
            <th className="px-6 py-4">Model</th>
            <th className="px-6 py-4">Fuel</th>
            <th className="px-6 py-4">Driver</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle._id}
              className="border-t border-slate-200 hover:bg-slate-50"
            >
              <td className="px-6 py-4 font-semibold">
                {vehicle.vehicleNumber}
              </td>

              <td className="px-6 py-4">
                {typeof vehicle.companyId === "string"
                  ? "-"
                  : vehicle.companyId.companyName}
              </td>

              <td className="px-6 py-4">{vehicle.manufacturer}</td>

              <td className="px-6 py-4">{vehicle.vehicleModel}</td>

              <td className="px-6 py-4 capitalize">{vehicle.fuelType}</td>

              <td className="px-6 py-4">
                {typeof vehicle.assignedDriver === "string" ||
                !vehicle.assignedDriver
                  ? "-"
                  : vehicle.assignedDriver.name}
              </td>

              <td className="px-6 py-4">
                <VehicleStatusBadge status={vehicle.status} />
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-100"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/vehicles/${vehicle._id}/edit`)}
                    className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-100"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(vehicle._id)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
