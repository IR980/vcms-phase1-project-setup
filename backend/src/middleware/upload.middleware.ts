import multer, { FileFilterCallback } from "multer";

import { Request } from "express";

/**
 * ============================================================
 * UPLOAD CONFIGURATION
 * ============================================================
 *
 * Supported document formats:
 *
 * PDF
 * JPG / JPEG
 * PNG
 * WEBP
 *
 * Maximum file size:
 *
 * 10 MB
 */

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * ============================================================
 * MULTER STORAGE
 * ============================================================
 *
 * memoryStorage() keeps the uploaded file in memory as a
 * Buffer.
 *
 * This Buffer will later be passed to:
 *
 * cloudinaryService.uploadDocument()
 *
 * No permanent local file is created.
 */
const storage = multer.memoryStorage();

/**
 * ============================================================
 * FILE FILTER
 * ============================================================
 *
 * Reject unsupported file types before the file reaches
 * the controller.
 */
const documentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  /**
   * Check MIME type.
   */
  if (
    !ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new Error(
        "Invalid file type. Only PDF, JPG, JPEG, PNG and WEBP files are allowed.",
      ),
    );
  }

  callback(null, true);
};

/**
 * ============================================================
 * MULTER INSTANCE
 * ============================================================
 */
const upload = multer({
  storage,

  limits: {
    /**
     * Maximum file size:
     * 10 MB
     */
    fileSize: MAX_DOCUMENT_FILE_SIZE,

    /**
     * Only one file should be uploaded
     * for a document request.
     */
    files: 1,
  },

  fileFilter: documentFileFilter,
});

/**
 * ============================================================
 * SINGLE DOCUMENT UPLOAD
 * ============================================================
 *
 * Frontend field name:
 *
 * file
 *
 * Example:
 *
 * formData.append("file", selectedFile);
 */
export const uploadDocument = upload.single("file");

/**
 * ============================================================
 * OPTIONAL GENERIC SINGLE IMAGE UPLOAD
 * ============================================================
 *
 * This can later be used for:
 *
 * - Driver profile photo
 * - Vehicle image
 * - Company logo
 *
 * It currently uses the same 10 MB limit.
 */
export const uploadSingle = upload.single("file");

/**
 * ============================================================
 * EXPORT MULTER INSTANCE
 * ============================================================
 *
 * Exporting the instance allows us to create other upload
 * configurations later without creating another multer
 * configuration file.
 */
export default upload;
