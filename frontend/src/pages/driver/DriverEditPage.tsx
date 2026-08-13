import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DriverForm from "../../components/driver/DriverForm/DriverForm";

import { useDriverStore } from "../../store/driver.store";

import type {
  CreateDriverDto,
  UpdateDriverDto,
} from "../../types/driver.types";

const DriverEditPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    selectedDriver,
    loading,
    error,
    fetchDriver,
    editDriver,
    clearSelectedDriver,
  } = useDriverStore();

  const [initialLoading, setInitialLoading] = useState(true);

  /**
   * Load Driver
   */
  useEffect(() => {
    if (!id) {
      navigate("/drivers");
      return;
    }

    const loadDriver = async () => {
      setInitialLoading(true);

      try {
        await fetchDriver(id);
      } finally {
        setInitialLoading(false);
      }
    };

    loadDriver();

    /**
     * Clear selected driver when
     * leaving the edit page.
     */
    return () => {
      clearSelectedDriver();
    };
  }, [id, fetchDriver, clearSelectedDriver, navigate]);

  /**
   * Submit Update
   */
  const handleSubmit = async (data: CreateDriverDto | UpdateDriverDto) => {
    if (!id) {
      return;
    }

    try {
      await editDriver(id, data as UpdateDriverDto);

      navigate(`/drivers/${id}`);
    } catch {
      /**
       * Store handles the error.
       *
       * Keep the user on the form so
       * they can correct the data.
       */
    }
  };

  /**
   * Cancel
   */
  const handleCancel = () => {
    if (id) {
      navigate(`/drivers/${id}`);
    } else {
      navigate("/drivers");
    }
  };

  /**
   * Invalid ID
   */
  if (!id) {
    return null;
  }

  /**
   * Initial Loading
   */
  if (initialLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading driver...</p>
        </div>
      </div>
    );
  }

  /**
   * Driver Not Found
   */
  if (!selectedDriver) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Driver not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested driver could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/drivers")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Drivers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Driver</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the driver's profile, license, employment, and assignment
          information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Driver Form */}
      <DriverForm
        mode="edit"
        initialData={selectedDriver}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DriverEditPage;
