/**
 * ============================================================
 * EXPIRY SERVICE
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Responsibility:
 *
 * 1. Fetch documents from MongoDB
 * 2. Calculate expiry status
 * 3. Filter documents by expiry status
 * 4. Generate expiry summaries
 * 5. Generate dashboard-ready data
 * 6. Generate reminder candidates for Phase 8
 *
 * IMPORTANT:
 *
 * This service does NOT send emails/SMS/WhatsApp.
 *
 * Notification delivery belongs to Phase 8.
 */

import { Types } from "mongoose";

import DocumentModel, {
  DocumentType,
  DocumentOwnerType,
  DocumentVerificationStatus,
} from "../models/Document.model";

import { EXPIRY_STATUS, EXPIRY_THRESHOLDS } from "../config/expiry";

import type { ExpiryStatus } from "../config/expiry";

import { calculateExpiry } from "../utils/expiry/expiryCalculator.util";

import type {
  DocumentExpiryResult,
  ExpiryDashboardResult,
  ExpiryEngineResult,
  ExpiryListOptions,
  ExpiryListResult,
  ExpiryPagination,
  ExpiryQueryFilter,
  ExpiryReminderCandidate,
  ExpiryStatusCount,
  ExpirySummary,
} from "../types/expiry.types";

import { ApiError } from "../utils/ApiError";

/**
 * ============================================================
 * EXPIRY DOCUMENT INPUT
 * ============================================================
 *
 * IMPORTANT:
 *
 * We intentionally do NOT use IDocument here.
 *
 * Mongoose `.lean()` returns a flattened/plain object type,
 * not a hydrated IDocument instance.
 *
 * Expiry calculation only needs these fields.
 */
type ExpiryDocumentInput = {
  _id: Types.ObjectId;

  companyId: Types.ObjectId;

  documentType: DocumentType;

  ownerType: DocumentOwnerType;

  vehicleId?: Types.ObjectId;

  driverId?: Types.ObjectId;

  documentNumber?: string;

  originalFileName?: string;

  expiryDate?: Date;

  verificationStatus: DocumentVerificationStatus;

  isOcrProcessed: boolean;
};

/**
 * ============================================================
 * EXPIRY SERVICE
 * ============================================================
 */
class ExpiryService {
  /**
   * ==========================================================
   * CALCULATE DOCUMENT EXPIRY
   * ==========================================================
   */
  calculateDocumentExpiry(
    document: ExpiryDocumentInput,
    referenceDate: Date = new Date(),
  ): DocumentExpiryResult | null {
    /**
     * --------------------------------------------------------
     * Document must have expiry date.
     * --------------------------------------------------------
     */
    if (!document.expiryDate) {
      return null;
    }

    /**
     * --------------------------------------------------------
     * Calculate expiry.
     * --------------------------------------------------------
     */
    const calculation = calculateExpiry(document.expiryDate, {
      referenceDate,
      useCalendarDays: true,
    });

    return {
      documentId: document._id.toString(),

      companyId: document.companyId.toString(),

      documentType: document.documentType,

      ownerType: document.ownerType,

      vehicleId: document.vehicleId ? document.vehicleId.toString() : undefined,

      driverId: document.driverId ? document.driverId.toString() : undefined,

      documentNumber: document.documentNumber,

      originalFileName: document.originalFileName,

      expiryDate: calculation.expiryDate,

      daysRemaining: calculation.daysRemaining,

      status: calculation.status,

      isExpired: calculation.isExpired,

      isExpiringSoon: calculation.isExpiringSoon,

      isCritical: calculation.isCritical,

      warningThreshold: calculation.warningThreshold,

      verificationStatus: document.verificationStatus,
    };
  }

