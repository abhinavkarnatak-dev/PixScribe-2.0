import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export interface StoredImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadGeneratedImage(
  bytes: Buffer,
  userId: string,
): Promise<StoredImage> {
  ensureConfigured();

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `pixscribe/generations/${userId}`,
          resource_type: "image",
          format: "png",
          // Keep the original untouched; the gallery requests derived sizes.
          transformation: undefined,
        },
        (error, response) => {
          if (error || !response) {
            reject(error ?? new Error("Cloudinary returned no response"));
            return;
          }
          resolve(response);
        },
      );
      stream.end(bytes);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("[storage] upload failed", error);
    throw new AppError(
      "STORAGE_FAILED",
      "Your image was created but could not be saved. Your credit has been returned.",
      502,
    );
  }
}

export async function deleteStoredImage(publicId: string): Promise<void> {
  ensureConfigured();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // A dangling asset is not worth failing the user's delete over.
    console.error("[storage] delete failed", publicId, error);
  }
}

/**
 * Builds a resized delivery URL for grid thumbnails.
 * Falls back to the original if the URL is not a Cloudinary one.
 */
export function thumbnailUrl(url: string, width = 640): string {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  return `${url.slice(0, at + marker.length)}f_auto,q_auto,w_${width}/${url.slice(
    at + marker.length,
  )}`;
}
