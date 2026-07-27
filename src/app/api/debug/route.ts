import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result: any = {};
  
  try {
    const raw = await db.$executeRawUnsafe(`ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "educations" TEXT NOT NULL DEFAULT '[]';`);
    result.raw1 = raw;
  } catch (e: any) {
    result.raw1_error = e.message;
  }
  
  try {
    const raw = await db.$executeRawUnsafe(`ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "certifications" TEXT NOT NULL DEFAULT '[]';`);
    result.raw2 = raw;
  } catch (e: any) {
    result.raw2_error = e.message;
  }

  try {
    const data = {
      educations: JSON.stringify([]),
      certifications: JSON.stringify([{ enabled: false }]),
      languages: JSON.stringify([{ enabled: false }])
    };
    
    const updated = await db.profile.upsert({
      where: { id: "profile-vi" },
      update: data,
      create: { id: "profile-vi", locale: "vi", ...data },
    });
    
    result.updated = updated;
    result.ok = true;
  } catch (error: any) {
    result.ok = false;
    result.upsert_error = error.message;
  }
  
  return NextResponse.json(result);
}
