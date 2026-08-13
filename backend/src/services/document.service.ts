

// import { Types, FilterQuery } from "mongoose";

// import DocumentModel, {
//   DocumentType,
//   DocumentOwnerType,
//   DocumentVerificationStatus,
//   CloudinaryResourceType,
//   IDocument,
// } from "../models/Document.model";

// import { Vehicle } from "../models/Vehicle.model";
// import { Driver } from "../models/Driver.model";

// import {
//   CreateDocumentDto,
//   UpdateDocumentDto,
//   DocumentQueryDto,
//   DocumentResponseDto,
//   DocumentListResponseDto,
// } from "../types/document.dto";

// import cloudinaryService from "./cloudinary.service";

// import { processDocumentOCR } from "./ocr.service";

// import { parseDocumentByType } from "./documentParser.service";

// import { ApiError } from "../utils/ApiError";

// /**
//  * ============================================================
//  * CONSTANTS
//  * ============================================================
//  */

// const EXPIRING_SOON_DAYS = 30;

// /**
//  * ============================================================
//  * DOCUMENT SERVICE
//  * ============================================================
//  */
// class DocumentService {
//   /**
//    * ==========================================================
//    * CREATE DOCUMENT
//    * ==========================================================
//    *
//    * Flow:
//    *
//    * Controller
//    *      ↓
//    * Multer
//    *      ↓
//    * Cloudinary
//    *      ↓
//    * OCR
//    *      ↓
//    * Document Parser
//    *      ↓
//    * Extract document data
//    *      ↓
//    * MongoDB
//    *
//    * IMPORTANT:
//    *
//    * expiryDate is NOT manually required.
//    *
//    * OCR must detect expiryDate from the uploaded document.
//    */
//   async createDocument(
//     data: CreateDocumentDto,
//     file: Express.Multer.File,
//     uploadedBy?: string,
//   ): Promise<DocumentResponseDto> {
//     /**
//      * --------------------------------------------------------
//      * 1. Validate uploaded file
//      * --------------------------------------------------------
//      */
//     if (!file) {
//       throw new ApiError(400, "Document file is required");
//     }

//     if (!file.buffer || file.buffer.length === 0) {
//       throw new ApiError(400, "Uploaded file is empty");
//     }

//     /**
//      * --------------------------------------------------------
//      * 2. Validate company ObjectId
//      * --------------------------------------------------------
//      */
//     if (!Types.ObjectId.isValid(data.companyId)) {
//       throw new ApiError(400, "Invalid company ID");
//     }

//     /**
//      * --------------------------------------------------------
//      * 3. Validate owner relationship
//      * --------------------------------------------------------
//      */
//     await this.validateOwner(
//       data.companyId,
//       data.ownerType,
//       data.vehicleId,
//       data.driverId,
//     );

//     /**
//      * --------------------------------------------------------
//      * 4. Check duplicate document
//      * --------------------------------------------------------
//      */
//     const ownerFilter =
//       data.ownerType === DocumentOwnerType.VEHICLE
//         ? {
//             vehicleId: new Types.ObjectId(data.vehicleId!),
//           }
//         : {
//             driverId: new Types.ObjectId(data.driverId!),
//           };

//     const duplicate = await DocumentModel.findOne({
//       companyId: new Types.ObjectId(data.companyId),

//       documentType: data.documentType,

//       ...ownerFilter,

//       verificationStatus: {
//         $ne: DocumentVerificationStatus.REJECTED,
//       },
//     });

//     if (duplicate) {
//       throw new ApiError(
//         409,
//         `A ${this.getDocumentTypeLabel(
//           data.documentType,
//         )} document already exists for this ${data.ownerType}`,
//       );
//     }

//     /**
//      * ========================================================
//      * 5. OCR PROCESSING
//      * ========================================================
//      *
//      * IMPORTANT:
//      *
//      * We run OCR BEFORE Cloudinary upload.
//      *
//      * Reason:
//      *
//      * If OCR cannot read the document or cannot detect
//      * expiryDate, we don't want to upload an unusable
//      * compliance document to Cloudinary.
//      */
//     console.log("========== DOCUMENT OCR START ==========");

//     console.log({
//       fileName: file.originalname,

//       mimeType: file.mimetype,

//       fileSize: file.size,

//       documentType: data.documentType,
//     });

//     let ocrText = "";

//     let ocrProcessed = false;

//     let parsedDocument: Awaited<ReturnType<typeof parseDocumentByType>> | null =
//       null;

//     try {
//       /**
//        * ------------------------------------------------------
//        * Run OCR
//        * ------------------------------------------------------
//        */
//       const ocrResult = await processDocumentOCR({
//         buffer: file.buffer,

//         mimeType: file.mimetype,

//         originalFileName: file.originalname,
//       });

//       console.log("========== OCR ENGINE RESULT ==========");

//       console.log({
//         success: ocrResult.success,

//         status: ocrResult.status,

//         confidence: ocrResult.confidence,

//         processingTimeMs: ocrResult.processingTimeMs,

//         error: ocrResult.error,
//       });

//       /**
//        * ------------------------------------------------------
//        * OCR failed
//        * ------------------------------------------------------
//        */
//       if (!ocrResult.success || !ocrResult.text || !ocrResult.text.trim()) {
//         throw new ApiError(
//           400,
//           ocrResult.error ||
//             "Unable to read the uploaded document. Please upload a clear document.",
//         );
//       }

//       /**
//        * ------------------------------------------------------
//        * OCR succeeded
//        * ------------------------------------------------------
//        */
//       ocrText = ocrResult.text.trim();

//       ocrProcessed = true;

//       console.log("========== RAW OCR TEXT ==========");

//       console.log(ocrText);

//       console.log("========== END RAW OCR TEXT ==========");

//       /**
//        * ------------------------------------------------------
//        * Parse document
//        * ------------------------------------------------------
//        */
//       parsedDocument = await parseDocumentByType(
//         data.documentType,
//         ocrText,
//         data.ownerType,
//       );

//       console.log("========== DOCUMENT PARSER RESULT ==========");

//       console.dir(parsedDocument, {
//         depth: null,
//       });
//     } catch (error) {
//       console.error("OCR processing failed:", error);

//       if (error instanceof ApiError) {
//         throw error;
//       }

//       throw new ApiError(
//         400,
//         "Unable to read the uploaded document. Please upload a clearer document.",
//       );
//     }

//     /**
//      * ========================================================
//      * 6. EXTRACT DOCUMENT DATA
//      * ========================================================
//      *
//      * OCR is now the ONLY source for automatic data.
//      */
//     const extractedIssueDate = parsedDocument?.data.issueDate;

//     const extractedExpiryDate = parsedDocument?.data.expiryDate;

//     const extractedDocumentNumber = parsedDocument?.data.documentNumber;

//     const extractedIssuingAuthority = parsedDocument?.data.issuingAuthority;

//     /**
//      * --------------------------------------------------------
//      * Log extracted data
//      * --------------------------------------------------------
//      */
//     console.log("========== OCR EXTRACTED DATA ==========");

//     console.log({
//       documentNumber: extractedDocumentNumber,

//       issueDate: extractedIssueDate,

//       expiryDate: extractedExpiryDate,

//       issuingAuthority: extractedIssuingAuthority,

//       expiryDateExtracted: parsedDocument?.expiryDateExtracted,

//       expiryDateValid: parsedDocument?.expiryDateValid,

//       confidence: parsedDocument?.confidence,

//       reviewStatus: parsedDocument?.reviewStatus,
//     });

//     /**
//      * ========================================================
//      * 7. EXPIRY DATE MUST COME FROM OCR
//      * ========================================================
//      *
//      * Manual expiryDate is intentionally NOT used.
//      *
//      * This implements the requirement:
//      *
//      * User uploads document
//      *        ↓
//      * OCR reads document
//      *        ↓
//      * System detects expiry date
//      *        ↓
//      * Save expiry date
//      */
//     if (
//       !parsedDocument ||
//       !parsedDocument.expiryDateExtracted ||
//       !parsedDocument.expiryDateValid ||
//       !extractedExpiryDate
//     ) {
//       throw new ApiError(
//         400,
//         "Expiry date could not be detected from the document. Please upload a clear and readable document.",
//       );
//     }

//     /**
//      * --------------------------------------------------------
//      * 8. Validate extracted dates
//      * --------------------------------------------------------
//      */
//     const issueDate = extractedIssueDate;

//     const expiryDate = extractedExpiryDate;

//     if (issueDate && Number.isNaN(issueDate.getTime())) {
//       throw new ApiError(400, "OCR extracted an invalid issue date.");
//     }

//     if (Number.isNaN(expiryDate.getTime())) {
//       throw new ApiError(400, "OCR extracted an invalid expiry date.");
//     }

//     /**
//      * --------------------------------------------------------
//      * 9. Issue / expiry relationship
//      * --------------------------------------------------------
//      */
//     if (issueDate && expiryDate < issueDate) {
//       throw new ApiError(
//         400,
//         "OCR detected an expiry date before the issue date.",
//       );
//     }

//     /**
//      * ========================================================
//      * 10. UPLOAD TO CLOUDINARY
//      * ========================================================
//      */
//     let cloudinaryResult;

//     try {
//       cloudinaryResult = await cloudinaryService.uploadDocument(
//         file.buffer,

//         data.ownerType,

//         data.documentType,
//       );
//     } catch (error) {
//       console.error("Cloudinary upload failed:", error);

//       throw new ApiError(500, "Failed to upload document to Cloudinary");
//     }

