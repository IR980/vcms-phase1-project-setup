import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();

  const [openProfile, setOpenProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden md:flex">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search vehicles, drivers..."
              className="w-80 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button className="relative rounded-xl p-2 transition hover:bg-slate-100">
          <Bell size={22} />

          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            3
          </span>
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setOpenProfile((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <User size={20} />
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold">{user?.name}</p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role.replace("_", " ")}
              </p>
            </div>

            <ChevronDown size={18} />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 p-4">
                <p className="font-semibold">{user?.name}</p>

                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>

              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-slate-100">
                <User size={18} />
                My Profile
              </button>

              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-slate-100">
                <Settings size={18} />
                Settings
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
