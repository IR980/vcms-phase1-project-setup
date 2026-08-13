import { type FormEvent, useEffect, useState } from "react";

import {
  type CreateDocumentFormData,
  type Document,
  type DocumentFormErrors,
  type DocumentOwnerType,
  type DocumentType,
  type UpdateDocumentFormData,
  DEFAULT_DOCUMENT_FORM_DATA,
} from "../../../types/document.types";

import DocumentInfoSection, {
  type DocumentRelationOption,
} from "./DocumentInfoSection";

import DocumentUploadSection from "./DocumentUploadSection";

import DocumentFormActions from "./DocumentFormActions";

/**
 * ============================================================
 * FORM STATE
 * ============================================================
 */
interface DocumentFormState {
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
interface DocumentFormProps {
  /**
   * Existing document.
   *
   * null / undefined = CREATE mode
   * document = EDIT mode
   */
  document?: Document | null;

  /**
   * Create / Update submit handler.
   */
  onSubmit: (
    data: CreateDocumentFormData | UpdateDocumentFormData,
  ) => Promise<void>;

  /**
   * Cancel handler.
   */
  onCancel: () => void;

  /**
   * Submit/loading state.
   */
  isSubmitting?: boolean;

  /**
   * Backend/server error.
   */
  serverError?: string | null;

  /**
   * ========================================================
   * COMPANY OPTIONS
   * ========================================================
   *
   * value = MongoDB ObjectId
   * label = company business ID/name
   */
  companies?: DocumentRelationOption[];

  /**
   * ========================================================
   * VEHICLE OPTIONS
   * ========================================================
   *
   * value = MongoDB ObjectId
   * label = vehicle number
   */
  vehicles?: DocumentRelationOption[];

  /**
   * ========================================================
   * DRIVER OPTIONS
   * ========================================================
   *
   * value = MongoDB ObjectId
   * label = driver name/employee ID
   */
  drivers?: DocumentRelationOption[];

  /**
   * Loading states.
   */
  isLoadingCompanies?: boolean;

  isLoadingVehicles?: boolean;

