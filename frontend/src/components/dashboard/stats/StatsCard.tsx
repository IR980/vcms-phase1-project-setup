import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import Loader from "../../common/Loader";

interface StatsCardProps {
  title: string;

  value: number | string;

  icon: React.ElementType;

  color?: "blue" | "green" | "red" | "yellow" | "purple";

  trend?: number;

  trendLabel?: string;

  loading?: boolean;
}

const colors = {
  blue: {
    icon: "bg-blue-100 text-blue-600",
    border: "border-blue-100",
  },

  green: {
    icon: "bg-green-100 text-green-600",
    border: "border-green-100",
  },

  red: {
    icon: "bg-red-100 text-red-600",
    border: "border-red-100",
  },

  yellow: {
    icon: "bg-yellow-100 text-yellow-600",
    border: "border-yellow-100",
  },

  purple: {
    icon: "bg-purple-100 text-purple-600",
    border: "border-purple-100",
  },
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  trendLabel,
  loading = false,
}: StatsCardProps) => {
  const theme = colors[color];

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        theme.border,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          {loading ? (
            <div className="mt-4">
              <Loader size="md" />
            </div>
          ) : (
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
          )}
        </div>

        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            theme.icon,
          )}
        >
          <Icon size={28} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-5 flex items-center gap-2">
          {trend >= 0 ? (
            <ArrowUpRight size={18} className="text-green-600" />
          ) : (
            <ArrowDownRight size={18} className="text-red-600" />
          )}

          <span
            className={clsx(
              "text-sm font-semibold",
              trend >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {Math.abs(trend)}%
          </span>

          <span className="text-sm text-slate-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
