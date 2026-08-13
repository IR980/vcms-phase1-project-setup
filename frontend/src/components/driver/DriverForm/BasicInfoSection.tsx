import { UserRound, Building2, CalendarDays, Camera } from "lucide-react";

import Card from "../../common/Card";
import type {
  DriverFormData,
  DriverFormErrors,
  DriverFormChangeHandler,
} from "./driver-form.types";
import { DRIVER_GENDER_OPTIONS } from "../../../constants/driver.constants";

interface BasicInfoSectionProps {
  formData: DriverFormData;

  errors: DriverFormErrors;

  onChange: DriverFormChangeHandler;
}

const BasicInfoSection = ({
  formData,
  errors,
  onChange,
}: BasicInfoSectionProps) => {
  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2.5">
          <UserRound size={20} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the driver's personal and employment identification details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Company */}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="companyId"
              type="text"
              value={formData.companyId}
              onChange={(event) => onChange("companyId", event.target.value)}
              placeholder="Enter company ID"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.companyId
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.companyId && (
            <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label
            htmlFor="employeeId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Employee ID
          </label>

          <input
            id="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={(event) =>
              onChange("employeeId", event.target.value.toUpperCase())
            }
            placeholder="e.g. EMP-001"
            maxLength={50}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm uppercase outline-none transition focus:ring-2 ${
              errors.employeeId
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            First Name
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(event) => onChange("firstName", event.target.value)}
            placeholder="Enter first name"
            maxLength={50}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
              errors.firstName
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Last Name
          </label>

          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(event) => onChange("lastName", event.target.value)}
            placeholder="Enter last name"
            maxLength={50}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Date of Birth
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(event) => onChange("dateOfBirth", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Gender
          </label>

          <select
            id="gender"
            value={formData.gender}
            onChange={(event) => onChange("gender", event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select gender</option>

            {DRIVER_GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Photo */}
        <div className="md:col-span-2">
          <label
            htmlFor="profilePhoto"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Profile Photo URL
          </label>

          <div className="relative">
            <Camera
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="profilePhoto"
              type="url"
              value={formData.profilePhoto}
              onChange={(event) => onChange("profilePhoto", event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.profilePhoto
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.profilePhoto && (
            <p className="mt-1 text-xs text-red-600">{errors.profilePhoto}</p>
          )}

          <p className="mt-1 text-xs text-slate-400">
            Enter a publicly accessible image URL.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BasicInfoSection;
