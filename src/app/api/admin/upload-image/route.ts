import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { put } from "@vercel/blob";
import crypto from "crypto";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
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
      { ok: false, message: "Định dạng không hỗ trợ (chỉ PNG/JPEG/WebP/GIF)." },
      { status: 422 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, message: "File quá lớn (tối đa 5MB)." },
      { status: 422 }
    );
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const name = `img_${Date.now()}_${crypto.randomBytes(3).toString("hex")}.${ext}`;

  const blob = await put(name, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
