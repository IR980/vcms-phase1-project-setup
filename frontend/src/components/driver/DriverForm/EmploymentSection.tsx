// import {
//   CalendarDays,
//   Building2,
//   Truck,
//   BriefcaseBusiness,
//   Activity,
// } from "lucide-react";

// import Card from "../../common/Card";

// import { DRIVER_STATUS_OPTIONS } from "../../../constants/driver.constants";
// import type {
//   DriverFormData,
//   DriverFormErrors,
//   DriverFormChangeHandler,
// } from "./driver-form.types";

// interface EmploymentSectionProps {
//   formData: DriverFormData;

//   errors: DriverFormErrors;

//   onChange: DriverFormChangeHandler;
// }

// const EmploymentSection = ({
//   formData,
//   errors,
//   onChange,
// }: EmploymentSectionProps) => {
//   return (
//     <Card className="p-6">
//       {/* Section Header */}
//       <div className="mb-6 flex items-center gap-3">
//         <div className="rounded-lg bg-violet-100 p-2.5">
//           <BriefcaseBusiness size={20} className="text-violet-600" />
//         </div>

//         <div>
//           <h2 className="text-lg font-semibold text-slate-900">
//             Employment & Assignment
//           </h2>

//           <p className="text-sm text-slate-500">
//             Configure the driver's employment, company, vehicle assignment, and
//             status.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//         {/* Company ID */}
//         <div>
//           <label
//             htmlFor="employmentCompanyId"
//             className="mb-2 block text-sm font-medium text-slate-700"
//           >
//             Company
//             <span className="ml-1 text-red-500">*</span>
//           </label>

//           <div className="relative">
//             <Building2
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               id="employmentCompanyId"
//               type="text"
//               value={formData.companyId}
//               onChange={(event) => onChange("companyId", event.target.value)}
//               placeholder="Enter company ID"
//               className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
//                 errors.companyId
//                   ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//                   : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
//               }`}
//             />
//           </div>

//           {errors.companyId && (
//             <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>
//           )}

//           <p className="mt-1 text-xs text-slate-400">
//             Company selection will be connected to the Company API when the
//             assignment dropdown is added.
//           </p>
//         </div>

//         {/* Joining Date */}
//         <div>
//           <label
//             htmlFor="joiningDate"
//             className="mb-2 block text-sm font-medium text-slate-700"
//           >
//             Joining Date
//           </label>

//           <div className="relative">
//             <CalendarDays
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               id="joiningDate"
//               type="date"
//               value={formData.joiningDate}
//               onChange={(event) => onChange("joiningDate", event.target.value)}
//               className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
//                 errors.joiningDate
//                   ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//                   : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
//               }`}
//             />
//           </div>

//           {errors.joiningDate && (
//             <p className="mt-1 text-xs text-red-600">{errors.joiningDate}</p>
//           )}
//         </div>

//         {/* Department */}
//         <div>
//           <label
//             htmlFor="department"
//             className="mb-2 block text-sm font-medium text-slate-700"
//           >
//             Department
//           </label>

//           <div className="relative">
//             <BriefcaseBusiness
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               id="department"
//               type="text"
//               value={formData.department}
//               onChange={(event) => onChange("department", event.target.value)}
//               placeholder="e.g. Transport Operations"
//               maxLength={100}
//               className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
//                 errors.department
//                   ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//                   : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
//               }`}
//             />
//           </div>

//           {errors.department && (
//             <p className="mt-1 text-xs text-red-600">{errors.department}</p>
//           )}
//         </div>

//         {/* Driver Status */}
//         <div>
//           <label
//             htmlFor="status"
//             className="mb-2 block text-sm font-medium text-slate-700"
//           >
//             Driver Status
//             <span className="ml-1 text-red-500">*</span>
//           </label>

//           <div className="relative">
//             <Activity
//               size={18}
//               className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <select
//               id="status"
//               value={formData.status}
//               onChange={(event) => onChange("status", event.target.value)}
//               className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
//                 errors.status
//                   ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//                   : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
//               }`}
//             >
//               <option value="">Select status</option>

//               {DRIVER_STATUS_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {errors.status && (
//             <p className="mt-1 text-xs text-red-600">{errors.status}</p>
//           )}
//         </div>

//         {/* Assigned Vehicle */}
//         <div className="md:col-span-2">
//           <label
//             htmlFor="assignedVehicle"
//             className="mb-2 block text-sm font-medium text-slate-700"
//           >
//             Assigned Vehicle
//           </label>

//           <div className="relative">
//             <Truck
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               id="assignedVehicle"
//               type="text"
//               value={formData.assignedVehicle}
//               onChange={(event) =>
//                 onChange("assignedVehicle", event.target.value)
//               }
//               placeholder="Enter vehicle ID"
//               className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
//                 errors.assignedVehicle
//                   ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//                   : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
//               }`}
//             />
//           </div>

//           {errors.assignedVehicle && (
//             <p className="mt-1 text-xs text-red-600">
//               {errors.assignedVehicle}
//             </p>
//           )}

//           <p className="mt-1 text-xs text-slate-400">
//             Leave empty if no vehicle is currently assigned.
//           </p>
//         </div>
//       </div>
//     </Card>
//   );
// };

