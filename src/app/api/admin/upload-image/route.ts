import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const ALLOWED_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);

  if (!ALLOWED.has(file.type) && !ALLOWED_EXTS.has(ext)) {
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

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadToCloudinary(buffer, "web_vando/images");
    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Lỗi khi upload ảnh lên Cloudinary." },
      { status: 500 }
    );
  }
}
