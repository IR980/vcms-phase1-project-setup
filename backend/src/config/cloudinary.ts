import { v2 as cloudinary } from "cloudinary";

/**
 * ============================================================
 * CLOUDINARY CONFIGURATION
 * ============================================================
 *
 * Required environment variables:
 *
 * CLOUDINARY_CLOUD_NAME
 * CLOUDINARY_API_KEY
 * CLOUDINARY_API_SECRET
 *
 * IMPORTANT:
 * Never expose CLOUDINARY_API_SECRET to the frontend.
 */

/**
 * ============================================================
 * ENVIRONMENT VARIABLES
 * ============================================================
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

const apiKey = process.env.CLOUDINARY_API_KEY;

const apiSecret = process.env.CLOUDINARY_API_SECRET;

/**
 * ============================================================
 * VALIDATE ENVIRONMENT VARIABLES
 * ============================================================
 */
console.log("========== CLOUDINARY CONFIG ==========");

console.log("Cloud Name:", cloudName ? "✅ Loaded" : "❌ Missing");

console.log("API Key:", apiKey ? "✅ Loaded" : "❌ Missing");

console.log("API Secret:", apiSecret ? "✅ Loaded" : "❌ Missing");

console.log("=======================================");

if (!cloudName) {
  throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
}

if (!apiKey) {
  throw new Error("CLOUDINARY_API_KEY is not configured");
}

if (!apiSecret) {
  throw new Error("CLOUDINARY_API_SECRET is not configured");
}

/**
 * ============================================================
 * CONFIGURE CLOUDINARY
 * ============================================================
 */
cloudinary.config({
  cloud_name: cloudName,

  api_key: apiKey,

  api_secret: apiSecret,

  /**
   * Always use HTTPS URLs.
   */
  secure: true,
});

/**
 * ============================================================
 * CLOUDINARY CONNECTION VERIFICATION
 * ============================================================
 *
 * This verifies that the configured Cloudinary credentials
 * are actually accepted by Cloudinary.
 *
 * This does NOT upload any file.
 */
cloudinary.api
  .ping()
  .then((result) => {
    if (result.status === "ok") {
      console.log("☁️ Cloudinary: ✅ CONNECTED");
    } else {
      console.error("☁️ Cloudinary: ❌ CONNECTION FAILED");

      console.error("Cloudinary response:", result);
    }
  })
  .catch((error: unknown) => {
    console.error("☁️ Cloudinary: ❌ CONNECTION FAILED");

    if (error instanceof Error) {
      console.error("Cloudinary Error:", error.message);
    } else {
      console.error("Cloudinary Error:", error);
    }
  });

/**
 * ============================================================
 * EXPORT CONFIGURED CLOUDINARY CLIENT
 * ============================================================
 */
export default cloudinary;
