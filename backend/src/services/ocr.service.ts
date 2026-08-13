import { createWorker, type Worker } from "tesseract.js";
import sharp from "sharp";

import ocrConfig, {
  isOCRSupportedMimeType,
} from "../config/ocr";

/**
 * ============================================================
 * PDFIUM DYNAMIC IMPORT
 * ============================================================
 *
 * @hyzyla/pdfium is ESM.
 *
 * Backend is currently CommonJS.
 *
 * Therefore use a real native dynamic import().
 */

type PDFiumModule = typeof import("@hyzyla/pdfium", { with: { "resolution-mode": "require" } });

const loadPDFium =
  async (): Promise<PDFiumModule> => {
    const dynamicImport =
      new Function(
        "specifier",
        "return import(specifier);",
      ) as (
        specifier: string,
      ) => Promise<PDFiumModule>;

    return dynamicImport(
      "@hyzyla/pdfium",
    );
  };

/**
 * ============================================================
 * OCR SERVICE
 * ============================================================
 *
 * Phase 7 — OCR & Automatic Document Data Extraction
 *
 * Supported:
 *
 * - JPG
 * - JPEG
 * - PNG
 * - WEBP
 * - PDF
 *
 * Image flow:
 *
 * Original Image
 *      ↓
 * Sharp
 *      ↓
 * Multiple preprocessing variants
 *      ↓
 * Tesseract
 *      ↓
 * Best OCR result
 *
 * PDF flow:
 *
 * PDF
 *      ↓
 * PDFium
 *      ↓
 * PNG
 *      ↓
 * Multi-pass OCR
 *      ↓
 * Combined OCR text
 */

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type OCRStatus =
  | "success"
  | "failed"
  | "skipped";

export interface OCRResult {
  success: boolean;

  status: OCRStatus;

  text: string;

  provider: string;

  languages: string[];

  processingTimeMs: number;

  confidence?: number;

  error?: string;
}

export interface OCRInput {
  buffer: Buffer;

  mimeType: string;

  originalFileName?: string;
}

/**
 * ============================================================
 * INTERNAL OCR TYPES
 * ============================================================
 */

interface OCRPassResult {
  text: string;

  confidence?: number;

  variant: string;
}

interface OCRImageVariant {
  name: string;

  buffer: Buffer;
}

/**
 * ============================================================
 * WORKER
 * ============================================================
 */

let worker: Worker | null = null;

let workerInitializationPromise:
  Promise<Worker> | null = null;

/**
 * Shared worker must not receive simultaneous
 * recognize() calls.
 */
let workerLock:
  Promise<void> = Promise.resolve();

/**
 * ============================================================
 * LANGUAGE NORMALIZATION
 * ============================================================
 */

const normalizeLanguages =
  (): string[] => {
    const languages =
      ocrConfig.languages
        .map((language) =>
          language.trim(),
        )
        .filter(Boolean);

    if (
      languages.length === 0
    ) {
      return ["eng"];
    }

    return languages;
  };

/**
 * ============================================================
 * CREATE OCR WORKER
 * ============================================================
 */

const createOCRWorker =
  async (): Promise<Worker> => {
    /**
     * Reuse existing worker.
     */
    if (worker) {
      return worker;
    }

    /**
     * Prevent duplicate initialization.
     */
    if (
      workerInitializationPromise
    ) {
      return workerInitializationPromise;
    }

    workerInitializationPromise =
      (async () => {
        const languages =
          normalizeLanguages();

        console.log(
          "========== TESSERACT WORKER INITIALIZATION ==========",
        );

        console.log({
          languages,
        });

        const newWorker =
          await createWorker(
            languages,
            1,
            {
              logger:
                (message) => {
                  /**
                   * Keep recognition progress
                   * logs quiet.
                   */
                  if (
                    process.env.NODE_ENV ===
                    "development"
                  ) {
                    if (
                      message.status ===
                        "recognizing text" &&
                      typeof message.progress ===
                        "number"
                    ) {
                      return;
                    }
                  }
                },
            },
          );

        worker =
          newWorker;

        console.log(
          "Tesseract worker initialized successfully",
        );

        return newWorker;
      })();

    try {
      return await workerInitializationPromise;
    } finally {
      workerInitializationPromise =
        null;
    }
  };