//     /**
//      * ========================================================
//      * 11. PREPARE MONGODB DOCUMENT
//      * ========================================================
//      */
//     const documentData: Partial<IDocument> = {
//       /**
//        * ------------------------------------------------------
//        * Company
//        * ------------------------------------------------------
//        */
//       companyId: new Types.ObjectId(data.companyId),

//       /**
//        * ------------------------------------------------------
//        * Document
//        * ------------------------------------------------------
//        */
//       documentType: data.documentType,

//       ownerType: data.ownerType,

//       /**
//        * ------------------------------------------------------
//        * Owner
//        * ------------------------------------------------------
//        */
//       vehicleId:
//         data.ownerType === DocumentOwnerType.VEHICLE
//           ? new Types.ObjectId(data.vehicleId!)
//           : undefined,

//       driverId:
//         data.ownerType === DocumentOwnerType.DRIVER
//           ? new Types.ObjectId(data.driverId!)
//           : undefined,

//       /**
//        * ======================================================
//        * OCR EXTRACTED DATA
//        * ======================================================
//        *
//        * These values come from the uploaded document.
//        */
//       documentNumber: extractedDocumentNumber,

//       issueDate: issueDate,

//       expiryDate: expiryDate,

//       issuingAuthority: extractedIssuingAuthority,

//       /**
//        * ======================================================
//        * CLOUDINARY
//        * ======================================================
//        */
//       fileUrl: cloudinaryResult.secureUrl,

//       originalFileName: file.originalname,

//       mimeType: file.mimetype,

//       fileSize: file.size,

//       cloudinaryPublicId: cloudinaryResult.publicId,

//       cloudinaryResourceType: this.normalizeCloudinaryResourceType(
//         cloudinaryResult.resourceType,
//       ),

//       cloudinaryFormat: cloudinaryResult.format,

//       /**
//        * ======================================================
//        * VERIFICATION
//        * ======================================================
//        */
//       verificationStatus: DocumentVerificationStatus.UPLOADED,

//       /**
//        * ======================================================
//        * OCR
//        * ======================================================
//        */
//       isOcrProcessed: ocrProcessed,

//       extractedText: ocrText,

//       /**
//        * ======================================================
//        * USER
//        * ======================================================
//        */
//       uploadedBy:
//         uploadedBy && Types.ObjectId.isValid(uploadedBy)
//           ? new Types.ObjectId(uploadedBy)
//           : undefined,

//       notes: data.notes?.trim(),
//     };

//     /**
//      * ========================================================
//      * 12. SAVE MONGODB
//      * ========================================================
//      */
//     try {
//       const document = await DocumentModel.create(documentData);

//       console.log("========== DOCUMENT CREATED SUCCESSFULLY ==========");

//       console.log({
//         documentId: document._id.toString(),

//         documentType: document.documentType,

//         documentNumber: document.documentNumber,

//         expiryDate: document.expiryDate,

//         isOcrProcessed: document.isOcrProcessed,
//       });

//       return this.toResponseDto(document);
//     } catch (error) {
//       /**
//        * ------------------------------------------------------
//        * MongoDB failed
//        * ------------------------------------------------------
//        *
//        * Remove Cloudinary file because database record
//        * was not created.
//        */
//       try {
//         await cloudinaryService.deleteDocument(
//           cloudinaryResult.publicId,

//           cloudinaryResult.resourceType,
//         );
//       } catch (cleanupError) {
//         console.error(
//           "Failed to cleanup Cloudinary file after database error:",
//           cleanupError,
//         );
//       }

//       throw error;
//     }
//   }

//   /**
//    * ==========================================================
//    * GET DOCUMENTS
//    * ==========================================================
//    */
//   async getDocuments(
//     query: DocumentQueryDto,
//   ): Promise<DocumentListResponseDto> {
//     const page = query.page ?? 1;

//     const limit = query.limit ?? 10;

//     const skip = (page - 1) * limit;

//     const filter: FilterQuery<IDocument> = {};

//     if (query.companyId) {
//       filter.companyId = new Types.ObjectId(query.companyId);
//     }

//     if (query.documentType) {
//       filter.documentType = query.documentType;
//     }

//     if (query.ownerType) {
//       filter.ownerType = query.ownerType;
//     }

//     if (query.vehicleId) {
//       filter.vehicleId = new Types.ObjectId(query.vehicleId);
//     }

//     if (query.driverId) {
//       filter.driverId = new Types.ObjectId(query.driverId);
//     }

//     if (query.verificationStatus) {
//       filter.verificationStatus = query.verificationStatus;
//     }

//     /**
//      * Search.
//      */
//     if (query.search && query.search.trim()) {
//       const search = query.search.trim();

//       filter.$or = [
//         {
//           documentNumber: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           issuingAuthority: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           originalFileName: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     /**
//      * Expiry range.
//      */
//     if (query.expiryFrom || query.expiryTo) {
//       filter.expiryDate = {};

//       if (query.expiryFrom) {
//         filter.expiryDate.$gte = new Date(query.expiryFrom);
//       }

//       if (query.expiryTo) {
//         const expiryTo = new Date(query.expiryTo);

//         expiryTo.setHours(23, 59, 59, 999);

//         filter.expiryDate.$lte = expiryTo;
//       }
//     }

//     /**
//      * Expired.
//      */
//     if (query.expired === true) {
//       filter.expiryDate = {
//         ...(filter.expiryDate ?? {}),

//         $lt: new Date(),
//       };
//     }

//     /**
//      * Expiring within N days.
//      */
//     if (query.expiringWithin !== undefined) {
//       const now = new Date();

//       const futureDate = new Date();

//       futureDate.setDate(futureDate.getDate() + query.expiringWithin);

//       filter.expiryDate = {
//         ...(filter.expiryDate ?? {}),

//         $gte: now,

//         $lte: futureDate,
//       };
//     }

//     /**
//      * Sorting.
//      */
//     const sortBy = query.sortBy ?? "createdAt";

//     const sortOrder = query.sortOrder === "asc" ? 1 : -1;

//     const sort: Record<string, import("mongoose").SortOrder> = {
//       [sortBy]: sortOrder as import("mongoose").SortOrder,
//     };

//     /**
//      * Execute.
//      */
//     const [documents, total] = await Promise.all([
//       DocumentModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),

//       DocumentModel.countDocuments(filter),
//     ]);

//     const responseDocuments = documents.map((document) =>
//       this.toResponseDto(document),
//     );

//     const totalPages = Math.ceil(total / limit);

//     return {
//       documents: responseDocuments,

//       pagination: {
//         page,

//         limit,

//         total,

//         totalPages,

//         hasNextPage: page < totalPages,

//         hasPreviousPage: page > 1,
//       },
//     };
//   }

//   /**
//    * ==========================================================
//    * GET DOCUMENT BY ID
//    * ==========================================================
//    */
//   async getDocumentById(documentId: string): Promise<DocumentResponseDto> {
//     if (!Types.ObjectId.isValid(documentId)) {
//       throw new ApiError(400, "Invalid document ID");
//     }

//     const document = await DocumentModel.findById(documentId)
//       .populate({
//         path: "vehicleId",
//         select: "registrationNumber vehicleNumber make model vehicleType",
//       })
//       .populate({
//         path: "driverId",
//         select: "firstName lastName employeeId mobileNumber licenseNumber",
//       })
//       .populate({
//         path: "uploadedBy",
//         select: "firstName lastName email",
//       })
//       .populate({
//         path: "verifiedBy",
//         select: "firstName lastName email",
//       })
//       .lean();

//     if (!document) {
//       throw new ApiError(404, "Document not found");
//     }

//     return this.toResponseDto(document);
//   }

//   /**
//    * ==========================================================
//    * UPDATE DOCUMENT
//    * ==========================================================
//    */
//   async updateDocument(
//     documentId: string,
//     data: UpdateDocumentDto,
//     file?: Express.Multer.File,
//   ): Promise<DocumentResponseDto> {
//     /**
//      * 1. Validate ID.
//      */
//     if (!Types.ObjectId.isValid(documentId)) {
//       throw new ApiError(400, "Invalid document ID");
//     }

//     /**
//      * 2. Find existing document.
//      */
//     const existing = await DocumentModel.findById(documentId);

//     if (!existing) {
//       throw new ApiError(404, "Document not found");
//     }

//     /**
//      * 3. Determine final owner.
//      */
//     const finalOwnerType = data.ownerType ?? existing.ownerType;

//     const finalVehicleId =
//       data.vehicleId ??
//       (existing.vehicleId ? existing.vehicleId.toString() : undefined);

//     const finalDriverId =
//       data.driverId ??
//       (existing.driverId ? existing.driverId.toString() : undefined);

//     /**
//      * 4. Validate owner.
//      */
//     await this.validateOwner(
//       existing.companyId.toString(),
//       finalOwnerType,
//       finalVehicleId,
//       finalDriverId,
//     );

//     /**
//      * 5. Existing dates.
//      */
//     let finalIssueDate =
//       data.issueDate !== undefined
//         ? new Date(data.issueDate)
//         : existing.issueDate;

//     let finalExpiryDate =
//       data.expiryDate !== undefined
//         ? new Date(data.expiryDate)
//         : existing.expiryDate;

//     if (finalIssueDate && Number.isNaN(finalIssueDate.getTime())) {
//       throw new ApiError(400, "Invalid issue date");
//     }

//     if (finalExpiryDate && Number.isNaN(finalExpiryDate.getTime())) {
//       throw new ApiError(400, "Invalid expiry date");
//     }

//     if (finalIssueDate && finalExpiryDate && finalExpiryDate < finalIssueDate) {
//       throw new ApiError(400, "Expiry date must be after issue date");
//     }

