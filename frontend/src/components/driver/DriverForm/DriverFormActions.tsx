import { Save, Loader2, X } from "lucide-react";

import Button from "../../common/Button";

interface DriverFormActionsProps {
  mode?: "create" | "edit";

  loading?: boolean;

  onCancel: () => void;
}

const DriverFormActions = ({
  mode = "create",
  loading = false,
  onCancel,
}: DriverFormActionsProps) => {
  const isEditMode = mode === "edit";

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
      {/* Cancel */}
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={loading}
        className="justify-center sm:min-w-30"
      >
        <X size={18} />
        Cancel
      </Button>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="justify-center sm:min-w-37.5"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />

            {isEditMode ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            <Save size={18} />

            {isEditMode ? "Update Driver" : "Create Driver"}
          </>
        )}
      </Button>
    </div>
  );
};

export default DriverFormActions;
