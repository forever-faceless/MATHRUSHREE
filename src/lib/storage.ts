import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_DOC_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic"]);

export const UPLOAD_ROUTE_PREFIX = "/uploads/";

export function uploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim() || "./data/uploads";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

function cloudinaryEnabled(): boolean {
  return Boolean(process.env.CLOUDINARY_URL?.trim());
}

/** Serverless hosts have no persistent disk, so uploads there must go to Cloudinary. */
function assertStorageConfigured(): void {
  if (!cloudinaryEnabled() && (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    throw new UploadError("Image storage is not configured on this host. Add CLOUDINARY_URL to the environment variables and redeploy.");
  }
}

async function getCloudinary() {
  const { v2 } = await import("cloudinary");
  // The SDK reads CLOUDINARY_URL from the environment automatically.
  v2.config({ secure: true });
  return v2;
}

function safeFolder(folder: string): string {
  return folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "misc";
}

export class UploadError extends Error {}

/**
 * Resizes and converts an uploaded image to WebP, then stores it either on
 * Cloudinary (when CLOUDINARY_URL is set) or on local disk. Returns a URL usable in <Image>.
 */
export async function saveImage(file: File, folder: string): Promise<string> {
  assertStorageConfigured();
  if (!file || file.size === 0) throw new UploadError("Empty file.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Image is larger than 15 MB.");
  if (file.type && !IMAGE_TYPES.has(file.type)) throw new UploadError(`Unsupported image type: ${file.type}`);

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadError("Could not read the image. Please upload a JPG, PNG or WebP file.");
  }

  const id = crypto.randomUUID();
  const dir = safeFolder(folder);

  if (cloudinaryEnabled()) {
    const cloudinary = await getCloudinary();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `mathrushree/${dir}`, public_id: id, resource_type: "image", overwrite: false },
        (error, res) => (error || !res ? reject(error ?? new Error("Upload failed")) : resolve(res)),
      );
      stream.end(output);
    });
    return result.secure_url;
  }

  const target = path.join(uploadDir(), dir);
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, `${id}.webp`), output);
  return `${UPLOAD_ROUTE_PREFIX}${dir}/${id}.webp`;
}

/** Stores a PDF brochure. Local disk or Cloudinary "raw" resource. */
export async function saveDocument(file: File, folder: string): Promise<string> {
  assertStorageConfigured();
  if (!file || file.size === 0) throw new UploadError("Empty file.");
  if (file.size > MAX_DOC_BYTES) throw new UploadError("File is larger than 25 MB.");
  if (file.type !== "application/pdf") throw new UploadError("Only PDF brochures are supported.");
  const data = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  const dir = safeFolder(folder);

  if (cloudinaryEnabled()) {
    const cloudinary = await getCloudinary();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `mathrushree/${dir}`, public_id: `${id}.pdf`, resource_type: "raw" },
        (error, res) => (error || !res ? reject(error ?? new Error("Upload failed")) : resolve(res)),
      );
      stream.end(data);
    });
    return result.secure_url;
  }

  const target = path.join(uploadDir(), dir);
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, `${id}.pdf`), data);
  return `${UPLOAD_ROUTE_PREFIX}${dir}/${id}.pdf`;
}

/** Best-effort removal of a previously stored file. Never throws. */
export async function deleteStored(url: string): Promise<void> {
  try {
    if (!url) return;
    if (url.startsWith(UPLOAD_ROUTE_PREFIX)) {
      const rel = url.slice(UPLOAD_ROUTE_PREFIX.length);
      const abs = path.join(uploadDir(), rel);
      if (!abs.startsWith(uploadDir())) return;
      await fs.rm(abs, { force: true });
      return;
    }
    if (url.includes("res.cloudinary.com") && cloudinaryEnabled()) {
      const cloudinary = await getCloudinary();
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
      if (match) await cloudinary.uploader.destroy(match[1]);
    }
  } catch {
    // ignore
  }
}

/** Resolves a /uploads/... request path to an absolute file inside the upload dir, or null. */
export function resolveUploadPath(segments: string[]): string | null {
  const root = uploadDir();
  const rel = segments.join("/");
  if (!rel || rel.includes("..") || rel.includes("\0")) return null;
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(path.resolve(root))) return null;
  return abs;
}
