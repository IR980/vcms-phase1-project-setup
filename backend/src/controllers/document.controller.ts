import { Request, Response } from "express";

import documentService from "../services/document.service";

import {
  CreateDocumentDto,
  DocumentQueryDto,
  UpdateDocumentDto,
} from "../types/document.dto";

/**
 * ============================================================
 * AUTHENTICATED REQUEST TYPE
 * ============================================================
 *
 * Your auth middleware may already add `user` to req.
 *
 * We keep this local type so we do not need to modify
 * Express global Request typings at this stage.
 */
// Compatible with any auth middleware user shape
interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * ============================================================
 * DOCUMENT CONTROLLER
 * ============================================================
 */
class DocumentController {
  /**
   * ==========================================================
   * CREATE DOCUMENT
   * ==========================================================
   *
   * POST /api/v1/documents
   *
   * Content-Type:
   *
   * multipart/form-data
   *
   * Expected fields:
   *
   * - companyId
   * - documentType
   * - ownerType
   * - vehicleId / driverId
   * - documentNumber
   * - issueDate
   * - expiryDate
   * - issuingAuthority
   * - notes
   *
   * File field:
   *
   * file
   */
  createDocument = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    /**
     * --------------------------------------------------------
     * 1. File validation
     * --------------------------------------------------------
     *
     * Multer should already reject unsupported files.
     *
     * We still check here so the controller never sends
     * an empty file to the service.
     */
    if (!req.file) {
      res.status(400).json({
        success: false,

        message: "Document file is required",

        data: null,
      });

      return;
    }

    /**
     * --------------------------------------------------------
     * 2. Get authenticated user
     * --------------------------------------------------------
     */
    const uploadedBy = this.getAuthenticatedUserId(req);

    /**
     * --------------------------------------------------------
     * 3. Prepare DTO
     * --------------------------------------------------------
     *
     * req.body comes from multipart/form-data.
     *
     * Multer parses the multipart request before this
     * controller executes.
     */
    const data = req.body as CreateDocumentDto;

    /**
     * --------------------------------------------------------
     * 4. Call service
     * --------------------------------------------------------
     */
    const document = await documentService.createDocument(
      data,
      req.file,
      uploadedBy,
    );

    /**
     * --------------------------------------------------------
     * 5. Response
     * --------------------------------------------------------
     */
    res.status(201).json({
      success: true,

      message: "Document uploaded successfully",

      data: document,
    });
  };

  /**
   * ==========================================================
   * GET DOCUMENTS
   * ==========================================================
   *
   * GET /api/v1/documents
   *
   * Supports:
   *
   * - pagination
   * - search
   * - company
   * - document type
   * - vehicle
   * - driver
   * - verification status
   * - expiry range
   * - expired
   * - expiringWithin
   * - sorting
   */
  getDocuments = async (req: Request, res: Response): Promise<void> => {
    /**
     * --------------------------------------------------------
     * 1. Get query
     * --------------------------------------------------------
     */
    const query = req.query as unknown as DocumentQueryDto;

    /**
     * --------------------------------------------------------
     * 2. Call service
     * --------------------------------------------------------
     */
    const result = await documentService.getDocuments(query);

    /**
     * --------------------------------------------------------
     * 3. Response
     * --------------------------------------------------------
     */
    res.status(200).json({
      success: true,

      message: "Documents fetched successfully",

      data: result,
    });
  };

  /**
   * ==========================================================
   * GET DOCUMENT BY ID
   * ==========================================================
   *
   * GET /api/v1/documents/:id
   */
  getDocumentById = async (req: Request, res: Response): Promise<void> => {
    /**
     * --------------------------------------------------------
     * 1. Get document ID
     * --------------------------------------------------------
     */
    const documentId = req.params.id;

    /**
     * --------------------------------------------------------
     * 2. Call service
     * --------------------------------------------------------
     */
    const document = await documentService.getDocumentById(documentId);

    /**
     * --------------------------------------------------------
     * 3. Response
     * --------------------------------------------------------
     */
    res.status(200).json({
      success: true,

      message: "Document fetched successfully",

      data: document,
    });
  };

  /**
   * ==========================================================
   * UPDATE DOCUMENT
   * ==========================================================
   *
   * PATCH /api/v1/documents/:id
   *
   * Can update:
   *
   * - metadata only
   *
   * OR
   *
   * - metadata + new file
   *
   * If a new file is supplied:
   *
   * old Cloudinary file
   *       ↓
   * new Cloudinary file
   *       ↓
   * MongoDB update
   */
  updateDocument = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    /**
     * --------------------------------------------------------
     * 1. Get document ID
     * --------------------------------------------------------
     */
    const documentId = req.params.id;

    /**
     * --------------------------------------------------------
     * 2. Get body
     * --------------------------------------------------------
     */
    const data = req.body as UpdateDocumentDto;

    /**
     * --------------------------------------------------------
     * 3. New file is optional
     * --------------------------------------------------------
     *
     * req.file will be undefined when only metadata
     * is being updated.
     */
    const file = req.file;

    /**
     * --------------------------------------------------------
     * 4. Call service
     * --------------------------------------------------------
     */
    const document = await documentService.updateDocument(
      documentId,
      data,
      file,
    );

    /**
     * --------------------------------------------------------
     * 5. Response
     * --------------------------------------------------------
     */
    res.status(200).json({
      success: true,

      message: file
        ? "Document updated and file replaced successfully"
        : "Document updated successfully",

      data: document,
    });
  };

  /**
   * ==========================================================
   * DELETE DOCUMENT
   * ==========================================================
   *
   * DELETE /api/v1/documents/:id
   *
   * Service handles:
   *
   * 1. Cloudinary deletion
   * 2. MongoDB deletion
   */
  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    /**
     * --------------------------------------------------------
     * 1. Get document ID
     * --------------------------------------------------------
     */
    const documentId = req.params.id;

    /**
     * --------------------------------------------------------
     * 2. Call service
     * --------------------------------------------------------
     */
    const result = await documentService.deleteDocument(documentId);

    /**
     * --------------------------------------------------------
     * 3. Response
     * --------------------------------------------------------
     */
    res.status(200).json({
      success: true,

      message: result.message,

      data: {
        documentId: result.documentId,
      },
    });
  };

  /**
   * ==========================================================
   * GET AUTHENTICATED USER ID
   * ==========================================================
   *
   * Supports both:
   *
   * req.user.id
   *
   * and:
   *
   * req.user._id
   *
   * depending on how your authentication middleware
   * currently stores the authenticated user.
   */
  private getAuthenticatedUserId(
    req: AuthenticatedRequest,
  ): string | undefined {
    if (!req.user) {
      return undefined;
    }

    return req.user.id ?? req.user._id;
  }
}

/**
 * ============================================================
 * CONTROLLER INSTANCE
 * ============================================================
 */
const documentController = new DocumentController();

export default documentController;
