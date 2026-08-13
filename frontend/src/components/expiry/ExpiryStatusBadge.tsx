import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { ExpiryStatus } from "../../types/expiry.types";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface ExpiryStatusBadgeProps {
  status: ExpiryStatus;

  /**
   * Optional compact mode.
   */
  compact?: boolean;
}

/**
 * ============================================================
 * STATUS CONFIG
 * ============================================================
 */
interface StatusConfig {
  label: string;

  className: string;

  icon: LucideIcon;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  /**
   * ----------------------------------------------------------
   * EXPIRED
   * ----------------------------------------------------------
   */
  EXPIRED: {
    label: "Expired",

    className: "border-red-200 bg-red-50 text-red-700",

    icon: ShieldAlert,
  },

  /**
   * ----------------------------------------------------------
   * EXPIRING TODAY
   * ----------------------------------------------------------
   */
  EXPIRING_TODAY: {
    label: "Expires Today",

    className: "border-orange-200 bg-orange-50 text-orange-700",

    icon: AlertCircle,
  },

  /**
   * ----------------------------------------------------------
   * EXPIRING IN 7 DAYS
   * ----------------------------------------------------------
   */
  EXPIRING_IN_7_DAYS: {
    label: "Within 7 Days",

    className: "border-orange-200 bg-orange-50 text-orange-700",

    icon: Clock,
  },

  /**
   * ----------------------------------------------------------
   * EXPIRING IN 15 DAYS
   * ----------------------------------------------------------
   */
  EXPIRING_IN_15_DAYS: {
    label: "Within 15 Days",

    className: "border-yellow-200 bg-yellow-50 text-yellow-700",

    icon: Clock,
  },

  /**
   * ----------------------------------------------------------
   * EXPIRING IN 30 DAYS
   * ----------------------------------------------------------
   */
  EXPIRING_IN_30_DAYS: {
    label: "Within 30 Days",

    className: "border-blue-200 bg-blue-50 text-blue-700",

    icon: Clock,
  },

  /**
   * ----------------------------------------------------------
   * VALID
   * ----------------------------------------------------------
   */
  VALID: {
    label: "Valid",

    className: "border-green-200 bg-green-50 text-green-700",

    icon: CheckCircle2,
  },
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const ExpiryStatusBadge = ({
  status,
  compact = false,
}: ExpiryStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  /**
   * ----------------------------------------------------------
   * SAFETY FALLBACK
   * ----------------------------------------------------------
   */
  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
        Unknown
      </span>
    );
  }

  const Icon = config.icon;

  /**
   * ----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------
   */
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-medium",

        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",

        config.className,
      ].join(" ")}
    >
      <Icon
        className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
        aria-hidden="true"
      />

      <span>{config.label}</span>
    </span>
  );
};

export default ExpiryStatusBadge;
