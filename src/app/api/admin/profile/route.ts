import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type ProfileInput = {
  name?: string;
  role?: string;
  tagline?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  summary?: string;
  avatar?: string;
};

export async function PUT(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  let body: ProfileInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ." }, { status: 400 });
  }

  const data: ProfileInput = {};
  for (const key of [
    "name", "role", "tagline", "location", "email",
    "phone", "website", "github", "linkedin", "summary", "avatar",
  ] as const) {
    if (typeof body[key] === "string") {
      // @ts-expect-error assign string field
      data[key] = (body[key] as string).slice(0, 2000);
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, message: "Không có trường nào để cập nhật." }, { status: 422 });
  }

  const updated = await db.profile.upsert({
    where: { id: "profile" },
    update: data,
    create: { id: "profile", ...data },
  });

  return NextResponse.json({ ok: true, profile: updated });
}
