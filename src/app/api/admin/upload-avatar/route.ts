import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
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
      { ok: false, message: "Định dạng không hỗ trợ (chỉ PNG/JPEG/WebP/GIF)." },
      { status: 422 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, message: "File quá lớn (tối đa 4MB)." },
      { status: 422 }
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const name = `avatar-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buf);

  const url = `/uploads/${name}`;
  // Persist to profile so the public site picks it up.
  await db.profile.upsert({
    where: { id: "profile" },
    update: { avatar: url },
    create: { id: "profile", avatar: url },
  });

  return NextResponse.json({ ok: true, url });
}
