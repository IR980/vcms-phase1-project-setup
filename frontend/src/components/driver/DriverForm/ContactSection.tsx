import { Phone, Mail, MapPin, UserRound } from "lucide-react";

import Card from "../../common/Card";
import type {
  DriverFormData,
  DriverFormErrors,
  DriverFormChangeHandler,
} from "./driver-form.types";

interface ContactSectionProps {
  formData: DriverFormData;

  errors: DriverFormErrors;

  onChange: DriverFormChangeHandler;
}

const ContactSection = ({
  formData,
  errors,
  onChange,
}: ContactSectionProps) => {
  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2.5">
          <Phone size={20} className="text-emerald-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Information
          </h2>

          <p className="text-sm text-slate-500">
            Add the driver's contact and emergency contact details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Mobile Number */}
        <div>
          <label
            htmlFor="mobileNumber"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Mobile Number
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.mobileNumber}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");

                onChange("mobileNumber", value);
              }}
              placeholder="Enter 10-digit mobile number"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.mobileNumber
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.mobileNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="driver@example.com"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Address
          </label>

          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <textarea
              id="address"
              rows={3}
              value={formData.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="Enter complete address"
              maxLength={250}
              className={`w-full resize-none rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.address
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.address && (
            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            City
          </label>

          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="Enter city"
            maxLength={50}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
              errors.city
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {errors.city && (
            <p className="mt-1 text-xs text-red-600">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="state"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            State
          </label>

          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(event) => onChange("state", event.target.value)}
            placeholder="Enter state"
            maxLength={50}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
              errors.state
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {errors.state && (
            <p className="mt-1 text-xs text-red-600">{errors.state}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label
            htmlFor="pincode"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Pincode
          </label>

          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={formData.pincode}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "");

              onChange("pincode", value);
            }}
            placeholder="Enter 6-digit pincode"
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
              errors.pincode
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {errors.pincode && (
            <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
          )}
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label
            htmlFor="emergencyContactName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Emergency Contact Name
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="emergencyContactName"
              type="text"
              value={formData.emergencyContactName}
              onChange={(event) =>
                onChange("emergencyContactName", event.target.value)
              }
              placeholder="Enter contact name"
              maxLength={100}
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.emergencyContactName
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.emergencyContactName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.emergencyContactName}
            </p>
          )}
        </div>

        {/* Emergency Contact Number */}
        <div>
          <label
            htmlFor="emergencyContactNumber"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Emergency Contact Number
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="emergencyContactNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.emergencyContactNumber}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");

                onChange("emergencyContactNumber", value);
              }}
              placeholder="Enter 10-digit number"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.emergencyContactNumber
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>

          {errors.emergencyContactNumber && (
            <p className="mt-1 text-xs text-red-600">
              {errors.emergencyContactNumber}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ContactSection;
