import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleFormActionsProps {
  loading?: boolean;
  isEdit?: boolean;
  cancelPath?: string;
}

const VehicleFormActions = ({
  loading = false,
  isEdit = false,
  cancelPath = "/vehicles",
}: VehicleFormActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-end">
      {/* Cancel */}
      <button
        type="button"
        disabled={loading}
        onClick={() => navigate(cancelPath)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowLeft size={18} />
        Cancel
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {isEdit ? "Updating..." : "Saving..."}
          </>
        ) : (
          <>
            <Save size={18} />
            {isEdit ? "Update Vehicle" : "Save Vehicle"}
          </>
        )}
      </button>
    </div>
  );
};

export default VehicleFormActions;