  /**
   * ==========================================================
   * GET DOCUMENT EXPIRY BY ID
   * ==========================================================
   */
  async getDocumentExpiry(
    documentId: string,
    referenceDate: Date = new Date(),
  ): Promise<DocumentExpiryResult> {
    /**
     * --------------------------------------------------------
     * Validate ID
     * --------------------------------------------------------
     */
    if (!Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID");
    }

    /**
     * --------------------------------------------------------
     * Find document
     * --------------------------------------------------------
     *
     * Select only fields required by expiry engine.
     */
    const document = await DocumentModel.findById(documentId)
      .select(
        [
          "_id",
          "companyId",
          "documentType",
          "ownerType",
          "vehicleId",
          "driverId",
          "documentNumber",
          "originalFileName",
          "expiryDate",
          "verificationStatus",
          "isOcrProcessed",
        ].join(" "),
      )
      .lean();

    /**
     * --------------------------------------------------------
     * Not found
     * --------------------------------------------------------
     */
    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    /**
     * --------------------------------------------------------
     * Calculate
     * --------------------------------------------------------
     */
    const result = this.calculateDocumentExpiry(document, referenceDate);

    if (!result) {
      throw new ApiError(400, "Document does not have an expiry date");
    }

    return result;
  }

  /**
   * ==========================================================
   * GET EXPIRY DOCUMENTS
   * ==========================================================
   */
  async getExpiryDocuments(
    options: ExpiryListOptions = {},
  ): Promise<ExpiryListResult> {
    const page = Math.max(1, options.page ?? 1);

    const limit = Math.min(100, Math.max(1, options.limit ?? 20));

    const filter = options.filter ?? {};

    /**
     * --------------------------------------------------------
     * Build MongoDB filter
     * --------------------------------------------------------
     */
    const mongoFilter = this.buildMongoFilter(filter);

    /**
     * --------------------------------------------------------
     * Fetch documents
     * --------------------------------------------------------
     */
    const documents = await DocumentModel.find(mongoFilter)
      .sort({
        expiryDate: options.sortOrder === "desc" ? -1 : 1,
      })
      .select(
        [
          "_id",
          "companyId",
          "documentType",
          "ownerType",
          "vehicleId",
          "driverId",
          "documentNumber",
          "originalFileName",
          "expiryDate",
          "verificationStatus",
          "isOcrProcessed",
        ].join(" "),
      )
      .lean();

    /**
     * --------------------------------------------------------
     * Calculate expiry
     * --------------------------------------------------------
     */
    const expiryDocuments: DocumentExpiryResult[] = [];

    for (const document of documents) {
      const result = this.calculateDocumentExpiry(document);

      if (!result) {
        continue;
      }

      /**
       * Apply expiry-level filters.
       */
      if (!this.matchesExpiryFilter(result, filter)) {
        continue;
      }

      expiryDocuments.push(result);
    }

    /**
     * --------------------------------------------------------
     * Sort by urgency
     * --------------------------------------------------------
     */
    expiryDocuments.sort((first, second) => {
      if (first.daysRemaining !== second.daysRemaining) {
        return first.daysRemaining - second.daysRemaining;
      }

      return first.documentType.localeCompare(second.documentType);
    });

    /**
     * --------------------------------------------------------
     * Pagination
     * --------------------------------------------------------
     */
    const total = expiryDocuments.length;

    const skip = (page - 1) * limit;

    const paginatedDocuments = expiryDocuments.slice(skip, skip + limit);

    const totalPages = Math.ceil(total / limit);

    const pagination: ExpiryPagination = {
      page,

      limit,

      total,

      totalPages,

      hasNextPage: page < totalPages,

      hasPreviousPage: page > 1,
    };

    return {
      documents: paginatedDocuments,

      pagination,
    };
  }

  /**
   * ==========================================================
   * GET EXPIRED DOCUMENTS
   * ==========================================================
   */
  async getExpiredDocuments(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(EXPIRY_STATUS.EXPIRED, companyId, limit);
  }

  /**
   * ==========================================================
   * GET EXPIRING TODAY
   * ==========================================================
   */
  async getExpiringToday(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(
      EXPIRY_STATUS.EXPIRING_TODAY,
      companyId,
      limit,
    );
  }

  /**
   * ==========================================================
   * GET EXPIRING WITHIN 7 DAYS
   * ==========================================================
   */
  async getExpiringWithin7Days(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(
      EXPIRY_STATUS.EXPIRING_IN_7_DAYS,
      companyId,
      limit,
    );
  }

