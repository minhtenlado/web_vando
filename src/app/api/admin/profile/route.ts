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
  educations?: any[];
  certifications?: any[];
  languages?: any[];
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
      if (key === "avatar" || key === "summary") {
        data[key] = body[key] as string;
      } else {
        data[key] = (body[key] as string).slice(0, 2000);
      }
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
  if (Array.isArray(body.educations)) {
    data.educations = JSON.stringify(body.educations);
  }
  if (Array.isArray(body.certifications)) {
    data.certifications = JSON.stringify(body.certifications);
  }
  if (Array.isArray(body.languages)) {
    data.languages = JSON.stringify(body.languages);
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
      if (existing.avatar.includes("cloudinary.com")) {
        const { deleteFromCloudinary } = await import("@/lib/cloudinary");
        await deleteFromCloudinary(existing.avatar);
      }
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  let updated;
  try {
    updated = await db.profile.upsert({
      where: { id: profileId },
      update: data,
      create: { id: profileId, locale, ...data },
    });
  } catch (error: any) {
    console.error("Profile upsert error:", error);
    // If the error is about missing columns (educations, certifications, languages),
    // we can attempt to add them automatically.
    try {
      await db.$executeRawUnsafe(`ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "educations" TEXT NOT NULL DEFAULT '[]';`);
      await db.$executeRawUnsafe(`ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "certifications" TEXT NOT NULL DEFAULT '[]';`);
      await db.$executeRawUnsafe(`ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "languages" TEXT NOT NULL DEFAULT '[]';`);
      
      // Retry upsert
      updated = await db.profile.upsert({
        where: { id: profileId },
        update: data,
        create: { id: profileId, locale, ...data },
      });
    } catch (fallbackError: any) {
      return NextResponse.json(
        { ok: false, message: "Lỗi Prisma: " + (error.message || "Không xác định") },
        { status: 500 }
      );
    }
  }

  // Sync bilingual/shared arrays (principles, stats, skillGroups, techBadges, animatedRoles) to ALL profile rows
  const allProfileIds = ["profile-vi", "profile-en", "profile"];
  const syncData: Record<string, string> = {};
  if (data.principles) syncData.principles = data.principles;
  if (data.stats) syncData.stats = data.stats;
  if (data.skillGroups) syncData.skillGroups = data.skillGroups;
  if (data.techBadges) syncData.techBadges = data.techBadges;
  if (data.animatedRoles) syncData.animatedRoles = data.animatedRoles;
  if (data.educations) syncData.educations = data.educations;
  if (data.certifications) syncData.certifications = data.certifications;
  if (data.languages) syncData.languages = data.languages;

  if (Object.keys(syncData).length > 0) {
    for (const pid of allProfileIds) {
      if (pid === profileId) continue;
      const targetLoc = pid === "profile-en" ? "en" : "vi";
      try {
        await db.profile.upsert({
          where: { id: pid },
          update: syncData,
          create: { id: pid, locale: targetLoc, ...syncData },
        });
      } catch (e) {
        console.error(`[profile-api] Sync failed for ${pid}:`, e);
      }
    }
  }

  return NextResponse.json({ ok: true, profile: updated });
}
