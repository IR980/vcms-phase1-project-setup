import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DriverHeader from "../../components/driver/DriverHeader";
import DriverTable from "../../components/driver/DriverTable";

import Button from "../../components/common/Button";

import { useDriverStore } from "../../store/driver.store";

const DriverListPage = () => {
  const navigate = useNavigate();

  const {
    drivers,
    pagination,
    query,
    loading,
    error,
    fetchDrivers,
    removeDriver,
    setQuery,
    resetQuery,
    clearError,
  } = useDriverStore();

  /**
   * Load drivers
   */
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        await fetchDrivers({
          page: query.page,
          limit: query.limit,
          search: query.search,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        });
      } catch {
        // Store handles the error.
      }
    };

    loadDrivers();

    // We intentionally depend on the individual
    // query values instead of the query object.
    // This prevents an infinite fetch loop.
  }, [query.page, query.limit, query.search, query.sortBy, query.sortOrder]);

  /**
   * Search
   */
  const handleSearchChange = (value: string) => {
    setQuery({
      search: value,
      page: 1,
    });
  };

  /**
   * Reset
   */
  const handleReset = async () => {
    resetQuery();
  };

  /**
   * Delete Driver
   */
  const handleDelete = async (driver: (typeof drivers)[number]) => {
    const fullName = [driver.firstName, driver.lastName]
      .filter(Boolean)
      .join(" ");

    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullName || "this driver"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeDriver(driver._id);

      if (drivers.length === 1 && pagination.page > 1) {
        setQuery({
          page: pagination.page - 1,
        });

        return;
      }

      await fetchDrivers({
        page: query.page,
        limit: query.limit,
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
    } catch {
      // Store handles the error.
    }
  };

  /**
   * Pagination
   */
  const handlePreviousPage = () => {
    if (pagination.page <= 1) {
      return;
    }

    setQuery({
      page: pagination.page - 1,
    });
  };

  const handleNextPage = () => {
    if (pagination.page >= pagination.totalPages) {
      return;
    }

    setQuery({
      page: pagination.page + 1,
    });
  };

  /**
   * Empty page state
   */
  const showPagination = pagination.total > 0 && pagination.totalPages > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DriverHeader
        search={query.search ?? ""}
        totalDrivers={pagination.total}
        onSearchChange={handleSearchChange}
        onAdd={() => navigate("/drivers/create")}
        onReset={handleReset}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>

          <Button variant="ghost" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Driver Table */}
      <DriverTable
        drivers={drivers}
        loading={loading}
        onView={(driver) => navigate(`/drivers/${driver._id}`)}
        onEdit={(driver) => navigate(`/drivers/${driver._id}/edit`)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Pagination Info */}
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {pagination.total}
            </span>{" "}
            drivers
          </p>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handlePreviousPage}
              disabled={pagination.page <= 1 || loading}
              title="Previous page"
            >
              <ChevronLeft size={18} />
              Previous
            </Button>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            <Button
              variant="ghost"
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages || loading}
              title="Next page"
            >
              Next
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverListPage;
