import {
  CalendarDays,
  Clock3,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceExpiryBadgeProps {
  /**
   * Document expiry date.
   *
   * Expected format:
   *
   * ISO date string
   *
   * Example:
   *
   * 2026-09-05T00:00:00.000Z
   */
  expiryDate?: string;

  /**
   * Number of days remaining.
   *
   * Backend calculated value.
   *
   * Examples:
   *
   * 30  → expires in 30 days
   * 0   → expires today
   * -5  → expired 5 days ago
   */
  daysRemaining?: number;

  /**
   * Optional custom class.
   */
  className?: string;

  /**
   * Show calendar/status icon.
   *
   * Default: true
   */
  showIcon?: boolean;
}

/**
 * ============================================================
 * DATE FORMATTER
 * ============================================================
 */

const formatExpiryDate = (expiryDate: string): string => {
  const date = new Date(expiryDate);

  /**
   * Invalid date protection.
   */
  if (Number.isNaN(date.getTime())) {
    return "Invalid expiry date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceExpiryBadge = ({
  expiryDate,
  daysRemaining,
  className = "",
  showIcon = true,
}: ComplianceExpiryBadgeProps) => {
  /**
   * ==========================================================
   * NO EXPIRY DATE
   * ==========================================================
   */

  if (!expiryDate) {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-gray-200",
          "bg-gray-50",
          "px-2.5 py-1",
          "text-xs font-medium",
          "text-gray-600",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showIcon && (
          <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>No expiry date</span>
      </span>
    );
  }

  /**
   * ==========================================================
   * INVALID DATE
   * ==========================================================
   */

  const parsedDate = new Date(expiryDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-gray-200",
          "bg-gray-50",
          "px-2.5 py-1",
          "text-xs font-medium",
          "text-gray-600",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showIcon && (
          <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>Invalid expiry date</span>
      </span>
    );
  }

  /**
   * ==========================================================
   * FORMATTED DATE
   * ==========================================================
   */

  const formattedDate = formatExpiryDate(expiryDate);

  /**
   * ==========================================================
   * DAYS REMAINING NOT AVAILABLE
   * ==========================================================
   *
   * We can still show the actual expiry date.
   */

  if (typeof daysRemaining !== "number") {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-gray-200",
          "bg-gray-50",
          "px-2.5 py-1",
          "text-xs font-medium",
          "text-gray-700",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={`Expiry date: ${formattedDate}`}
      >
        {showIcon && (
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>Expires {formattedDate}</span>
      </span>
    );
  }

  /**
   * ==========================================================
   * EXPIRED
   * ==========================================================
   */

  if (daysRemaining < 0) {
    const expiredDays = Math.abs(daysRemaining);

    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-red-200",
          "bg-red-50",
          "px-2.5 py-1",
          "text-xs font-semibold",
          "text-red-700",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={`Expired on ${formattedDate}`}
      >
        {showIcon && (
          <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>
          {expiredDays === 1
            ? "Expired 1 day ago"
            : `Expired ${expiredDays} days ago`}
        </span>
      </span>
    );
  }

  /**
   * ==========================================================
   * EXPIRES TODAY
   * ==========================================================
   */

  if (daysRemaining === 0) {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-red-200",
          "bg-red-50",
          "px-2.5 py-1",
          "text-xs font-bold",
          "text-red-700",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={`Expires today: ${formattedDate}`}
      >
        {showIcon && (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>Expires today</span>
      </span>
    );
  }

  /**
   * ==========================================================
   * EXPIRING SOON
   * ==========================================================
   *
   * 1–30 days.
   */

  if (daysRemaining <= 30) {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5",
          "rounded-full border",
          "border-yellow-200",
          "bg-yellow-50",
          "px-2.5 py-1",
          "text-xs font-semibold",
          "text-yellow-700",
          "whitespace-nowrap",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        title={`Expiry date: ${formattedDate}`}
      >
        {showIcon && (
          <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        <span>
          {daysRemaining === 1
            ? "Expires in 1 day"
            : `Expires in ${daysRemaining} days`}
        </span>
      </span>
    );
  }

  /**
   * ==========================================================
   * VALID / FUTURE EXPIRY
   * ==========================================================
   */

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border",
        "border-green-200",
        "bg-green-50",
        "px-2.5 py-1",
        "text-xs font-medium",
        "text-green-700",
        "whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={`Expiry date: ${formattedDate}`}
    >
      {showIcon && (
        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}

      <span>Expires {formattedDate}</span>
    </span>
  );
};

export default ComplianceExpiryBadge;
