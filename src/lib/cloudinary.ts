import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "web_vando"
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its URL.
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.ext
    const parts = url.split("/upload/");
    if (parts.length < 2) return;
    const pathWithVersion = parts[1]; // v123/folder/filename.ext
    const pathParts = pathWithVersion.split("/");
    // Remove version prefix if present
    const startIdx = pathParts[0].startsWith("v") ? 1 : 0;
    const publicIdWithExt = pathParts.slice(startIdx).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn("Failed to delete from Cloudinary:", e);
  }
}
