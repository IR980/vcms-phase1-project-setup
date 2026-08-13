import { FilterQuery, Types } from "mongoose";

import DocumentModel, {
  DocumentOwnerType,
  DocumentVerificationStatus,
  IDocument,
} from "../models/Document.model";

import { ApiError } from "../utils/ApiError";

import type {
  ComplianceDocumentDto,
  ComplianceListResponseDto,
  ComplianceStatus,
  ComplianceSummaryDto,
  DriverComplianceDto,
  VehicleComplianceDto,
} from "../types/compliance.dto";

/**
 * ============================================================
 * DOCUMENT COMPLIANCE SERVICE
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Responsibilities:
 *
 * 1. Calculate document expiry status
 * 2. Calculate days remaining
 * 3. Find expired documents
 * 4. Find documents expiring soon
 * 5. Generate compliance summary
 * 6. Generate vehicle compliance
 * 7. Generate driver compliance
 * 8. Track OCR pending documents
 *
 * IMPORTANT:
 *
 * Compliance status is NOT stored in MongoDB.
 *
 * It is calculated dynamically from expiryDate.
 *
 * This prevents stale compliance status.
 */

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

/**
 * Number of days before expiry considered "expiring soon".
 */
const DEFAULT_EXPIRING_SOON_DAYS = 30;

/**
 * ============================================================
 * SERVICE CLASS
 * ============================================================
 */

class DocumentComplianceService {
  /**
   * ==========================================================
   * CALCULATE DAYS REMAINING
   * ==========================================================
   *
   * Example:
   *
   * expiryDate = tomorrow
   * result = 1
   *
   * expiryDate = today
   * result = 0
   *
   * expiryDate = yesterday
   * result = -1
   */
  calculateDaysRemaining(
    expiryDate?: Date | string | null,
  ): number | undefined {
    if (!expiryDate) {
      return undefined;
    }

    const expiry = new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
      return undefined;
    }

    const now = new Date();

    /**
     * Compare calendar dates instead of time-of-day.
     */
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const expiryDay = new Date(
      expiry.getFullYear(),
      expiry.getMonth(),
      expiry.getDate(),
    );