  /**
   * ==========================================================
   * GET EXPIRING WITHIN 15 DAYS
   * ==========================================================
   */
  async getExpiringWithin15Days(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(
      EXPIRY_STATUS.EXPIRING_IN_15_DAYS,
      companyId,
      limit,
    );
  }

  /**
   * ==========================================================
   * GET EXPIRING WITHIN 30 DAYS
   * ==========================================================
   */
  async getExpiringWithin30Days(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(
      EXPIRY_STATUS.EXPIRING_IN_30_DAYS,
      companyId,
      limit,
    );
  }

  /**
   * ==========================================================
   * GET VALID DOCUMENTS
   * ==========================================================
   */
  async getValidDocuments(
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    return this.getDocumentsByStatus(EXPIRY_STATUS.VALID, companyId, limit);
  }

  /**
   * ==========================================================
   * GET EXPIRY SUMMARY
   * ==========================================================
   */
  async getExpirySummary(companyId?: string): Promise<ExpirySummary> {
    const documents = await this.getAllExpiryDocuments(companyId);

    const total = documents.length;

    const expired = documents.filter(
      (document) => document.status === EXPIRY_STATUS.EXPIRED,
    ).length;

    const expiringToday = documents.filter(
      (document) => document.status === EXPIRY_STATUS.EXPIRING_TODAY,
    ).length;

    const expiringIn7Days = documents.filter(
      (document) => document.status === EXPIRY_STATUS.EXPIRING_IN_7_DAYS,
    ).length;

    const expiringIn15Days = documents.filter(
      (document) => document.status === EXPIRY_STATUS.EXPIRING_IN_15_DAYS,
    ).length;

    const expiringIn30Days = documents.filter(
      (document) => document.status === EXPIRY_STATUS.EXPIRING_IN_30_DAYS,
    ).length;

    const valid = documents.filter(
      (document) => document.status === EXPIRY_STATUS.VALID,
    ).length;

    return {
      total,

      expired: this.createStatusCount(expired, total),

      expiringToday: this.createStatusCount(expiringToday, total),

      expiringIn7Days: this.createStatusCount(expiringIn7Days, total),

      expiringIn15Days: this.createStatusCount(expiringIn15Days, total),

      expiringIn30Days: this.createStatusCount(expiringIn30Days, total),

      valid: this.createStatusCount(valid, total),
    };
  }

  /**
   * ==========================================================
   * GET DASHBOARD DATA
   * ==========================================================
   */
  async getExpiryDashboard(companyId?: string): Promise<ExpiryDashboardResult> {
    const documents = await this.getAllExpiryDocuments(companyId);

    const criticalDocuments = documents
      .filter((document) => document.isCritical)
      .sort((first, second) => first.daysRemaining - second.daysRemaining)
      .slice(0, 20);

    const upcomingDocuments = documents
      .filter((document) => document.isExpiringSoon && !document.isExpired)
      .sort((first, second) => first.daysRemaining - second.daysRemaining)
      .slice(0, 20);

    return {
      summary: await this.getExpirySummary(companyId),

      criticalDocuments,

      upcomingDocuments,

      calculatedAt: new Date(),
    };
  }

