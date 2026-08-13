import { Eye, Pencil, Trash2, UserRound } from "lucide-react";

import type { Driver } from "../../types/driver.types";

import DriverStatusBadge from "./DriverStatusBadge";

import Button from "../common/Button";
import Card from "../common/Card";

interface DriverTableProps {
  drivers: Driver[];

  loading?: boolean;

  onView: (driver: Driver) => void;

  onEdit: (driver: Driver) => void;

  onDelete: (driver: Driver) => void;
}

const DriverTable = ({
  drivers,
  loading = false,
  onView,
  onEdit,
  onDelete,
}: DriverTableProps) => {
  /**
   * Loading State
   */
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex min-h-62.5 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">Loading drivers...</p>
          </div>
        </div>
      </Card>
    );
  }

  /**
   * Empty State
   */
  if (drivers.length === 0) {
    return (
      <Card className="p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <UserRound size={32} className="text-slate-400" />
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            No drivers found
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            There are no drivers matching the current search or filter criteria.
          </p>
        </div>
      </Card>
    );
  }

  /**
   * License Expiry Helper
   */
  const getLicenseExpiryInfo = (expiryDate: string) => {
    const today = new Date();

    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry.getTime() - today.getTime();

    const daysRemaining = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        label: expiry.toLocaleDateString(),
        className: "text-red-600 font-semibold",
      };
    }

    if (daysRemaining <= 30) {
      return {
        label: expiry.toLocaleDateString(),
        className: "text-amber-600 font-semibold",
      };
    }

    return {
      label: expiry.toLocaleDateString(),
      className: "text-slate-700",
    };
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-300 text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Driver
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                License
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expiry
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vehicle
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {drivers.map((driver) => {
              const expiryInfo = getLicenseExpiryInfo(driver.licenseExpiryDate);

              const companyName =
                typeof driver.companyId === "string"
                  ? driver.companyId
                  : (driver.companyId?.companyName ?? "-");

              const vehicleNumber =
                typeof driver.assignedVehicle === "string"
                  ? driver.assignedVehicle
                  : (driver.assignedVehicle?.vehicleNumber ?? "-");

              const fullName = [driver.firstName, driver.lastName]
                .filter(Boolean)
                .join(" ");

              return (
                <tr key={driver._id} className="transition hover:bg-slate-50">
                  {/* Driver */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {driver.profilePhoto ? (
                        <img
                          src={driver.profilePhoto}
                          alt={fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <UserRound size={19} className="text-blue-600" />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-slate-900">
                          {fullName || "-"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {driver.employeeId
                            ? `ID: ${driver.employeeId}`
                            : "No Employee ID"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {driver.mobileNumber}
                    </p>

                    <p className="text-xs text-slate-500">
                      {driver.email || "-"}
                    </p>
                  </td>

                  {/* License */}
                  <td className="px-5 py-4">
                    <p className="font-medium uppercase text-slate-800">
                      {driver.licenseNumber}
                    </p>

                    <p className="text-xs uppercase text-slate-500">
                      {driver.licenseType}
                    </p>
                  </td>

                  {/* Expiry */}
                  <td className="px-5 py-4">
                    <span className={expiryInfo.className}>
                      {expiryInfo.label}
                    </span>
                  </td>

                  {/* Company */}
                  <td className="px-5 py-4">
                    <p className="max-w-45 truncate text-sm font-medium text-slate-700">
                      {companyName}
                    </p>
                  </td>

                  {/* Vehicle */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {vehicleNumber}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <DriverStatusBadge status={driver.status as any} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => onView(driver)}
                        title="View driver"
                      >
                        <Eye size={17} />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => onEdit(driver)}
                        title="Edit driver"
                      >
                        <Pencil size={17} />
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => onDelete(driver)}
                        title="Delete driver"
                      >
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DriverTable;
