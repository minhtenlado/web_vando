import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/cv/site-data-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSiteData();
  return NextResponse.json(data);
}
