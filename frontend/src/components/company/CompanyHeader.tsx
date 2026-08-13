import { Search, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type{ ChangeEvent } from "react";

interface CompanyHeaderProps {
  title?: string;
  subtitle?: string;

  searchValue?: string;

  onSearch?: (value: string) => void;

  onRefresh?: () => void;

  showCreateButton?: boolean;

  loading?: boolean;
}

const CompanyHeader = ({
  title = "Companies",
  subtitle = "Manage your companies and fleet information.",
  searchValue = "",
  onSearch,
  onRefresh,
  showCreateButton = true,
  loading = false,
}: CompanyHeaderProps) => {
  const navigate = useNavigate();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>

          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchValue}
              onChange={handleSearch}
              placeholder="Search company..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
            />
          </div>

          {/* Refresh */}
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Create */}
          {showCreateButton && (
            <button
              type="button"
              onClick={() => navigate("/companies/create")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Company
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;
