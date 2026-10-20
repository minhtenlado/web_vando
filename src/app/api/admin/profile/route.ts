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

function parseJson(value: string | null | undefined, fallback: unknown = []) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function GET(req: NextRequest) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "vi";
  try {
    const row = await db.profile.findUnique({ where: { id: `profile-${locale}` } })
      ?? await db.profile.findUnique({ where: { id: "profile" } });
    if (!row) return NextResponse.json({ ok: false, message: "Không tìm thấy hồ sơ." }, { status: 404 });
    const profile = {
      id: row.id, locale: row.locale, name: row.name, role: row.role, tagline: row.tagline,
      location: row.location, email: row.email, phone: row.phone, website: row.website,
      github: row.github, linkedin: row.linkedin, summary: row.summary, avatar: row.avatar,
      principles: parseJson(row.principles), stats: parseJson(row.stats), nowText: row.nowText,
      skillGroups: parseJson(row.skillGroups), socials: parseJson(row.socials),
      aboutSubtitle: row.aboutSubtitle, skillsSubtitle: row.skillsSubtitle,
      experienceSubtitle: row.experienceSubtitle, animatedRoles: parseJson(row.animatedRoles),
      techBadges: parseJson(row.techBadges), educations: parseJson(row.educations),
      certifications: parseJson(row.certifications), languages: parseJson(row.languages),
      settings: parseJson(row.settings, {}),
    };
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[ADMIN_PROFILE_GET] Database error", error);
    return NextResponse.json({ ok: false, message: "Không thể tải hồ sơ quản trị." }, { status: 500 });
  }
}

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

  let updated;
  try {
    updated = await db.profile.upsert({
      where: { id: profileId },
      update: data,
      create: { id: profileId, locale, ...data },
    });
  } catch (error) {
    console.error("Profile upsert error:", error);
    return NextResponse.json(
      { ok: false, message: "Không thể lưu hồ sơ. Kiểm tra schema cơ sở dữ liệu và thử lại." },
      { status: 500 },
    );
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
