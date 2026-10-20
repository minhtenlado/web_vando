import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  normalizeProjectImage,
  normalizeProjectResults,
  normalizeProjectUrl,
  normalizeResponsibilities,
  normalizeStringList,
} from "@/lib/cv/project-input";

type ProjectInput = {
  title?: string;
  subtitle?: string;
  overviewQuote?: string;
  year?: string;
  role?: string;
  highlight?: string;
  projectType?: string;
  responsibilities?: { title: string; subtitle: string; icon: string }[];
  results?: { number: string; label: string }[];
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
  visualsTitle?: string;
  videoTitle?: string;
  showVideoDemo?: boolean;
  published?: boolean;
  featured?: boolean;
  status?: string;
};

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

  if (typeof body.title === "string" && !body.title.trim()) {
    return NextResponse.json({ ok: false, message: "Tiêu đề dự án là bắt buộc." }, { status: 422 });
  }
  if (body.order !== undefined && (!Number.isInteger(body.order) || (body.order as number) < 0)) {
    return NextResponse.json({ ok: false, message: "Thứ tự hiển thị phải là số nguyên không âm." }, { status: 422 });
  }

  const image = normalizeProjectImage(body.image);
  const images = Array.isArray(body.images) ? body.images.map(normalizeProjectImage).filter(Boolean) : [];
  const youtubeUrl = normalizeProjectUrl(body.youtubeUrl, { youtubeOnly: true });
  const link = normalizeProjectUrl(body.link, { allowRelative: true });
  const repo = normalizeProjectUrl(body.repo, { allowRelative: true });
  if ((body.image?.trim() && !image) || (Array.isArray(body.images) && body.images.some((item) => typeof item === "string" && item.trim() && !normalizeProjectImage(item))) ||
      (body.youtubeUrl?.trim() && !youtubeUrl) || (body.link?.trim() && !link) || (body.repo?.trim() && !repo)) {
    return NextResponse.json({ ok: false, message: "URL ảnh hoặc tài nguyên không hợp lệ." }, { status: 422 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.subtitle === "string") data.subtitle = body.subtitle.slice(0, 500);
  if (typeof body.overviewQuote === "string") data.overviewQuote = body.overviewQuote.slice(0, 2000);
  if (typeof body.year === "string") data.year = body.year.slice(0, 100);
  if (typeof body.role === "string") data.role = body.role.slice(0, 200);
  if (typeof body.highlight === "string") data.highlight = body.highlight.slice(0, 200);
  if (typeof body.projectType === "string") data.projectType = body.projectType.slice(0, 200);
  if (Array.isArray(body.responsibilities)) data.responsibilities = JSON.stringify(normalizeResponsibilities(body.responsibilities));
  if (Array.isArray(body.results)) data.results = JSON.stringify(normalizeProjectResults(body.results));
  if (typeof body.category === "string") data.category = body.category.slice(0, 200);
  if (typeof body.description === "string") data.description = body.description.slice(0, 5000000);
  if (Array.isArray(body.features)) data.features = JSON.stringify(normalizeStringList(body.features));
  if (Array.isArray(body.tech)) data.tech = JSON.stringify(normalizeStringList(body.tech, 100, 120));
  if (typeof body.image === "string") data.image = image;
  if (Array.isArray(body.images)) data.images = JSON.stringify(images);
  if (typeof body.visualsTitle === "string") data.visualsTitle = body.visualsTitle.slice(0, 200);
  if (typeof body.videoTitle === "string") data.videoTitle = body.videoTitle.slice(0, 200);
  if (typeof body.showVideoDemo === "boolean") data.showVideoDemo = body.showVideoDemo;
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.status === "string") {
    if (!["", "completed", "in-development", "prototype", "research"].includes(body.status)) {
      return NextResponse.json({ ok: false, message: "Trạng thái dự án không hợp lệ." }, { status: 422 });
    }
    data.status = body.status;
  }
  if (typeof body.youtubeUrl === "string" || body.youtubeUrl === null) data.youtubeUrl = youtubeUrl;
  if (typeof body.link === "string" || body.link === null) data.link = link;
  if (typeof body.repo === "string" || body.repo === null) data.repo = repo;
  if (typeof body.order === "number") data.order = body.order;

  try {
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Không tìm thấy dự án." }, { status: 404 });
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

    await db.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tìm thấy dự án." }, { status: 500 });
  }
}
