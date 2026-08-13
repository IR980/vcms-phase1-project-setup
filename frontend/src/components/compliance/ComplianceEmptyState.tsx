import { FileSearch, RefreshCw } from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceEmptyStateProps {
  /**
   * Main heading.
   */
  title?: string;

  /**
   * Supporting message.
   */
  message?: string;

  /**
   * Optional action button.
   */
  actionLabel?: string;

  /**
   * Action callback.
   */
  onAction?: () => void;

  /**
   * Show action button.
   *
   * Default: false
   */
  showAction?: boolean;

  /**
   * Optional custom class name.
   */
  className?: string;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceEmptyState = ({
  title = "No compliance documents found",
  message = "There are no documents available for the selected criteria.",
  actionLabel = "Refresh",
  onAction,
  showAction = false,
  className = "",
}: ComplianceEmptyStateProps) => {
  return (
    <div
      className={[
        "flex min-h-64 w-full",
        "flex-col items-center justify-center",
        "rounded-xl border border-gray-200",
        "bg-white px-6 py-10",
        "text-center shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ==================================================== */}
      {/* ICON */}
      {/* ==================================================== */}

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <FileSearch className="h-7 w-7 text-gray-400" aria-hidden="true" />
      </div>

      {/* ==================================================== */}
      {/* TITLE */}
      {/* ==================================================== */}

      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>

      {/* ==================================================== */}
      {/* MESSAGE */}
      {/* ==================================================== */}

      <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">{message}</p>

      {/* ==================================================== */}
      {/* ACTION */}
      {/* ==================================================== */}

      {showAction && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />

          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ComplianceEmptyState;
