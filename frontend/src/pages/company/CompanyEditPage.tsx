import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Loader2, AlertCircle } from "lucide-react";

import CompanyForm from "../../components/company/CompanyForm/CompanyForm";
import { useCompanyStore } from "../../store/company.store";

const CompanyEditPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const { selectedCompany, loading, fetchCompany, clearSelectedCompany } =
    useCompanyStore();

  useEffect(() => {
    if (!id) return;

    void fetchCompany(id);

    return () => {
      clearSelectedCompany();
    };
  }, [id]);

  const handleSuccess = () => {
    navigate("/companies", {
      replace: true,
    });
  };

  if (loading && !selectedCompany) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!loading && !selectedCompany) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-500" size={60} />

        <h2 className="mt-4 text-2xl font-bold text-slate-800">
          Company Not Found
        </h2>

        <p className="mt-2 text-slate-500">
          The requested company does not exist or has been removed.
        </p>

        <button
          type="button"
          onClick={() => navigate("/companies")}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-100 p-3">
            <Building2 size={28} className="text-amber-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Company</h1>

            <p className="mt-1 text-sm text-slate-500">
              Update company information, contact details and business settings.
            </p>
          </div>
        </div>
      </div>

      {selectedCompany && (
        <CompanyForm
          mode="edit"
          company={selectedCompany}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default CompanyEditPage;
