import type{ ReactNode } from "react";

interface StatusBadgeProps {
  label: string;
  icon?: ReactNode;
  color: "green" | "red" | "yellow" | "blue" | "gray" | "orange";
}

const colorClasses = {
  green: "bg-green-100 text-green-700 border-green-200",

  red: "bg-red-100 text-red-700 border-red-200",

  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",

  blue: "bg-blue-100 text-blue-700 border-blue-200",

  gray: "bg-slate-100 text-slate-700 border-slate-200",

  orange: "bg-orange-100 text-orange-700 border-orange-200",
};

const StatusBadge = ({ label, icon, color }: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${colorClasses[color]}`}
    >
      {icon}

      {label}
    </span>
  );
};

export default StatusBadge;
