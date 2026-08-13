// // import { Router } from "express";
// // import { z } from "zod";

// // import documentController from "../controllers/document.controller";

// // import { authenticate, authorize } from "../middleware/auth";
// // import { uploadDocument } from "../middleware/upload.middleware";

// // import validateBody from "../middleware/validate";

// // import {
// //   createDocumentSchema,
// //   updateDocumentSchema,
// //   documentIdSchema,
// //   documentQuerySchema,
// // } from "../utils/validation/document.validation";

// // /**
// //  * ============================================================
// //  * DOCUMENT ROUTER
// //  * ============================================================
// //  */
// // const router = Router();

// // /**
// //  * ============================================================
// //  * CREATE DOCUMENT
// //  * ============================================================
// //  *
// //  * POST /api/v1/documents
// //  *
// //  * Request:
// //  *
// //  * Content-Type: multipart/form-data
// //  *
// //  * Flow:
// //  *
// //  * authenticate
// //  *      ↓
// //  * uploadDocument
// //  *      ↓
// //  * validateBody
// //  *      ↓
// //  * controller
// //  *      ↓
// //  * documentService
// //  *      ↓
// //  * Cloudinary
// //  *      ↓
// //  * MongoDB
// //  */
// // router.post(
// //   "/",

// //   authenticate,

// //   uploadDocument,

// //   validateBody(
// //     z.object({
// //       body: createDocumentSchema,
// //     }),
// //   ),

// //   documentController.createDocument,
// // );

// // /**
// //  * ============================================================
// //  * GET DOCUMENTS
// //  * ============================================================
// //  *
// //  * GET /api/v1/documents
// //  *
// //  * Examples:
// //  *
// //  * /documents?page=1&limit=10
// //  *
// //  * /documents?documentType=puc
// //  *
// //  * /documents?ownerType=vehicle
// //  *
// //  * /documents?vehicleId=...
// //  *
// //  * /documents?expired=true
// //  *
// //  * /documents?expiringWithin=30
// //  *
// //  * /documents?sortBy=expiryDate&sortOrder=asc
// //  */
// // router.get(
// //   "/",

// //   authenticate,

// //   validateBody(
// //     z.object({
// //       query: documentQuerySchema,
// //     }),
// //   ),

// //   documentController.getDocuments,
// // );

// // /**
// //  * ============================================================
// //  * GET DOCUMENT BY ID
// //  * ============================================================
// //  *
// //  * GET /api/v1/documents/:id
// //  */
// // router.get(
// //   "/:id",

// //   authenticate,

// //   validateBody(
// //     z.object({
// //       params: documentIdSchema,
// //     }),
// //   ),

// //   documentController.getDocumentById,
// // );

// // /**
// //  * ============================================================
// //  * UPDATE DOCUMENT
// //  * ============================================================
// //  *
// //  * PATCH /api/v1/documents/:id
// //  *
// //  * Can update:
// //  *
// //  * 1. Metadata only
// //  *
// //  * OR
// //  *
// //  * 2. Metadata + new file
// //  *
// //  * If new file is supplied:
// //  *
// //  * old file
// //  *    ↓
// //  * new Cloudinary upload
// //  *    ↓
// //  * MongoDB update
// //  *    ↓
// //  * old Cloudinary file delete
// //  */
// // router.patch(
// //   "/:id",

// //   authenticate,

// //   uploadDocument,

// //   validateBody(
// //     z.object({
// //       params: documentIdSchema,

// //       body: updateDocumentSchema,
// //     }),
// //   ),

// //   documentController.updateDocument,
// // );

// // /**
// //  * ============================================================
// //  * DELETE DOCUMENT
// //  * ============================================================
// //  *
// //  * DELETE /api/v1/documents/:id
// //  *
// //  * Flow:
// //  *
// //  * MongoDB document
// //  *      ↓
// //  * Cloudinary asset
// //  *      ↓
// //  * Cloudinary delete
// //  *      ↓
// //  * MongoDB delete
// //  */
// // router.delete(
// //   "/:id",

// //   authenticate,

// //   validateBody(
// //     z.object({
// //       params: documentIdSchema,
// //     }),
// //   ),

// //   documentController.deleteDocument,
// // );

// // /**
// //  * ============================================================
// //  * EXPORT
// //  * ============================================================
// //  */
// // export default router;
// import { Router, Request, Response, NextFunction } from "express";

