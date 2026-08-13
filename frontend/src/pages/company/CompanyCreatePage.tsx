import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import CompanyForm from "../../components/company/CompanyForm/CompanyForm";

const CompanyCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/companies", {
      replace: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <Building2 size={28} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Company
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new company to manage its fleet, vehicles, drivers and
              compliance documents.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <CompanyForm mode="create" onSuccess={handleSuccess} />
    </div>
  );
};

export default CompanyCreatePage;