/**
 * ============================================================
 * INPUT VALIDATION
 * ============================================================
 */

const validateOCRInput =
  (
    input: OCRInput,
  ): void => {
    if (
      !input.buffer ||
      !Buffer.isBuffer(
        input.buffer,
      )
    ) {
      throw new Error(
        "OCR requires a valid file buffer",
      );
    }

    if (
      input.buffer.length === 0
    ) {
      throw new Error(
        "OCR cannot process an empty file",
      );
    }

    if (
      input.buffer.length >
      ocrConfig.maxFileSize
    ) {
      throw new Error(
        `File exceeds OCR maximum size of ${Math.round(
          ocrConfig.maxFileSize /
            (1024 * 1024),
        )} MB`,
      );
    }

    if (
      !isOCRSupportedMimeType(
        input.mimeType,
      )
    ) {
      throw new Error(
        `Unsupported OCR MIME type: ${input.mimeType}`,
      );
    }
  };

/**
 * ============================================================
 * MIME HELPERS
 * ============================================================
 */

const isImageMimeType =
  (
    mimeType: string,
  ): boolean => {
    return [
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(
      mimeType,
    );
  };

const isPDFMimeType =
  (
    mimeType: string,
  ): boolean => {
    return (
      mimeType ===
      "application/pdf"
    );
  };

/**
 * ============================================================
 * IMAGE METADATA
 * ============================================================
 */

const getImageMetadata =
  async (
    buffer: Buffer,
  ) => {
    const metadata =
      await sharp(
        buffer,
      ).metadata();

    console.log(
      "========== OCR IMAGE METADATA ==========",
    );

    console.log({
      width:
        metadata.width,

      height:
        metadata.height,

      format:
        metadata.format,

      space:
        metadata.space,

      channels:
        metadata.channels,

      density:
        metadata.density,
    });

    if (
      !metadata.format
    ) {
      throw new Error(
        "Uploaded image is not a valid image format",
      );
    }

    return metadata;
  };

/**
 * ============================================================
 * CALCULATE OCR-SAFE SIZE
 * ============================================================
 *
 * Tesseract generally performs better when small document
 * text is enlarged.
 *
 * But we do not upscale infinitely because that increases
 * memory and processing time.
 */

const calculateTargetWidth =
  (
    width: number,
  ): number => {
    /**
     * Small images:
     * upscale significantly.
     */
    if (width < 1000) {
      return 1800;
    }

    /**
     * Medium images:
     * moderate upscale.
     */
    if (width < 1600) {
      return 2200;
    }

    /**
     * Already large:
     * keep near original.
     */
    return Math.min(
      width,
      2600,
    );
  };

/**
 * ============================================================
 * BASE IMAGE
 * ============================================================
 */

const createBaseImage =
  async (
    buffer: Buffer,
  ): Promise<Buffer> => {
    const metadata =
      await getImageMetadata(
        buffer,
      );

    const width =
      metadata.width ??
      0;

    const targetWidth =
      width > 0
        ? calculateTargetWidth(
            width,
          )
        : undefined;

    /**
     * Base normalization:
     *
     * - rotate according to EXIF
     * - white background
     * - resize
     * - remove alpha
     * - PNG
     */
    const image =
      sharp(buffer)
        .rotate()
        .flatten({
          background:
            "#ffffff",
        });

    if (
      targetWidth
    ) {
      image.resize({
        width:
          targetWidth,

        withoutEnlargement:
          false,

        fit: "inside",

        kernel:
          sharp
            .kernel
            .lanczos3,
      });
    }

    const result =
      await image
        .png({
          compressionLevel:
            6,

          adaptiveFiltering:
            true,

          force: true,
        })
        .toBuffer();

    const resultMetadata =
      await sharp(
        result,
      ).metadata();

    console.log(
      "========== OCR BASE IMAGE ==========",
    );

    console.log({
      format:
        resultMetadata.format,

      width:
        resultMetadata.width,

      height:
        resultMetadata.height,

      size:
        result.length,
    });

    return result;
  };

/**
 * ============================================================
 * CREATE OCR IMAGE VARIANTS
 * ============================================================
 *
 * Variant 1:
 * Enhanced color/contrast.
 *
 * Variant 2:
 * Grayscale + normalization + sharpen.
 *
 * Variant 3:
 * Grayscale + threshold.
 *
 * Different documents behave differently.
 *
 * Insurance documents often benefit from
 * grayscale + sharpen.
 *
 * Low contrast scans often benefit from
 * threshold.
 */

const createOCRImageVariants =
  async (
    buffer: Buffer,
  ): Promise<
    OCRImageVariant[]
  > => {
    const base =
      await createBaseImage(
        buffer,
      );

    /**
     * --------------------------------------------------------
     * PASS 1 — ENHANCED
     * --------------------------------------------------------
     */
    const enhanced =
      await sharp(base)
        .normalize()
        .linear(
          1.15,
          -10,
        )
        .sharpen({
          sigma: 1.1,

          m1: 0.8,

          m2: 2.5,
        })
        .png()
        .toBuffer();

    /**
     * --------------------------------------------------------
     * PASS 2 — GRAYSCALE
     * --------------------------------------------------------
     */
    const grayscale =
      await sharp(base)
        .grayscale()
        .normalize()
        .sharpen({
          sigma: 1.2,

          m1: 0.8,

          m2: 2.5,
        })
        .png()
        .toBuffer();

    /**
     * --------------------------------------------------------
     * PASS 3 — THRESHOLD
     * --------------------------------------------------------
     *
     * Threshold is useful for:
     *
     * - faded documents
     * - dark text
     * - white paper
     *
     * But it can destroy small characters,
     * therefore it is only one of the passes.
     */
    const threshold =
      await sharp(base)
        .grayscale()
        .normalize()
        .sharpen({
          sigma: 1.3,

          m1: 1,

          m2: 3,
        })
        .threshold(
          175,
        )
        .png()
        .toBuffer();

    const variants:
      OCRImageVariant[] =
      [
        {
          name:
            "enhanced",

          buffer:
            enhanced,
        },

        {
          name:
            "grayscale",

          buffer:
            grayscale,
        },

        {
          name:
            "threshold",

          buffer:
            threshold,
        },
      ];

    console.log(
      "========== OCR IMAGE VARIANTS ==========",
    );

    for (
      const variant of variants
    ) {
      const metadata =
        await sharp(
          variant.buffer,
        ).metadata();

      console.log({
        name:
          variant.name,

        width:
          metadata.width,

        height:
          metadata.height,

        size:
          variant.buffer.length,
      });
    }

    return variants;
  };

/**
 * ============================================================
 * OCR TEXT CLEANUP
 * ============================================================
 *
 * We do NOT aggressively modify OCR text.
 *
 * Parser needs the original line structure.
 */

const cleanOCRText =
  (
    text: string,
  ): string => {
    return text
      .replace(
        /\r\n/g,
        "\n",
      )
      .replace(
        /\r/g,
        "\n",
      )
      .replace(
        /[ \t]+/g,
        " ",
      )
      .replace(
        /\n{3,}/g,
        "\n\n",
      )
      .trim();
  };

/**
 * ============================================================
 * SCORE OCR TEXT
 * ============================================================
 *
 * Tesseract confidence alone is not always enough.
 *
 * We also look for useful document information:
 *
 * - dates
 * - insurance
 * - policy
 * - validity
 * - registration
 *
 * This is only used to choose the best OCR pass.
 *
 * It does NOT parse or invent values.
 */

const scoreOCRText =
  (
    text: string,
    confidence?: number,
  ): number => {
    const normalized =
      text.toUpperCase();

    let score =
      typeof confidence ===
      "number"
        ? confidence
        : 0;

    /**
     * Text availability.
     */
    if (
      text.length >= 100
    ) {
      score += 5;
    }

    if (
      text.length >= 250
    ) {
      score += 5;
    }

    /**
     * Insurance indicators.
     */
    const keywords = [
      "INSURANCE",
      "POLICY",
      "POLICY PERIOD",
      "VALIDITY",
      "VALID UPTO",
      "VALID UNTIL",
      "VALID TILL",
      "CERTIFICATE",
      "VEHICLE",
      "REGISTRATION",
      "MOTOR",
    ];

    for (
      const keyword of keywords
    ) {
      if (
        normalized.includes(
          keyword,
        )
      ) {
        score += 4;
      }
    }

    /**
     * Date patterns.
     */
    const dateMatches =
      text.match(
        /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g,
      );

    if (
      dateMatches
    ) {
      score += Math.min(
        dateMatches.length *
          3,
        15,
      );
    }

    const namedDateMatches =
      text.match(
        /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
      );

    if (
      namedDateMatches
    ) {
      score += Math.min(
        namedDateMatches.length *
          5,
        15,
      );
    }

    /**
     * Penalize extremely short OCR.
     */
    if (
      text.length < 30
    ) {
      score -= 15;
    }

    return Math.max(
      0,
      Math.min(
        100,
        score,
      ),
    );
  };

/**
 * ============================================================
 * ACQUIRE WORKER LOCK
 * ============================================================
 */

const acquireWorkerLock =
  async (): Promise<
    () => void
  > => {
    let releaseLock:
      | (() => void)
      | undefined;

    const previousLock =
      workerLock;

    workerLock =
      new Promise<void>(
        (resolve) => {
          releaseLock =
            resolve;
        },
      );

    await previousLock;

    return () => {
      releaseLock?.();
    };
  };

/**
 * ============================================================
 * RUN TESSERACT
 * ============================================================
 */

const recognizeWithWorker =
  async (
    image: Buffer,
    variant: string,
  ): Promise<OCRPassResult> => {
    const ocrWorker =
      await createOCRWorker();

    const releaseLock =
      await acquireWorkerLock();

    try {
      console.log(
        `========== TESSERACT ${variant.toUpperCase()} PASS ==========`,
      );

      const result =
        await ocrWorker.recognize(
          image,
        );

      const text =
        cleanOCRText(
          result.data.text ||
            "",
        );

      const rawConfidence =
        (
          result.data as {
            confidence?: number;
          }
        )
          .confidence;

      const confidence =
        typeof rawConfidence ===
          "number" &&
        Number.isFinite(
          rawConfidence,
        )
          ? rawConfidence
          : undefined;

      console.log(
        `Tesseract ${variant} completed:`,
        {
          textLength:
            text.length,

          confidence,

          score:
            scoreOCRText(
              text,
              confidence,
            ),
        },
      );

      return {
        text,

        confidence,

        variant,
      };
    } finally {
      releaseLock();
    }
  };

/**
 * ============================================================
 * SELECT BEST OCR RESULT
 * ============================================================
 */

const selectBestOCRResult =
  (
    results: OCRPassResult[],
  ): OCRPassResult => {
    if (
      results.length === 0
    ) {
      return {
        text: "",

        confidence:
          undefined,

        variant:
          "none",
      };
    }

    const ranked =
      [...results].sort(
        (a, b) => {
          const scoreA =
            scoreOCRText(
              a.text,
              a.confidence,
            );

          const scoreB =
            scoreOCRText(
              b.text,
              b.confidence,
            );

          return (
            scoreB -
            scoreA
          );
        },
      );

    const best =
      ranked[0];

    console.log(
      "========== BEST OCR PASS ==========",
    );

    console.log({
      variant:
        best.variant,

      confidence:
        best.confidence,

      score:
        scoreOCRText(
          best.text,
          best.confidence,
        ),

      textLength:
        best.text.length,
    });

    /**
     * Print comparison.
     */
    console.log(
      "========== OCR PASS COMPARISON ==========",
    );

    for (
      const result of ranked
    ) {
      console.log({
        variant:
          result.variant,

        confidence:
          result.confidence,

        score:
          scoreOCRText(
            result.text,
            result.confidence,
          ),

        textLength:
          result.text.length,
      });
    }

    return best;
  };

/**
 * ============================================================
 * IMAGE OCR
 * ============================================================
 */

const recognizeImage =
  async (
    buffer: Buffer,
  ): Promise<{
    text: string;

    confidence?: number;
  }> => {
    /**
     * --------------------------------------------------------
     * Create preprocessing variants.
     * --------------------------------------------------------
     */
    const variants =
      await createOCRImageVariants(
        buffer,
      );

    const results:
      OCRPassResult[] =
      [];

    /**
     * --------------------------------------------------------
     * Run OCR sequentially.
     *
     * Do NOT run these in Promise.all().
     *
     * The Tesseract worker is shared and protected
     * by workerLock.
     * --------------------------------------------------------
     */
    for (
      const variant of variants
    ) {
      try {
        const result =
          await recognizeWithWorker(
            variant.buffer,
            variant.name,
          );

        results.push(
          result,
        );
      } catch (error) {
        console.error(
          `Tesseract ${variant.name} pass failed:`,
          error,
        );
      }
    }

    /**
     * --------------------------------------------------------
     * Select best result.
     * --------------------------------------------------------
     */
    const best =
      selectBestOCRResult(
        results,
      );

    if (!best.text) {
      throw new Error(
        "Tesseract completed but no readable text was detected",
      );
    }

    console.log(
      "========== MULTI-PASS IMAGE OCR SUCCESS ==========",
    );

    console.log({
      selectedVariant:
        best.variant,

      confidence:
        best.confidence,

      textLength:
        best.text.length,
    });

    return {
      text:
        best.text,

      confidence:
        best.confidence,
    };
  };

/**
 * ============================================================
 * PDF → IMAGE
 * ============================================================
 *
 * PDFium is loaded dynamically.
 */

const renderPDFPages =
  async (
    buffer: Buffer,
  ): Promise<
    Buffer[]
  > => {
    console.log(
      "========== PDF OCR ==========",
    );

    const {
      PDFiumLibrary,
    } = await loadPDFium();

    const library =
      await PDFiumLibrary.init();

    let document:
      | Awaited<
          ReturnType<
            typeof library.loadDocument
          >
        >
      | null = null;

    try {
      /**
       * ------------------------------------------------------
       * Load PDF
       * ------------------------------------------------------
       */
      document =
        await library.loadDocument(
          buffer,
        );

      const pages =
        Array.from(
          document.pages(),
        );

      console.log(
        `PDF pages: ${pages.length}`,
      );

      /**
       * Protect server from very large PDFs.
       */
      const maxPages =
        Math.min(
          pages.length,
          20,
        );

      console.log(
        `Pages to OCR: ${maxPages}`,
      );

      if (
        maxPages === 0
      ) {
        throw new Error(
          "PDF contains no pages",
        );
      }

      const pageImages:
        Buffer[] =
        [];

      /**
       * ------------------------------------------------------
       * Render pages
       * ------------------------------------------------------
       */
      for (
        let index = 0;
        index < maxPages;
        index++
      ) {
        const page =
          pages[index];

        const pageNumber =
          index + 1;

        console.log(
          `Rendering PDF page ${pageNumber}/${maxPages}`,
        );

        let renderedImage:
          Buffer | null =
          null;

        await page.render({
          /**
           * Higher scale gives Tesseract more pixels
           * for small document text.
           */
          scale: 3,

          render:
            async (
              options,
            ) => {
              const pngBuffer =
                await sharp(
                  options.data,
                  {
                    raw: {
                      width:
                        options.width,

                      height:
                        options.height,

                      channels: 4,
                    },
                  },
                )
                  .png()
                  .toBuffer();

              renderedImage =
                pngBuffer;

              /**
               * Return original bitmap to PDFium.
               */
              return options.data;
            },
        });

        if (
          !renderedImage ||
          (
            renderedImage as Buffer
          ).length === 0
        ) {
          throw new Error(
            `PDF page ${pageNumber} could not be converted to PNG`,
          );
        }

        const metadata =
          await sharp(
            renderedImage,
          ).metadata();

        console.log(
          `Rendered PDF page ${pageNumber}:`,
          {
            width:
              metadata.width,

            height:
              metadata.height,

            format:
              metadata.format,

            size:
              (
                renderedImage as Buffer
              ).length,
          },
        );

        if (
          !metadata.format
        ) {
          throw new Error(
            `PDF page ${pageNumber} did not produce a valid image`,
          );
        }

        pageImages.push(
          renderedImage as Buffer,
        );
      }

      console.log(
        `PDF pages rendered successfully: ${pageImages.length}`,
      );

      return pageImages;
    } finally {
      /**
       * ------------------------------------------------------
       * Cleanup
       * ------------------------------------------------------
       */
      if (document) {
        document.destroy();
      }

      library.destroy();
    }
  };

/**
 * ============================================================
 * PDF OCR
 * ============================================================
 */

const recognizePDF =
  async (
    buffer: Buffer,
  ): Promise<{
    text: string;

    confidence?: number;

    pagesProcessed: number;
  }> => {
    console.log(
      "========== PDF OCR START ==========",
    );

    const pageImages =
      await renderPDFPages(
        buffer,
      );

    if (
      pageImages.length === 0
    ) {
      throw new Error(
        "PDF contains no readable pages",
      );
    }

    const pageTexts:
      string[] =
      [];

    const confidences:
      number[] =
      [];

    /**
     * OCR each page.
     */
    for (
      let index = 0;
      index <
      pageImages.length;
      index++
    ) {
      const pageNumber =
        index + 1;

      console.log(
        `OCR page ${pageNumber}/${pageImages.length}`,
      );

      try {
        const result =
          await recognizeImage(
            pageImages[index],
          );

        if (
          result.text
        ) {
          pageTexts.push(
            [
              `===== PAGE ${pageNumber} =====`,
              result.text,
            ].join("\n"),
          );
        }

        if (
          typeof result.confidence ===
          "number"
        ) {
          confidences.push(
            result.confidence,
          );
        }

        console.log(
          `OCR page ${pageNumber} completed`,
        );
      } catch (error) {
        /**
         * Page-level failure should not kill
         * the entire PDF.
         */
        console.error(
          `OCR failed for PDF page ${pageNumber}:`,
          error,
        );

        continue;
      }
    }

    const text =
      pageTexts
        .join("\n\n")
        .trim();

    const confidence =
      confidences.length >
      0
        ? confidences.reduce(
            (
              sum,
              value,
            ) =>
              sum +
              value,
            0,
          ) /
          confidences.length
        : undefined;

    console.log(
      "========== RAW PDF OCR TEXT ==========",
    );

    console.log(
      text,
    );

    console.log(
      "========== END RAW PDF OCR TEXT ==========",
    );

    if (!text) {
      throw new Error(
        "PDF pages were rendered successfully, but OCR could not detect readable text",
      );
    }

    return {
      text,

      confidence,

      pagesProcessed:
        pageImages.length,
    };
  };

/**
 * ============================================================
 * PROCESS DOCUMENT OCR
 * ============================================================
 */

export const processDocumentOCR =
  async (
    input: OCRInput,
  ): Promise<OCRResult> => {
    const startTime =
      Date.now();

    /**
     * ========================================================
     * OCR DISABLED
     * ========================================================
     */
    if (
      !ocrConfig.enabled
    ) {
      return {
        success: false,

        status:
          "skipped",

        text: "",

        provider:
          ocrConfig.provider,

        languages:
          normalizeLanguages(),

        processingTimeMs:
          Date.now() -
          startTime,

        error:
          "OCR processing is disabled",
      };
    }

    /**
     * ========================================================
     * VALIDATE INPUT
     * ========================================================
     */
    try {
      validateOCRInput(
        input,
      );
    } catch (error) {
      return {
        success: false,

        status:
          "failed",

        text: "",

        provider:
          ocrConfig.provider,

        languages:
          normalizeLanguages(),

        processingTimeMs:
          Date.now() -
          startTime,

        error:
          error instanceof
          Error
            ? error.message
            : "Invalid OCR input",
      };
    }

    /**
     * ========================================================
     * PDF
     * ========================================================
     */
    if (
      isPDFMimeType(
        input.mimeType,
      )
    ) {
      try {
        console.log(
          "========== PROCESSING PDF DOCUMENT ==========",
        );

        const result =
          await Promise.race([
            recognizePDF(
              input.buffer,
            ),

            new Promise<never>(
              (
                _resolve,
                reject,
              ) => {
                setTimeout(
                  () => {
                    reject(
                      new Error(
                        "PDF OCR processing timed out",
                      ),
                    );
                  },
                  ocrConfig.timeout,
                );
              },
            ),
          ]);

        if (
          !result.text
        ) {
          return {
            success: false,

            status:
              "failed",

            text: "",

            provider:
              ocrConfig.provider,

            languages:
              normalizeLanguages(),

            processingTimeMs:
              Date.now() -
              startTime,

            confidence:
              result.confidence,

            error:
              "PDF OCR completed but no readable text was detected",
          };
        }

        return {
          success: true,

          status:
            "success",

          text:
            result.text,

          provider:
            ocrConfig.provider,

          languages:
            normalizeLanguages(),

          processingTimeMs:
            Date.now() -
            startTime,

          confidence:
            result.confidence,
        };
      } catch (error) {
        console.error(
          "PDF OCR failed:",
          error,
        );

        return {
          success: false,

          status:
            "failed",

          text: "",

          provider:
            ocrConfig.provider,

          languages:
            normalizeLanguages(),

          processingTimeMs:
            Date.now() -
            startTime,

          error:
            error instanceof
            Error
              ? error.message
              : "PDF OCR processing failed",
        };
      }
    }

    /**
     * ========================================================
     * IMAGE
     * ========================================================
     */
    if (
      !isImageMimeType(
        input.mimeType,
      )
    ) {
      return {
        success: false,

        status:
          "failed",

        text: "",

        provider:
          ocrConfig.provider,

        languages:
          normalizeLanguages(),

        processingTimeMs:
          Date.now() -
          startTime,

        error:
          `Unsupported image MIME type: ${input.mimeType}`,
      };
    }

    /**
     * ========================================================
     * IMAGE OCR
     * ========================================================
     */
    try {
      console.log(
        "========== PROCESSING IMAGE DOCUMENT ==========",
      );

      console.log({
        fileName:
          input.originalFileName,

        mimeType:
          input.mimeType,

        fileSize:
          input.buffer.length,
      });

      const result =
        await Promise.race([
          recognizeImage(
            input.buffer,
          ),

          new Promise<never>(
            (
              _resolve,
              reject,
            ) => {
              setTimeout(
                () => {
                  reject(
                    new Error(
                      "OCR processing timed out",
                    ),
                  );
                },
                ocrConfig.timeout,
              );
            },
          ),
        ]);

      if (
        !result.text
      ) {
        return {
          success: false,

          status:
            "failed",

          text: "",

          provider:
            ocrConfig.provider,

          languages:
            normalizeLanguages(),

          processingTimeMs:
            Date.now() -
            startTime,

          confidence:
            result.confidence,

          error:
            "OCR completed but no readable text was detected",
        };
      }

      console.log(
        "========== IMAGE OCR SUCCESS ==========",
      );

      console.log({
        confidence:
          result.confidence,

        textLength:
          result.text.length,
      });

      return {
        success: true,

        status:
          "success",

        text:
          result.text,

        provider:
          ocrConfig.provider,

        languages:
          normalizeLanguages(),

        processingTimeMs:
          Date.now() -
          startTime,

        confidence:
          result.confidence,
      };
    } catch (error) {
      console.error(
        "Image OCR failed:",
        error,
      );

      return {
        success: false,

        status:
          "failed",

        text: "",

        provider:
          ocrConfig.provider,

        languages:
          normalizeLanguages(),

        processingTimeMs:
          Date.now() -
          startTime,

        error:
          error instanceof
          Error
            ? error.message
            : "OCR processing failed",
      };
    }
  };

/**
 * ============================================================
 * SIMPLE TEXT HELPER
 * ============================================================
 */

export const extractTextFromDocument =
  async (
    input: OCRInput,
  ): Promise<string> => {
    const result =
      await processDocumentOCR(
        input,
      );

    if (
      !result.success
    ) {
      throw new Error(
        result.error ||
          "Unable to extract text from document",
      );
    }

    return result.text;
  };

/**
 * ============================================================
 * OCR WORKER SHUTDOWN
 * ============================================================
 */

export const shutdownOCR =
  async (): Promise<void> => {
    if (!worker) {
      return;
    }

    try {
      await worker.terminate();
    } finally {
      worker = null;

      workerInitializationPromise =
        null;

      workerLock =
        Promise.resolve();
    }
  };

/**
 * ============================================================
 * OCR HEALTH CHECK
 * ============================================================
 */

export const getOCRStatus =
  () => {
    return {
      enabled:
        ocrConfig.enabled,

      provider:
        ocrConfig.provider,

      languages:
        normalizeLanguages(),

      workerInitialized:
        Boolean(worker),

      supportedMimeTypes:
        [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],

      preprocessing:
        [
          "enhanced",
          "grayscale",
          "threshold",
        ],

      multiPassOCR:
        true,
    };
  };

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  processDocumentOCR,

  extractTextFromDocument,

  shutdownOCR,

  getOCRStatus,
};