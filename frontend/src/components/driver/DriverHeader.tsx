import { Plus, Search, RotateCcw } from "lucide-react";

import Button from "../common/Button";
import Card from "../common/Card";

interface DriverHeaderProps {
  search: string;
  totalDrivers: number;

  onSearchChange: (value: string) => void;

  onAdd: () => void;

  onReset?: () => void;
}

const DriverHeader = ({
  search,
  totalDrivers,
  onSearchChange,
  onAdd,
  onReset,
}: DriverHeaderProps) => {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5">
        {/* Header Content */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6 text-blue-600"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>

                <p className="text-sm text-slate-500">
                  Manage your drivers and driving licenses
                </p>
              </div>
            </div>
          </div>

          {/* Add Driver */}
          <Button onClick={onAdd}>
            <Plus size={18} />
            Add Driver
          </Button>
        </div>

        {/* Search + Count */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, employee ID, mobile or license..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {totalDrivers} {totalDrivers === 1 ? "Driver" : "Drivers"}
            </span>

            {onReset && (
              <Button variant="ghost" onClick={onReset} title="Reset search">
                <RotateCcw size={17} />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DriverHeader;