  /**
   * ==========================================================
   * GET REMINDER CANDIDATES
   * ==========================================================
   *
   * Phase 7 → Phase 8 bridge.
   *
   * This method does NOT send reminders.
   */
  async getReminderCandidates(
    companyId?: string,
  ): Promise<ExpiryReminderCandidate[]> {
    const documents = await this.getAllExpiryDocuments(companyId);

    const candidates: ExpiryReminderCandidate[] = [];

    for (const document of documents) {
      /**
       * Expired documents are handled separately.
       */
      if (document.isExpired) {
        continue;
      }

      /**
       * 30-day reminder.
       */
      if (document.daysRemaining === EXPIRY_THRESHOLDS.THIRTY_DAYS) {
        candidates.push(
          this.createReminderCandidate(document, EXPIRY_THRESHOLDS.THIRTY_DAYS),
        );

        continue;
      }

      /**
       * 15-day reminder.
       */
      if (document.daysRemaining === EXPIRY_THRESHOLDS.FIFTEEN_DAYS) {
        candidates.push(
          this.createReminderCandidate(
            document,
            EXPIRY_THRESHOLDS.FIFTEEN_DAYS,
          ),
        );

        continue;
      }

      /**
       * 7-day reminder.
       */
      if (document.daysRemaining === EXPIRY_THRESHOLDS.SEVEN_DAYS) {
        candidates.push(
          this.createReminderCandidate(document, EXPIRY_THRESHOLDS.SEVEN_DAYS),
        );

        continue;
      }

      /**
       * Expiry day reminder.
       */
      if (document.daysRemaining === 0) {
        candidates.push(this.createReminderCandidate(document, 0));
      }
    }

    return candidates;
  }

  /**
   * ==========================================================
   * PROCESS SINGLE DOCUMENT
   * ==========================================================
   */
  async processDocument(
    documentId: string,
    referenceDate: Date = new Date(),
  ): Promise<ExpiryEngineResult> {
    const expiry = await this.getDocumentExpiry(documentId, referenceDate);

    const warnings: string[] = [];

    /**
     * Rejected document warning.
     */
    if (expiry.verificationStatus === DocumentVerificationStatus.REJECTED) {
      warnings.push(
        "This document has been rejected and should not be considered compliant.",
      );
    }

    /**
     * OCR warning.
     */
    const document = await DocumentModel.findById(documentId)
      .select("isOcrProcessed")
      .lean();

    if (document && !document.isOcrProcessed) {
      warnings.push("OCR processing has not been completed for this document.");
    }

    return {
      success: true,

      documentId,

      expiry,

      warnings,

      calculatedAt: new Date(),
    };
  }

  /**
   * ==========================================================
   * PROCESS ALL DOCUMENTS
   * ==========================================================
   */
  async processAllDocuments(companyId?: string) {
    const documents = await this.getAllExpiryDocuments(companyId);

    let expired = 0;

    let expiringSoon = 0;

    let critical = 0;

    for (const document of documents) {
      if (document.isExpired) {
        expired++;
      }

      if (document.isExpiringSoon) {
        expiringSoon++;
      }

      if (document.isCritical) {
        critical++;
      }
    }

    return {
      processed: documents.length,

      successful: documents.length,

      failed: 0,

      expired,

      expiringSoon,

      critical,

      results: documents.map((document) => ({
        success: true,

        documentId: document.documentId,

        expiry: document,

        warnings: [],

        calculatedAt: new Date(),
      })),

      processedAt: new Date(),
    };
  }

  /**
   * ==========================================================
   * PRIVATE: GET DOCUMENTS BY STATUS
   * ==========================================================
   */
  private async getDocumentsByStatus(
    status: ExpiryStatus,
    companyId?: string,
    limit = 50,
  ): Promise<DocumentExpiryResult[]> {
    const result = await this.getExpiryDocuments({
      page: 1,

      limit: Math.min(Math.max(limit, 1), 100),

      filter: {
        companyId,

        status,
      },
    });

    return result.documents;
  }

