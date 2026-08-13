import { useNavigate } from "react-router-dom";
import {
  Car,
  FilePlus2,
  UserPlus,
  Building2,
  ScanSearch,
  BarChart3,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth";
import { UserRole } from "../../../types/auth.types";

interface ActionItem {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  roles: UserRole[];
}

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions: ActionItem[] = [
    {
      title: "Add Vehicle",
      description: "Register a new vehicle",
      icon: Car,
      path: "/vehicles/create",
      color: "bg-blue-100 text-blue-600",
      roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
    },
    {
      title: "Upload Document",
      description: "Upload RC, Insurance, PUC",
      icon: FilePlus2,
      path: "/documents/upload",
      color: "bg-green-100 text-green-600",
      roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER, UserRole.STAFF],
    },
    {
      title: "Add Driver",
      description: "Create a driver profile",
      icon: UserPlus,
      path: "/drivers/create",
      color: "bg-purple-100 text-purple-600",
      roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
    },
    {
      title: "Add Company",
      description: "Register a new company",
      icon: Building2,
      path: "/company/create",
      color: "bg-yellow-100 text-yellow-600",
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: "AI OCR Scan",
      description: "Extract document details",
      icon: ScanSearch,
      path: "/ocr",
      color: "bg-pink-100 text-pink-600",
      roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
    },
    {
      title: "Reports",
      description: "View compliance reports",
      icon: BarChart3,
      path: "/reports",
      color: "bg-indigo-100 text-indigo-600",
      roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
    },
  ];

  const visibleActions = actions.filter((action) =>
    user ? action.roles.includes(user.role) : false,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-800">
        Quick Actions
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Frequently used shortcuts to manage your fleet.
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="group rounded-2xl border border-slate-200 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
              >
                <Icon size={24} />
              </div>

              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
