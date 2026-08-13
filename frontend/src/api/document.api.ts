import api from "./api";

import type {
  CreateDocumentFormData,
  UpdateDocumentFormData,
  DocumentQueryParams,
  DocumentListApiResponse,
  DocumentSingleApiResponse,
  DeleteDocumentApiResponse,
} from "../types/document.types";

/**
 * ============================================================
 * DOCUMENT API
 * ============================================================
 *
 * Backend:
 *
 * /api/v1/documents
 *
 * Supported operations:
 *
 * POST   /documents
 * GET    /documents
 * GET    /documents/:id
 * PATCH  /documents/:id
 * DELETE /documents/:id
 */

/**
 * ============================================================
 * DOCUMENT API SERVICE
 * ============================================================
 */
const documentApi = {
  /**
   * ==========================================================
   * CREATE DOCUMENT
   * ==========================================================
   *
   * POST /documents
   *
   * Content-Type:
   *
   * multipart/form-data
   *
   * File field:
   *
   * file
   */
  createDocument: async (
    data: CreateDocumentFormData,
  ): Promise<DocumentSingleApiResponse> => {
    const formData = new FormData();

    /**
     * --------------------------------------------------------
     * Company
     * --------------------------------------------------------
     */
    formData.append("companyId", data.companyId);

    /**
     * --------------------------------------------------------
     * Document Type
     * --------------------------------------------------------
     */
    formData.append("documentType", data.documentType);

    /**
     * --------------------------------------------------------
     * Owner Type
     * --------------------------------------------------------
     */
    formData.append("ownerType", data.ownerType);

    /**
     * --------------------------------------------------------
     * Vehicle
     * --------------------------------------------------------
     */
    if (data.vehicleId && data.vehicleId.trim()) {
      formData.append("vehicleId", data.vehicleId);
    }

    /**
     * --------------------------------------------------------
     * Driver
     * --------------------------------------------------------
     */
    if (data.driverId && data.driverId.trim()) {
      formData.append("driverId", data.driverId);
    }

    /**
     * --------------------------------------------------------
     * Document Number
     * --------------------------------------------------------
     */
    if (data.documentNumber && data.documentNumber.trim()) {
      formData.append("documentNumber", data.documentNumber);
    }

    /**
     * --------------------------------------------------------
     * Issue Date
     * --------------------------------------------------------
     */
    if (data.issueDate && data.issueDate.trim()) {
      formData.append("issueDate", data.issueDate);
    }

    /**
     * --------------------------------------------------------
     * Expiry Date
     * --------------------------------------------------------
     */
    if (data.expiryDate) {
      const expiryValue = data.expiryDate instanceof Date ? data.expiryDate.toISOString() : data.expiryDate;
      formData.append("expiryDate", expiryValue);
    }

    /**
     * --------------------------------------------------------
     * Issuing Authority
     * --------------------------------------------------------
     */
    if (data.issuingAuthority && data.issuingAuthority.trim()) {
      formData.append("issuingAuthority", data.issuingAuthority);
    }

    /**
     * --------------------------------------------------------
     * Notes
     * --------------------------------------------------------
     */
    if (data.notes && data.notes.trim()) {
      formData.append("notes", data.notes);
    }

    /**
     * --------------------------------------------------------
     * FILE
     * --------------------------------------------------------
     *
     * Backend:
     *
     * upload.single("file")
     *
     * Therefore the field name MUST be "file".
     */
    if (!data.file) {
      throw new Error("Document file is required");
    }

    formData.append("file", data.file);

    /**
     * --------------------------------------------------------
     * API REQUEST
     * --------------------------------------------------------
     *
     * Do NOT manually set:
     *
     * Content-Type: multipart/form-data
     *
     * Axios/browser automatically adds the multipart
     * boundary.
     */
    const response = await api.post<DocumentSingleApiResponse>(
      "/documents",
      formData,
    );

    return response.data;
  },

  /**
   * ==========================================================
   * GET DOCUMENTS
   * ==========================================================
   *
   * GET /documents
   */
  getDocuments: async (
    params?: DocumentQueryParams,
  ): Promise<DocumentListApiResponse> => {
    const response = await api.get<DocumentListApiResponse>("/documents", {
      params,
    });

    return response.data;
  },

  /**
   * ==========================================================
   * GET DOCUMENT BY ID
   * ==========================================================
   *
   * GET /documents/:id
   */
  getDocumentById: async (id: string): Promise<DocumentSingleApiResponse> => {
    const response = await api.get<DocumentSingleApiResponse>(
      `/documents/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================================
   * UPDATE DOCUMENT
   * ==========================================================
   *
   * PATCH /documents/:id
   *
   * Supports:
   *
   * 1. Metadata update
   *
   * 2. Metadata + replacement file
   */
  updateDocument: async (
    id: string,
    data: UpdateDocumentFormData,
  ): Promise<DocumentSingleApiResponse> => {
    const formData = new FormData();

    /**
     * --------------------------------------------------------
     * Document Type
     * --------------------------------------------------------
     */
    if (data.documentType) {
      formData.append("documentType", data.documentType);
    }

    /**
     * --------------------------------------------------------
     * Owner Type
     * --------------------------------------------------------
     */
    if (data.ownerType) {
      formData.append("ownerType", data.ownerType);
    }

    /**
     * --------------------------------------------------------
     * Vehicle
     * --------------------------------------------------------
     */
    if (data.vehicleId && data.vehicleId.trim()) {
      formData.append("vehicleId", data.vehicleId);
    }

    /**
     * --------------------------------------------------------
     * Driver
     * --------------------------------------------------------
     */
    if (data.driverId && data.driverId.trim()) {
      formData.append("driverId", data.driverId);
    }

    /**
     * --------------------------------------------------------
     * Document Number
     * --------------------------------------------------------
     */
    if (data.documentNumber && data.documentNumber.trim()) {
      formData.append("documentNumber", data.documentNumber);
    }

    /**
     * --------------------------------------------------------
     * Issue Date
     * --------------------------------------------------------
     */
    if (data.issueDate && data.issueDate.trim()) {
      formData.append("issueDate", data.issueDate);
    }

    /**
     * --------------------------------------------------------
     * Expiry Date
     * --------------------------------------------------------
     */
    if (data.expiryDate && data.expiryDate.trim()) {
      formData.append("expiryDate", data.expiryDate);
    }

    /**
     * --------------------------------------------------------
     * Issuing Authority
     * --------------------------------------------------------
     */
    if (data.issuingAuthority && data.issuingAuthority.trim()) {
      formData.append("issuingAuthority", data.issuingAuthority);
    }

    /**
     * --------------------------------------------------------
     * Verification Status
     * --------------------------------------------------------
     */
    if (data.verificationStatus) {
      formData.append("verificationStatus", data.verificationStatus);
    }

    /**
     * --------------------------------------------------------
     * Notes
     * --------------------------------------------------------
     */
    if (data.notes && data.notes.trim()) {
      formData.append("notes", data.notes);
    }

    /**
     * --------------------------------------------------------
     * Replacement File
     * --------------------------------------------------------
     */
    if (data.file) {
      formData.append("file", data.file);
    }

    /**
     * --------------------------------------------------------
     * API REQUEST
     * --------------------------------------------------------
     */
    const response = await api.patch<DocumentSingleApiResponse>(
      `/documents/${id}`,
      formData,
    );

    return response.data;
  },

  /**
   * ==========================================================
   * DELETE DOCUMENT
   * ==========================================================
   *
   * DELETE /documents/:id
   */
  deleteDocument: async (id: string): Promise<DeleteDocumentApiResponse> => {
    const response = await api.delete<DeleteDocumentApiResponse>(
      `/documents/${id}`,
    );

    return response.data;
  },
};

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */
export default documentApi;
