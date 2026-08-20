import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const res1 = await db.$executeRawUnsafe(
      `ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isAuthor" BOOLEAN NOT NULL DEFAULT false;`
    );
    const res2 = await db.$executeRawUnsafe(
      `ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;`
    );

    return NextResponse.json({
      ok: true,
      message: "Database schema migration executed successfully on Neon DB!",
      res1,
      res2,
    });
  } catch (error: any) {
    console.error("[Migration Error]", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Migration failed" },
      { status: 500 }
    );
  }
}
