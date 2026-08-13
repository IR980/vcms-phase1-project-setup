import { CheckCircle2, CircleOff, PauseCircle } from "lucide-react";

interface Props {
  status: "active" | "inactive" | "suspended";
  size?: "sm" | "md";
}

const CompanyStatusBadge = ({ status, size = "md" }: Props) => {
  const config = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      className: "border-green-200 bg-green-50 text-green-700",
    },

    inactive: {
      label: "Inactive",
      icon: CircleOff,
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },

    suspended: {
      label: "Suspended",
      icon: PauseCircle,
      className: "border-orange-200 bg-orange-50 text-orange-700",
    },
  } as const;

  const current = config[status];

  const Icon = current.icon;

  const sizeClasses =
    size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${current.className}`}
    >
      <Icon
        className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}
        aria-hidden="true"
      />

      {current.label}
    </span>
  );
};

export default CompanyStatusBadge;
