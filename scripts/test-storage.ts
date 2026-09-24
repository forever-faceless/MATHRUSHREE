/**
 * Smoke test for the local image pipeline (sharp resize → webp → disk) and path safety.
 * Run with: node --conditions=react-server --import tsx scripts/test-storage.ts
 */
import fs from "node:fs";
import { deleteStored, resolveUploadPath, saveDocument, saveImage } from "../src/lib/storage";

async function main() {
  const png = fs.readFileSync("public/brand/logo.png");
  const webp = fs.readFileSync("public/demo/site-1.webp");

  const url1 = await saveImage(new File([png], "logo.png", { type: "image/png" }), "test");
  const url2 = await saveImage(new File([webp], "site.webp", { type: "image/webp" }), "test");
  const pdfBytes = Buffer.from("%PDF-1.4\n%âãÏÓ\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
  const url3 = await saveDocument(new File([pdfBytes], "b.pdf", { type: "application/pdf" }), "test");

  for (const url of [url1, url2, url3]) {
    const abs = resolveUploadPath(url.replace("/uploads/", "").split("/"));
    const size = abs ? fs.statSync(abs).size : -1;
    console.log(url, "->", size, "bytes");
  }
  console.log("traversal blocked:", resolveUploadPath(["..", "local.db"]) === null);

  // Unsupported type must be rejected.
  let rejected = false;
  try {
    await saveImage(new File([Buffer.from("hello")], "x.txt", { type: "text/plain" }), "test");
  } catch {
    rejected = true;
  }
  console.log("text file rejected:", rejected);
  console.log("URLS", JSON.stringify([url1, url2, url3]));
  // Leave url2 in place for the HTTP check; the caller deletes it afterwards.
  await deleteStored(url1);
  await deleteStored(url3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
