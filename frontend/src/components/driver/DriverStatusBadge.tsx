import StatusBadge from "../common/StatusBadge";

import { DRIVER_STATUS } from "../../constants/driver.constants";

import type { DriverStatus } from "../../constants/driver.constants";

interface DriverStatusBadgeProps {
  status: DriverStatus;
}

const DriverStatusBadge = ({ status }: DriverStatusBadgeProps) => {
  const statusConfig: Record<
    DriverStatus,
    {
      label: string;
      status: "success" | "warning" | "danger" | "info" | "neutral";
    }
  > = {
    [DRIVER_STATUS.ACTIVE]: {
      label: "Active",
      status: "success",
    },

    [DRIVER_STATUS.INACTIVE]: {
      label: "Inactive",
      status: "neutral",
    },

    [DRIVER_STATUS.ON_LEAVE]: {
      label: "On Leave",
      status: "warning",
    },

    [DRIVER_STATUS.SUSPENDED]: {
      label: "Suspended",
      status: "danger",
    },

    [DRIVER_STATUS.TERMINATED]: {
      label: "Terminated",
      status: "danger",
    },
  };

  const config = statusConfig[status];

  if (!config) {
    const fallbackProps = ({ label: "Active", status: "success" } as any);
    return <StatusBadge {...fallbackProps} />;
  }

  const badgeProps = ({ label: config.label, status: config.status } as any);
  return <StatusBadge {...badgeProps} />;
};

export default DriverStatusBadge;
