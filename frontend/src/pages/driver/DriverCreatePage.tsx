import { useNavigate } from "react-router-dom";

import DriverForm from "../../components/driver/DriverForm/DriverForm";

import { useDriverStore } from "../../store/driver.store";

import type {
  CreateDriverDto,
  UpdateDriverDto,
} from "../../types/driver.types";

const DriverCreatePage = () => {
  const navigate = useNavigate();

  const { addDriver, loading } = useDriverStore();

  /**
   * Create Driver
   */
  const handleSubmit = async (data: CreateDriverDto | UpdateDriverDto) => {
    try {
      /**
       * Create mode always expects
       * CreateDriverDto.
       */
      await addDriver(data as CreateDriverDto);

      /**
       * Redirect after successful creation
       */
      navigate("/drivers");
    } catch {
      /**
       * The store already stores the
       * API error.
       *
       * We keep the user on the form
       * so they can correct the data.
       */
    }
  };

  /**
   * Cancel
   */
  const handleCancel = () => {
    navigate("/drivers");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Driver</h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new driver profile and assign them to a company.
        </p>
      </div>

      {/* Driver Form */}
      <DriverForm
        mode="create"
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DriverCreatePage;
