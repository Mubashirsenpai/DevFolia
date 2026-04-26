import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  return { cloudName, apiKey, apiSecret };
}

function hasCloudinaryConfig() {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.apiKey && cfg.apiSecret);
}

function ensureCloudinaryConfigured() {
  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary is not configured.");
  }
  const cfg = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });
}

export async function uploadToCloudinary(
  buffer: Buffer,
  opts: {
    folder: string;
    publicId: string;
    resourceType?: "image" | "raw" | "video" | "auto";
  },
) {
  ensureCloudinaryConfigured();
  return new Promise<{ secureUrl: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder,
        public_id: opts.publicId,
        resource_type: opts.resourceType ?? "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({ secureUrl: result.secure_url });
      },
    );

    stream.end(buffer);
  });
}
