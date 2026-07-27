import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
    
    return NextResponse.json({ ok: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
