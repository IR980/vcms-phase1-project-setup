import { Building2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Card from "../../common/Card";

import type{ CreateVehicleDto } from "../../../types/vehicle.types";
import { VEHICLE_STATUS } from "../../../constants/vehicle.constants";

interface CompanyOption {
  _id: string;
  companyName: string;
}

interface DriverOption {
  _id: string;
  name: string;
}

interface Props {
  companies?: CompanyOption[];
  drivers?: DriverOption[];
}

const CompanyAssignmentSection = ({ companies = [], drivers = [] }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateVehicleDto>();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-2">
          <Building2 size={22} className="text-purple-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">Assignment</h2>

          <p className="text-sm text-slate-500">
            Assign the vehicle to a company, driver, and define its current
            status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Company */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company
          </label>

          <select
            {...register("companyId")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Company</option>

            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.companyName}
              </option>
            ))}
          </select>

          {errors.companyId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.companyId.message}
            </p>
          )}
        </div>

        {/* Driver */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Assigned Driver
          </label>

          <select
            {...register("assignedDriver")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Driver</option>

            {drivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name}
              </option>
            ))}
          </select>

          {errors.assignedDriver && (
            <p className="mt-1 text-sm text-red-500">
              {errors.assignedDriver.message}
            </p>
          )}
        </div>

        {/* Vehicle Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Vehicle Status
          </label>

          <select
            {...register("status")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {VEHICLE_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CompanyAssignmentSection;
