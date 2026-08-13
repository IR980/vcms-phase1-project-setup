import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import cloudinary from "../config/cloudinary";

/**
 * ============================================================
 * CLOUDINARY UPLOAD OPTIONS
 * ============================================================
 */
export interface CloudinaryUploadOptions {
  /**
   * Cloudinary folder.
   *
   * Example:
   *
   * vcms/documents/vehicles/puc
   */
  folder: string;

  /**
   * Optional custom public ID.
   *
   * If not provided, Cloudinary will generate one.
   */
  publicId?: string;

  /**
   * Resource type.
   *
   * auto:
   * Cloudinary determines the resource type.
   *
   * raw:
   * Used for PDFs/documents.
   *
   * image:
   * Used for JPG/PNG/WEBP.
   */
  resourceType?: "auto" | "image" | "raw" | "video";
}

/**
 * ============================================================
 * CLOUDINARY UPLOAD RESULT
 * ============================================================
 */
export interface CloudinaryUploadResult {
  /**
   * Cloudinary secure URL.
   */
  secureUrl: string;

  /**
   * Cloudinary public ID.
   */
  publicId: string;

  /**
   * Cloudinary resource type.
   */
  resourceType: string;

  /**
   * Uploaded file format.
   */
  format?: string;

  /**
   * File size in bytes.
   */
  bytes: number;

  /**
   * Original Cloudinary asset URL.
   */
  url?: string;
}

/**
 * ============================================================
 * CLOUDINARY SERVICE
 * ============================================================
 */
class CloudinaryService {
  /**
   * ==========================================================
   * UPLOAD BUFFER
   * ==========================================================
   *
   * Uploads a file buffer directly to Cloudinary.
   *
   * This is ideal for:
   *
   * multer.memoryStorage()
   *
   * Flow:
   *
   * Frontend
   *    ↓
   * Multipart/FormData
   *    ↓
   * Multer
   *    ↓
   * Buffer
   *    ↓
   * Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions,
  ): Promise<CloudinaryUploadResult> {
    /**
     * --------------------------------------------------------
     * Validate Buffer
     * --------------------------------------------------------
     */
    if (!buffer || buffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    /**
     * --------------------------------------------------------
     * Upload to Cloudinary
     * --------------------------------------------------------
     *
     * upload_stream is used because the file is already
     * available as a Buffer in memory.
     */
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,

          public_id: options.publicId,

          resource_type: options.resourceType ?? "auto",

          /**
           * Keep original filename behavior
           * controlled by public_id/folder.
           */
          use_filename: false,

          unique_filename: true,

          /**
           * Prevent accidental overwriting unless
           * the same public ID is explicitly used.
           */
          overwrite: false,
        },

        (
          error: UploadApiErrorResponse | undefined,

          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(
              new Error(error.message || "Cloudinary upload failed"),
            );
          }

          if (!result) {
            return reject(new Error("Cloudinary upload returned no result"));
          }

          resolve({
            secureUrl: result.secure_url,

            publicId: result.public_id,

            resourceType: result.resource_type,

            format: result.format,

            bytes: result.bytes,

            url: result.url,
          });
        },
      );

      /**
       * Write buffer to upload stream.
       */
      uploadStream.end(buffer);
    });
  }

  /**
   * ==========================================================
   * UPLOAD DOCUMENT
   * ==========================================================
   *
   * Specialized helper for VCMS documents.
   *
   * Folder structure:
   *
   * vcms/documents/vehicles/puc
   * vcms/documents/vehicles/rc
   * vcms/documents/drivers/driving_license
   */
  async uploadDocument(
    buffer: Buffer,
    ownerType: "vehicle" | "driver",
    documentType: string,
    publicId?: string,
  ): Promise<CloudinaryUploadResult> {
    /**
     * --------------------------------------------------------
     * Build Folder
     * --------------------------------------------------------
     */
    const folder = this.buildDocumentFolder(ownerType, documentType);

    /**
     * --------------------------------------------------------
     * Determine Resource Type
     * --------------------------------------------------------
     *
     * "auto" allows Cloudinary to determine whether
     * the uploaded asset should be treated as image/raw.
     *
     * We use auto here because the same document module
     * supports:
     *
     * PDF
     * JPG
     * PNG
     * WEBP
     */
    return this.uploadBuffer(buffer, {
      folder,

      publicId,

      resourceType: "auto",
    });
  }

  /**
   * ==========================================================
   * DELETE FILE
   * ==========================================================
   *
   * Deletes a Cloudinary asset using its public ID.
   *
   * resourceType must match the resource type used
   * during upload.
   */
  async deleteFile(
    publicId: string,
    resourceType: "image" | "raw" | "video" = "raw",
  ): Promise<void> {
    /**
     * --------------------------------------------------------
     * Validate Public ID
     * --------------------------------------------------------
     */
    if (!publicId || publicId.trim().length === 0) {
      throw new Error("Cloudinary public ID is required");
    }

    /**
     * --------------------------------------------------------
     * Delete Cloudinary Asset
     * --------------------------------------------------------
     */
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,

      /**
       * Invalidate cached versions of
       * the deleted asset.
       */
      invalidate: true,
    });

    /**
     * --------------------------------------------------------
     * Validate Delete Result
     * --------------------------------------------------------
     */
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }
  }

  /**
   * ==========================================================
   * DELETE DOCUMENT
   * ==========================================================
   *
   * Specialized document deletion helper.
   */
  async deleteDocument(publicId: string, resourceType?: string): Promise<void> {
    /**
     * Cloudinary documents may be stored as:
     *
     * raw
     * image
     *
     * Therefore use the stored resource type whenever
     * it is available.
     */
    const normalizedResourceType = this.normalizeResourceType(resourceType);

    await this.deleteFile(publicId, normalizedResourceType);
  }

  /**
   * ==========================================================
   * BUILD DOCUMENT FOLDER
   * ==========================================================
   */
  private buildDocumentFolder(
    ownerType: "vehicle" | "driver",
    documentType: string,
  ): string {
    /**
     * Normalize values to prevent malformed
     * Cloudinary folder names.
     */
    const normalizedOwner = ownerType.trim().toLowerCase();

    const normalizedDocumentType = documentType
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    return `vcms/documents/${normalizedOwner}s/${normalizedDocumentType}`;
  }

  /**
   * ==========================================================
   * NORMALIZE RESOURCE TYPE
   * ==========================================================
   */
  private normalizeResourceType(
    resourceType?: string,
  ): "image" | "raw" | "video" {
    if (resourceType === "image") {
      return "image";
    }

    if (resourceType === "video") {
      return "video";
    }

    /**
     * Default document resource type.
     */
    return "raw";
  }
}

/**
 * ============================================================
 * SERVICE INSTANCE
 * ============================================================
 */
export const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