//     /**
//      * 6. Final document type.
//      */
//     const finalDocumentType = data.documentType ?? existing.documentType;

//     /**
//      * 7. Duplicate check.
//      */
//     const ownerFilter =
//       finalOwnerType === DocumentOwnerType.VEHICLE
//         ? {
//             vehicleId: new Types.ObjectId(finalVehicleId!),
//           }
//         : {
//             driverId: new Types.ObjectId(finalDriverId!),
//           };

//     const duplicate = await DocumentModel.findOne({
//       _id: {
//         $ne: existing._id,
//       },

//       companyId: existing.companyId,

//       documentType: finalDocumentType,

//       ...ownerFilter,

//       verificationStatus: {
//         $ne: DocumentVerificationStatus.REJECTED,
//       },
//     });

//     if (duplicate) {
//       throw new ApiError(
//         409,
//         `A ${this.getDocumentTypeLabel(
//           finalDocumentType,
//         )} document already exists for this ${finalOwnerType}`,
//       );
//     }

//     /**
//      * 8. Prepare update.
//      */
//     const updateData: Record<string, unknown> = {};

//     if (data.documentType !== undefined) {
//       updateData.documentType = data.documentType;
//     }

//     if (data.ownerType !== undefined) {
//       updateData.ownerType = data.ownerType;
//     }

//     if (finalOwnerType === DocumentOwnerType.VEHICLE) {
//       updateData.vehicleId = new Types.ObjectId(finalVehicleId!);

//       updateData.driverId = undefined;
//     } else {
//       updateData.driverId = new Types.ObjectId(finalDriverId!);

//       updateData.vehicleId = undefined;
//     }

//     if (data.documentNumber !== undefined) {
//       updateData.documentNumber = data.documentNumber.trim();
//     }

//     if (data.issueDate !== undefined) {
//       updateData.issueDate = finalIssueDate;
//     }

//     if (data.expiryDate !== undefined) {
//       updateData.expiryDate = finalExpiryDate;
//     }

//     if (data.issuingAuthority !== undefined) {
//       updateData.issuingAuthority = data.issuingAuthority.trim();
//     }

//     if (data.notes !== undefined) {
//       updateData.notes = data.notes.trim();
//     }

//     /**
//      * ========================================================
//      * 9. NEW FILE + OCR
//      * ========================================================
//      */
//     let newCloudinaryResult:
//       | Awaited<ReturnType<typeof cloudinaryService.uploadDocument>>
//       | undefined;

//     let newOCRText = "";

//     let newParsedDocument: Awaited<
//       ReturnType<typeof parseDocumentByType>
//     > | null = null;

//     if (file) {
//       if (!file.buffer || file.buffer.length === 0) {
//         throw new ApiError(400, "Uploaded file is empty");
//       }

//       /**
//        * ------------------------------------------------------
//        * OCR new file FIRST
//        * ------------------------------------------------------
//        */
//       try {
//         const ocrResult = await processDocumentOCR({
//           buffer: file.buffer,

//           mimeType: file.mimetype,

//           originalFileName: file.originalname,
//         });

//         if (!ocrResult.success || !ocrResult.text || !ocrResult.text.trim()) {
//           throw new ApiError(
//             400,
//             ocrResult.error || "Unable to read the new document.",
//           );
//         }

//         newOCRText = ocrResult.text.trim();

//         newParsedDocument = await parseDocumentByType(
//           finalDocumentType,
//           newOCRText,
//           finalOwnerType,
//         );
//       } catch (error) {
//         console.error("OCR processing failed during document update:", error);

//         if (error instanceof ApiError) {
//           throw error;
//         }

//         throw new ApiError(
//           400,
//           "Unable to read the new document. Please upload a clear document.",
//         );
//       }

//       /**
//        * ------------------------------------------------------
//        * OCR expiry is mandatory for new file
//        * ------------------------------------------------------
//        */
//       if (
//         !newParsedDocument.expiryDateExtracted ||
//         !newParsedDocument.expiryDateValid ||
//         !newParsedDocument.data.expiryDate
//       ) {
//         throw new ApiError(
//           400,
//           "Expiry date could not be detected from the new document. Please upload a clear document.",
//         );
//       }

//       /**
//        * ------------------------------------------------------
//        * OCR dates replace existing values
//        * ------------------------------------------------------
//        */
//       finalExpiryDate = newParsedDocument.data.expiryDate;

//       finalIssueDate = newParsedDocument.data.issueDate;

//       /**
//        * ------------------------------------------------------
//        * Validate dates
//        * ------------------------------------------------------
//        */
//       if (finalIssueDate && finalExpiryDate < finalIssueDate) {
//         throw new ApiError(
//           400,
//           "OCR detected an expiry date before the issue date.",
//         );
//       }

//       /**
//        * ------------------------------------------------------
//        * Upload new file to Cloudinary
//        * ------------------------------------------------------
//        */
//       try {
//         newCloudinaryResult = await cloudinaryService.uploadDocument(
//           file.buffer,

//           finalOwnerType,

//           finalDocumentType,
//         );
//       } catch {
//         throw new ApiError(500, "Failed to upload new document to Cloudinary");
//       }

//       /**
//        * ------------------------------------------------------
//        * Cloudinary information
//        * ------------------------------------------------------
//        */
//       updateData.fileUrl = newCloudinaryResult.secureUrl;

//       updateData.originalFileName = file.originalname;

//       updateData.mimeType = file.mimetype;

//       updateData.fileSize = file.size;

//       updateData.cloudinaryPublicId = newCloudinaryResult.publicId;

//       updateData.cloudinaryResourceType = this.normalizeCloudinaryResourceType(
//         newCloudinaryResult.resourceType,
//       );

//       updateData.cloudinaryFormat = newCloudinaryResult.format;

//       /**
//        * ------------------------------------------------------
//        * OCR information
//        * ------------------------------------------------------
//        */
//       updateData.isOcrProcessed = true;

//       updateData.extractedText = newOCRText;

//       updateData.documentNumber = newParsedDocument.data.documentNumber;

//       updateData.issuingAuthority = newParsedDocument.data.issuingAuthority;

//       updateData.issueDate = finalIssueDate;

//       updateData.expiryDate = finalExpiryDate;

//       /**
//        * New file requires verification again.
//        */
//       updateData.verificationStatus = DocumentVerificationStatus.UPLOADED;

//       updateData.verifiedBy = undefined;

//       updateData.verifiedAt = undefined;
//     }

//     /**
//      * ========================================================
//      * 10. Verification update
//      * ========================================================
//      */
//     if (data.verificationStatus !== undefined && !file) {
//       updateData.verificationStatus = data.verificationStatus;

//       if (data.verificationStatus === DocumentVerificationStatus.VERIFIED) {
//         if (!data.verifiedBy) {
//           throw new ApiError(
//             400,
//             "verifiedBy is required when document is verified",
//           );
//         }

//         if (!Types.ObjectId.isValid(data.verifiedBy)) {
//           throw new ApiError(400, "Invalid verifiedBy user ID");
//         }

//         updateData.verifiedBy = new Types.ObjectId(data.verifiedBy);

//         updateData.verifiedAt = data.verifiedAt
//           ? new Date(data.verifiedAt)
//           : new Date();
//       }

//       if (data.verificationStatus === DocumentVerificationStatus.REJECTED) {
//         updateData.verifiedBy = undefined;

//         updateData.verifiedAt = undefined;
//       }
//     }

//     /**
//      * ========================================================
//      * 11. Update MongoDB
//      * ========================================================
//      */
//     let updatedDocument;

//     try {
//       updatedDocument = await DocumentModel.findByIdAndUpdate(
//         existing._id,
//         {
//           $set: updateData,
//         },
//         {
//           new: true,

//           runValidators: true,
//         },
//       );
//     } catch (error) {
//       /**
//        * Cleanup newly uploaded file.
//        */
//       if (newCloudinaryResult) {
//         try {
//           await cloudinaryService.deleteDocument(
//             newCloudinaryResult.publicId,

//             newCloudinaryResult.resourceType,
//           );
//         } catch {
//           console.error(
//             "Failed to cleanup new Cloudinary file:",
//             newCloudinaryResult.publicId,
//           );
//         }
//       }

//       throw error;
//     }

//     if (!updatedDocument) {
//       if (newCloudinaryResult) {
//         try {
//           await cloudinaryService.deleteDocument(
//             newCloudinaryResult.publicId,

//             newCloudinaryResult.resourceType,
//           );
//         } catch {
//           console.error(
//             "Failed to cleanup Cloudinary file:",
//             newCloudinaryResult.publicId,
//           );
//         }
//       }

//       throw new ApiError(404, "Document not found");
//     }

//     /**
//      * ========================================================
//      * 12. Delete old Cloudinary file
//      * ========================================================
//      */
//     if (newCloudinaryResult && existing.cloudinaryPublicId) {
//       try {
//         await cloudinaryService.deleteDocument(
//           existing.cloudinaryPublicId,

//           existing.cloudinaryResourceType,
//         );
//       } catch (error) {
//         console.error(
//           "Failed to delete old Cloudinary document:",
//           existing.cloudinaryPublicId,
//           error,
//         );
//       }
//     }

//     return this.toResponseDto(updatedDocument);
//   }

//   /**
//    * ==========================================================
//    * DELETE DOCUMENT
//    * ==========================================================
//    */
//   async deleteDocument(documentId: string): Promise<{
//     message: string;
//     documentId: string;
//   }> {
//     if (!Types.ObjectId.isValid(documentId)) {
//       throw new ApiError(400, "Invalid document ID");
//     }

