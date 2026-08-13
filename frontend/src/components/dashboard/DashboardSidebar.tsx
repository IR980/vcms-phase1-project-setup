import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { sidebarItems } from "../../config/sidebar.config";
import useAuth from "../../hooks/useAuth";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = sidebarItems.filter((item) =>
    item.roles.includes(user?.role!),
  );

  return (
    <aside
      className={clsx(
        "flex h-screen flex-col border-r border-slate-800 bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">VCMS</h1>

            <p className="text-xs text-slate-400">Fleet Management</p>
          </div>
        )}

        <button
          onClick={onToggle}
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              <Icon size={20} />

              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800 p-4">
        {!collapsed && (
          <div className="mb-4">
            <p className="font-semibold">{user?.name}</p>

            <p className="text-sm text-slate-400">{user?.role}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={20} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
