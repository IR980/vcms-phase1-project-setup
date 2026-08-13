import { Building2, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { CompanyFormValues } from "../../../validation/company.schema";

const BasicInfoSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3">
          <Building2 className="text-blue-600" size={22} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Basic Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the company's primary information.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company Name *
          </label>

          <input
            {...register("companyName")}
            placeholder="ABC Logistics"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.companyName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Legal Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Legal Name *
          </label>

          <input
            {...register("legalName")}
            placeholder="ABC Logistics Pvt. Ltd."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.legalName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.legalName.message}
            </p>
          )}
        </div>

        {/* Owner Name */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Owner / Authorized Person *
          </label>

          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("ownerName")}
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.ownerName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.ownerName.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BasicInfoSection;
