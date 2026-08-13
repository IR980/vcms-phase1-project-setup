import { BadgeX, CheckCircle2, Wrench, XCircle } from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import type { VehicleStatus } from "../../types/vehicle.types";

interface Props {
  status: VehicleStatus;
}

const VehicleStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "active":
      return (
        <StatusBadge
          label="Active"
          color="green"
          icon={<CheckCircle2 size={16} />}
        />
      );

    case "maintenance":
      return (
        <StatusBadge
          label="Maintenance"
          color="yellow"
          icon={<Wrench size={16} />}
        />
      );

    case "inactive":
      return (
        <StatusBadge
          label="Inactive"
          color="gray"
          icon={<XCircle size={16} />}
        />
      );

    case "sold":
      return (
        <StatusBadge label="Sold" color="red" icon={<BadgeX size={16} />} />
      );

    default:
      return <StatusBadge label="Unknown" color="gray" />;
  }
};

export default VehicleStatusBadge;
