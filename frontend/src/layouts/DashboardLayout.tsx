import { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardMobileSidebar from "../components/dashboard/DashboardMobileSidebar";

const DashboardLayout = () => {
  /**
   * Desktop Sidebar
   */
  const [collapsed, setCollapsed] = useState(false);

  /**
   * Mobile Sidebar
   */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Sidebar */}
      <DashboardMobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        </div>

        {/* Main Section */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <DashboardHeader onMenuClick={() => setMobileSidebarOpen(true)} />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
              <p>
                © {new Date().getFullYear()} Vehicle Compliance Management
                System
              </p>

              <p>Version 1.0.0</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
