import { CreditCard, CalendarDays, Building2 } from "lucide-react";

import Card from "../../common/Card";

import { LICENSE_TYPE_OPTIONS } from "../../../constants/driver.constants";
import type {
  DriverFormData,
  DriverFormErrors,
  DriverFormChangeHandler,
} from "./driver-form.types";

interface LicenseSectionProps {
  formData: DriverFormData;

  errors: DriverFormErrors;

  onChange: DriverFormChangeHandler;
}

const LicenseSection = ({
  formData,
  errors,
  onChange,
}: LicenseSectionProps) => {
  /**
   * Determine whether the license
   * is already expired.
   */
  const isExpired =
    formData.licenseExpiryDate &&
    new Date(formData.licenseExpiryDate) <
      new Date(new Date().setHours(0, 0, 0, 0));

  /**
   * Determine whether the license
   * expires within 30 days.
   */
  const expiresSoon =
    formData.licenseExpiryDate &&
    !isExpired &&
    Math.ceil(
      (new Date(formData.licenseExpiryDate).getTime() -
        new Date(new Date().setHours(0, 0, 0, 0)).getTime()) /
        (1000 * 60 * 60 * 24),
    ) <= 30;

  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-amber-100 p-2.5">
          <CreditCard size={20} className="text-amber-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Driving License
          </h2>

          <p className="text-sm text-slate-500">
            Enter the driver's license and issuing authority details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* License Number */}
        <div>
          <label
            htmlFor="licenseNumber"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            License Number
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <CreditCard
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={(event) =>
                onChange("licenseNumber", event.target.value.toUpperCase())
              }
              placeholder="Enter license number"
              maxLength={30}
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm uppercase outline-none transition focus:ring-2 ${
                errors.licenseNumber
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.licenseNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.licenseNumber}</p>
          )}
        </div>

        {/* License Type */}
        <div>
          <label
            htmlFor="licenseType"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            License Type
            <span className="ml-1 text-red-500">*</span>
          </label>

          <select
            id="licenseType"
            value={formData.licenseType}
            onChange={(event) => onChange("licenseType", event.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
              errors.licenseType
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          >
            <option value="">Select license type</option>

            {LICENSE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {errors.licenseType && (
            <p className="mt-1 text-xs text-red-600">{errors.licenseType}</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label
            htmlFor="licenseIssueDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            License Issue Date
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="licenseIssueDate"
              type="date"
              value={formData.licenseIssueDate}
              onChange={(event) =>
                onChange("licenseIssueDate", event.target.value)
              }
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.licenseIssueDate
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.licenseIssueDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.licenseIssueDate}
            </p>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label
            htmlFor="licenseExpiryDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            License Expiry Date
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="licenseExpiryDate"
              type="date"
              value={formData.licenseExpiryDate}
              onChange={(event) =>
                onChange("licenseExpiryDate", event.target.value)
              }
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.licenseExpiryDate
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.licenseExpiryDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.licenseExpiryDate}
            </p>
          )}

          {/* Expiry Warning */}
          {!errors.licenseExpiryDate && isExpired && (
            <p className="mt-1 text-xs font-medium text-red-600">
              This license has expired.
            </p>
          )}

          {!errors.licenseExpiryDate && expiresSoon && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              This license expires within 30 days.
            </p>
          )}
        </div>

        {/* Issuing Authority */}
        <div className="md:col-span-2">
          <label
            htmlFor="issuingAuthority"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Issuing Authority
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="issuingAuthority"
              type="text"
              value={formData.issuingAuthority}
              onChange={(event) =>
                onChange("issuingAuthority", event.target.value)
              }
              placeholder="e.g. Regional Transport Office"
              maxLength={150}
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.issuingAuthority
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.issuingAuthority && (
            <p className="mt-1 text-xs text-red-600">
              {errors.issuingAuthority}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LicenseSection;
