type UploadKind = "image" | "document";

const IMAGE_TYPES: Record<string, string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  gif: ["image/gif"],
};
const DOCUMENT_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  zip: ["application/zip", "application/x-zip-compressed"],
};

function hasSignature(ext: string, bytes: Uint8Array): boolean {
  if (ext === "png") return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (ext === "jpg" || ext === "jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (ext === "gif") return bytes.length >= 6 && String.fromCharCode(...bytes.slice(0, 6)).match(/^GIF8[79]a$/) !== null;
  if (ext === "webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (ext === "pdf") return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  if (ext === "zip") return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [[0x03, 0x04], [0x05, 0x06], [0x07, 0x08]].some(([a, b]) => bytes[2] === a && bytes[3] === b);
  return false;
}

export async function validateUploadFile(file: File, kind: UploadKind): Promise<boolean> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeTypes = kind === "image" ? IMAGE_TYPES : DOCUMENT_TYPES;
  const expectedMime = mimeTypes[extension];
  if (!expectedMime || (file.type && !expectedMime.includes(file.type))) return false;
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    return hasSignature(extension, bytes);
  } catch {
    return false;
  }
}