//     const document = await DocumentModel.findById(documentId);

//     if (!document) {
//       throw new ApiError(404, "Document not found");
//     }

//     if (document.cloudinaryPublicId) {
//       try {
//         await cloudinaryService.deleteDocument(
//           document.cloudinaryPublicId,

//           document.cloudinaryResourceType,
//         );
//       } catch {
//         throw new ApiError(500, "Failed to delete document from Cloudinary");
//       }
//     }

//     await DocumentModel.deleteOne({
//       _id: document._id,
//     });

//     return {
//       message: "Document deleted successfully",

//       documentId: document._id.toString(),
//     };
//   }

//   /**
//    * ==========================================================
//    * VALIDATE OWNER
//    * ==========================================================
//    */
//   private async validateOwner(
//     companyId: string,
//     ownerType: DocumentOwnerType,
//     vehicleId?: string,
//     driverId?: string,
//   ): Promise<void> {
//     /**
//      * VEHICLE
//      */
//     if (ownerType === DocumentOwnerType.VEHICLE) {
//       if (!vehicleId) {
//         throw new ApiError(400, "vehicleId is required for vehicle documents");
//       }

//       if (!Types.ObjectId.isValid(vehicleId)) {
//         throw new ApiError(400, "Invalid vehicle ID");
//       }

//       const vehicle = await Vehicle.findOne({
//         _id: new Types.ObjectId(vehicleId),

//         companyId: new Types.ObjectId(companyId),
//       })
//         .select("_id")
//         .lean();

//       if (!vehicle) {
//         throw new ApiError(404, "Vehicle not found in the selected company");
//       }

//       return;
//     }

//     /**
//      * DRIVER
//      */
//     if (ownerType === DocumentOwnerType.DRIVER) {
//       if (!driverId) {
//         throw new ApiError(400, "driverId is required for driver documents");
//       }

//       if (!Types.ObjectId.isValid(driverId)) {
//         throw new ApiError(400, "Invalid driver ID");
//       }

//       const driver = await Driver.findOne({
//         _id: new Types.ObjectId(driverId),

//         companyId: new Types.ObjectId(companyId),
//       })
//         .select("_id")
//         .lean();

//       if (!driver) {
//         throw new ApiError(404, "Driver not found in the selected company");
//       }

//       return;
//     }

//     throw new ApiError(400, "Invalid document owner type");
//   }

//   /**
//    * ==========================================================
//    * CALCULATE DAYS REMAINING
//    * ==========================================================
//    */
//   private calculateDaysRemaining(expiryDate?: Date): number | undefined {
//     if (!expiryDate) {
//       return undefined;
//     }

//     const now = new Date();

//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     const expiry = new Date(
//       expiryDate.getFullYear(),
//       expiryDate.getMonth(),
//       expiryDate.getDate(),
//     );

//     const difference = expiry.getTime() - today.getTime();

//     return Math.ceil(difference / (1000 * 60 * 60 * 24));
//   }

//   /**
//    * ==========================================================
//    * CALCULATE COMPLIANCE STATUS
//    * ==========================================================
//    */
//   private calculateComplianceStatus(
//     daysRemaining?: number,
//   ): "valid" | "expiring_soon" | "expired" {
//     if (daysRemaining === undefined) {
//       return "valid";
//     }

//     if (daysRemaining < 0) {
//       return "expired";
//     }

//     if (daysRemaining <= EXPIRING_SOON_DAYS) {
//       return "expiring_soon";
//     }

//     return "valid";
//   }

//   /**
//    * ==========================================================
//    * CLOUDINARY RESOURCE TYPE
//    * ==========================================================
//    */
//   private normalizeCloudinaryResourceType(
//     resourceType: string,
//   ): CloudinaryResourceType {
//     if (resourceType === CloudinaryResourceType.IMAGE) {
//       return CloudinaryResourceType.IMAGE;
//     }

//     return CloudinaryResourceType.RAW;
//   }

//   /**
//    * ==========================================================
//    * DOCUMENT TYPE LABEL
//    * ==========================================================
//    */
//   private getDocumentTypeLabel(documentType: DocumentType): string {
//     const labels: Record<DocumentType, string> = {
//       [DocumentType.RC]: "RC",

//       [DocumentType.PUC]: "PUC",

//       [DocumentType.FITNESS]: "Fitness",

//       [DocumentType.INSURANCE]: "Insurance",

//       [DocumentType.PERMIT]: "Permit",

//       [DocumentType.ROAD_TAX]: "Road Tax",

//       [DocumentType.DRIVING_LICENSE]: "Driving License",

//       [DocumentType.MEDICAL_CERTIFICATE]: "Medical Certificate",

//       [DocumentType.OTHER]: "Other",
//     };

//     return labels[documentType] ?? "Document";
//   }

//   /**
//    * ==========================================================
//    * RESPONSE DTO
//    * ==========================================================
//    */
//   private toResponseDto(document: any): DocumentResponseDto {
//     const expiryDate = document.expiryDate
//       ? new Date(document.expiryDate)
//       : undefined;

//     const daysRemaining = this.calculateDaysRemaining(expiryDate);

//     const complianceStatus = this.calculateComplianceStatus(daysRemaining);

//     return {
//       _id: document._id.toString(),

//       companyId: document.companyId.toString(),

//       documentType: document.documentType,

//       ownerType: document.ownerType,

//       vehicleId: document.vehicleId
//         ? this.getObjectIdString(document.vehicleId)
//         : undefined,

//       driverId: document.driverId
//         ? this.getObjectIdString(document.driverId)
//         : undefined,

//       documentNumber: document.documentNumber,

//       issueDate: document.issueDate
//         ? new Date(document.issueDate).toISOString()
//         : undefined,

//       expiryDate: expiryDate ? expiryDate.toISOString() : "",

//       issuingAuthority: document.issuingAuthority,

//       fileUrl: document.fileUrl,

//       originalFileName: document.originalFileName,

//       mimeType: document.mimeType,

//       fileSize: document.fileSize,

//       cloudinaryPublicId: document.cloudinaryPublicId,

//       cloudinaryResourceType: this.normalizeCloudinaryResourceType(
//         document.cloudinaryResourceType,
//       ),

//       cloudinaryFormat: document.cloudinaryFormat,

//       verificationStatus: document.verificationStatus,

//       isOcrProcessed: document.isOcrProcessed,

//       extractedText: document.extractedText,

//       notes: document.notes,

//       uploadedBy: document.uploadedBy
//         ? this.getObjectIdString(document.uploadedBy)
//         : undefined,

//       verifiedBy: document.verifiedBy
//         ? this.getObjectIdString(document.verifiedBy)
//         : undefined,

//       verifiedAt: document.verifiedAt
//         ? new Date(document.verifiedAt).toISOString()
//         : undefined,

//       daysRemaining,

//       complianceStatus,

//       createdAt: new Date(document.createdAt).toISOString(),

//       updatedAt: new Date(document.updatedAt).toISOString(),
//     };
//   }

//   /**
//    * ==========================================================
//    * OBJECT ID STRING HELPER
//    * ==========================================================
//    */
//   private getObjectIdString(value: any): string {
//     if (value instanceof Types.ObjectId) {
//       return value.toString();
//     }

//     if (value && typeof value === "object" && value._id) {
//       return value._id.toString();
//     }

//     return String(value);
//   }
// }

// /**
//  * ============================================================
//  * SERVICE INSTANCE
//  * ============================================================
//  */
// const documentService = new DocumentService();

// export default documentService;


import { Types, FilterQuery } from "mongoose";

import DocumentModel, {
  DocumentType,
  DocumentOwnerType,
  DocumentVerificationStatus,
  CloudinaryResourceType,
  IDocument,
} from "../models/Document.model";

import { Vehicle } from "../models/Vehicle.model";
import { Driver } from "../models/Driver.model";

import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  DocumentResponseDto,
  DocumentListResponseDto,
} from "../types/document.dto";

import cloudinaryService from "./cloudinary.service";

import { processDocumentOCR } from "./ocr.service";

import { parseDocumentByType } from "./documentParser.service";

import { ApiError } from "../utils/ApiError";

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const EXPIRING_SOON_DAYS = 30;

/**
 * ============================================================
 * EXPIRY DATE SOURCE
 * ============================================================
 *
 * OCR has priority.
 *
 * If OCR cannot extract a valid expiry date,
 * manually supplied expiryDate is used as fallback.
 */
type ExpiryDateSource = "ocr" | "manual";

/**
 * ============================================================
 * DOCUMENT SERVICE
 * ============================================================
 */
class DocumentService {
  /**
 * ==========================================================
 * PARSE MANUAL EXPIRY DATE
 * ==========================================================
 *
 * Supports:
 *
 * 1. "2026-07-10"
 * 2. Date instance
 */
private parseManualExpiryDate(
  value?: string | Date,
): Date | undefined {
  /**
   * No value.
   */
  if (!value) {
    return undefined;
  }

  /**
   * Already a Date object.
   */
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }

