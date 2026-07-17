import { NextRequest, NextResponse } from "next/server";
import { getSiteData } from "@/lib/cv/site-data-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  const data = await getSiteData(locale);
  return NextResponse.json(data);
}
