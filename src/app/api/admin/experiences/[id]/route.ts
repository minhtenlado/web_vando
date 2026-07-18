import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

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
};

function normUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, 500);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  let body: ExpInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.role === "string") data.role = body.role.trim().slice(0, 300);
  if (typeof body.company === "string") data.company = body.company.trim().slice(0, 300);
  if (typeof body.companyUrl === "string") data.companyUrl = normUrl(body.companyUrl);
  if (typeof body.period === "string") data.period = body.period.slice(0, 100);
  if (typeof body.location === "string") data.location = body.location.slice(0, 200);
  if (typeof body.description === "string") data.description = body.description.slice(0, 4000);
  if (Array.isArray(body.highlights)) data.highlights = JSON.stringify(body.highlights);
  if (Array.isArray(body.stack)) data.stack = JSON.stringify(body.stack);
  if (Array.isArray(body.images)) data.images = JSON.stringify(body.images);
  if (typeof body.order === "number") data.order = body.order;

  try {
    const updated = await db.experience.update({ where: { id }, data });
    return NextResponse.json({ ok: true, experience: updated });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tìm thấy kinh nghiệm." }, { status: 404 });
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
    await db.experience.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Không tìm thấy kinh nghiệm." }, { status: 404 });
  }
}
