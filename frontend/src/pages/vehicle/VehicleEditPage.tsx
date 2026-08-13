import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import VehicleForm from "../../components/vehicle/VehicleForm/VehicleForm";

import { useVehicleStore } from "../../store/vehicle.store";

import type { CreateVehicleDto } from "../../types/vehicle.types";

const VehicleEditPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    selectedVehicle,
    loading,
    fetchVehicle,
    editVehicle,
    clearSelectedVehicle,
  } = useVehicleStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    void fetchVehicle(id);

    return () => {
      clearSelectedVehicle();
    };
  }, [id]);

  const handleSubmit = async (data: CreateVehicleDto) => {
    if (!id) return;

    try {
      setSaving(true);
      // Don't send empty assignedDriver
      const payload = {
        ...data,
        assignedDriver:
          data.assignedDriver === "" ? undefined : data.assignedDriver,
      };

      await editVehicle(id, payload);

      navigate("/vehicles");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
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
        <h2 className="text-xl font-semibold text-red-700">
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
          <div className="rounded-xl bg-amber-100 p-3">
            <Truck size={28} className="text-amber-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>

            <p className="text-slate-500">Update vehicle information.</p>
          </div>
        </div>
      </div>

      {/* Form */}

      <VehicleForm
        initialValues={selectedVehicle}
        loading={saving}
        onSubmit={handleSubmit}
        companies={[]}
        drivers={[]}
      />
    </div>
  );
};

export default VehicleEditPage;
