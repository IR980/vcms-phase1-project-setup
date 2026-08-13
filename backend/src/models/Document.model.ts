import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * ============================================================
 * DOCUMENT TYPES
 * ============================================================
 */
export enum DocumentType {
  RC = "rc",
  PUC = "puc",
  FITNESS = "fitness",
  INSURANCE = "insurance",
  PERMIT = "permit",
  ROAD_TAX = "road_tax",
  DRIVING_LICENSE = "driving_license",
  MEDICAL_CERTIFICATE = "medical_certificate",
  OTHER = "other",
}

/**
 * ============================================================
 * DOCUMENT OWNER TYPE
 * ============================================================
 */
export enum DocumentOwnerType {
  VEHICLE = "vehicle",
  DRIVER = "driver",
}

/**
 * ============================================================
 * DOCUMENT VERIFICATION STATUS
 * ============================================================
 */
export enum DocumentVerificationStatus {
  UPLOADED = "uploaded",

  PENDING_VERIFICATION = "pending_verification",

  VERIFIED = "verified",

  REJECTED = "rejected",
}

/**
 * ============================================================
 * CLOUDINARY RESOURCE TYPE
 * ============================================================
 *
 * Cloudinary generally uses:
 *
 * image → JPG / PNG / WEBP
 * raw   → PDF and other raw files
 */
export enum CloudinaryResourceType {
  IMAGE = "image",
  RAW = "raw",
}

/**
 * ============================================================
 * DOCUMENT INTERFACE
 * ============================================================
 */
export interface IDocument extends Document {
  /**
   * Company owner.
   */
  companyId: Types.ObjectId;

  /**
   * Document type.
   */
  documentType: DocumentType;

  /**
   * Document belongs to vehicle or driver.
   */
  ownerType: DocumentOwnerType;

  /**
   * Vehicle reference.
   */
  vehicleId?: Types.ObjectId;

  /**
   * Driver reference.
   */
  driverId?: Types.ObjectId;

  /**
   * Document number.
   */
  documentNumber?: string;

  /**
   * Issue date.
   */
  issueDate?: Date;

  /**
   * Expiry date.
   *
   * Critical field for VCMS compliance monitoring.
   */
  expiryDate?: Date;

  /**
   * Issuing authority.
   */
  issuingAuthority?: string;

  /**
   * ========================================================
   * FILE INFORMATION
   * ========================================================
   */

  /**
   * Cloudinary secure URL.
   */
  fileUrl: string;

  /**
   * Original uploaded filename.
   */
  originalFileName: string;

  /**
   * Uploaded file MIME type.
   */
  mimeType: string;

  /**
   * File size in bytes.
   */
  fileSize: number;

  /**
   * ========================================================
   * CLOUDINARY INFORMATION
   * ========================================================
   *
   * These fields allow us to manage the Cloudinary
   * asset later.
   */

  /**
   * Cloudinary public ID.
   *
   * Example:
   *
   * vcms/documents/vehicles/puc/abc123
   */
  cloudinaryPublicId: string;

  /**
   * Cloudinary resource type.
   *
   * image
   * raw
   */
  cloudinaryResourceType: CloudinaryResourceType;

  /**
   * Cloudinary format.
   *
   * Examples:
   *
   * pdf
   * jpg
   * png
   * webp
   */
  cloudinaryFormat?: string;

  /**
   * ========================================================
   * VERIFICATION
   * ========================================================
   */

  verificationStatus: DocumentVerificationStatus;

  /**
   * OCR processed flag.
   */
  isOcrProcessed: boolean;

  /**
   * OCR extracted text.
   */
  extractedText?: string;

  /**
   * Additional notes.
   */
  notes?: string;

  /**
   * User who uploaded document.
   */
  uploadedBy?: Types.ObjectId;

  /**
   * User who verified document.
   */
  verifiedBy?: Types.ObjectId;

