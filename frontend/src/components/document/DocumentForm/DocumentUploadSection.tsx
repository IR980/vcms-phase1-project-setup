import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

import { FileText, Upload, X, Eye, FileImage, AlertCircle } from "lucide-react";

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentUploadSectionProps {
  /**
   * Newly selected file.
   *
   * null means no new file selected.
   */
  file: File | null;

  /**
   * Existing Cloudinary file URL.
   *
   * Used in edit mode.
   */
  existingFileUrl?: string;

  /**
   * Existing uploaded filename.
   */
  existingFileName?: string;

  /**
   * Validation error coming from parent form.
   */
  error?: string;

  /**
   * Called whenever the selected file changes.
   */
  onFileChange: (file: File | null) => void;

  /**
   * Disable upload controls.
   */
  disabled?: boolean;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentUploadSection = ({
  file,

  existingFileUrl,

  existingFileName,

  error,

  onFileChange,

  disabled = false,
}: DocumentUploadSectionProps) => {
  /**
   * ----------------------------------------------------------
   * File input reference
   * ----------------------------------------------------------
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * ----------------------------------------------------------
   * Drag state
   * ----------------------------------------------------------
   */
  const [isDragging, setIsDragging] = useState(false);

  /**
   * ----------------------------------------------------------
   * Local validation error
   * ----------------------------------------------------------
   */
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * ----------------------------------------------------------
   * Preview URL
   * ----------------------------------------------------------
   */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /**
   * ==========================================================
   * VALIDATE FILE
   * ==========================================================
   */
  const validateFile = (selectedFile: File): string | null => {
    /**
     * --------------------------------------------------------
     * File size
     * --------------------------------------------------------
     */
    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size cannot exceed 10 MB.";
    }

    /**
     * --------------------------------------------------------
     * MIME type
     * --------------------------------------------------------
     */
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      return "Only PDF, JPG, PNG and WEBP files are allowed.";
    }

    return null;
  };

  /**
   * ==========================================================
   * CREATE PREVIEW
   * ==========================================================
   */
  const createPreview = (selectedFile: File) => {
    /**
     * Revoke previous object URL.
     */
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    /**
     * Browser can preview images and PDFs.
     */
    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);
  };

  /**
   * ==========================================================
   * PROCESS FILE
   * ==========================================================
   */
  const processFile = (selectedFile: File) => {
    /**
     * Clear previous local error.
     */
    setLocalError(null);

    /**
     * Validate.
     */
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setLocalError(validationError);

      return;
    }

    /**
     * Create preview.
     */
    createPreview(selectedFile);

    /**
     * Send file to parent.
     */
    onFileChange(selectedFile);
  };

  /**
   * ==========================================================
   * FILE INPUT CHANGE
   * ==========================================================
   */
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);

    /**
     * Reset input value so selecting the
     * same file again triggers onChange.
     */
    event.target.value = "";
  };

  /**
   * ==========================================================
   * OPEN FILE PICKER
   * ==========================================================
   */
  const handleBrowse = () => {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  /**
   * ==========================================================
   * DRAG ENTER
   * ==========================================================
   */
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    event.stopPropagation();

    if (disabled) {
      return;
    }

    setIsDragging(true);
  };

  /**
   * ==========================================================
   * DRAG OVER
   * ==========================================================
   */
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    event.stopPropagation();

    if (disabled) {
      return;
    }

    setIsDragging(true);
  };

  /**
   * ==========================================================
   * DRAG LEAVE
   * ==========================================================
   */
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    event.stopPropagation();

    setIsDragging(false);
  };

  /**
   * ==========================================================
   * DROP
   * ==========================================================
   */
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    event.stopPropagation();

    setIsDragging(false);

    if (disabled) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    processFile(droppedFile);
  };

  /**
   * ==========================================================
   * REMOVE SELECTED FILE
   * ==========================================================
   */
  const handleRemoveFile = () => {
    if (disabled) {
      return;
    }

    /**
     * Revoke object URL.
     */
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    setLocalError(null);

    onFileChange(null);
  };

  /**
   * ==========================================================
   * OPEN EXISTING FILE
   * ==========================================================
   */
  const handleOpenExistingFile = () => {
    if (!existingFileUrl) {
      return;
    }

    window.open(existingFileUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * ==========================================================
   * CLEANUP
   * ==========================================================
   *
   * Object URLs must be revoked when component unmounts.
   */
  // Note:
  // The preview is also revoked when replaced/removed.
  // The browser will clean up remaining object URLs when
  // the page unloads.
  /**
   * ==========================================================
   * DISPLAY ERROR
   * ==========================================================
   */
  const displayError = localError || error;

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}
      <div className="border-b border-gray-200 bg-gray-50/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Document Upload
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Upload the official document for secure Cloudinary storage.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* BODY */}
      {/* ==================================================== */}
      <div className="space-y-5 p-5">
        {/* ================================================== */}
        {/* EXISTING FILE */}
        {/* ================================================== */}
        {existingFileUrl && !file && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-700">
                    Existing Document
                  </p>

                  <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                    {existingFileName || "Uploaded document"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenExistingFile}
                disabled={disabled}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                View
              </button>
            </div>

            <p className="mt-3 text-xs text-blue-600">
              Select a new file below if you want to replace the existing
              document.
            </p>
          </div>
        )}

        {/* ================================================== */}
        {/* DROP ZONE */}
        {/* ================================================== */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "relative rounded-xl border-2 border-dashed p-6 text-center transition",

            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50/50",

            displayError ? "border-red-300 bg-red-50/30" : "",

            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/30",
          ].join(" ")}
          onClick={handleBrowse}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();

              handleBrowse();
            }
          }}
          aria-disabled={disabled}
        >
          {/* ================================================= */}
          {/* HIDDEN INPUT */}
          {/* ================================================= */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          {/* ================================================= */}
          {/* ICON */}
          {/* ================================================= */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
            <Upload className="h-7 w-7" aria-hidden="true" />
          </div>

          {/* ================================================= */}
          {/* TEXT */}
          {/* ================================================= */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-800">
              {isDragging
                ? "Drop your document here"
                : "Drag & drop your document here"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              or <span className="font-medium text-blue-600">browse files</span>
            </p>
          </div>

          {/* ================================================= */}
          {/* FILE RULES */}
          {/* ================================================= */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>PDF, JPG, PNG, WEBP</span>

            <span aria-hidden="true">•</span>

            <span>Maximum 10 MB</span>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}
        {displayError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />

            <span>{displayError}</span>
          </div>
        )}

        {/* ================================================== */}
        {/* SELECTED FILE */}
        {/* ================================================== */}
        {file && (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Selected File
                </p>

                <p className="text-xs text-gray-500">
                  This file will be uploaded to Cloudinary.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={disabled}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                title="Remove selected file"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* ============================================== */}
            {/* FILE DETAILS */}
            {/* ============================================== */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                {file.type === "application/pdf" ? (
                  <FileText className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <FileImage className="h-5 w-5" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {file.name}
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                  {" • "}
                  {file.type || "Unknown type"}
                </p>
              </div>
            </div>

            {/* ============================================== */}
            {/* PREVIEW */}
            {/* ============================================== */}
            {previewUrl && (
              <div className="border-t border-gray-100 bg-gray-50 p-3">
                {file.type.startsWith("image/") ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={previewUrl}
                      alt="Selected document preview"
                      className="max-h-80 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FileText className="h-6 w-6" aria-hidden="true" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      PDF document selected
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(previewUrl, "_blank", "noopener,noreferrer")
                      }
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Preview PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* SECURITY NOTE */}
        {/* ================================================== */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <FileText
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />

            <p className="text-xs leading-5 text-gray-500">
              Your document is uploaded securely through the backend to
              Cloudinary. Cloudinary credentials are never exposed to the
              browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentUploadSection;
