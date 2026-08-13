import {
  CalendarDays,
  FileText,
  Building2,
  Car,
  UserRound,
  Hash,
  Landmark,
} from "lucide-react";

import {
  type DocumentFormErrors,
  type DocumentType,
  type DocumentOwnerType,
  DOCUMENT_TYPE_LABELS,
} from "../../../types/document.types";

/**
 * ============================================================
 * SELECT OPTION
 * ============================================================
 *
 * label:
 *   User ko visible value.
 *
 * value:
 *   Actual MongoDB ObjectId.
 *
 * Example:
 *
 * {
 *   value: "68a123456789012345678901",
 *   label: "C-001",
 *   description: "Chandra Enterprises"
 * }
 */
export interface DocumentRelationOption {
  value: string;

  label: string;

  description?: string;
}

/**
 * ============================================================
 * FORM DATA TYPE
 * ============================================================
 */
interface DocumentInfoFormData {
  companyId: string;

  documentType: DocumentType;

  ownerType: DocumentOwnerType;

  vehicleId: string;

  driverId: string;

  documentNumber: string;

  issueDate: string;

  expiryDate: string;

  issuingAuthority: string;

  notes: string;

  file: File | null;
}

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentInfoSectionProps {
  formData: DocumentInfoFormData;

  errors: DocumentFormErrors;

  /**
   * Generic field update.
   */
  onChange: <K extends keyof DocumentInfoFormData>(
    field: K,
    value: DocumentInfoFormData[K],
  ) => void;

  /**
   * Company change handler.
   *
   * DocumentForm uses this to clear:
   *
   * vehicleId
   * driverId
   *
   * when company changes.
   */
  onCompanyChange: (companyId: string) => void;

  /**
   * Owner type change handler.
   *
   * DocumentForm uses this to clear the
   * opposite relation ID.
   */
  onOwnerTypeChange: (ownerType: DocumentOwnerType) => void;

  /**
   * ----------------------------------------------------------
   * Company options
   * ----------------------------------------------------------
   *
   * value = MongoDB ObjectId
   * label = company business ID
   */
  companies: DocumentRelationOption[];

  /**
   * ----------------------------------------------------------
   * Vehicle options
   * ----------------------------------------------------------
   *
   * value = MongoDB ObjectId
   * label = vehicle number
   */
  vehicles: DocumentRelationOption[];

  /**
   * ----------------------------------------------------------
   * Driver options
   * ----------------------------------------------------------
   *
   * value = MongoDB ObjectId
   * label = driver name / employee ID
   */
  drivers: DocumentRelationOption[];

  /**
   * Optional loading states.
   */
  isLoadingCompanies?: boolean;

  isLoadingVehicles?: boolean;

  isLoadingDrivers?: boolean;
}

/**
 * ============================================================
 * DOCUMENT TYPES
 * ============================================================
 */
const DOCUMENT_TYPES: DocumentType[] = [
  "rc",
  "puc",
  "fitness",
  "insurance",
  "permit",
  "road_tax",
  "driving_license",
  "medical_certificate",
  "other",
];

/**
 * ============================================================
 * INPUT CLASS
 * ============================================================
 */
const inputClass = (hasError: boolean): string => {
  return [
    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 outline-none transition",

    "placeholder:text-gray-400",

    "focus:ring-2",

    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
  ].join(" ");
};

/**
 * ============================================================
 * LABEL
 * ============================================================
 */
