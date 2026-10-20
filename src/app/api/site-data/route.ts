import { getSiteData } from "@/lib/cv/site-data-server";
import { toPresentationData } from "@/lib/cv/site-presentation";
import { NextRequest,NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "vi";
  const data = await getSiteData(locale);
  const unavailable = Object.keys(data.errors || {}).length > 0;
  return NextResponse.json(toPresentationData(data), {
    status: unavailable ? 503 : 200,
    headers: { "Cache-Control": "no-store", ...(unavailable ? { "Retry-After": "30" } : {}) },
  });
}
