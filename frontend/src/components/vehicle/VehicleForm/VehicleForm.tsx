import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import type {
  Vehicle,
  CreateVehicleDto,
  DriverSummary,
  CompanySummary,
} from "../../../types/vehicle.types";
import BasicInfoSection from "./BasicInfoSection";
import RegistrationSection from "./RegistrationSection";
import SpecificationsSection from "./SpecificationsSection";
import CompanyAssignmentSection from "./CompanyAssignmentSection";
import VehicleFormActions from "./VehicleFormActions";

interface VehicleFormProps {
  initialValues?: Vehicle;

  loading?: boolean;

  companies: CompanySummary[];

  drivers: DriverSummary[];

  onSubmit: (data: CreateVehicleDto) => Promise<void>;
}

const defaultValues: CreateVehicleDto = {
  companyId: "",

  vehicleNumber: "",

  vehicleName: "",

  vehicleType: "truck",

  manufacturer: "",

  vehicleModel: "",

  manufacturingYear: new Date().getFullYear(),

  color: "",

  fuelType: "diesel",

  transmission: "",

  registrationNumber: "",

  registrationDate: "",

  chassisNumber: "",

  engineNumber: "",

  currentOdometer: 0,

  assignedDriver: "",

  status: "active",
};

const VehicleForm = ({
  initialValues,
  loading = false,
  companies,
  drivers,
  onSubmit,
}: VehicleFormProps) => {
  const methods = useForm<CreateVehicleDto>({
    defaultValues,
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (initialValues) {
      reset({
        companyId:
          typeof initialValues.companyId === "string"
            ? initialValues.companyId
            : initialValues.companyId._id,

        vehicleNumber: initialValues.vehicleNumber,

        vehicleName: initialValues.vehicleName ?? "",

        vehicleType: initialValues.vehicleType,

        manufacturer: initialValues.manufacturer,

        vehicleModel: initialValues.vehicleModel,

        manufacturingYear: initialValues.manufacturingYear,

        color: initialValues.color ?? "",

        fuelType: initialValues.fuelType,

        transmission: initialValues.transmission ?? "",

        registrationNumber: initialValues.registrationNumber,

        registrationDate: initialValues.registrationDate
          ? initialValues.registrationDate.substring(0, 10)
          : "",

        chassisNumber: initialValues.chassisNumber,

        engineNumber: initialValues.engineNumber,

        currentOdometer: initialValues.currentOdometer,

        assignedDriver:
          typeof initialValues.assignedDriver === "string"
            ? initialValues.assignedDriver
            : (initialValues.assignedDriver?._id ?? ""),

        status: initialValues.status,
      });
    }
  }, [initialValues, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoSection />

        <RegistrationSection />

        <SpecificationsSection />

        <CompanyAssignmentSection companies={companies} drivers={drivers} />

        <VehicleFormActions loading={loading} isEdit={Boolean(initialValues)} />
      </form>
    </FormProvider>
  );
};

export default VehicleForm;
