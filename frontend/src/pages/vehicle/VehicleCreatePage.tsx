import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";

import Button from "../../components/common/Button";
import VehicleForm from "../../components/vehicle/VehicleForm/VehicleForm";

import { useVehicleStore } from "../../store/vehicle.store";
import { useCompanyStore } from "../../store/company.store";

import type {
  CompanySummary,
  CreateVehicleDto,
  DriverSummary,
} from "../../types/vehicle.types";

const VehicleCreatePage = () => {
  const navigate = useNavigate();

  /**
   * Vehicle Store
   */
  const { addVehicle } = useVehicleStore();

  /**
   * Company Store
   */
  const {
    companies,
    fetchCompanies,
    loading: companyLoading,
  } = useCompanyStore();

  const [loading, setLoading] = useState(false);

  /**
   * Drivers
   *
   * Driver module is not implemented yet.
   * Once Driver Management is created,
   * replace this with the Driver Store.
   */
  const drivers: DriverSummary[] = [];

  /**
   * Load Companies
   */
  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  /**
   * Create Vehicle
   */
  const handleSubmit = async (data: CreateVehicleDto) => {
    try {
      setLoading(true);

      /**
       * Don't send empty assignedDriver
       */
      const payload: CreateVehicleDto = {
        ...data,
        assignedDriver: data.assignedDriver || undefined,
      };

      await addVehicle(payload);

      navigate("/vehicles");
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert Company Store data
   * to Vehicle form format.
   */
  const companyOptions: CompanySummary[] = companies.map((company) => ({
    _id: company._id,
    companyName: company.companyName,
    legalName: company.legalName,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/vehicles")}
          className="mb-3"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3">
            <Truck size={28} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Vehicle
            </h1>

            <p className="text-slate-500">
              Register a new vehicle in the fleet management system.
            </p>
          </div>
        </div>
      </div>

      {/* Company Loading */}
      {companyLoading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading companies...
        </div>
      )}

      {/* No Companies */}
      {!companyLoading && companyOptions.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No companies found. Please create a company before adding a vehicle.
        </div>
      )}

      {/* Vehicle Form */}
      <VehicleForm
        companies={companyOptions}
        drivers={drivers}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default VehicleCreatePage;