    const difference = expiryDay.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }

  /**
   * ==========================================================
   * GET COMPLIANCE STATUS
   * ==========================================================
   */
  getComplianceStatus(
    expiryDate?: Date | string | null,
    expiringSoonDays: number = DEFAULT_EXPIRING_SOON_DAYS,
  ): ComplianceStatus {
    const daysRemaining = this.calculateDaysRemaining(expiryDate);

    /**
     * No expiry date.
     */
    if (daysRemaining === undefined) {
      return "no_expiry";
    }

    /**
     * Already expired.
     */
    if (daysRemaining < 0) {
      return "expired";
    }

    /**
     * Expiring soon.
     */
    if (daysRemaining <= expiringSoonDays) {
      return "expiring_soon";
    }

    /**
     * Valid.
     */
    return "valid";
  }

  /**
   * ==========================================================
   * GET DOCUMENT COMPLIANCE
   * ==========================================================
   *
   * Converts a MongoDB document into compliance information.
   */
  getDocumentCompliance(
    document: any,
    expiringSoonDays: number = DEFAULT_EXPIRING_SOON_DAYS,
  ): ComplianceDocumentDto {
    const daysRemaining = this.calculateDaysRemaining(document.expiryDate);

    const complianceStatus = this.getComplianceStatus(
      document.expiryDate,
      expiringSoonDays,
    );

    return {
      _id: this.getObjectIdString(document._id),

      companyId: this.getObjectIdString(document.companyId),

      documentType: document.documentType,

      ownerType: document.ownerType,

      vehicleId: document.vehicleId
        ? this.getObjectIdString(document.vehicleId)
        : undefined,

      driverId: document.driverId
        ? this.getObjectIdString(document.driverId)
        : undefined,

      documentNumber: document.documentNumber,

      issueDate: document.issueDate
        ? new Date(document.issueDate).toISOString()
        : undefined,

      expiryDate: document.expiryDate
        ? new Date(document.expiryDate).toISOString()
        : undefined,

      originalFileName: document.originalFileName,

      fileUrl: document.fileUrl,

      verificationStatus: document.verificationStatus,

      isOcrProcessed: Boolean(document.isOcrProcessed),

      daysRemaining,

      complianceStatus,

      isExpired: complianceStatus === "expired",

      isExpiringSoon: complianceStatus === "expiring_soon",
    };
  }

  /**
   * ==========================================================
   * GET COMPLIANCE SUMMARY
   * ==========================================================
   */
  async getComplianceSummary(companyId: string): Promise<ComplianceSummaryDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const companyObjectId = new Types.ObjectId(companyId);

    /**
     * Fetch only fields required for summary.
     */
    const documents = await DocumentModel.find({
      companyId: companyObjectId,
    })
      .select("expiryDate isOcrProcessed verificationStatus")
      .lean();

    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let noExpiry = 0;

    let ocrProcessed = 0;
    let ocrPending = 0;

    let verificationPending = 0;
    let verified = 0;
    let rejected = 0;

    for (const document of documents) {
      /**
       * Compliance.
       */
      const status = this.getComplianceStatus(document.expiryDate);

      switch (status) {
        case "valid":
          valid++;
          break;

        case "expiring_soon":
          expiringSoon++;
          break;

        case "expired":
          expired++;
          break;

        case "no_expiry":
          noExpiry++;
          break;
      }

      /**
       * OCR.
       */
      if (document.isOcrProcessed) {
        ocrProcessed++;
      } else {
        ocrPending++;
      }

      /**
       * Verification.
       */
      switch (document.verificationStatus) {
        case DocumentVerificationStatus.PENDING_VERIFICATION:
          verificationPending++;
          break;

        case DocumentVerificationStatus.VERIFIED:
          verified++;
          break;

        case DocumentVerificationStatus.REJECTED:
          rejected++;
          break;
      }
    }

    return {
      totalDocuments: documents.length,

      valid,

      expiringSoon,

      expired,

      noExpiry,

      ocrProcessed,

      ocrPending,

      verificationPending,

      verified,

      rejected,
    };
  }

  /**
   * ==========================================================
   * GET EXPIRING DOCUMENTS
   * ==========================================================
   *
   * Returns documents that will expire within N days.
   *
   * Default:
   *
   * 30 days
   */
  async getExpiringDocuments(
    companyId: string,
    options?: {
      days?: number;
      page?: number;
      limit?: number;
      documentType?: string;
      ownerType?: DocumentOwnerType;
      vehicleId?: string;
      driverId?: string;
    },
  ): Promise<ComplianceListResponseDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const days = options?.days ?? DEFAULT_EXPIRING_SOON_DAYS;

    if (days < 0 || days > 3650) {
      throw new ApiError(400, "Expiry window must be between 0 and 3650 days");
    }

    const page = options?.page ?? 1;

    const limit = options?.limit ?? 20;

    const skip = (page - 1) * limit;

    const now = this.startOfToday();

    const futureDate = this.endOfDay(this.addDays(now, days));

    const filter: FilterQuery<IDocument> = {
      companyId: new Types.ObjectId(companyId),

      expiryDate: {
        $gte: now,

        $lte: futureDate,
      },
    };

    this.applyOwnerFilters(filter, options);

    if (options?.documentType) {
      filter.documentType = options.documentType;
    }

    const total = await DocumentModel.countDocuments(filter);

    const documents = await DocumentModel.find(filter)
      .sort({
        expiryDate: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return this.createListResult(documents, page, limit, total);
  }

  /**
   * ==========================================================
   * GET EXPIRED DOCUMENTS
   * ==========================================================
   */
  async getExpiredDocuments(
    companyId: string,
    options?: {
      page?: number;
      limit?: number;
      documentType?: string;
      ownerType?: DocumentOwnerType;
      vehicleId?: string;
      driverId?: string;
    },
  ): Promise<ComplianceListResponseDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const page = options?.page ?? 1;

    const limit = options?.limit ?? 20;

    const skip = (page - 1) * limit;

    const filter: FilterQuery<IDocument> = {
      companyId: new Types.ObjectId(companyId),

      expiryDate: {
        $lt: this.startOfToday(),
      },
    };

    this.applyOwnerFilters(filter, options);

    if (options?.documentType) {
      filter.documentType = options.documentType;
    }

    const total = await DocumentModel.countDocuments(filter);

    const documents = await DocumentModel.find(filter)
      .sort({
        expiryDate: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return this.createListResult(documents, page, limit, total);
  }

  /**
   * ==========================================================
   * GET VALID DOCUMENTS
   * ==========================================================
   *
   * Documents with expiry date beyond the configured
   * expiring-soon window.
   */
  async getValidDocuments(
    companyId: string,
    options?: {
      days?: number;
      page?: number;
      limit?: number;
      documentType?: string;
      ownerType?: DocumentOwnerType;
      vehicleId?: string;
      driverId?: string;
    },
  ): Promise<ComplianceListResponseDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const days = options?.days ?? DEFAULT_EXPIRING_SOON_DAYS;

    if (days < 0 || days > 3650) {
      throw new ApiError(400, "Expiry window must be between 0 and 3650 days");
    }

    const page = options?.page ?? 1;

    const limit = options?.limit ?? 20;

    const skip = (page - 1) * limit;

    const minimumValidDate = this.addDays(this.startOfToday(), days + 1);

    const filter: FilterQuery<IDocument> = {
      companyId: new Types.ObjectId(companyId),

      expiryDate: {
        $gte: minimumValidDate,
      },
    };

    this.applyOwnerFilters(filter, options);

    if (options?.documentType) {
      filter.documentType = options.documentType;
    }

    const total = await DocumentModel.countDocuments(filter);

    const documents = await DocumentModel.find(filter)
      .sort({
        expiryDate: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return this.createListResult(documents, page, limit, total);
  }

  /**
   * ==========================================================
   * GET DOCUMENTS WITHOUT EXPIRY
   * ==========================================================
   */
  async getDocumentsWithoutExpiry(
    companyId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<ComplianceListResponseDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const page = options?.page ?? 1;

    const limit = options?.limit ?? 20;

    const skip = (page - 1) * limit;

    const filter: FilterQuery<IDocument> = {
      companyId: new Types.ObjectId(companyId),

      $or: [
        {
          expiryDate: {
            $exists: false,
          },
        },
        {
          expiryDate: null,
        },
      ],
    };

    const total = await DocumentModel.countDocuments(filter);

    const documents = await DocumentModel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return this.createListResult(documents, page, limit, total);
  }

  /**
   * ==========================================================
   * GET OCR PENDING DOCUMENTS
   * ==========================================================
   */
  async getOCRPendingDocuments(
    companyId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<ComplianceListResponseDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    const page = options?.page ?? 1;

    const limit = options?.limit ?? 20;

    const skip = (page - 1) * limit;

    const filter = {
      companyId: new Types.ObjectId(companyId),

      isOcrProcessed: false,
    };

    const total = await DocumentModel.countDocuments(filter);

    const documents = await DocumentModel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return this.createListResult(documents, page, limit, total);
  }

  /**
   * ==========================================================
   * GET VEHICLE COMPLIANCE
   * ==========================================================
   */
  async getVehicleCompliance(
    companyId: string,
    vehicleId: string,
  ): Promise<VehicleComplianceDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    this.validateObjectId(vehicleId, "Invalid vehicle ID");

    const documents = await DocumentModel.find({
      companyId: new Types.ObjectId(companyId),

      ownerType: DocumentOwnerType.VEHICLE,

      vehicleId: new Types.ObjectId(vehicleId),
    })
      .sort({
        expiryDate: 1,
      })
      .lean();

    const complianceDocuments = documents.map((document) =>
      this.getDocumentCompliance(document),
    );

    const statistics = this.calculateStatistics(complianceDocuments);

    return {
      vehicleId,

      documents: complianceDocuments,

      ...statistics,

      overallStatus: this.calculateOverallStatus(complianceDocuments),
    };
  }

  /**
   * ==========================================================
   * GET DRIVER COMPLIANCE
   * ==========================================================
   */
  async getDriverCompliance(
    companyId: string,
    driverId: string,
  ): Promise<DriverComplianceDto> {
    this.validateObjectId(companyId, "Invalid company ID");

    this.validateObjectId(driverId, "Invalid driver ID");

    const documents = await DocumentModel.find({
      companyId: new Types.ObjectId(companyId),

      ownerType: DocumentOwnerType.DRIVER,

      driverId: new Types.ObjectId(driverId),
    })
      .sort({
        expiryDate: 1,
      })
      .lean();

    const complianceDocuments = documents.map((document) =>
      this.getDocumentCompliance(document),
    );

    const statistics = this.calculateStatistics(complianceDocuments);

    return {
      driverId,

      documents: complianceDocuments,

      ...statistics,

      overallStatus: this.calculateOverallStatus(complianceDocuments),
    };
  }

  /**
   * ==========================================================
   * GET COMPANY COMPLIANCE
   * ==========================================================
   */
  async getCompanyCompliance(companyId: string): Promise<{
    summary: ComplianceSummaryDto;

    expired: ComplianceDocumentDto[];

    expiringSoon: ComplianceDocumentDto[];

    noExpiry: ComplianceDocumentDto[];
  }> {
    this.validateObjectId(companyId, "Invalid company ID");

    const companyObjectId = new Types.ObjectId(companyId);

    const documents = await DocumentModel.find({
      companyId: companyObjectId,
    })
      .sort({
        expiryDate: 1,
      })
      .lean();

    const complianceDocuments = documents.map((document) =>
      this.getDocumentCompliance(document),
    );

    const summary = this.calculateSummaryFromResults(complianceDocuments);

    return {
      summary,

      expired: complianceDocuments.filter(
        (document) => document.complianceStatus === "expired",
      ),

      expiringSoon: complianceDocuments.filter(
        (document) => document.complianceStatus === "expiring_soon",
      ),

      noExpiry: complianceDocuments.filter(
        (document) => document.complianceStatus === "no_expiry",
      ),
    };
  }

  /**
   * ==========================================================
   * GET CRITICAL DOCUMENTS
   * ==========================================================
   *
   * Critical means:
   *
   * - Expired
   * - Expiring within 7 days
   */
  async getCriticalDocuments(
    companyId: string,
    limit = 20,
  ): Promise<ComplianceDocumentDto[]> {
    this.validateObjectId(companyId, "Invalid company ID");

    if (limit < 1 || limit > 100) {
      throw new ApiError(400, "Limit must be between 1 and 100");
    }

    const now = this.startOfToday();

    const sevenDays = this.endOfDay(this.addDays(now, 7));

    const documents = await DocumentModel.find({
      companyId: new Types.ObjectId(companyId),

      expiryDate: {
        $lte: sevenDays,
      },
    })
      .sort({
        expiryDate: 1,
      })
      .limit(limit)
      .lean();

    return documents.map((document) => this.getDocumentCompliance(document));
  }

  /**
   * ==========================================================
   * CALCULATE STATISTICS
   * ==========================================================
   */
  private calculateStatistics(documents: ComplianceDocumentDto[]): {
    totalDocuments: number;

    valid: number;

    expiringSoon: number;

    expired: number;

    noExpiry: number;
  } {
    let valid = 0;

    let expiringSoon = 0;

    let expired = 0;

    let noExpiry = 0;

    for (const document of documents) {
      switch (document.complianceStatus) {
        case "valid":
          valid++;
          break;

        case "expiring_soon":
          expiringSoon++;
          break;

        case "expired":
          expired++;
          break;

        case "no_expiry":
          noExpiry++;
          break;
      }
    }

    return {
      totalDocuments: documents.length,

      valid,

      expiringSoon,

      expired,

      noExpiry,
    };
  }

  /**
   * ==========================================================
   * CALCULATE SUMMARY FROM RESULTS
   * ==========================================================
   */
  private calculateSummaryFromResults(
    documents: ComplianceDocumentDto[],
  ): ComplianceSummaryDto {
    const statistics = this.calculateStatistics(documents);

    let ocrProcessed = 0;

    let ocrPending = 0;

    let verificationPending = 0;

    let verified = 0;

    let rejected = 0;

    for (const document of documents) {
      /**
       * OCR.
       */
      if (document.isOcrProcessed) {
        ocrProcessed++;
      } else {
        ocrPending++;
      }

      /**
       * Verification.
       */
      switch (document.verificationStatus) {
        case DocumentVerificationStatus.PENDING_VERIFICATION:
          verificationPending++;
          break;

        case DocumentVerificationStatus.VERIFIED:
          verified++;
          break;

        case DocumentVerificationStatus.REJECTED:
          rejected++;
          break;
      }
    }

    return {
      ...statistics,

      ocrProcessed,

      ocrPending,

      verificationPending,

      verified,

      rejected,
    };
  }

  /**
   * ==========================================================
   * CALCULATE OVERALL STATUS
   * ==========================================================
   *
   * Priority:
   *
   * expired
   *   ↓
   * expiring_soon
   *   ↓
   * no_expiry
   *   ↓
   * valid
   */
  private calculateOverallStatus(
    documents: ComplianceDocumentDto[],
  ): ComplianceStatus {
    if (documents.length === 0) {
      return "no_expiry";
    }

    /**
     * Any expired document makes the owner critical.
     */
    if (documents.some((document) => document.complianceStatus === "expired")) {
      return "expired";
    }

    /**
     * Any document expiring soon.
     */
    if (
      documents.some(
        (document) => document.complianceStatus === "expiring_soon",
      )
    ) {
      return "expiring_soon";
    }

    /**
     * Missing expiry requires attention.
     */
    if (
      documents.some((document) => document.complianceStatus === "no_expiry")
    ) {
      return "no_expiry";
    }

    return "valid";
  }

  /**
   * ==========================================================
   * APPLY OWNER FILTERS
   * ==========================================================
   */
  private applyOwnerFilters(
    filter: FilterQuery<IDocument>,
    options?: {
      ownerType?: DocumentOwnerType;
      vehicleId?: string;
      driverId?: string;
    },
  ): void {
    if (options?.ownerType) {
      filter.ownerType = options.ownerType;
    }

    if (options?.vehicleId) {
      this.validateObjectId(options.vehicleId, "Invalid vehicle ID");

      filter.vehicleId = new Types.ObjectId(options.vehicleId);
    }

    if (options?.driverId) {
      this.validateObjectId(options.driverId, "Invalid driver ID");

      filter.driverId = new Types.ObjectId(options.driverId);
    }
  }

  /**
   * ==========================================================
   * CREATE PAGINATED RESULT
   * ==========================================================
   */
  private createListResult(
    documents: any[],
    page: number,
    limit: number,
    total: number,
  ): ComplianceListResponseDto {
    const complianceDocuments = documents.map((document) =>
      this.getDocumentCompliance(document),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      documents: complianceDocuments,

      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage: page < totalPages,

        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * ==========================================================
   * DATE HELPERS
   * ==========================================================
   */

  private startOfToday(): Date {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  private endOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
  }

  /**
   * ==========================================================
   * OBJECT ID HELPERS
   * ==========================================================
   */

  private validateObjectId(value: string, message: string): void {
    if (!Types.ObjectId.isValid(value)) {
      throw new ApiError(400, message);
    }
  }

  private getObjectIdString(value: any): string {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (value && typeof value === "object" && value._id) {
      return value._id.toString();
    }

    return String(value);
  }
}

/**
 * ============================================================
 * SERVICE INSTANCE
 * ============================================================
 */

const documentComplianceService = new DocumentComplianceService();

export default documentComplianceService;
