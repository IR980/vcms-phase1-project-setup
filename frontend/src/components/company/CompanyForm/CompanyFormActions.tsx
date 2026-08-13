import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompanyFormActionsProps {
  loading?: boolean;
  mode: "create" | "edit";
}

const CompanyFormActions = ({
  loading = false,
  mode,
}: CompanyFormActionsProps) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/companies");
  };

  return (
    <div className="sticky bottom-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {/* Cancel */}
        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={18} />
          Cancel
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save size={18} />
              {mode === "create" ? "Create Company" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompanyFormActions;