  /**
   * ==========================================================
   * PRIVATE: GET ALL EXPIRY DOCUMENTS
   * ==========================================================
   */
  private async getAllExpiryDocuments(
    companyId?: string,
  ): Promise<DocumentExpiryResult[]> {
    const mongoFilter: Record<string, unknown> = {
      expiryDate: {
        $exists: true,

        $ne: null,
      },
    };

    /**
     * Company filter.
     */
    if (companyId) {
      if (!Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid company ID");
      }

      mongoFilter.companyId = new Types.ObjectId(companyId);
    }

    /**
     * Do not include rejected documents in compliance
     * calculations.
     */
    mongoFilter.verificationStatus = {
      $ne: DocumentVerificationStatus.REJECTED,
    };

    const documents = await DocumentModel.find(mongoFilter)
      .sort({
        expiryDate: 1,
      })
      .select(
        [
          "_id",
          "companyId",
          "documentType",
          "ownerType",
          "vehicleId",
          "driverId",
          "documentNumber",
          "originalFileName",
          "expiryDate",
          "verificationStatus",
          "isOcrProcessed",
        ].join(" "),
      )
      .lean();

    const results: DocumentExpiryResult[] = [];

    for (const document of documents) {
      const result = this.calculateDocumentExpiry(document);

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * ==========================================================
   * PRIVATE: BUILD MONGO FILTER
   * ==========================================================
   */
  private buildMongoFilter(filter: ExpiryQueryFilter) {
    const mongoFilter: Record<string, unknown> = {
      expiryDate: {
        $exists: true,

        $ne: null,
      },
    };

    /**
     * Company.
     */
    if (filter.companyId) {
      if (!Types.ObjectId.isValid(filter.companyId)) {
        throw new ApiError(400, "Invalid company ID");
      }

      mongoFilter.companyId = new Types.ObjectId(filter.companyId);
    }

    /**
     * Vehicle.
     */
    if (filter.vehicleId) {
      if (!Types.ObjectId.isValid(filter.vehicleId)) {
        throw new ApiError(400, "Invalid vehicle ID");
      }

      mongoFilter.vehicleId = new Types.ObjectId(filter.vehicleId);
    }

    /**
     * Driver.
     */
    if (filter.driverId) {
      if (!Types.ObjectId.isValid(filter.driverId)) {
        throw new ApiError(400, "Invalid driver ID");
      }

      mongoFilter.driverId = new Types.ObjectId(filter.driverId);
    }

    /**
     * Document type.
     */
    if (filter.documentType) {
      mongoFilter.documentType = filter.documentType;
    }

    /**
     * Owner type.
     */
    if (filter.ownerType) {
      mongoFilter.ownerType = filter.ownerType;
    }

    /**
     * Rejected documents.
     */
    if (filter.includeRejected !== true) {
      mongoFilter.verificationStatus = {
        $ne: DocumentVerificationStatus.REJECTED,
      };
    }

    return mongoFilter;
  }

  /**
   * ==========================================================
   * PRIVATE: EXPIRY FILTER
   * ==========================================================
   */
  private matchesExpiryFilter(
    document: DocumentExpiryResult,
    filter: ExpiryQueryFilter,
  ): boolean {
    /**
     * Status.
     */
    if (filter.status && document.status !== filter.status) {
      return false;
    }

    /**
     * Expired.
     */
    if (filter.includeExpired === false && document.isExpired) {
      return false;
    }

    /**
     * Minimum days.
     */
    if (
      filter.minDaysRemaining !== undefined &&
      document.daysRemaining < filter.minDaysRemaining
    ) {
      return false;
    }

    /**
     * Maximum days.
     */
    if (
      filter.maxDaysRemaining !== undefined &&
      document.daysRemaining > filter.maxDaysRemaining
    ) {
      return false;
    }

    return true;
  }

  /**
   * ==========================================================
   * PRIVATE: CREATE REMINDER CANDIDATE
   * ==========================================================
   */
  private createReminderCandidate(
    document: DocumentExpiryResult,
    reminderThreshold: number,
  ): ExpiryReminderCandidate {
    return {
      documentId: document.documentId,

      companyId: document.companyId,

      documentType: document.documentType,

      vehicleId: document.vehicleId,

      driverId: document.driverId,

      expiryDate: document.expiryDate,

      daysRemaining: document.daysRemaining,

      status: document.status,

      reminderThreshold,
    };
  }

  /**
   * ==========================================================
   * PRIVATE: CREATE STATUS COUNT
   * ==========================================================
   */
  private createStatusCount(count: number, total: number): ExpiryStatusCount {
    return {
      count,

      percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
    };
  }
}

/**
 * ============================================================
 * SERVICE INSTANCE
 * ============================================================
 */
const expiryService = new ExpiryService();

export default expiryService;
