import { Building, CreditCard } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { CompanyFormValues } from "../../../validation/company.schema";

const BusinessSection = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Business Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter your company's business registration details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GST Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            GST Number
          </label>

          <div className="relative">
            <Building
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("gstNumber")}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              onChange={(e) =>
                setValue("gstNumber", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.gstNumber && (
            <p className="mt-2 text-sm text-red-600">
              {errors.gstNumber.message}
            </p>
          )}
        </div>

        {/* PAN Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            PAN Number
          </label>

          <div className="relative">
            <CreditCard
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              {...register("panNumber")}
              placeholder="ABCDE1234F"
              maxLength={10}
              onChange={(e) =>
                setValue("panNumber", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {errors.panNumber && (
            <p className="mt-2 text-sm text-red-600">
              {errors.panNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> GST and PAN are optional. If provided, they
          must be valid according to the format defined in the validation
          schema.
        </p>
      </div>
    </section>
  );
};

export default BusinessSection;
