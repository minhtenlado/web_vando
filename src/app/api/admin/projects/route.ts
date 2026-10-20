import { requireAuth } from "@/lib/auth";
import {
normalizeProjectImage,
normalizeProjectResults,
normalizeProjectUrl,
normalizeResponsibilities,
normalizeStringList,
projectPayloadError,
} from "@/lib/cv/project-input";
import { readProjects } from "@/lib/cv/project-store";
import { db } from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });
  }
  try {
    const result = await readProjects(db, { locale: locale === "en" ? "en" : "vi", includeUnpublished: true });
    const rows = result.rows;
    const parseArray = (value: string | null | undefined) => {
      try {
        const result = JSON.parse(value || "[]");
        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      }
    };
    const projects = rows.map((project) => ({
      ...project,
      responsibilities: parseArray(project.responsibilities),
      results: parseArray(project.results),
      features: parseArray(project.features),
      tech: parseArray(project.tech),
      images: parseArray(project.images),
    }));
    return NextResponse.json({ ok: true, projects, publicationControlsAvailable: result.publicationControlsAvailable });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return NextResponse.json({ ok: false, message: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}

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
  locale?: string;
  visualsTitle?: string;
  videoTitle?: string;
  showVideoDemo?: boolean;
  published?: boolean;
  featured?: boolean;
  status?: string;
};

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  let body: ProjectInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const payloadError = projectPayloadError(body);
  if (payloadError) return NextResponse.json({ ok: false, message: payloadError }, { status: 422 });
  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ ok: false, message: "Tiêu đề dự án là bắt buộc." }, { status: 422 });
  }
  if (body.order !== undefined && (!Number.isInteger(body.order) || (body.order as number) < 0)) {
    return NextResponse.json({ ok: false, message: "Thứ tự hiển thị phải là số nguyên không âm." }, { status: 422 });
  }
  if (body.status !== undefined && body.status !== "" && !["completed", "in-development", "prototype", "research"].includes(body.status)) {
    return NextResponse.json({ ok: false, message: "Trạng thái dự án không hợp lệ." }, { status: 422 });
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

  const locale = body.locale === "en" ? "en" : "vi";
  try {
    const schema = await readProjects(db, { locale, includeUnpublished: true, limit: 1 });
    if (!schema.publicationControlsAvailable) {
      return NextResponse.json({ ok: false, message: "Cần chạy migration publication controls trước khi tạo dự án mới. Nội dung cũ vẫn được giữ nguyên." }, { status: 503 });
    }
    const count = await db.project.count({ where: { locale } });
    const created = await db.project.create({
      data: {
        locale,
        title: body.title.trim(),
        subtitle: (body.subtitle ?? "").slice(0, 500),
        overviewQuote: (body.overviewQuote ?? "").slice(0, 2000),
        year: (body.year ?? "").slice(0, 100),
        role: (body.role ?? "").slice(0, 200),
        highlight: (body.highlight ?? "").slice(0, 200),
        projectType: (body.projectType ?? "").slice(0, 200),
        responsibilities: JSON.stringify(normalizeResponsibilities(body.responsibilities)),
        results: JSON.stringify(normalizeProjectResults(body.results)),
        category: (body.category ?? "").slice(0, 200),
        description: (body.description ?? "").slice(0, 5000000),
        features: JSON.stringify(normalizeStringList(body.features)),
        tech: JSON.stringify(normalizeStringList(body.tech, 100, 120)),
        image,
        images: JSON.stringify(images),
        visualsTitle: (body.visualsTitle ?? "").slice(0, 200),
        videoTitle: (body.videoTitle ?? "").slice(0, 200),
        showVideoDemo: typeof body.showVideoDemo === "boolean" ? body.showVideoDemo : true,
        published: typeof body.published === "boolean" ? body.published : false,
        featured: typeof body.featured === "boolean" ? body.featured : false,
        status: normalizeStatus(body.status),
        youtubeUrl,
        link,
        repo,
        order: typeof body.order === "number" ? body.order : count,
      },
    });
    return NextResponse.json({ ok: true, project: created });
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return NextResponse.json({ ok: false, message: "Lỗi máy chủ nội bộ." }, { status: 500 });
  }
}

function normalizeStatus(value: unknown): string {
  return typeof value === "string" && ["completed", "in-development", "prototype", "research"].includes(value)
    ? value
    : "";
}