// import documentController from "../controllers/document.controller";

// import { authenticate } from "../middleware/auth";

// import { uploadDocument } from "../middleware/upload.middleware";

// import {
//   createDocumentSchema,
//   updateDocumentSchema,
//   documentIdSchema,
//   documentQuerySchema,
// } from "../utils/validation/document.validation";

// import { ApiError } from "../utils/ApiError";

// const router = Router();

// /**
//  * ============================================================
//  * VALIDATE DOCUMENT BODY
//  * ============================================================
//  *
//  * IMPORTANT:
//  *
//  * Do NOT use validate.ts here.
//  *
//  * Multer first creates:
//  *
//  * req.body
//  * req.file
//  *
//  * Then we validate req.body directly.
//  */
// const validateDocumentBody =
//   (schema: any) => (req: Request, _res: Response, next: NextFunction) => {
//     console.log("\n========== DOCUMENT BODY VALIDATION ==========");

//     console.log("Content-Type:", req.headers["content-type"]);

//     console.log("Request body:");

//     console.dir(req.body, {
//       depth: null,
//     });

//     console.log("Request file:");

//     console.dir(req.file, {
//       depth: 1,
//     });

//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       console.log("========== DOCUMENT ZOD ERROR ==========");

//       console.dir(result.error.flatten(), {
//         depth: null,
//       });

//       return next(
//         new ApiError(400, "Document validation failed", result.error.flatten()),
//       );
//     }

//     /**
//      * Store parsed/validated data.
//      */
//     req.body = result.data;

//     next();
//   };

// /**
//  * ============================================================
//  * VALIDATE DOCUMENT PARAMS
//  * ============================================================
//  */
// const validateDocumentParams = (
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ) => {
//   const result = documentIdSchema.safeParse(req.params);

//   if (!result.success) {
//     return next(
//       new ApiError(400, "Invalid document ID", result.error.flatten()),
//     );
//   }

//   req.params = result.data;

//   next();
// };

// /**
//  * ============================================================
//  * VALIDATE DOCUMENT QUERY
//  * ============================================================
//  */
// const validateDocumentQuery = (
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ) => {
//   const result = documentQuerySchema.safeParse(req.query);

//   if (!result.success) {
//     return next(
//       new ApiError(400, "Invalid document query", result.error.flatten()),
//     );
//   }

//   req.query = result.data as unknown as typeof req.query;

//   next();
// };

// /**
//  * ============================================================
//  * CREATE DOCUMENT
//  * ============================================================
//  *
//  * POST /api/v1/documents
//  */
// router.post(
//   "/",

//   authenticate,

//   /**
//    * IMPORTANT:
//    * Multer must run before body validation.
//    */
//   uploadDocument,

//   validateDocumentBody(createDocumentSchema),

//   documentController.createDocument,
// );

// /**
//  * ============================================================
//  * GET DOCUMENTS
//  * ============================================================
//  *
//  * GET /api/v1/documents
//  */
// router.get(
//   "/",

//   authenticate,

//   validateDocumentQuery,

//   documentController.getDocuments,
// );

// /**
//  * ============================================================
//  * GET DOCUMENT BY ID
//  * ============================================================
//  *
//  * GET /api/v1/documents/:id
//  */
// router.get(
//   "/:id",

//   authenticate,

//   validateDocumentParams,

//   documentController.getDocumentById,
// );

// /**
//  * ============================================================
//  * UPDATE DOCUMENT
//  * ============================================================
//  *
//  * PATCH /api/v1/documents/:id
//  */
// router.patch(
//   "/:id",

//   authenticate,

//   uploadDocument,

//   validateDocumentParams,

//   validateDocumentBody(updateDocumentSchema),

//   documentController.updateDocument,
// );

// /**
//  * ============================================================
//  * DELETE DOCUMENT
//  * ============================================================
//  *
//  * DELETE /api/v1/documents/:id
//  */
// router.delete(
//   "/:id",

//   authenticate,

//   validateDocumentParams,

//   documentController.deleteDocument,
// );

// export default router;

import { Router, Request, Response, NextFunction } from "express";

import { authenticate } from "../middleware/auth";

import upload from "../middleware/upload.middleware";

import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdSchema,
  documentQuerySchema,
} from "../utils/validation/document.validation";

import documentController from "../controllers/document.controller";

