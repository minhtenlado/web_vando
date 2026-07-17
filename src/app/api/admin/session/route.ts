import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";

export async function GET() {
  const authed = await isAuthed();
  return NextResponse.json({ authed });
}