const FieldLabel = ({
  children,
  required = false,
}: {
  children: React.ReactNode;

  required?: boolean;
}) => {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

/**
 * ============================================================
 * ERROR MESSAGE
 * ============================================================
 */
const FieldError = ({ message }: { message?: string }) => {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
};

/**
 * ============================================================
 * SELECT OPTIONS
 * ============================================================
 */
const SelectOptions = ({
  options,
  placeholder,
}: {
  options: DocumentRelationOption[];

  placeholder: string;
}) => {
  return (
    <>
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
          {option.description ? ` — ${option.description}` : ""}
        </option>
      ))}
    </>
  );
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentInfoSection = ({
  formData,

  errors,

  onChange,

  onCompanyChange,

  onOwnerTypeChange,

  companies,

  vehicles,

  drivers,

  isLoadingCompanies = false,

  isLoadingVehicles = false,

  isLoadingDrivers = false,
}: DocumentInfoSectionProps) => {
  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ==================================================== */}
      {/* SECTION HEADER */}
      {/* ==================================================== */}
      <div className="border-b border-gray-200 bg-gray-50/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Document Information
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Enter the document details and link it to the correct vehicle or
              driver.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* FORM BODY */}
      {/* ==================================================== */}
      <div className="space-y-6 p-5">
        {/* ================================================== */}
        {/* OWNER INFORMATION */}
        {/* ================================================== */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" aria-hidden="true" />

            <h3 className="text-sm font-semibold text-gray-800">Ownership</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* ============================================== */}
            {/* COMPANY */}
            {/* ============================================== */}
            <div>
              <FieldLabel required>Company</FieldLabel>

              <select
                value={formData.companyId}
                onChange={(event) => onCompanyChange(event.target.value)}
                disabled={
                  isLoadingCompanies || isLoadingVehicles || isLoadingDrivers
                }
                className={inputClass(Boolean(errors.companyId))}
                aria-invalid={Boolean(errors.companyId)}
              >
                <SelectOptions
                  options={companies}
                  placeholder={
                    isLoadingCompanies
                      ? "Loading companies..."
                      : "Select company"
                  }
                />
              </select>

              <FieldError message={errors.companyId} />
            </div>

            {/* ============================================== */}
            {/* OWNER TYPE */}
            {/* ============================================== */}
            <div>
              <FieldLabel required>Document Belongs To</FieldLabel>

              <div className="grid grid-cols-2 gap-2">
                {/* ========================================== */}
                {/* VEHICLE */}
                {/* ========================================== */}
                <button
                  type="button"
                  onClick={() => onOwnerTypeChange("vehicle")}
                  disabled={
                    isLoadingCompanies ||
                    isSubmittingDisabled(isLoadingVehicles)
                  }
                  className={[
                    "flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition",

                    formData.ownerType === "vehicle"
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                  aria-pressed={formData.ownerType === "vehicle"}
                >
                  <Car className="h-4 w-4" aria-hidden="true" />
                  Vehicle
                </button>

                {/* ========================================== */}
                {/* DRIVER */}
                {/* ========================================== */}
                <button
                  type="button"
                  onClick={() => onOwnerTypeChange("driver")}
                  disabled={isLoadingCompanies || isLoadingDrivers}
                  className={[
                    "flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition",

                    formData.ownerType === "driver"
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                  aria-pressed={formData.ownerType === "driver"}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Driver
                </button>
              </div>

              <FieldError message={errors.ownerType} />
            </div>

            {/* ============================================== */}
            {/* VEHICLE */}
            {/* ============================================== */}
            {formData.ownerType === "vehicle" && (
              <div>
                <FieldLabel required>Vehicle</FieldLabel>

                <div className="relative">
                  <Car
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                  <select
                    value={formData.vehicleId}
                    onChange={(event) =>
                      onChange("vehicleId", event.target.value)
                    }
                    disabled={isLoadingVehicles || !formData.companyId}
                    className={`${inputClass(Boolean(errors.vehicleId))} pl-9`}
                    aria-invalid={Boolean(errors.vehicleId)}
                  >
                    <SelectOptions
                      options={vehicles}
                      placeholder={
                        !formData.companyId
                          ? "Select company first"
                          : isLoadingVehicles
                            ? "Loading vehicles..."
                            : vehicles.length === 0
                              ? "No vehicles available"
                              : "Select vehicle"
                      }
                    />
                  </select>
                </div>

                <FieldError message={errors.vehicleId} />
              </div>
            )}

            {/* ============================================== */}
            {/* DRIVER */}
            {/* ============================================== */}
            {formData.ownerType === "driver" && (
              <div>
                <FieldLabel required>Driver</FieldLabel>

                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />

                  <select
                    value={formData.driverId}
                    onChange={(event) =>
                      onChange("driverId", event.target.value)
                    }
                    disabled={isLoadingDrivers || !formData.companyId}
                    className={`${inputClass(Boolean(errors.driverId))} pl-9`}
                    aria-invalid={Boolean(errors.driverId)}
                  >
                    <SelectOptions
                      options={drivers}
                      placeholder={
                        !formData.companyId
                          ? "Select company first"
                          : isLoadingDrivers
                            ? "Loading drivers..."
                            : drivers.length === 0
                              ? "No drivers available"
                              : "Select driver"
                      }
                    />
                  </select>
                </div>

                <FieldError message={errors.driverId} />
              </div>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* DOCUMENT DETAILS */}
        {/* ================================================== */}
        <div className="border-t border-gray-100 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />

            <h3 className="text-sm font-semibold text-gray-800">
              Document Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* ============================================== */}
            {/* DOCUMENT TYPE */}
            {/* ============================================== */}
            <div>
              <FieldLabel required>Document Type</FieldLabel>

              <select
                value={formData.documentType}
                onChange={(event) =>
                  onChange("documentType", event.target.value as DocumentType)
                }
                className={inputClass(Boolean(errors.documentType))}
                aria-invalid={Boolean(errors.documentType)}
              >
                <option value="">Select document type</option>

                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>

              <FieldError message={errors.documentType} />
            </div>

            {/* ============================================== */}
            {/* DOCUMENT NUMBER */}
            {/* ============================================== */}
            <div>
              <FieldLabel>Document Number</FieldLabel>

              <div className="relative">
                <Hash
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(event) =>
                    onChange("documentNumber", event.target.value)
                  }
                  placeholder="e.g. PUC123456789"
                  className={`${inputClass(
                    Boolean(errors.documentNumber),
                  )} pl-9`}
                  aria-invalid={Boolean(errors.documentNumber)}
                />
              </div>

              <FieldError message={errors.documentNumber} />
            </div>

            {/* ============================================== */}
            {/* ISSUE DATE */}
            {/* ============================================== */}
            <div>
              <FieldLabel>Issue Date</FieldLabel>

              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(event) =>
                    onChange("issueDate", event.target.value)
                  }
                  className={`${inputClass(Boolean(errors.issueDate))} pl-9`}
                  aria-invalid={Boolean(errors.issueDate)}
                />
              </div>

              <FieldError message={errors.issueDate} />
            </div>

            {/* ============================================== */}
            {/* EXPIRY DATE */}
            {/* ============================================== */}
            <div>
              <FieldLabel>Expiry Date</FieldLabel>

              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(event) =>
                    onChange("expiryDate", event.target.value)
                  }
                  className={`${inputClass(Boolean(errors.expiryDate))} pl-9`}
                  aria-invalid={Boolean(errors.expiryDate)}
                  min={formData.issueDate || undefined}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Leave blank to let OCR detect the expiry date automatically.
                </p>
              </div>

              <FieldError message={errors.expiryDate} />
            </div>

            {/* ============================================== */}
            {/* ISSUING AUTHORITY */}
            {/* ============================================== */}
            <div className="md:col-span-2">
              <FieldLabel>Issuing Authority</FieldLabel>

              <div className="relative">
                <Landmark
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  value={formData.issuingAuthority}
                  onChange={(event) =>
                    onChange("issuingAuthority", event.target.value)
                  }
                  placeholder="e.g. Regional Transport Office"
                  className={`${inputClass(
                    Boolean(errors.issuingAuthority),
                  )} pl-9`}
                  aria-invalid={Boolean(errors.issuingAuthority)}
                />
              </div>

              <FieldError message={errors.issuingAuthority} />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* NOTES */}
        {/* ================================================== */}
        <div className="border-t border-gray-100 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />

            <h3 className="text-sm font-semibold text-gray-800">
              Additional Information
            </h3>
          </div>

          <div>
            <FieldLabel>Notes</FieldLabel>

            <textarea
              value={formData.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Add any additional information about this document..."
              className={[
                "w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition",

                "placeholder:text-gray-400",

                errors.notes
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              ].join(" ")}
              aria-invalid={Boolean(errors.notes)}
            />

            <div className="mt-1.5 flex items-center justify-between">
              <FieldError message={errors.notes} />

              <span className="ml-auto text-xs text-gray-400">
                {formData.notes.length}
                /1000
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * ============================================================
 * SMALL HELPER
 * ============================================================
 *
 * Keeps button disabled expression readable.
 */
const isSubmittingDisabled = (value: boolean): boolean => {
  return value;
};

export default DocumentInfoSection;