  isLoadingDrivers?: boolean;
}

/**
 * ============================================================
 * MONGODB OBJECT ID
 * ============================================================
 *
 * Backend Zod validation expects a 24-character
 * hexadecimal MongoDB ObjectId.
 */
const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * ============================================================
 * FILE CONFIGURATION
 * ============================================================
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * ============================================================
 * INITIAL FORM DATA
 * ============================================================
 */
const getInitialFormData = (document?: Document | null): DocumentFormState => {
  /**
   * ========================================================
   * CREATE MODE
   * ========================================================
   */
  if (!document) {
    return {
      ...DEFAULT_DOCUMENT_FORM_DATA,

      companyId: "",

      vehicleId: "",

      driverId: "",

      documentNumber: "",

      issueDate: "",

      expiryDate: "",

      issuingAuthority: "",

      notes: "",

      file: null,
    };
  }

  /**
   * ========================================================
   * EDIT MODE
   * ========================================================
   */
  return {
    companyId: document.companyId ?? "",

    documentType: document.documentType,

    ownerType: document.ownerType,

    vehicleId: document.vehicleId ?? "",

    driverId: document.driverId ?? "",

    documentNumber: document.documentNumber ?? "",

    issueDate: document.issueDate ? document.issueDate.slice(0, 10) : "",

    expiryDate: document.expiryDate ? document.expiryDate.slice(0, 10) : "",

    issuingAuthority: document.issuingAuthority ?? "",

    notes: document.notes ?? "",

    /**
     * Existing Cloudinary file is not loaded
     * into browser File state.
     */
    file: null,
  };
};

/**
 * ============================================================
 * VALIDATE MONGODB OBJECT ID
 * ============================================================
 */
const isValidObjectId = (value: string): boolean => {
  return MONGO_OBJECT_ID_REGEX.test(value.trim());
};

/**
 * ============================================================
 * FORM VALIDATION
 * ============================================================
 */
const validateForm = (
  formData: DocumentFormState,
  isEditMode: boolean,
): DocumentFormErrors => {
  const errors: DocumentFormErrors = {};

  /**
   * ========================================================
   * COMPANY
   * ========================================================
   */
  if (!formData.companyId.trim()) {
    errors.companyId = "Company is required.";
  } else if (!isValidObjectId(formData.companyId)) {
    errors.companyId = "Please select a valid company.";
  }

  /**
   * ========================================================
   * DOCUMENT TYPE
   * ========================================================
   */
  if (!formData.documentType) {
    errors.documentType = "Document type is required.";
  }

  /**
   * ========================================================
   * OWNER TYPE
   * ========================================================
   */
  if (!formData.ownerType) {
    errors.ownerType = "Document owner is required.";
  }

  /**
   * ========================================================
   * VEHICLE
   * ========================================================
   */
  if (formData.ownerType === "vehicle") {
    if (!formData.vehicleId.trim()) {
      errors.vehicleId = "Vehicle is required.";
    } else if (!isValidObjectId(formData.vehicleId)) {
      errors.vehicleId = "Please select a valid vehicle.";
    }
  }

  /**
   * ========================================================
   * DRIVER
   * ========================================================
   */
  if (formData.ownerType === "driver") {
    if (!formData.driverId.trim()) {
      errors.driverId = "Driver is required.";
    } else if (!isValidObjectId(formData.driverId)) {
      errors.driverId = "Please select a valid driver.";
    }
  }

  /**
   * ========================================================
   * DOCUMENT NUMBER
   * ========================================================
   */
  if (formData.documentNumber.trim().length > 100) {
    errors.documentNumber = "Document number cannot exceed 100 characters.";
  }

  /**
   * ========================================================
   * ISSUE DATE
   * ========================================================
   */
  if (formData.issueDate) {
    const issueDate = new Date(formData.issueDate);

    if (Number.isNaN(issueDate.getTime())) {
      errors.issueDate = "Enter a valid issue date.";
    }
  }

  /**
 * ----------------------------------------------------------
 * Expiry Date
 * ----------------------------------------------------------
 *
 * IMPORTANT:
 *
 * Expiry date is now OPTIONAL on frontend.
 *
 * OCR will attempt to read the expiry date automatically
 * from the uploaded document.
 *
 * Manual expiry date can still be entered as a fallback.
 */
if (formData.expiryDate) {
  const expiryDate =
    new Date(formData.expiryDate);

  if (
    Number.isNaN(
      expiryDate.getTime(),
    )
  ) {
    errors.expiryDate =
      "Enter a valid expiry date.";
  }
}

  /**
 * ----------------------------------------------------------
 * Issue vs Expiry
 * ----------------------------------------------------------
 *
 * Compare only when both dates are available.
 *
 * If expiryDate is empty, OCR will provide it.
 */
if (
  formData.issueDate &&
  formData.expiryDate
) {
  const issueDate =
    new Date(
      formData.issueDate,
    );

  const expiryDate =
    new Date(
      formData.expiryDate,
    );

  if (
    !Number.isNaN(
      issueDate.getTime(),
    ) &&
    !Number.isNaN(
      expiryDate.getTime(),
    ) &&
    expiryDate < issueDate
  ) {
    errors.expiryDate =
      "Expiry date must be after the issue date.";
  }
}

  /**
   * ========================================================
   * ISSUING AUTHORITY
   * ========================================================
   */
  if (formData.issuingAuthority.trim().length > 150) {
    errors.issuingAuthority = "Issuing authority cannot exceed 150 characters.";
  }

  /**
   * ========================================================
   * NOTES
   * ========================================================
   */
  if (formData.notes.trim().length > 1000) {
    errors.notes = "Notes cannot exceed 1000 characters.";
  }

  /**
   * ========================================================
   * FILE
   * ========================================================
   *
   * CREATE:
   *   File required.
   *
   * EDIT:
   *   File optional because existing Cloudinary
   *   file can remain unchanged.
   */
  if (!isEditMode && !formData.file) {
    errors.file = "Please select a document file.";
  }

  /**
   * ========================================================
   * FILE SIZE / TYPE
   * ========================================================
   */
  if (formData.file) {
    if (formData.file.size > MAX_FILE_SIZE) {
      errors.file = "File size cannot exceed 10 MB.";
    }

    if (!ALLOWED_FILE_TYPES.includes(formData.file.type)) {
      errors.file = "Only PDF, JPG, PNG and WEBP files are allowed.";
    }
  }

  return errors;
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentForm = ({
  document,

  onSubmit,

  onCancel,

  isSubmitting = false,

  serverError = null,

  companies = [],

  vehicles = [],

  drivers = [],

  isLoadingCompanies = false,

  isLoadingVehicles = false,

  isLoadingDrivers = false,
}: DocumentFormProps) => {
  /**
   * ==========================================================
   * MODE
   * ==========================================================
   */
  const isEditMode = Boolean(document);

  /**
   * ==========================================================
   * FORM STATE
   * ==========================================================
   */
  const [formData, setFormData] = useState<DocumentFormState>(() =>
    getInitialFormData(document),
  );

  /**
   * ==========================================================
   * VALIDATION ERRORS
   * ==========================================================
   */
  const [errors, setErrors] = useState<DocumentFormErrors>({});

  /**
   * ==========================================================
   * RESET WHEN DOCUMENT CHANGES
   * ==========================================================
   */
  useEffect(() => {
    setFormData(getInitialFormData(document));

    setErrors({});
  }, [document]);

  /**
   * ==========================================================
   * GENERIC FIELD UPDATE
   * ==========================================================
   */
  const updateField = <K extends keyof DocumentFormState>(
    field: K,
    value: DocumentFormState[K],
  ) => {
    setFormData((previous) => ({
      ...previous,

      [field]: value,
    }));

    /**
     * Remove field-specific error.
     */
    setErrors((previous) => ({
      ...previous,

      [field]: undefined,
    }));
  };

  /**
   * ==========================================================
   * COMPANY CHANGE
   * ==========================================================
   *
   * When company changes:
   *
   * companyId -> new company
   * vehicleId -> clear
   * driverId  -> clear
   *
   * This prevents selecting a vehicle/driver belonging
   * to another company.
   */
  const handleCompanyChange = (companyId: string) => {
    setFormData((previous) => ({
      ...previous,

      companyId,

      vehicleId: "",

      driverId: "",
    }));

    setErrors((previous) => ({
      ...previous,

      companyId: undefined,

      vehicleId: undefined,

      driverId: undefined,
    }));
  };

  /**
   * ==========================================================
   * OWNER TYPE CHANGE
   * ==========================================================
   *
   * Vehicle:
   *   vehicleId exists
   *   driverId empty
   *
   * Driver:
   *   driverId exists
   *   vehicleId empty
   */
  const handleOwnerTypeChange = (ownerType: DocumentOwnerType) => {
    setFormData((previous) => ({
      ...previous,

      ownerType,

      vehicleId: ownerType === "vehicle" ? previous.vehicleId : "",

      driverId: ownerType === "driver" ? previous.driverId : "",
    }));

    setErrors((previous) => ({
      ...previous,

      ownerType: undefined,

      vehicleId: undefined,

      driverId: undefined,
    }));
  };

  /**
   * ==========================================================
   * FILE CHANGE
   * ==========================================================
   */
  const handleFileChange = (file: File | null) => {
    updateField("file", file);
  };

  /**
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /**
     * Prevent duplicate submission.
     */
    if (isSubmitting) {
      return;
    }

    /**
     * ======================================================
     * VALIDATE
     * ======================================================
     */
    const validationErrors = validateForm(formData, isEditMode);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    /**
     * ======================================================
     * CREATE MODE
     * ======================================================
     */
    if (!isEditMode) {
      /**
       * Extra safety.
       */
      if (!formData.file) {
        setErrors({
          file: "Please select a document file.",
        });

        return;
      }

      const createData: CreateDocumentFormData = {
        companyId: formData.companyId.trim(),

        documentType: formData.documentType,

        ownerType: formData.ownerType,

        documentNumber: formData.documentNumber.trim() || undefined,

        issueDate: formData.issueDate.trim(),

        expiryDate: formData.expiryDate.trim(),

        issuingAuthority: formData.issuingAuthority.trim() || undefined,

        notes: formData.notes.trim() || undefined,

        file: formData.file,

        /**
         * ------------------------------------------------
         * Vehicle document
         * ------------------------------------------------
         */
        ...(formData.ownerType === "vehicle"
          ? {
              vehicleId: formData.vehicleId.trim(),
            }
          : {}),

        /**
         * ------------------------------------------------
         * Driver document
         * ------------------------------------------------
         */
        ...(formData.ownerType === "driver"
          ? {
              driverId: formData.driverId.trim(),
            }
          : {}),
      };

      await onSubmit(createData);

      return;
    }

    /**
     * ======================================================
     * EDIT MODE
     * ======================================================
     *
     * companyId is intentionally NOT included here
     * unless your UpdateDocumentFormData explicitly
     * supports it.
     */
    const updateData: UpdateDocumentFormData = {
      documentType: formData.documentType,

      ownerType: formData.ownerType,

      documentNumber: formData.documentNumber.trim(),

      issueDate: formData.issueDate ?? "",

      expiryDate: formData.expiryDate ?? "",

      issuingAuthority: formData.issuingAuthority.trim(),

      notes: formData.notes.trim(),

      /**
       * New file is optional during edit.
       */
      file: formData.file ?? undefined,

      /**
       * Vehicle relation.
       */
      ...(formData.ownerType === "vehicle"
        ? {
            vehicleId: formData.vehicleId.trim(),
          }
        : {}),

      /**
       * Driver relation.
       */
      ...(formData.ownerType === "driver"
        ? {
            driverId: formData.driverId.trim(),
          }
        : {}),
    };

    await onSubmit(updateData);
  };

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ==================================================== */}
      {/* SERVER ERROR */}
      {/* ==================================================== */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* ==================================================== */}
      {/* DOCUMENT INFORMATION */}
      {/* ==================================================== */}
      <DocumentInfoSection
        formData={formData}
        errors={errors}
        onChange={updateField}
        onCompanyChange={handleCompanyChange}
        onOwnerTypeChange={handleOwnerTypeChange}
        companies={companies}
        vehicles={vehicles}
        drivers={drivers}
        isLoadingCompanies={isLoadingCompanies}
        isLoadingVehicles={isLoadingVehicles}
        isLoadingDrivers={isLoadingDrivers}
      />

      {/* ==================================================== */}
      {/* DOCUMENT FILE UPLOAD */}
      {/* ==================================================== */}
      <DocumentUploadSection
        file={formData.file}
        existingFileUrl={document?.fileUrl}
        existingFileName={document?.originalFileName}
        error={errors.file}
        onFileChange={handleFileChange}
        disabled={isSubmitting}
      />

      {/* ==================================================== */}
      {/* FORM ACTIONS */}
      {/* ==================================================== */}
      <DocumentFormActions
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
};

export default DocumentForm;
