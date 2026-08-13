import { Truck } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Input from "../../common/Input";
import Card from "../../common/Card";

import type{ CreateVehicleDto } from "../../../types/vehicle.types";

import { VEHICLE_TYPES } from "../../../constants/vehicle.constants";
const BasicInfoSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateVehicleDto>();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2">
          <Truck size={22} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Basic Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the basic details of the vehicle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Vehicle Number"
          placeholder="DL01AB1234"
          error={errors.vehicleNumber?.message}
          {...register("vehicleNumber")}
        />

        <Input
          label="Vehicle Name"
          placeholder="Tata Prima 5530"
          error={errors.vehicleName?.message}
          {...register("vehicleName")}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Vehicle Type
          </label>

          <select
            {...register("vehicleType")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {errors.vehicleType && (
            <p className="mt-1 text-sm text-red-500">
              {errors.vehicleType.message}
            </p>
          )}
        </div>

        <Input
          label="Manufacturer"
          placeholder="Tata Motors"
          error={errors.manufacturer?.message}
          {...register("manufacturer")}
        />

        <Input
          label="Vehicle Model"
          placeholder="Prima 5530"
          error={errors.vehicleModel?.message}
          {...register("vehicleModel")}
        />
      </div>
    </Card>
  );
};

export default BasicInfoSection;