  /**
   * Verification timestamp.
   */
  verifiedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

/**
 * ============================================================
 * DOCUMENT SCHEMA
 * ============================================================
 */
const documentSchema = new Schema<IDocument>(
  {
    /**
     * ------------------------------------------------------
     * COMPANY
     * ------------------------------------------------------
     */
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /**
     * ------------------------------------------------------
     * DOCUMENT TYPE
     * ------------------------------------------------------
     */
    documentType: {
      type: String,

      enum: Object.values(DocumentType),

      required: true,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * OWNER TYPE
     * ------------------------------------------------------
     */
    ownerType: {
      type: String,

      enum: Object.values(DocumentOwnerType),

      required: true,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * VEHICLE
     * ------------------------------------------------------
     */
    vehicleId: {
      type: Schema.Types.ObjectId,

      ref: "Vehicle",

      index: true,
    },

    /**
     * ------------------------------------------------------
     * DRIVER
     * ------------------------------------------------------
     */
    driverId: {
      type: Schema.Types.ObjectId,

      ref: "Driver",

      index: true,
    },

    /**
     * ------------------------------------------------------
     * DOCUMENT NUMBER
     * ------------------------------------------------------
     */
    documentNumber: {
      type: String,

      trim: true,

      maxlength: 100,
    },

    /**
     * ------------------------------------------------------
     * ISSUE DATE
     * ------------------------------------------------------
     */
    issueDate: {
      type: Date,
    },

    /**
     * ------------------------------------------------------
     * EXPIRY DATE
     * ------------------------------------------------------
     *
     * Main compliance field.
     */
    expiryDate: {
      type: Date,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * ISSUING AUTHORITY
     * ------------------------------------------------------
     */
    issuingAuthority: {
      type: String,

      trim: true,

      maxlength: 150,
    },

    /**
     * ======================================================
     * FILE INFORMATION
     * ======================================================
     */

    /**
     * ------------------------------------------------------
     * CLOUDINARY SECURE URL
     * ------------------------------------------------------
     */
    fileUrl: {
      type: String,

      required: true,

      trim: true,
    },

    /**
     * ------------------------------------------------------
     * ORIGINAL FILE NAME
     * ------------------------------------------------------
     */
    originalFileName: {
      type: String,

      required: true,

      trim: true,

      maxlength: 255,
    },

    /**
     * ------------------------------------------------------
     * MIME TYPE
     * ------------------------------------------------------
     */
    mimeType: {
      type: String,

      required: true,

      enum: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    },

    /**
     * ------------------------------------------------------
     * FILE SIZE
     * ------------------------------------------------------
     */
    fileSize: {
      type: Number,

      required: true,

      min: 1,
    },

    /**
     * ======================================================
     * CLOUDINARY INFORMATION
     * ======================================================
     */

    /**
     * ------------------------------------------------------
     * CLOUDINARY PUBLIC ID
     * ------------------------------------------------------
     */
    cloudinaryPublicId: {
      type: String,

      required: true,

      trim: true,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * CLOUDINARY RESOURCE TYPE
     * ------------------------------------------------------
     */
    cloudinaryResourceType: {
      type: String,

      enum: Object.values(CloudinaryResourceType),

      required: true,

      default: CloudinaryResourceType.RAW,
    },

    /**
     * ------------------------------------------------------
     * CLOUDINARY FORMAT
     * ------------------------------------------------------
     */
    cloudinaryFormat: {
      type: String,

      trim: true,

      lowercase: true,

      maxlength: 20,
    },

    /**
     * ======================================================
     * VERIFICATION
     * ======================================================
     */

    /**
     * ------------------------------------------------------
     * VERIFICATION STATUS
     * ------------------------------------------------------
     */
    verificationStatus: {
      type: String,

      enum: Object.values(DocumentVerificationStatus),

      default: DocumentVerificationStatus.UPLOADED,

      required: true,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * OCR PROCESSED
     * ------------------------------------------------------
     */
    isOcrProcessed: {
      type: Boolean,

      default: false,

      index: true,
    },

    /**
     * ------------------------------------------------------
     * OCR EXTRACTED TEXT
     * ------------------------------------------------------
     */
    extractedText: {
      type: String,
    },

    /**
     * ------------------------------------------------------
     * NOTES
     * ------------------------------------------------------
     */
    notes: {
      type: String,

      trim: true,

      maxlength: 1000,
    },

    /**
     * ------------------------------------------------------
     * UPLOADED BY
     * ------------------------------------------------------
     */
    uploadedBy: {
      type: Schema.Types.ObjectId,

      ref: "User",
    },

    /**
     * ------------------------------------------------------
     * VERIFIED BY
     * ------------------------------------------------------
     */
    verifiedBy: {
      type: Schema.Types.ObjectId,

      ref: "User",
    },

    /**
     * ------------------------------------------------------
     * VERIFIED AT
     * ------------------------------------------------------
     */
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,

    versionKey: false,
  },
);

/**
 * ============================================================
 * DOCUMENT VALIDATION
 * ============================================================
 *
 * Vehicle document:
 *
 * ownerType = vehicle
 * vehicleId = required
 * driverId = not allowed
 *
 * Driver document:
 *
 * ownerType = driver
 * driverId = required
 * vehicleId = not allowed
 */
documentSchema.pre("validate", function (next) {
  /**
   * --------------------------------------------------------
   * Vehicle Owner
   * --------------------------------------------------------
   */
  if (this.ownerType === DocumentOwnerType.VEHICLE) {
    if (!this.vehicleId) {
      return next(new Error("vehicleId is required for vehicle documents"));
    }

    if (this.driverId) {
      return next(
        new Error("driverId must not be provided for vehicle documents"),
      );
    }
  }

  /**
   * --------------------------------------------------------
   * Driver Owner
   * --------------------------------------------------------
   */
  if (this.ownerType === DocumentOwnerType.DRIVER) {
    if (!this.driverId) {
      return next(new Error("driverId is required for driver documents"));
    }

    if (this.vehicleId) {
      return next(
        new Error("vehicleId must not be provided for driver documents"),
      );
    }
  }

  /**
   * --------------------------------------------------------
   * DATE VALIDATION
   * --------------------------------------------------------
   */
  if (this.issueDate && this.expiryDate && this.expiryDate < this.issueDate) {
    return next(new Error("Expiry date must be after issue date"));
  }

  /**
   * --------------------------------------------------------
   * VERIFIED DOCUMENT VALIDATION
   * --------------------------------------------------------
   */
  if (this.verificationStatus === DocumentVerificationStatus.VERIFIED) {
    if (!this.verifiedBy) {
      return next(new Error("verifiedBy is required for verified documents"));
    }

    if (!this.verifiedAt) {
      return next(new Error("verifiedAt is required for verified documents"));
    }
  }

  next();
});

/**
 * ============================================================
 * INDEXES
 * ============================================================
 */

/**
 * Company + expiry.
 *
 * Useful for compliance dashboard.
 */
documentSchema.index({
  companyId: 1,

  expiryDate: 1,
});

/**
 * Company + vehicle + document type.
 */
documentSchema.index({
  companyId: 1,

  vehicleId: 1,

  documentType: 1,
});

/**
 * Company + driver + document type.
 */
documentSchema.index({
  companyId: 1,

  driverId: 1,

  documentType: 1,
});

/**
 * Expiry + verification.
 */
documentSchema.index({
  expiryDate: 1,

  verificationStatus: 1,
});

/**
 * Cloudinary asset lookup.
 *
 * Useful when deleting/replacing files.
 */
documentSchema.index({
  cloudinaryPublicId: 1,
});

/**
 * ============================================================
 * MODEL
 * ============================================================
 */
const DocumentModel: Model<IDocument> = mongoose.model<IDocument>(
  "Document",
  documentSchema,
);

export default DocumentModel;
