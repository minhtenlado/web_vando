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
  locale?: string;
  principles?: any[];
  stats?: any[];
  nowText?: string;
  skillGroups?: any[];
  socials?: any[];
  aboutSubtitle?: string;
  skillsSubtitle?: string;
  experienceSubtitle?: string;
  animatedRoles?: string[];
  techBadges?: { icon: string; text: string }[];
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

  const locale = body.locale === "en" ? "en" : "vi";
  const profileId = `profile-${locale}`;

  const data: Record<string, string> = {};
  for (const key of [
    "name", "role", "tagline", "location", "email",
    "phone", "website", "github", "linkedin", "summary", "avatar", "nowText",
    "aboutSubtitle", "skillsSubtitle", "experienceSubtitle"
  ] as const) {
    if (typeof body[key] === "string") {
      data[key] = (body[key] as string).slice(0, 2000);
    }
  }

  if (Array.isArray(body.principles)) {
    data.principles = JSON.stringify(body.principles);
  }
  if (Array.isArray(body.stats)) {
    data.stats = JSON.stringify(body.stats);
  }
  if (Array.isArray(body.skillGroups)) {
    data.skillGroups = JSON.stringify(body.skillGroups);
  }
  if (Array.isArray(body.socials)) {
    data.socials = JSON.stringify(body.socials);
  }
  if (Array.isArray(body.animatedRoles)) {
    data.animatedRoles = JSON.stringify(body.animatedRoles);
  }
  if (Array.isArray(body.techBadges)) {
    data.techBadges = JSON.stringify(body.techBadges);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, message: "Không có trường nào để cập nhật." }, { status: 422 });
  }

  // Find existing profile to check if avatar changed
  let existing = await db.profile.findUnique({ where: { id: profileId } });
  if (!existing) {
    existing = await db.profile.findUnique({ where: { id: "profile" } });
  }
  if (existing && existing.avatar && data.avatar && existing.avatar !== data.avatar) {
    try {
      const { deleteVercelBlob } = await import("@/lib/cv/blob");
      await deleteVercelBlob(existing.avatar);
    } catch (error) {
      console.error("Failed to delete old avatar from Vercel Blob:", error);
    }
  }

  const updated = await db.profile.upsert({
    where: { id: profileId },
    update: data,
    create: { id: profileId, locale, ...data },
  });

  return NextResponse.json({ ok: true, profile: updated });
}
