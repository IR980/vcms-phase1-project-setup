import { Loader2, Save, Upload, X } from "lucide-react";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentFormActionsProps {
  /**
   * Whether the form is in edit mode.
   */
  isEditMode?: boolean;

  /**
   * Whether form submission is in progress.
   */
  isSubmitting?: boolean;

  /**
   * Cancel button handler.
   */
  onCancel: () => void;

  /**
   * Optional custom submit label.
   */
  submitLabel?: string;

  /**
   * Optional custom cancel label.
   */
  cancelLabel?: string;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentFormActions = ({
  isEditMode = false,

  isSubmitting = false,

  onCancel,

  submitLabel,

  cancelLabel = "Cancel",
}: DocumentFormActionsProps) => {
  /**
   * ----------------------------------------------------------
   * Submit label
   * ----------------------------------------------------------
   */
  const defaultSubmitLabel = isEditMode ? "Update Document" : "Upload Document";

  const finalSubmitLabel = submitLabel ?? defaultSubmitLabel;

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
      {/* ================================================== */}
      {/* CANCEL */}
      {/* ================================================== */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <X className="h-4 w-4" aria-hidden="true" />

        {cancelLabel}
      </button>

      {/* ================================================== */}
      {/* SUBMIT */}
      {/* ================================================== */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />

            {isEditMode ? "Updating..." : "Uploading..."}
          </>
        ) : (
          <>
            {isEditMode ? (
              <Save className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}

            {finalSubmitLabel}
          </>
        )}
      </button>
    </div>
  );
};

export default DocumentFormActions;
