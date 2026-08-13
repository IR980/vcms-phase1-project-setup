import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

import type { ComplianceStatus } from "../../types/compliance.dto";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceStatusBadgeProps {
  /**
   * Compliance status calculated by backend.
   */
  status: ComplianceStatus;

  /**
   * Optional custom class name.
   */
  className?: string;

  /**
   * Whether to display the icon.
   *
   * Default: true
   */
  showIcon?: boolean;
}

/**
 * ============================================================
 * STATUS CONFIG
 * ============================================================
 */

const statusConfig: Record<
  ComplianceStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  valid: {
    label: "Valid",

    icon: CheckCircle2,

    className: "border-green-200 bg-green-50 text-green-700",
  },

  expiring_soon: {
    label: "Expiring Soon",

    icon: AlertTriangle,

    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },

  expired: {
    label: "Expired",

    icon: XCircle,

    className: "border-red-200 bg-red-50 text-red-700",
  },

  no_expiry: {
    label: "No Expiry",

    icon: HelpCircle,

    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceStatusBadge = ({
  status,
  className = "",
  showIcon = true,
}: ComplianceStatusBadgeProps) => {
  /**
   * ----------------------------------------------------------
   * Get configuration
   * ----------------------------------------------------------
   */

  const config = statusConfig[status];

  const Icon = config.icon;

  /**
   * ----------------------------------------------------------
   * Render
   * ----------------------------------------------------------
   */

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border",
        "px-2.5 py-1",
        "text-xs font-semibold",
        "whitespace-nowrap",
        config.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}

      <span>{config.label}</span>
    </span>
  );
};

export default ComplianceStatusBadge;
