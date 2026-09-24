import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { resolveUploadPath } from "@/lib/storage";

const types: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

/** Serves files uploaded through the admin panel when local disk storage is used. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await ctx.params;
  const abs = resolveUploadPath(segments);
  if (!abs) return new Response("Not found", { status: 404 });
  const type = types[path.extname(abs).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(abs);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const data = await readFile(abs);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
