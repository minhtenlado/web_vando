import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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
      { ok: false, message: "File quá lớn (tối đa 5MB)." },
      { status: 422 }
    );
  }

  const locale = (formData.get("locale") as string) || "vi";
  const profileId = `profile-${locale}`;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadToCloudinary(buffer, "web_vando/avatars");

    // Clean up old avatar from Cloudinary if it exists
    try {
      const existing = await db.profile.findUnique({ where: { id: profileId } });
      if (existing?.avatar && existing.avatar.includes("cloudinary.com")) {
        await deleteFromCloudinary(existing.avatar);
      }
    } catch {
      // Non-critical: old avatar cleanup failed
    }

    // Persist to profile so the public site picks it up.
    await db.profile.upsert({
      where: { id: profileId },
      update: { avatar: url },
      create: { id: profileId, avatar: url },
    });

    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error("Cloudinary avatar upload error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Lỗi khi upload avatar lên Cloudinary." },
      { status: 500 }
    );
  }
}
