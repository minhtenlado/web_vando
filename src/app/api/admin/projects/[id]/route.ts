import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type ProjectInput = {
  title?: string;
  category?: string;
  description?: string;
  features?: string[];
  tech?: string[];
  image?: string;
  images?: string[];
  youtubeUrl?: string;
  link?: string;
  repo?: string;
  order?: number;
};

function normUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let s = v.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s; // bare YouTube ID
  if (!s.startsWith("http://") && !s.startsWith("https://") && !s.startsWith("/") && !s.startsWith("#")) {
    s = "https://" + s;
  }
  return s.slice(0, 500);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  let body: ProjectInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.category === "string") data.category = body.category.slice(0, 200);
  if (typeof body.description === "string") data.description = body.description.slice(0, 4000);
  if (Array.isArray(body.features)) data.features = JSON.stringify(body.features);
  if (Array.isArray(body.tech)) data.tech = JSON.stringify(body.tech);
  if (typeof body.image === "string") data.image = body.image.slice(0, 500);
  if (Array.isArray(body.images)) data.images = JSON.stringify(body.images);
  if (typeof body.youtubeUrl === "string") data.youtubeUrl = normUrl(body.youtubeUrl);
  if (typeof body.link === "string") data.link = normUrl(body.link);
  if (typeof body.repo === "string") data.repo = normUrl(body.repo);
  if (typeof body.order === "number") data.order = body.order;

  try {
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Không tìm thấy dự án." }, { status: 404 });
    }

    // Find orphaned blobs
    const oldImages: string[] = [];
    if (existing.image) oldImages.push(existing.image);
    try {
      const existingImages = (existing as any).images;
      if (existingImages) {
        const arr = JSON.parse(existingImages);
        if (Array.isArray(arr)) oldImages.push(...arr);
      }
    } catch {}

    const newImages = new Set<string>();
    if (data.image) newImages.add(data.image as string);
    if (body.images) {
      body.images.forEach(img => newImages.add(img));
    }

    const toDelete = oldImages.filter(img => !newImages.has(img));
    if (toDelete.length > 0) {
      const { deleteVercelBlob } = await import("@/lib/cv/blob");
      await deleteVercelBlob(toDelete);
    }

    const updated = await db.project.update({ where: { id }, data });
    return NextResponse.json({ ok: true, project: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, message: "Đã có lỗi xảy ra." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  try {
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Không tìm thấy dự án." }, { status: 404 });
    }

    const toDelete: string[] = [];
    if (existing.image) toDelete.push(existing.image);
    try {
      const existingImages = (existing as any).images;
      if (existingImages) {
        const arr = JSON.parse(existingImages);
        if (Array.isArray(arr)) toDelete.push(...arr);
      }
    } catch {}

    if (toDelete.length > 0) {
      const { deleteVercelBlob } = await import("@/lib/cv/blob");
      await deleteVercelBlob(toDelete);
    }

    await db.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tìm thấy dự án." }, { status: 500 });
  }
}
