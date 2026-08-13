import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Pencil,
  Truck,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { useCompanyStore } from "../../store/company.store";
import CompanyStatusBadge from "../../components/company/CompanyStatusBadge";
import Loader from "../../components/common/Loader";

const CompanyDetailsPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const { selectedCompany, loading, fetchCompany, clearSelectedCompany } =
    useCompanyStore();

  useEffect(() => {
    if (!id) return;

    void fetchCompany(id);

    return () => {
      clearSelectedCompany();
    };
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!selectedCompany) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        <h2 className="text-2xl font-bold">Company Not Found</h2>

        <button
          onClick={() => navigate("/companies")}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/companies")}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          onClick={() => navigate(`/companies/${selectedCompany._id}/edit`)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          <Pencil size={18} />
          Edit Company
        </button>
      </div>

      {/* Company Card */}

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-100">
            {selectedCompany.logo ? (
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.companyName}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 size={42} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {selectedCompany.companyName}
              </h1>

              <CompanyStatusBadge status={selectedCompany.status} />
            </div>

            <p className="mt-2 text-slate-500">{selectedCompany.legalName}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail size={18} />

                {selectedCompany.email}
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />

                {selectedCompany.phone}
              </div>

              <div className="flex items-center gap-3">
                <Globe size={18} />

                {selectedCompany.website || "-"}
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} />
                {selectedCompany.city}, {selectedCompany.state}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <span className="font-semibold">GST</span>

                <p>{selectedCompany.gstNumber || "-"}</p>
              </div>

              <div>
                <span className="font-semibold">PAN</span>

                <p>{selectedCompany.panNumber || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Summary */}

      <div className="grid gap-6 md:grid-cols-4">
        <SummaryCard
          title="Vehicles"
          value={selectedCompany.totalVehicles}
          icon={<Truck />}
        />

        <SummaryCard
          title="Drivers"
          value={selectedCompany.totalDrivers}
          icon={<Users />}
        />

        <SummaryCard
          title="Documents"
          value={selectedCompany.totalDocuments}
          icon={<FileText />}
        />

        <SummaryCard title="Expiring" value={0} icon={<AlertTriangle />} />
      </div>

      {/* Quick Actions */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Quick Actions</h2>

        <div className="grid gap-4 md:grid-cols-4">
          <ActionButton
            title="Edit Company"
            onClick={() => navigate(`/companies/${selectedCompany._id}/edit`)}
          />

          <ActionButton
            title="Add Vehicle"
            onClick={() => navigate("/vehicles/create")}
          />

          <ActionButton
            title="Upload Document"
            onClick={() => navigate("/documents/upload")}
          />

          <ActionButton title="Reports" onClick={() => navigate("/reports")} />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <div className="flex justify-between">
      <div>
        <p className="text-slate-500">{title}</p>

        <h2 className="mt-2 text-3xl font-bold">{value}</h2>
      </div>

      <div className="text-blue-600">{icon}</div>
    </div>
  </div>
);

const ActionButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="rounded-xl border p-4 text-center transition hover:border-blue-600 hover:bg-blue-50"
  >
    {title}
  </button>
);

export default CompanyDetailsPage;