// export default EmploymentSection;

import {
  CalendarDays,
  Building2,
  Truck,
  BriefcaseBusiness,
  Activity,
} from "lucide-react";

import Card from "../../common/Card";

import { DRIVER_STATUS_OPTIONS } from "../../../constants/driver.constants";

import type {
  DriverFormData,
  DriverFormErrors,
  DriverFormChangeHandler,
} from "./driver-form.types";

/**
 * ============================================================
 * Select Option Types
 * ============================================================
 */

export interface CompanyOption {
  _id: string;
  companyName: string;
  legalName?: string;
}

export interface VehicleOption {
  _id: string;
  vehicleNumber: string;
  vehicleName?: string;
  manufacturer?: string;
  vehicleModel?: string;
}

/**
 * ============================================================
 * Props
 * ============================================================
 */

interface EmploymentSectionProps {
  formData: DriverFormData;

  errors: DriverFormErrors;

  onChange: DriverFormChangeHandler;

  companies?: CompanyOption[];

  vehicles?: VehicleOption[];

  companiesLoading?: boolean;

  vehiclesLoading?: boolean;
}

/**
 * ============================================================
 * Component
 * ============================================================
 */

const EmploymentSection = ({
  formData,
  errors,
  onChange,
  companies = [],
  vehicles = [],
  companiesLoading = false,
  vehiclesLoading = false,
}: EmploymentSectionProps) => {
  /**
   * Filter vehicles according to the selected
   * company when your Vehicle API later
   * provides companyId.
   *
   * For now the complete vehicle list is used.
   */
  const availableVehicles = vehicles;

  return (
    <Card className="p-6">
      {/* ======================================================
          Section Header
          ====================================================== */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-violet-100 p-2.5">
          <BriefcaseBusiness size={20} className="text-violet-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Employment & Assignment
          </h2>

          <p className="text-sm text-slate-500">
            Configure the driver's employment, company, vehicle assignment, and
            status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* ====================================================
            Company
            ==================================================== */}
        <div>
          <label
            htmlFor="companyId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Company
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="companyId"
              value={formData.companyId}
              onChange={(event) => onChange("companyId", event.target.value)}
              disabled={companiesLoading}
              className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.companyId
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              } ${companiesLoading ? "cursor-not-allowed bg-slate-50" : ""}`}
            >
              <option value="">
                {companiesLoading ? "Loading companies..." : "Select company"}
              </option>

              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName}
                  {company.legalName ? ` (${company.legalName})` : ""}
                </option>
              ))}
            </select>
          </div>

          {errors.companyId && (
            <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>
          )}

          {!companiesLoading && companies.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              No companies available. Create a company first.
            </p>
          )}
        </div>

        {/* ====================================================
            Joining Date
            ==================================================== */}
        <div>
          <label
            htmlFor="joiningDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Joining Date
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={(event) => onChange("joiningDate", event.target.value)}
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.joiningDate
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.joiningDate && (
            <p className="mt-1 text-xs text-red-600">{errors.joiningDate}</p>
          )}
        </div>

        {/* ====================================================
            Department
            ==================================================== */}
        <div>
          <label
            htmlFor="department"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Department
          </label>

          <div className="relative">
            <BriefcaseBusiness
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="department"
              type="text"
              value={formData.department}
              onChange={(event) => onChange("department", event.target.value)}
              placeholder="e.g. Transport Operations"
              maxLength={100}
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.department
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.department && (
            <p className="mt-1 text-xs text-red-600">{errors.department}</p>
          )}
        </div>

        {/* ====================================================
            Driver Status
            ==================================================== */}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Driver Status
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <Activity
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="status"
              value={formData.status}
              onChange={(event) => onChange("status", event.target.value)}
              className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.status
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            >
              <option value="">Select status</option>

              {DRIVER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </div>

        {/* ====================================================
            Assigned Vehicle
            ==================================================== */}
        <div className="md:col-span-2">
          <label
            htmlFor="assignedVehicle"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Assigned Vehicle
          </label>

          <div className="relative">
            <Truck
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="assignedVehicle"
              value={formData.assignedVehicle}
              onChange={(event) =>
                onChange("assignedVehicle", event.target.value)
              }
              disabled={vehiclesLoading}
              className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.assignedVehicle
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              } ${vehiclesLoading ? "cursor-not-allowed bg-slate-50" : ""}`}
            >
              <option value="">
                {vehiclesLoading
                  ? "Loading vehicles..."
                  : "No vehicle assigned"}
              </option>

              {availableVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber}

                  {vehicle.vehicleName ? ` - ${vehicle.vehicleName}` : ""}

                  {vehicle.manufacturer && vehicle.vehicleModel
                    ? ` (${vehicle.manufacturer} ${vehicle.vehicleModel})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {errors.assignedVehicle && (
            <p className="mt-1 text-xs text-red-600">
              {errors.assignedVehicle}
            </p>
          )}

          {!vehiclesLoading && availableVehicles.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">
              No vehicles available.
            </p>
          )}

          {availableVehicles.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Leave as "No vehicle assigned" if the driver is currently
              unassigned.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EmploymentSection;
