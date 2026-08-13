import { Search, RefreshCw, Plus, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleHeaderProps {
  searchValue: string;
  loading?: boolean;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}

const VehicleHeader = ({
  searchValue,
  loading = false,
  onSearch,
  onRefresh,
}: VehicleHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <Truck size={30} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Vehicle Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage all company vehicles, assignments and compliance
              information.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchValue}
              placeholder="Search vehicle..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Add Vehicle */}
          <button
            type="button"
            onClick={() => navigate("/vehicles/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleHeader;
