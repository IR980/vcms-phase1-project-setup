import { ClipboardCheck } from "lucide-react";
import { useFormContext } from "react-hook-form";

import Card from "../../common/Card";
import Input from "../../common/Input";

import type{ CreateVehicleDto } from "../../../types/vehicle.types";

const RegistrationSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateVehicleDto>();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-2">
          <ClipboardCheck size={22} className="text-green-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Registration Details
          </h2>

          <p className="text-sm text-slate-500">
            Enter the vehicle registration and identification details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Registration Number"
          placeholder="DL01AB1234"
          error={errors.registrationNumber?.message}
          {...register("registrationNumber")}
        />

        <Input
          label="Registration Date"
          type="date"
          error={errors.registrationDate?.message}
          {...register("registrationDate")}
        />

        <Input
          label="Chassis Number"
          placeholder="Enter chassis number"
          error={errors.chassisNumber?.message}
          {...register("chassisNumber")}
        />

        <Input
          label="Engine Number"
          placeholder="Enter engine number"
          error={errors.engineNumber?.message}
          {...register("engineNumber")}
        />
      </div>
    </Card>
  );
};

export default RegistrationSection;
