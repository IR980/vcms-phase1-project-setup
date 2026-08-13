import { MapPin, Building, Globe, Mailbox } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { CompanyFormValues } from "../../../validation/company.schema";

const AddressSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Address Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter the registered office address of the company.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Address */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Address *
          </label>

          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-4 top-4 text-slate-400"
            />

            <textarea
              rows={4}
              {...register("address")}
              placeholder="Enter complete company address"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {errors.address && (
            <p className="mt-2 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            City *
          </label>

          <div className="relative">
            <Building
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("city")}
              placeholder="New Delhi"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.city && (
            <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            State *
          </label>

          <div className="relative">
            <Building
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("state")}
              placeholder="Delhi"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.state && (
            <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Country *
          </label>

          <div className="relative">
            <Globe
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("country")}
              placeholder="India"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.country && (
            <p className="mt-2 text-sm text-red-600">
              {errors.country.message}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Postal Code *
          </label>

          <div className="relative">
            <Mailbox
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("postalCode")}
              placeholder="110001"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.postalCode && (
            <p className="mt-2 text-sm text-red-600">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Use the company's registered office address.
          This information will be used in invoices, reports, and compliance
          documents.
        </p>
      </div>
    </section>
  );
};

export default AddressSection;
