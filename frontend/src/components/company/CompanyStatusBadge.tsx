import { CheckCircle2, XCircle } from "lucide-react";

import StatusBadge from "../common/StatusBadge";

interface Props {
  status: "active" | "inactive";
}

const CompanyStatusBadge = ({ status }: Props) => {
  if (status === "active") {
    return (
      <StatusBadge
        label="Active"
        color="green"
        icon={<CheckCircle2 size={16} />}
      />
    );
  }

  return (
    <StatusBadge label="Inactive" color="gray" icon={<XCircle size={16} />} />
  );
};

export default CompanyStatusBadge;
