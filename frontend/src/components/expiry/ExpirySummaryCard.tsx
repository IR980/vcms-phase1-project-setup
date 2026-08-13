import type { LucideIcon } from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface ExpirySummaryCardProps {
  title: string;

  count: number;

  percentage?: number;

  icon: LucideIcon;

  description?: string;

  className?: string;

  onClick?: () => void;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const ExpirySummaryCard = ({
  title,
  count,
  percentage,
  icon: Icon,
  description,
  className = "",
  onClick,
}: ExpirySummaryCardProps) => {
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!clickable) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          onClick?.();
        }
      }}
      className={[
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition",
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {count}
          </p>

          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-5 w-5 text-gray-600" aria-hidden="true" />
        </div>
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Percentage</span>

            <span className="font-semibold text-gray-700">{percentage}%</span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-700 transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, percentage))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirySummaryCard;