import { ApiError } from "../utils/ApiError";

const router = Router();

/**
 * ============================================================
 * CREATE DOCUMENT VALIDATION
 * ============================================================
 *
 * Multipart request:
 *
 * req.body -> document metadata
 * req.file -> uploaded file
 *
 * createDocumentSchema directly validates req.body.
 */
const validateCreateDocument = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    console.log("\n========== DOCUMENT BODY VALIDATION ==========");

    console.log("Content-Type:", req.headers["content-type"]);

    console.log("Request body:");

    console.dir(req.body, {
      depth: null,
    });

    console.log("Request file:");

    console.dir(req.file, {
      depth: 1,
    });

    /**
     * --------------------------------------------------------
     * Validate metadata
     * --------------------------------------------------------
     */
    const result = createDocumentSchema.safeParse(req.body);

    if (!result.success) {
      console.log("\n========== DOCUMENT ZOD ERROR ==========");

      console.dir(result.error.flatten(), {
        depth: null,
      });

      return next(
        new ApiError(400, "Document validation failed", result.error.flatten()),
      );
    }

    /**
     * --------------------------------------------------------
     * File required for CREATE
     * --------------------------------------------------------
     */
    if (!req.file) {
      return next(new ApiError(400, "Document file is required"));
    }

    /**
     * --------------------------------------------------------
     * Use validated data
     * --------------------------------------------------------
     */
    req.body = result.data;

    console.log("\n========== DOCUMENT VALIDATION SUCCESS ==========");

    console.dir(req.body, {
      depth: null,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * UPDATE DOCUMENT VALIDATION
 * ============================================================
 */
const validateUpdateDocument = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    console.log("\n========== DOCUMENT UPDATE VALIDATION ==========");

    console.log("Request body:");

    console.dir(req.body, {
      depth: null,
    });

    console.log("Request file:");

    console.dir(req.file, {
      depth: 1,
    });

    /**
     * --------------------------------------------------------
     * Validate update metadata
     * --------------------------------------------------------
     */
    const result = updateDocumentSchema.safeParse(req.body);

    if (!result.success) {
      console.log("\n========== DOCUMENT UPDATE ZOD ERROR ==========");

      console.dir(result.error.flatten(), {
        depth: null,
      });

      return next(
        new ApiError(400, "Document validation failed", result.error.flatten()),
      );
    }

    req.body = result.data;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * DOCUMENT ID VALIDATION
 * ============================================================
 */
const validateDocumentId = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const result = documentIdSchema.safeParse(req.params);

    if (!result.success) {
      return next(
        new ApiError(400, "Invalid document ID", result.error.flatten()),
      );
    }

    req.params = result.data;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * DOCUMENT QUERY VALIDATION
 * ============================================================
 */
const validateDocumentQuery = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const result = documentQuerySchema.safeParse(req.query);

    if (!result.success) {
      return next(
        new ApiError(400, "Invalid document query", result.error.flatten()),
      );
    }

    req.query = result.data as any;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * CREATE DOCUMENT
 * ============================================================
 *
 * POST /api/v1/documents
 *
 * Flow:
 *
 * authenticate
 *      ↓
 * multer
 *      ↓
 * validation
 *      ↓
 * controller
 */
router.post(
  "/",
  authenticate,
  upload.single("file"),
  validateCreateDocument,
  documentController.createDocument,
);

/**
 * ============================================================
 * GET DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/documents
 */
router.get(
  "/",
  authenticate,
  validateDocumentQuery,
  documentController.getDocuments,
);

/**
 * ============================================================
 * GET DOCUMENT BY ID
 * ============================================================
 *
 * GET /api/v1/documents/:id
 */
router.get(
  "/:id",
  authenticate,
  validateDocumentId,
  documentController.getDocumentById,
);

/**
 * ============================================================
 * UPDATE DOCUMENT
 * ============================================================
 *
 * PATCH /api/v1/documents/:id
 *
 * File is optional.
 */
router.patch(
  "/:id",
  authenticate,
  upload.single("file"),
  validateDocumentId,
  validateUpdateDocument,
  documentController.updateDocument,
);

/**
 * ============================================================
 * DELETE DOCUMENT
 * ============================================================
 *
 * DELETE /api/v1/documents/:id
 */
router.delete(
  "/:id",
  authenticate,
  validateDocumentId,
  documentController.deleteDocument,
);

export default router;
