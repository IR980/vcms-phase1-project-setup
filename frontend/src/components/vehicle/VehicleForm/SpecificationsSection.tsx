import { Settings2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Card from "../../common/Card";
import Input from "../../common/Input";

import type{ CreateVehicleDto } from "../../../types/vehicle.types";

import {
  FUEL_TYPES,
  TRANSMISSION_TYPES
} from "../../../constants/vehicle.constants";

const SpecificationsSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateVehicleDto>();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-orange-100 p-2">
          <Settings2 size={22} className="text-orange-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Vehicle Specifications
          </h2>

          <p className="text-sm text-slate-500">
            Enter the technical specifications of the vehicle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Manufacturing Year"
          type="number"
          placeholder="2024"
          error={errors.manufacturingYear?.message}
          {...register("manufacturingYear", {
            valueAsNumber: true,
          })}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Fuel Type
          </label>

          <select
            {...register("fuelType")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel.value} value={fuel.value}>
                {fuel.label}
              </option>
            ))}
          </select>

          {errors.fuelType && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fuelType.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Transmission
          </label>

          <select
            {...register("transmission")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Transmission</option>

            {TRANSMISSION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {errors.transmission && (
            <p className="mt-1 text-sm text-red-500">
              {errors.transmission.message}
            </p>
          )}
        </div>

        <Input
          label="Color"
          placeholder="White"
          error={errors.color?.message}
          {...register("color")}
        />

        <Input
          label="Current Odometer (KM)"
          type="number"
          placeholder="25000"
          error={errors.currentOdometer?.message}
          {...register("currentOdometer", {
            valueAsNumber: true,
          })}
        />
      </div>
    </Card>
  );
};

export default SpecificationsSection;
