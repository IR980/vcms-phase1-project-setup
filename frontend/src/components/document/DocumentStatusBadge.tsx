import { CheckCircle2, Clock3, FileUp, XCircle } from "lucide-react";

import {
  type DocumentVerificationStatus,
  DOCUMENT_VERIFICATION_STATUS_LABELS,
} from "../../types/document.types";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentStatusBadgeProps {
  /**
   * Document verification status.
   */
  status: DocumentVerificationStatus;

  /**
   * Optional custom className.
   */
  className?: string;

  /**
   * Show status icon.
   *
   * Default: true
   */
  showIcon?: boolean;

  /**
   * Badge size.
   *
   * Default: "md"
   */
  size?: "sm" | "md";
}

/**
 * ============================================================
 * STATUS CONFIG
 * ============================================================
 */
const STATUS_CONFIG: Record<
  DocumentVerificationStatus,
  {
    icon: typeof FileUp;

    className: string;
  }
> = {
  uploaded: {
    icon: FileUp,

    className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  },

  pending_verification: {
    icon: Clock3,

    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },

  verified: {
    icon: CheckCircle2,

    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  },

  rejected: {
    icon: XCircle,

    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentStatusBadge = ({
  status,

  className = "",

  showIcon = true,

  size = "md",
}: DocumentStatusBadgeProps) => {
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
   * Size classes
   * ----------------------------------------------------------
   */
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full font-medium",
        sizeClasses,
        config.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIcon && <Icon className={iconSize} aria-hidden="true" />}

      {DOCUMENT_VERIFICATION_STATUS_LABELS[status]}
    </span>
  );
};

export default DocumentStatusBadge;
