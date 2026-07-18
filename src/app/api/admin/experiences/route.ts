import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteData } from "@/lib/cv/site-data-server";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  const data = await getSiteData(locale);
  return NextResponse.json({ ok: true, experiences: data.experiences });
}

type ExpInput = {
  role?: string;
  company?: string;
  companyUrl?: string;
  period?: string;
  location?: string;
  description?: string;
  highlights?: string[];
  stack?: string[];
  images?: string[];
  order?: number;
  locale?: string;
};

function normUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, 500);
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  let body: ExpInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  if (!body.role || !body.company) {
    return NextResponse.json(
      { ok: false, message: "Vị trí và công ty là bắt buộc." },
      { status: 422 }
    );
  }

  const locale = body.locale === "en" ? "en" : "vi";
  const count = await db.experience.count({ where: { locale } });
  
  const created = await db.experience.create({
    data: {
      locale,
      role: body.role.trim().slice(0, 300),
      company: body.company.trim().slice(0, 300),
      companyUrl: normUrl(body.companyUrl),
      period: (body.period ?? "").slice(0, 100),
      location: (body.location ?? "").slice(0, 200),
      description: (body.description ?? "").slice(0, 4000),
      highlights: JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
      stack: JSON.stringify(Array.isArray(body.stack) ? body.stack : []),
      images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
      order: typeof body.order === "number" ? body.order : count,
    },
  });

  return NextResponse.json({ ok: true, experience: created });
}