    return value;
  }

  /**
   * String value.
   */
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  /**
   * Expected frontend format:
   *
   * YYYY-MM-DD
   */
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  /**
   * Strict date validation.
   *
   * Prevents invalid dates such as:
   *
   * 2026-02-31
   */
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

  /**
   * ==========================================================
   * RESOLVE EXPIRY DATE
   * ==========================================================
   *
   * Priority:
   *
   * 1. OCR expiry date
   * 2. Manual expiry date
   * 3. Error
   */
  private resolveExpiryDate(
    ocrExpiryDate?: Date,
    ocrExpiryValid?: boolean,
    manualExpiryDate?: string | Date,
  ): {
    expiryDate: Date;
    source: ExpiryDateSource;
  } {
    /**
     * --------------------------------------------------------
     * 1. OCR has priority
     * --------------------------------------------------------
     */
    if (
      ocrExpiryDate &&
      ocrExpiryValid &&
      !Number.isNaN(
        ocrExpiryDate.getTime(),
      )
    ) {
      return {
        expiryDate: ocrExpiryDate,
        source: "ocr",
      };
    }

    /**
     * --------------------------------------------------------
     * 2. Manual fallback
     * --------------------------------------------------------
     */
    const manualDate =
      this.parseManualExpiryDate(
        manualExpiryDate,
      );

    if (manualDate) {
      return {
        expiryDate: manualDate,
        source: "manual",
      };
    }

    /**
     * --------------------------------------------------------
     * 3. Neither available
     * --------------------------------------------------------
     */
    throw new ApiError(
      400,
      "Expiry date could not be detected from the document and no valid manual expiry date was provided.",
    );
  }

  /**
   * ==========================================================
   * VALIDATE DATE
   * ==========================================================
   */
  private validateDate(
    date: Date | undefined,
    fieldName: string,
  ): void {
    if (!date) {
      return;
    }

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new ApiError(
        400,
        `Invalid ${fieldName}.`,
      );
    }
  }

  /**
   * ==========================================================
   * VALIDATE ISSUE / EXPIRY RELATIONSHIP
   * ==========================================================
   */
  private validateDateRelationship(
    issueDate: Date | undefined,
    expiryDate: Date,
    source: ExpiryDateSource,
  ): void {
    if (
      issueDate &&
      expiryDate < issueDate
    ) {
      throw new ApiError(
        400,
        source === "manual"
          ? "Manual expiry date cannot be before the issue date."
          : "OCR detected an expiry date before the issue date.",
      );
    }
  }

  /**
   * ==========================================================
   * CREATE DOCUMENT
   * ==========================================================
   *
   * Flow:
   *
   * Controller
   *      ↓
   * Multer
   *      ↓
   * OCR
   *      ↓
   * Parser
   *      ↓
   * OCR expiry?
   *      ↓
   * YES ──────────────→ OCR expiry
   *      │
   *      NO
   *      ↓
   * Manual expiryDate?
   *      ↓
   * YES ──────────────→ Manual expiry
   *      │
   *      NO
   *      ↓
   * 400 Error
   *      ↓
   * Cloudinary
   *      ↓
   * MongoDB
   */
  async createDocument(
    data: CreateDocumentDto,
    file: Express.Multer.File,
    uploadedBy?: string,
  ): Promise<DocumentResponseDto> {
    /**
     * --------------------------------------------------------
     * 1. Validate uploaded file
     * --------------------------------------------------------
     */
    if (!file) {
      throw new ApiError(
        400,
        "Document file is required",
      );
    }

    if (
      !file.buffer ||
      file.buffer.length === 0
    ) {
      throw new ApiError(
        400,
        "Uploaded file is empty",
      );
    }

    /**
     * --------------------------------------------------------
     * 2. Validate company
     * --------------------------------------------------------
     */
    if (
      !Types.ObjectId.isValid(
        data.companyId,
      )
    ) {
      throw new ApiError(
        400,
        "Invalid company ID",
      );
    }

    /**
     * --------------------------------------------------------
     * 3. Validate owner
     * --------------------------------------------------------
     */
    await this.validateOwner(
      data.companyId,
      data.ownerType,
      data.vehicleId,
      data.driverId,
    );

    /**
     * --------------------------------------------------------
     * 4. Duplicate document check
     * --------------------------------------------------------
     */
    const ownerFilter =
      data.ownerType ===
      DocumentOwnerType.VEHICLE
        ? {
            vehicleId:
              new Types.ObjectId(
                data.vehicleId!,
              ),
          }
        : {
            driverId:
              new Types.ObjectId(
                data.driverId!,
              ),
          };

    const duplicate =
      await DocumentModel.findOne({
        companyId:
          new Types.ObjectId(
            data.companyId,
          ),

        documentType:
          data.documentType,

        ...ownerFilter,

        verificationStatus: {
          $ne:
            DocumentVerificationStatus.REJECTED,
        },
      });

    if (duplicate) {
      throw new ApiError(
        409,
        `A ${this.getDocumentTypeLabel(
          data.documentType,
        )} document already exists for this ${data.ownerType}`,
      );
    }

    /**
     * ========================================================
     * 5. OCR PROCESSING
     * ========================================================
     */
    console.log(
      "========== DOCUMENT OCR START ==========",
    );

    console.log({
      fileName:
        file.originalname,

      mimeType:
        file.mimetype,

      fileSize:
        file.size,

      documentType:
        data.documentType,

      manualExpiryDate:
        data.expiryDate,
    });

    let ocrText = "";

    let ocrProcessed = false;

    let parsedDocument:
      | Awaited<
          ReturnType<
            typeof parseDocumentByType
          >
        >
      | null = null;

    try {
      /**
       * ------------------------------------------------------
       * Run OCR
       * ------------------------------------------------------
       */
      const ocrResult =
        await processDocumentOCR({
          buffer:
            file.buffer,

          mimeType:
            file.mimetype,

          originalFileName:
            file.originalname,
        });

      console.log(
        "========== OCR ENGINE RESULT ==========",
      );

      console.log({
        success:
          ocrResult.success,

        status:
          ocrResult.status,

        confidence:
          ocrResult.confidence,

        processingTimeMs:
          ocrResult.processingTimeMs,

        error:
          ocrResult.error,
      });

      /**
       * ------------------------------------------------------
       * OCR failed completely
       * ------------------------------------------------------
       *
       * IMPORTANT:
       *
       * Even if OCR fails, we can still use
       * manual expiryDate.
       *
       * Therefore we DO NOT immediately reject
       * when manual expiry is available.
       */
      if (
        !ocrResult.success ||
        !ocrResult.text ||
        !ocrResult.text.trim()
      ) {
        console.warn(
          "OCR could not read the document. Manual expiry fallback will be checked.",
        );
      } else {
        /**
         * ----------------------------------------------------
         * OCR succeeded
         * ----------------------------------------------------
         */
        ocrText =
          ocrResult.text.trim();

        ocrProcessed = true;

        console.log(
          "========== RAW OCR TEXT ==========",
        );

        console.log(
          ocrText,
        );

        console.log(
          "========== END RAW OCR TEXT ==========",
        );

        /**
         * ----------------------------------------------------
         * Parse document
         * ----------------------------------------------------
         */
        parsedDocument =
          await parseDocumentByType(
            data.documentType,
            ocrText,
            data.ownerType,
          );

        console.log(
          "========== DOCUMENT PARSER RESULT ==========",
        );

        console.dir(
          parsedDocument,
          {
            depth: null,
          },
        );
      }
    } catch (error) {
      console.error(
        "OCR processing failed:",
        error,
      );

      /**
       * Do NOT immediately throw.
       *
       * Manual expiry may still be available.
       */
      if (
        error instanceof ApiError
      ) {
        console.warn(
          "OCR ApiError received. Checking manual expiry fallback.",
        );
      } else {
        console.warn(
          "Unexpected OCR error. Checking manual expiry fallback.",
        );
      }
    }

    /**
     * ========================================================
     * 6. EXTRACT OCR DATA
     * ========================================================
     */
    const extractedIssueDate =
      parsedDocument?.data
        .issueDate;

    const extractedExpiryDate =
      parsedDocument?.data
        .expiryDate;

    const extractedDocumentNumber =
      parsedDocument?.data
        .documentNumber;

    const extractedIssuingAuthority =
      parsedDocument?.data
        .issuingAuthority;

    /**
     * --------------------------------------------------------
     * Log extracted data
     * --------------------------------------------------------
     */
    console.log(
      "========== OCR EXTRACTED DATA ==========",
    );

    console.log({
      documentNumber:
        extractedDocumentNumber,

      issueDate:
        extractedIssueDate,

      expiryDate:
        extractedExpiryDate,

      issuingAuthority:
        extractedIssuingAuthority,

      expiryDateExtracted:
        parsedDocument
          ?.expiryDateExtracted,

      expiryDateValid:
        parsedDocument
          ?.expiryDateValid,

      confidence:
        parsedDocument?.confidence,

      reviewStatus:
        parsedDocument
          ?.reviewStatus,

      manualExpiryDate:
        data.expiryDate,
    });

    /**
     * ========================================================
     * 7. RESOLVE EXPIRY DATE
     * ========================================================
     *
     * OCR > Manual
     *
     * Case 1:
     *
     * OCR expiry found
     *      ↓
     * Use OCR
     *
     * Case 2:
     *
     * OCR expiry missing
     *      ↓
     * Use manual expiryDate
     *
     * Case 3:
     *
     * Both missing
     *      ↓
     * 400
     */
    const resolvedExpiry =
  this.resolveExpiryDate(
    extractedExpiryDate,
    parsedDocument?.expiryDateValid,
    data.expiryDate,
  );

    const expiryDate =
      resolvedExpiry.expiryDate;

    const expiryDateSource =
      resolvedExpiry.source;

    /**
     * ========================================================
     * 8. VALIDATE DATES
     * ========================================================
     */
    const issueDate =
      extractedIssueDate;

    this.validateDate(
      issueDate,
      "issue date",
    );

    this.validateDate(
      expiryDate,
      "expiry date",
    );

    this.validateDateRelationship(
      issueDate,
      expiryDate,
      expiryDateSource,
    );

    /**
     * ========================================================
     * 9. EXPIRY RESOLUTION LOG
     * ========================================================
     */
    console.log(
      "========== EXPIRY DATE RESOLUTION ==========",
    );

    console.log({
      ocrExpiryDate:
        extractedExpiryDate,

      ocrExpiryValid:
        parsedDocument
          ?.expiryDateValid,

      manualExpiryDate:
        data.expiryDate,

      finalExpiryDate:
        expiryDate,

      expiryDateSource:
        expiryDateSource,

      issueDate:
        issueDate,

      reviewStatus:
        parsedDocument
          ?.reviewStatus,
    });

    /**
     * ========================================================
     * 10. UPLOAD TO CLOUDINARY
     * ========================================================
     */
    let cloudinaryResult;

    try {
      cloudinaryResult =
        await cloudinaryService.uploadDocument(
          file.buffer,

          data.ownerType,

          data.documentType,
        );
    } catch (error) {
      console.error(
        "Cloudinary upload failed:",
        error,
      );

      throw new ApiError(
        500,
        "Failed to upload document to Cloudinary",
      );
    }

    /**
     * ========================================================
     * 11. PREPARE MONGODB DOCUMENT
     * ========================================================
     */
    const documentData:
      Partial<IDocument> = {
      /**
       * Company
       */
      companyId:
        new Types.ObjectId(
          data.companyId,
        ),

      /**
       * Document
       */
      documentType:
        data.documentType,

      ownerType:
        data.ownerType,

      /**
       * Owner
       */
      vehicleId:
        data.ownerType ===
        DocumentOwnerType.VEHICLE
          ? new Types.ObjectId(
              data.vehicleId!,
            )
          : undefined,

      driverId:
        data.ownerType ===
        DocumentOwnerType.DRIVER
          ? new Types.ObjectId(
              data.driverId!,
            )
          : undefined,

      /**
       * OCR extracted fields.
       */
      documentNumber:
        extractedDocumentNumber,

      issueDate:
        issueDate,

      /**
       * IMPORTANT:
       *
       * Final resolved expiry date.
       *
       * OCR > Manual
       */
      expiryDate:
        expiryDate,

      issuingAuthority:
        extractedIssuingAuthority,

      /**
       * Cloudinary
       */
      fileUrl:
        cloudinaryResult.secureUrl,

      originalFileName:
        file.originalname,

      mimeType:
        file.mimetype,

      fileSize:
        file.size,

      cloudinaryPublicId:
        cloudinaryResult.publicId,

      cloudinaryResourceType:
        this.normalizeCloudinaryResourceType(
          cloudinaryResult.resourceType,
        ),

      cloudinaryFormat:
        cloudinaryResult.format,

      /**
       * Verification
       *
       * Manual fallback should remain
       * reviewable.
       */
      verificationStatus:
        DocumentVerificationStatus.UPLOADED,

      /**
       * OCR
       */
      isOcrProcessed:
        ocrProcessed,

      extractedText:
        ocrText,

      /**
       * User
       */
      uploadedBy:
        uploadedBy &&
        Types.ObjectId.isValid(
          uploadedBy,
        )
          ? new Types.ObjectId(
              uploadedBy,
            )
          : undefined,

      notes:
        data.notes?.trim(),
    };

    /**
     * ========================================================
     * 12. SAVE MONGODB
     * ========================================================
     */
    try {
      const document =
        await DocumentModel.create(
          documentData,
        );

      console.log(
        "========== DOCUMENT CREATED SUCCESSFULLY ==========",
      );

      console.log({
        documentId:
          document._id.toString(),

        documentType:
          document.documentType,

        documentNumber:
          document.documentNumber,

        issueDate:
          document.issueDate,

        expiryDate:
          document.expiryDate,

        expiryDateSource:
          expiryDateSource,

        isOcrProcessed:
          document.isOcrProcessed,

        ocrConfidence:
          parsedDocument?.confidence,

        reviewStatus:
          parsedDocument
            ?.reviewStatus,
      });

      return this.toResponseDto(
        document,
      );
    } catch (error) {
      /**
       * ------------------------------------------------------
       * MongoDB failed.
       *
       * Cleanup Cloudinary.
       * ------------------------------------------------------
       */
      try {
        await cloudinaryService.deleteDocument(
          cloudinaryResult.publicId,

          cloudinaryResult.resourceType,
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Failed to cleanup Cloudinary file after database error:",
          cleanupError,
        );
      }

      throw error;
    }
  }

  /**
   * ==========================================================
   * GET DOCUMENTS
   * ==========================================================
   */
  async getDocuments(
    query: DocumentQueryDto,
  ): Promise<DocumentListResponseDto> {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 10;

    const skip =
      (page - 1) *
      limit;

    const filter:
      FilterQuery<IDocument> =
      {};

    if (query.companyId) {
      filter.companyId =
        new Types.ObjectId(
          query.companyId,
        );
    }

    if (query.documentType) {
      filter.documentType =
        query.documentType;
    }

    if (query.ownerType) {
      filter.ownerType =
        query.ownerType;
    }

    if (query.vehicleId) {
      filter.vehicleId =
        new Types.ObjectId(
          query.vehicleId,
        );
    }

    if (query.driverId) {
      filter.driverId =
        new Types.ObjectId(
          query.driverId,
        );
    }

    if (
      query.verificationStatus
    ) {
      filter.verificationStatus =
        query.verificationStatus;
    }

    /**
     * Search.
     */
    if (
      query.search &&
      query.search.trim()
    ) {
      const search =
        query.search.trim();

      filter.$or = [
        {
          documentNumber: {
            $regex: search,
            $options: "i",
          },
        },

        {
          issuingAuthority: {
            $regex: search,
            $options: "i",
          },
        },

        {
          originalFileName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /**
     * Expiry range.
     */
    if (
      query.expiryFrom ||
      query.expiryTo
    ) {
      filter.expiryDate =
        {};

      if (
        query.expiryFrom
      ) {
        filter.expiryDate.$gte =
          new Date(
            query.expiryFrom,
          );
      }

      if (
        query.expiryTo
      ) {
        const expiryTo =
          new Date(
            query.expiryTo,
          );

        expiryTo.setHours(
          23,
          59,
          59,
          999,
        );

        filter.expiryDate.$lte =
          expiryTo;
      }
    }

    /**
     * Expired.
     */
    if (
      query.expired === true
    ) {
      filter.expiryDate = {
        ...(filter.expiryDate ??
          {}),

        $lt: new Date(),
      };
    }

    /**
     * Expiring within N days.
     */
    if (
      query.expiringWithin !==
      undefined
    ) {
      const now =
        new Date();

      const futureDate =
        new Date();

      futureDate.setDate(
        futureDate.getDate() +
          query.expiringWithin,
      );

      filter.expiryDate = {
        ...(filter.expiryDate ??
          {}),

        $gte: now,

        $lte: futureDate,
      };
    }

    /**
     * Sorting.
     */
    const sortBy =
      query.sortBy ??
      "createdAt";

    const sortOrder =
      query.sortOrder ===
      "asc"
        ? 1
        : -1;

    const sort: Record<
      string,
      import("mongoose").SortOrder
    > = {
      [sortBy]:
        sortOrder as import("mongoose").SortOrder,
    };

    /**
     * Execute.
     */
    const [
      documents,
      total,
    ] = await Promise.all([
      DocumentModel.find(
        filter,
      )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      DocumentModel.countDocuments(
        filter,
      ),
    ]);

    const responseDocuments =
      documents.map(
        (document) =>
          this.toResponseDto(
            document,
          ),
      );

    const totalPages =
      Math.ceil(
        total / limit,
      );

    return {
      documents:
        responseDocuments,

      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  /**
   * ==========================================================
   * GET DOCUMENT BY ID
   * ==========================================================
   */
  async getDocumentById(
    documentId: string,
  ): Promise<DocumentResponseDto> {
    if (
      !Types.ObjectId.isValid(
        documentId,
      )
    ) {
      throw new ApiError(
        400,
        "Invalid document ID",
      );
    }

    const document =
      await DocumentModel.findById(
        documentId,
      )
        .populate({
          path: "vehicleId",
          select:
            "registrationNumber vehicleNumber make model vehicleType",
        })
        .populate({
          path: "driverId",
          select:
            "firstName lastName employeeId mobileNumber licenseNumber",
        })
        .populate({
          path: "uploadedBy",
          select:
            "firstName lastName email",
        })
        .populate({
          path: "verifiedBy",
          select:
            "firstName lastName email",
        })
        .lean();

    if (!document) {
      throw new ApiError(
        404,
        "Document not found",
      );
    }

    return this.toResponseDto(
      document,
    );
  }

  /**
   * ==========================================================
   * UPDATE DOCUMENT
   * ==========================================================
   */
  async updateDocument(
    documentId: string,
    data: UpdateDocumentDto,
    file?: Express.Multer.File,
  ): Promise<DocumentResponseDto> {
    /**
     * 1. Validate ID.
     */
    if (
      !Types.ObjectId.isValid(
        documentId,
      )
    ) {
      throw new ApiError(
        400,
        "Invalid document ID",
      );
    }

    /**
     * 2. Find existing document.
     */
    const existing =
      await DocumentModel.findById(
        documentId,
      );

    if (!existing) {
      throw new ApiError(
        404,
        "Document not found",
      );
    }

    /**
     * 3. Determine final owner.
     */
    const finalOwnerType =
      data.ownerType ??
      existing.ownerType;

    const finalVehicleId =
      data.vehicleId ??
      (existing.vehicleId
        ? existing.vehicleId.toString()
        : undefined);

    const finalDriverId =
      data.driverId ??
      (existing.driverId
        ? existing.driverId.toString()
        : undefined);

    /**
     * 4. Validate owner.
     */
    await this.validateOwner(
      existing.companyId.toString(),
      finalOwnerType,
      finalVehicleId,
      finalDriverId,
    );

    /**
     * 5. Existing dates.
     */
    let finalIssueDate =
      data.issueDate !==
      undefined
        ? new Date(
            data.issueDate,
          )
        : existing.issueDate;

    let finalExpiryDate =
      data.expiryDate !==
      undefined
        ? new Date(
            data.expiryDate,
          )
        : existing.expiryDate;

    if (
      finalIssueDate &&
      Number.isNaN(
        finalIssueDate.getTime(),
      )
    ) {
      throw new ApiError(
        400,
        "Invalid issue date",
      );
    }

    if (
      finalExpiryDate &&
      Number.isNaN(
        finalExpiryDate.getTime(),
      )
    ) {
      throw new ApiError(
        400,
        "Invalid expiry date",
      );
    }

    if (
      finalIssueDate &&
      finalExpiryDate &&
      finalExpiryDate <
        finalIssueDate
    ) {
      throw new ApiError(
        400,
        "Expiry date must be after issue date",
      );
    }

    /**
     * 6. Final document type.
     */
    const finalDocumentType =
      data.documentType ??
      existing.documentType;

    /**
     * 7. Duplicate check.
     */
    const ownerFilter =
      finalOwnerType ===
      DocumentOwnerType.VEHICLE
        ? {
            vehicleId:
              new Types.ObjectId(
                finalVehicleId!,
              ),
          }
        : {
            driverId:
              new Types.ObjectId(
                finalDriverId!,
              ),
          };

    const duplicate =
      await DocumentModel.findOne({
        _id: {
          $ne:
            existing._id,
        },

        companyId:
          existing.companyId,

        documentType:
          finalDocumentType,

        ...ownerFilter,

        verificationStatus: {
          $ne:
            DocumentVerificationStatus.REJECTED,
        },
      });

    if (duplicate) {
      throw new ApiError(
        409,
        `A ${this.getDocumentTypeLabel(
          finalDocumentType,
        )} document already exists for this ${finalOwnerType}`,
      );
    }

    /**
     * 8. Prepare update.
     */
    const updateData:
      Record<
        string,
        unknown
      > = {};

    if (
      data.documentType !==
      undefined
    ) {
      updateData.documentType =
        data.documentType;
    }

    if (
      data.ownerType !==
      undefined
    ) {
      updateData.ownerType =
        data.ownerType;
    }

    if (
      finalOwnerType ===
      DocumentOwnerType.VEHICLE
    ) {
      updateData.vehicleId =
        new Types.ObjectId(
          finalVehicleId!,
        );

      updateData.driverId =
        undefined;
    } else {
      updateData.driverId =
        new Types.ObjectId(
          finalDriverId!,
        );

      updateData.vehicleId =
        undefined;
    }

    if (
      data.documentNumber !==
      undefined
    ) {
      updateData.documentNumber =
        data.documentNumber.trim();
    }

    if (
      data.issueDate !==
      undefined
    ) {
      updateData.issueDate =
        finalIssueDate;
    }

    if (
      data.expiryDate !==
      undefined
    ) {
      updateData.expiryDate =
        finalExpiryDate;
    }

    if (
      data.issuingAuthority !==
      undefined
    ) {
      updateData.issuingAuthority =
        data.issuingAuthority.trim();
    }

    if (
      data.notes !==
      undefined
    ) {
      updateData.notes =
        data.notes.trim();
    }

    /**
     * ========================================================
     * 9. NEW FILE + OCR
     * ========================================================
     */
    let newCloudinaryResult:
      | Awaited<
          ReturnType<
            typeof cloudinaryService.uploadDocument
          >
        >
      | undefined;

    let newOCRText = "";

    let newParsedDocument:
      | Awaited<
          ReturnType<
            typeof parseDocumentByType
          >
        >
      | null = null;

    let newExpiryDateSource:
      | ExpiryDateSource
      | undefined;

    if (file) {
      if (
        !file.buffer ||
        file.buffer.length === 0
      ) {
        throw new ApiError(
          400,
          "Uploaded file is empty",
        );
      }

      /**
       * ------------------------------------------------------
       * OCR new file
       * ------------------------------------------------------
       */
      try {
        const ocrResult =
          await processDocumentOCR({
            buffer:
              file.buffer,

            mimeType:
              file.mimetype,

            originalFileName:
              file.originalname,
          });

        /**
         * OCR completely failed.
         *
         * We will still check manual expiryDate.
         */
        if (
          ocrResult.success &&
          ocrResult.text &&
          ocrResult.text.trim()
        ) {
          newOCRText =
            ocrResult.text.trim();

          newParsedDocument =
            await parseDocumentByType(
              finalDocumentType,
              newOCRText,
              finalOwnerType,
            );
        } else {
          console.warn(
            "OCR could not read updated document. Manual expiry fallback will be checked.",
          );
        }
      } catch (error) {
        console.error(
          "OCR processing failed during document update:",
          error,
        );

        /**
         * Do not immediately reject.
         *
         * Manual expiry can be used.
         */
      }

      /**
       * ------------------------------------------------------
       * Resolve expiry
       * ------------------------------------------------------
       */
      const resolvedExpiry =
        this.resolveExpiryDate(
          newParsedDocument?.data
            .expiryDate,
          newParsedDocument
            ?.expiryDateValid,
          data.expiryDate,
        );

      finalExpiryDate =
        resolvedExpiry.expiryDate;

      newExpiryDateSource =
        resolvedExpiry.source;

      finalIssueDate =
        newParsedDocument?.data
          .issueDate ??
        finalIssueDate;

      /**
       * ------------------------------------------------------
       * Validate dates
       * ------------------------------------------------------
       */
      this.validateDate(
        finalIssueDate,
        "issue date",
      );

      this.validateDate(
        finalExpiryDate,
        "expiry date",
      );

      this.validateDateRelationship(
        finalIssueDate,
        finalExpiryDate,
        newExpiryDateSource,
      );

      /**
       * ------------------------------------------------------
       * Upload new file
       * ------------------------------------------------------
       */
      try {
        newCloudinaryResult =
          await cloudinaryService.uploadDocument(
            file.buffer,

            finalOwnerType,

            finalDocumentType,
          );
      } catch (
        error
      ) {
        console.error(
          "Cloudinary upload failed:",
          error,
        );

        throw new ApiError(
          500,
          "Failed to upload new document to Cloudinary",
        );
      }

      /**
       * Cloudinary information.
       */
      updateData.fileUrl =
        newCloudinaryResult.secureUrl;

      updateData.originalFileName =
        file.originalname;

      updateData.mimeType =
        file.mimetype;

      updateData.fileSize =
        file.size;

      updateData.cloudinaryPublicId =
        newCloudinaryResult.publicId;

      updateData.cloudinaryResourceType =
        this.normalizeCloudinaryResourceType(
          newCloudinaryResult.resourceType,
        );

      updateData.cloudinaryFormat =
        newCloudinaryResult.format;

      /**
       * OCR.
       */
      updateData.isOcrProcessed =
        Boolean(
          newParsedDocument,
        );

      updateData.extractedText =
        newOCRText;

      /**
       * OCR fields.
       */
      if (
        newParsedDocument
      ) {
        updateData.documentNumber =
          newParsedDocument
            .data.documentNumber;

        updateData.issuingAuthority =
          newParsedDocument
            .data.issuingAuthority;
      }

      updateData.issueDate =
        finalIssueDate;

      /**
       * IMPORTANT:
       *
       * OCR expiry > manual expiry.
       */
      updateData.expiryDate =
        finalExpiryDate;

      /**
       * New file requires verification.
       */
      updateData.verificationStatus =
        DocumentVerificationStatus.UPLOADED;

      updateData.verifiedBy =
        undefined;

      updateData.verifiedAt =
        undefined;

      console.log(
        "========== UPDATE EXPIRY RESOLUTION ==========",
      );

      console.log({
        ocrExpiryDate:
          newParsedDocument?.data
            .expiryDate,

        ocrExpiryValid:
          newParsedDocument
            ?.expiryDateValid,

        manualExpiryDate:
          data.expiryDate,

        finalExpiryDate:
          finalExpiryDate,

        expiryDateSource:
          newExpiryDateSource,
      });
    }

    /**
     * ========================================================
     * 10. Verification update
     * ========================================================
     */
    if (
      data.verificationStatus !==
        undefined &&
      !file
    ) {
      updateData.verificationStatus =
        data.verificationStatus;

      if (
        data.verificationStatus ===
        DocumentVerificationStatus.VERIFIED
      ) {
        if (
          !data.verifiedBy
        ) {
          throw new ApiError(
            400,
            "verifiedBy is required when document is verified",
          );
        }

        if (
          !Types.ObjectId.isValid(
            data.verifiedBy,
          )
        ) {
          throw new ApiError(
            400,
            "Invalid verifiedBy user ID",
          );
        }

        updateData.verifiedBy =
          new Types.ObjectId(
            data.verifiedBy,
          );

        updateData.verifiedAt =
          data.verifiedAt
            ? new Date(
                data.verifiedAt,
              )
            : new Date();
      }

      if (
        data.verificationStatus ===
        DocumentVerificationStatus.REJECTED
      ) {
        updateData.verifiedBy =
          undefined;

        updateData.verifiedAt =
          undefined;
      }
    }

    /**
     * ========================================================
     * 11. Update MongoDB
     * ========================================================
     */
    let updatedDocument;

    try {
      updatedDocument =
        await DocumentModel.findByIdAndUpdate(
          existing._id,
          {
            $set:
              updateData,
          },
          {
            new: true,

            runValidators: true,
          },
        );
    } catch (
      error
    ) {
      /**
       * Cleanup newly uploaded file.
       */
      if (
        newCloudinaryResult
      ) {
        try {
          await cloudinaryService.deleteDocument(
            newCloudinaryResult.publicId,

            newCloudinaryResult.resourceType,
          );
        } catch {
          console.error(
            "Failed to cleanup new Cloudinary file:",
            newCloudinaryResult.publicId,
          );
        }
      }

      throw error;
    }

    if (!updatedDocument) {
      if (
        newCloudinaryResult
      ) {
        try {
          await cloudinaryService.deleteDocument(
            newCloudinaryResult.publicId,

            newCloudinaryResult.resourceType,
          );
        } catch {
          console.error(
            "Failed to cleanup Cloudinary file:",
            newCloudinaryResult.publicId,
          );
        }
      }

      throw new ApiError(
        404,
        "Document not found",
      );
    }

    /**
     * ========================================================
     * 12. Delete old Cloudinary file
     * ========================================================
     */
    if (
      newCloudinaryResult &&
      existing.cloudinaryPublicId
    ) {
      try {
        await cloudinaryService.deleteDocument(
          existing.cloudinaryPublicId,

          existing.cloudinaryResourceType,
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to delete old Cloudinary document:",
          existing.cloudinaryPublicId,
          error,
        );
      }
    }

    return this.toResponseDto(
      updatedDocument,
    );
  }

  /**
   * ==========================================================
   * DELETE DOCUMENT
   * ==========================================================
   */
  async deleteDocument(
    documentId: string,
  ): Promise<{
    message: string;
    documentId: string;
  }> {
    if (
      !Types.ObjectId.isValid(
        documentId,
      )
    ) {
      throw new ApiError(
        400,
        "Invalid document ID",
      );
    }

    const document =
      await DocumentModel.findById(
        documentId,
      );

    if (!document) {
      throw new ApiError(
        404,
        "Document not found",
      );
    }

    if (
      document.cloudinaryPublicId
    ) {
      try {
        await cloudinaryService.deleteDocument(
          document.cloudinaryPublicId,

          document.cloudinaryResourceType,
        );
      } catch {
        throw new ApiError(
          500,
          "Failed to delete document from Cloudinary",
        );
      }
    }

    await DocumentModel.deleteOne({
      _id: document._id,
    });

    return {
      message:
        "Document deleted successfully",

      documentId:
        document._id.toString(),
    };
  }

  /**
   * ==========================================================
   * VALIDATE OWNER
   * ==========================================================
   */
  private async validateOwner(
    companyId: string,
    ownerType: DocumentOwnerType,
    vehicleId?: string,
    driverId?: string,
  ): Promise<void> {
    /**
     * VEHICLE
     */
    if (
      ownerType ===
      DocumentOwnerType.VEHICLE
    ) {
      if (!vehicleId) {
        throw new ApiError(
          400,
          "vehicleId is required for vehicle documents",
        );
      }

      if (
        !Types.ObjectId.isValid(
          vehicleId,
        )
      ) {
        throw new ApiError(
          400,
          "Invalid vehicle ID",
        );
      }

      const vehicle =
        await Vehicle.findOne({
          _id:
            new Types.ObjectId(
              vehicleId,
            ),

          companyId:
            new Types.ObjectId(
              companyId,
            ),
        })
          .select("_id")
          .lean();

      if (!vehicle) {
        throw new ApiError(
          404,
          "Vehicle not found in the selected company",
        );
      }

      return;
    }

    /**
     * DRIVER
     */
    if (
      ownerType ===
      DocumentOwnerType.DRIVER
    ) {
      if (!driverId) {
        throw new ApiError(
          400,
          "driverId is required for driver documents",
        );
      }

      if (
        !Types.ObjectId.isValid(
          driverId,
        )
      ) {
        throw new ApiError(
          400,
          "Invalid driver ID",
        );
      }

      const driver =
        await Driver.findOne({
          _id:
            new Types.ObjectId(
              driverId,
            ),

          companyId:
            new Types.ObjectId(
              companyId,
            ),
        })
          .select("_id")
          .lean();

      if (!driver) {
        throw new ApiError(
          404,
          "Driver not found in the selected company",
        );
      }

      return;
    }

    throw new ApiError(
      400,
      "Invalid document owner type",
    );
  }

  /**
   * ==========================================================
   * CALCULATE DAYS REMAINING
   * ==========================================================
   */
  private calculateDaysRemaining(
    expiryDate?: Date,
  ): number | undefined {
    if (!expiryDate) {
      return undefined;
    }

    const now =
      new Date();

    const today =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

    const expiry =
      new Date(
        expiryDate.getFullYear(),
        expiryDate.getMonth(),
        expiryDate.getDate(),
      );

    const difference =
      expiry.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 *
          60 *
          60 *
          24),
    );
  }

  /**
   * ==========================================================
   * CALCULATE COMPLIANCE STATUS
   * ==========================================================
   */
  private calculateComplianceStatus(
    daysRemaining?: number,
  ):
    | "valid"
    | "expiring_soon"
    | "expired" {
    if (
      daysRemaining ===
      undefined
    ) {
      return "valid";
    }

    if (
      daysRemaining < 0
    ) {
      return "expired";
    }

    if (
      daysRemaining <=
      EXPIRING_SOON_DAYS
    ) {
      return "expiring_soon";
    }

    return "valid";
  }

  /**
   * ==========================================================
   * CLOUDINARY RESOURCE TYPE
   * ==========================================================
   */
  private normalizeCloudinaryResourceType(
    resourceType: string,
  ): CloudinaryResourceType {
    if (
      resourceType ===
      CloudinaryResourceType.IMAGE
    ) {
      return CloudinaryResourceType.IMAGE;
    }

    return CloudinaryResourceType.RAW;
  }

  /**
   * ==========================================================
   * DOCUMENT TYPE LABEL
   * ==========================================================
   */
  private getDocumentTypeLabel(
    documentType: DocumentType,
  ): string {
    const labels: Record<
      DocumentType,
      string
    > = {
      [DocumentType.RC]:
        "RC",

      [DocumentType.PUC]:
        "PUC",

      [DocumentType.FITNESS]:
        "Fitness",

      [DocumentType.INSURANCE]:
        "Insurance",

      [DocumentType.PERMIT]:
        "Permit",

      [DocumentType.ROAD_TAX]:
        "Road Tax",

      [DocumentType.DRIVING_LICENSE]:
        "Driving License",

      [DocumentType.MEDICAL_CERTIFICATE]:
        "Medical Certificate",

      [DocumentType.OTHER]:
        "Other",
    };

    return (
      labels[documentType] ??
      "Document"
    );
  }

  /**
   * ==========================================================
   * RESPONSE DTO
   * ==========================================================
   */
  private toResponseDto(
    document: any,
  ): DocumentResponseDto {
    const expiryDate =
      document.expiryDate
        ? new Date(
            document.expiryDate,
          )
        : undefined;

    const daysRemaining =
      this.calculateDaysRemaining(
        expiryDate,
      );

    const complianceStatus =
      this.calculateComplianceStatus(
        daysRemaining,
      );

    return {
      _id:
        document._id.toString(),

      companyId:
        document.companyId.toString(),

      documentType:
        document.documentType,

      ownerType:
        document.ownerType,

      vehicleId:
        document.vehicleId
          ? this.getObjectIdString(
              document.vehicleId,
            )
          : undefined,

      driverId:
        document.driverId
          ? this.getObjectIdString(
              document.driverId,
            )
          : undefined,

      documentNumber:
        document.documentNumber,

      issueDate:
        document.issueDate
          ? new Date(
              document.issueDate,
            ).toISOString()
          : undefined,

      expiryDate:
        expiryDate
          ? expiryDate.toISOString()
          : "",

      issuingAuthority:
        document.issuingAuthority,

      fileUrl:
        document.fileUrl,

      originalFileName:
        document.originalFileName,

      mimeType:
        document.mimeType,

      fileSize:
        document.fileSize,

      cloudinaryPublicId:
        document.cloudinaryPublicId,

      cloudinaryResourceType:
        this.normalizeCloudinaryResourceType(
          document.cloudinaryResourceType,
        ),

      cloudinaryFormat:
        document.cloudinaryFormat,

      verificationStatus:
        document.verificationStatus,

      isOcrProcessed:
        document.isOcrProcessed,

      extractedText:
        document.extractedText,

      notes:
        document.notes,

      uploadedBy:
        document.uploadedBy
          ? this.getObjectIdString(
              document.uploadedBy,
            )
          : undefined,

      verifiedBy:
        document.verifiedBy
          ? this.getObjectIdString(
              document.verifiedBy,
            )
          : undefined,

      verifiedAt:
        document.verifiedAt
          ? new Date(
              document.verifiedAt,
            ).toISOString()
          : undefined,

      daysRemaining,

      complianceStatus,

      createdAt:
        new Date(
          document.createdAt,
        ).toISOString(),

      updatedAt:
        new Date(
          document.updatedAt,
        ).toISOString(),
    };
  }

  /**
   * ==========================================================
   * OBJECT ID STRING HELPER
   * ==========================================================
   */
  private getObjectIdString(
    value: any,
  ): string {
    if (
      value instanceof
      Types.ObjectId
    ) {
      return value.toString();
    }

    if (
      value &&
      typeof value ===
        "object" &&
      value._id
    ) {
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
const documentService =
  new DocumentService();

export default documentService;