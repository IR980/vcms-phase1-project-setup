import { Loader2 } from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceLoadingProps {
  /**
   * Optional loading message.
   */
  message?: string;

  /**
   * Show loading message.
   *
   * Default: true
   */
  showMessage?: boolean;

  /**
   * Minimum height of loading area.
   *
   * Default: "min-h-64"
   */
  minHeightClass?: string;

  /**
   * Optional custom class.
   */
  className?: string;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceLoading = ({
  message = "Loading compliance data...",
  showMessage = true,
  minHeightClass = "min-h-64",
  className = "",
}: ComplianceLoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={[
        "flex w-full flex-col items-center justify-center",
        "rounded-xl border border-gray-200",
        "bg-white px-6 py-10",
        "shadow-sm",
        minHeightClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ==================================================== */}
      {/* LOADING ICON */}
      {/* ==================================================== */}

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Loader2
          className="h-6 w-6 animate-spin text-gray-600"
          aria-hidden="true"
        />
      </div>

      {/* ==================================================== */}
      {/* MESSAGE */}
      {/* ==================================================== */}

      {showMessage && (
        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
      )}

      {/* ==================================================== */}
      {/* ACCESSIBILITY */}
      {/* ==================================================== */}

      <span className="sr-only">{message}</span>
    </div>
  );
};

export default ComplianceLoading;
