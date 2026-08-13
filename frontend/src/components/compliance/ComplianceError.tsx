import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceErrorProps {
  /**
   * Error message returned by API/store.
   */
  message?: string | null;

  /**
   * Optional retry callback.
   */
  onRetry?: () => void;

  /**
   * Retry button label.
   *
   * Default: "Try Again"
   */
  retryLabel?: string;

  /**
   * Show retry button.
   *
   * Default: true when onRetry exists.
   */
  showRetry?: boolean;

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

const ComplianceError = ({
  message,
  onRetry,
  retryLabel = "Try Again",
  showRetry = true,
  className = "",
}: ComplianceErrorProps) => {
  /**
   * ==========================================================
   * DEFAULT MESSAGE
   * ==========================================================
   */

  const errorMessage =
    message || "Unable to load compliance data. Please try again.";

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "flex min-h-64 w-full",
        "flex-col items-center justify-center",
        "rounded-xl border border-red-200",
        "bg-red-50 px-6 py-10",
        "text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ==================================================== */}
      {/* ERROR ICON */}
      {/* ==================================================== */}

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
      </div>

      {/* ==================================================== */}
      {/* TITLE */}
      {/* ==================================================== */}

      <h3 className="mt-4 text-base font-semibold text-red-900">
        Unable to load compliance data
      </h3>

      {/* ==================================================== */}
      {/* MESSAGE */}
      {/* ==================================================== */}

      <p className="mt-1 max-w-md text-sm leading-6 text-red-700">
        {errorMessage}
      </p>

      {/* ==================================================== */}
      {/* RETRY */}
      {/* ==================================================== */}

      {showRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />

          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ComplianceError;
