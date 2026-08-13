import { useEffect } from "react";

import VehicleHeader from "../../components/vehicle/VehicleHeader";
import VehicleTable from "../../components/vehicle/VehicleTable";

import { useVehicleStore } from "../../store/vehicle.store";

const VehicleListPage = () => {
  

  const {
    vehicles,
    loading,
    error,
    query,
    pagination,
    setQuery,
    fetchVehicles,
    removeVehicle,
  } = useVehicleStore();

  useEffect(() => {
    void fetchVehicles();
  }, [query]);

  const handleSearch = (value: string) => {
    setQuery({
      search: value,
      page: 1,
    });
  };

  const handleRefresh = () => {
    void fetchVehicles();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeVehicle(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setQuery({
      page,
    });
  };

  return (
    <div className="space-y-6">
      <VehicleHeader
        searchValue={query.search ?? ""}
        loading={loading}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      <VehicleTable
        vehicles={vehicles}
        loading={loading}
        onDelete={handleDelete}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
