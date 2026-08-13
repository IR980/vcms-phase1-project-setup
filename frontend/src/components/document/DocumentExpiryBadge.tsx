import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

import {
  type ComplianceStatus,
  COMPLIANCE_STATUS_LABELS,
} from "../../types/document.types";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentExpiryBadgeProps {
  /**
   * Compliance status calculated by backend.
   *
   * valid
   * expiring_soon
   * expired
   */
  status: ComplianceStatus;

  /**
   * Number of days remaining.
   *
   * Positive  -> days remaining
   * Zero      -> expires today
   * Negative  -> already expired
   */
  daysRemaining?: number;

  /**
   * Whether to show the icon.
   *
   * Default: true
   */
  showIcon?: boolean;

  /**
   * Whether to show the number of days.
   *
   * Default: true
   */
  showDays?: boolean;

  /**
   * Badge size.
   *
   * Default: "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Optional custom className.
   */
  className?: string;
}

/**
 * ============================================================
 * STATUS CONFIGURATION
 * ============================================================
 */
const STATUS_CONFIG: Record<
  ComplianceStatus,
  {
    icon: typeof CheckCircle2;

    className: string;
  }
> = {
  valid: {
    icon: CheckCircle2,

    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  },

  expiring_soon: {
    icon: AlertTriangle,

    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },

  expired: {
    icon: XCircle,

    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },
};

/**
 * ============================================================
 * SIZE CONFIGURATION
 * ============================================================
 */
const SIZE_CONFIG = {
  sm: {
    badge: "px-2 py-0.5 text-xs gap-1",

    icon: "h-3 w-3",
  },

  md: {
    badge: "px-2.5 py-1 text-xs gap-1.5",

    icon: "h-3.5 w-3.5",
  },

  lg: {
    badge: "px-3 py-1.5 text-sm gap-2",

    icon: "h-4 w-4",
  },
};

/**
 * ============================================================
 * DAYS LABEL
 * ============================================================
 */
const getDaysLabel = (
  status: ComplianceStatus,
  daysRemaining?: number,
): string => {
  /**
   * ----------------------------------------------------------
   * Expired
   * ----------------------------------------------------------
   */
  if (status === "expired") {
    if (daysRemaining === undefined) {
      return "Expired";
    }

    const expiredDays = Math.abs(daysRemaining);

    if (expiredDays === 0) {
      return "Expired today";
    }

    if (expiredDays === 1) {
      return "Expired 1 day ago";
    }

    return `Expired ${expiredDays} days ago`;
  }

  /**
   * ----------------------------------------------------------
   * Expires today
   * ----------------------------------------------------------
   */
  if (daysRemaining === 0) {
    return "Expires today";
  }

  /**
   * ----------------------------------------------------------
   * Unknown days
   * ----------------------------------------------------------
   */
  if (daysRemaining === undefined) {
    return COMPLIANCE_STATUS_LABELS[status];
  }

  /**
   * ----------------------------------------------------------
   * One day remaining
   * ----------------------------------------------------------
   */
  if (daysRemaining === 1) {
    return "1 day remaining";
  }

  /**
   * ----------------------------------------------------------
   * Multiple days remaining
   * ----------------------------------------------------------
   */
  return `${daysRemaining} days remaining`;
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentExpiryBadge = ({
  status,

  daysRemaining,

  showIcon = true,

  showDays = true,

  size = "md",

  className = "",
}: DocumentExpiryBadgeProps) => {
  /**
   * ----------------------------------------------------------
   * Status configuration
   * ----------------------------------------------------------
   */
  const config = STATUS_CONFIG[status];

  /**
   * ----------------------------------------------------------
   * Icon
   * ----------------------------------------------------------
   */
  const Icon = config.icon;

  /**
   * ----------------------------------------------------------
   * Size configuration
   * ----------------------------------------------------------
   */
  const sizeConfig = SIZE_CONFIG[size];

  /**
   * ----------------------------------------------------------
   * Label
   * ----------------------------------------------------------
   */
  const statusLabel = COMPLIANCE_STATUS_LABELS[status];

  const daysLabel = getDaysLabel(status, daysRemaining);

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full font-medium",
        sizeConfig.badge,
        config.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={showDays ? daysLabel : statusLabel}
    >
      {/* Status icon */}
      {showIcon && <Icon className={sizeConfig.icon} aria-hidden="true" />}

      {/* Status */}
      <span>{statusLabel}</span>

      {/* Days remaining */}
      {showDays && daysRemaining !== undefined && (
        <>
          <span aria-hidden="true">•</span>

          <span>{daysLabel}</span>
        </>
      )}
    </span>
  );
};

export default DocumentExpiryBadge;
