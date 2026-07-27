import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { put, del } from "@vercel/blob";
import crypto from "crypto";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Form data không hợp lệ." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Thiếu file ảnh." }, { status: 422 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { ok: false, message: "Định dạng không hỗ trợ (chỉ PNG/JPEG/WebP/GIF/SVG)." },
      { status: 422 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, message: "File quá lớn (tối đa 4MB)." },
      { status: 422 }
    );
  }

  const locale = (formData.get("locale") as string) || "vi";
  const profileId = `profile-${locale}`;

  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const name = `avatar-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

  let url = "";
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN credentials");
    }
    const blob = await put(name, file, {
      access: "public",
      addRandomSuffix: false,
    });
    url = blob.url;
  } catch (err: any) {
    console.warn("Avatar Vercel Blob upload failed, falling back to Base64:", err?.message);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || (ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`);
    url = `data:${mime};base64,${buffer.toString("base64")}`;
  }

  // Clean up old avatar blob if it exists in Vercel storage.
  try {
    const existing = await db.profile.findUnique({ where: { id: profileId } });
    if (existing?.avatar && existing.avatar.includes("vercel-storage.com")) {
      await del(existing.avatar);
    }
  } catch {
    // Non-critical: old blob cleanup failed, continue with upload.
  }

  // Persist to profile so the public site picks it up.
  await db.profile.upsert({
    where: { id: profileId },
    update: { avatar: url },
    create: { id: profileId, avatar: url },
  });

  return NextResponse.json({ ok: true, url });
}
