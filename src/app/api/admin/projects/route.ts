import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteData } from "@/lib/cv/site-data-server";

// Public list (also used by admin) — returns projects by locale.
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  const data = await getSiteData(locale);
  return NextResponse.json({ ok: true, projects: data.projects });
}

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
  locale?: string;
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

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ ok: false, message: "Tiêu đề dự án là bắt buộc." }, { status: 422 });
  }

  const locale = body.locale === "en" ? "en" : "vi";
  const count = await db.project.count({ where: { locale } });
  
  const created = await db.project.create({
    data: {
      locale,
      title: body.title.trim(),
      category: (body.category ?? "").slice(0, 200),
      description: (body.description ?? "").slice(0, 4000),
      features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
      tech: JSON.stringify(Array.isArray(body.tech) ? body.tech : []),
      image: (body.image ?? "").slice(0, 500),
      images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
      youtubeUrl: normUrl(body.youtubeUrl),
      link: normUrl(body.link),
      repo: normUrl(body.repo),
      order: typeof body.order === "number" ? body.order : count,
    },
  });

  return NextResponse.json({ ok: true, project: created });
}

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
