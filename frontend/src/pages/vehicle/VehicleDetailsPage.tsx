import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Truck,
  Fuel,
  Calendar,
  Gauge,
  User,
} from "lucide-react";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import VehicleStatusBadge from "../../components/vehicle/VehicleStatusBadge";

import { useVehicleStore } from "../../store/vehicle.store";

const VehicleDetailsPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const {
    selectedVehicle,
    loading,
    fetchVehicle,
    removeVehicle,
    clearSelectedVehicle,
  } = useVehicleStore();

  useEffect(() => {
    if (!id) return;

    void fetchVehicle(id);

    return () => {
      clearSelectedVehicle();
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmed) return;

    await removeVehicle(id);

    navigate("/vehicles");
  };

  if (loading && !selectedVehicle) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!selectedVehicle) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">
          Vehicle not found
        </h2>

        <Button className="mt-4" onClick={() => navigate("/vehicles")}>
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-3"
            onClick={() => navigate("/vehicles")}
          >
            <ArrowLeft size={18} />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <Truck size={30} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {selectedVehicle.vehicleNumber}
              </h1>

              <p className="text-slate-500">Vehicle Details</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/vehicles/${selectedVehicle._id}/edit`)}
          >
            <Pencil size={18} />
            Edit
          </Button>

          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>

      {/* Status */}

      <VehicleStatusBadge status={selectedVehicle.status} />

      {/* Vehicle Information */}

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Vehicle Information</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Info
            icon={<Truck size={18} />}
            label="Vehicle Number"
            value={selectedVehicle.vehicleNumber}
          />

          <Info
            label="Vehicle Name"
            value={selectedVehicle.vehicleName || "-"}
          />

          <Info label="Manufacturer" value={selectedVehicle.manufacturer} />

          <Info label="Model" value={selectedVehicle.vehicleModel} />

          <Info
            icon={<Fuel size={18} />}
            label="Fuel Type"
            value={selectedVehicle.fuelType}
          />

          <Info
            label="Transmission"
            value={selectedVehicle.transmission || "-"}
          />

          <Info
            icon={<Calendar size={18} />}
            label="Manufacturing Year"
            value={String(selectedVehicle.manufacturingYear)}
          />

          <Info label="Color" value={selectedVehicle.color || "-"} />

          <Info
            icon={<Gauge size={18} />}
            label="Current Odometer"
            value={`${selectedVehicle.currentOdometer} KM`}
          />
        </div>
      </Card>

      {/* Registration */}

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Registration Details</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Info
            label="Registration Number"
            value={selectedVehicle.registrationNumber}
          />

          <Info
            label="Registration Date"
            value={
              selectedVehicle.registrationDate
                ? new Date(
                    selectedVehicle.registrationDate,
                  ).toLocaleDateString()
                : "-"
            }
          />

          <Info label="Engine Number" value={selectedVehicle.engineNumber} />

          <Info label="Chassis Number" value={selectedVehicle.chassisNumber} />
        </div>
      </Card>

      {/* Assignment */}

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Assignment</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Info
            icon={<Building2 size={18} />}
            label="Company"
            value={
              typeof selectedVehicle.companyId === "string"
                ? selectedVehicle.companyId
                : selectedVehicle.companyId.companyName
            }
          />

          <Info
            icon={<User size={18} />}
            label="Driver"
            value={
              typeof selectedVehicle.assignedDriver === "string" ||
              !selectedVehicle.assignedDriver
                ? "-"
                : selectedVehicle.assignedDriver.name
            }
          />
        </div>
      </Card>
    </div>
  );
};

interface InfoProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const Info = ({ label, value, icon }: InfoProps) => (
  <div>
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
      {icon}
      {label}
    </div>

    <p className="text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

export default VehicleDetailsPage;
