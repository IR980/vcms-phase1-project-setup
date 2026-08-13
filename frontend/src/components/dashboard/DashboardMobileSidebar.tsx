import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { X, LogOut, Truck } from "lucide-react";
import clsx from "clsx";

import { sidebarItems } from "../../config/sidebar.config";
import useAuth from "../../hooks/useAuth";

interface DashboardMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardMobileSidebar = ({
  isOpen,
  onClose,
}: DashboardMobileSidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = sidebarItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      />

      {/* Drawer */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Truck size={22} />
            </div>

            <div>
              <h1 className="font-bold">VCMS</h1>

              <p className="text-xs text-slate-400">Fleet Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-xl px-4 py-3 transition",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    )
                  }
                >
                  <Icon size={20} />

                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-4">
            <p className="font-semibold">{user?.name}</p>

            <p className="text-sm capitalize text-slate-400">
              {user?.role.replaceAll("_", " ")}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={20} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </Fragment>
  );
};

export default DashboardMobileSidebar;
