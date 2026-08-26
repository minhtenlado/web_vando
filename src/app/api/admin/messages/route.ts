import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

// GET: List all contact messages
export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") || "all"; // all, unread, starred, archived

  const where: Record<string, unknown> = {};
  if (filter === "unread") where.read = false;
  if (filter === "starred") where.starred = true;
  if (filter === "archived") where.archived = true;
  if (filter === "all") where.archived = false; // "all" shows non-archived

  const messages = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const stats = {
    total: await db.contactMessage.count({ where: { archived: false } }),
    unread: await db.contactMessage.count({ where: { read: false, archived: false } }),
    starred: await db.contactMessage.count({ where: { starred: true, archived: false } }),
    archived: await db.contactMessage.count({ where: { archived: true } }),
  };

  return NextResponse.json({ messages, stats });
}

// PATCH: Update message (mark read, starred, archived)
export async function PATCH(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ids, action } = body as {
    id?: string;
    ids?: string[];
    action: "read" | "unread" | "star" | "unstar" | "archive" | "unarchive" | "delete";
  };

  const targetIds = ids || (id ? [id] : []);
  if (targetIds.length === 0) {
    return NextResponse.json({ error: "Missing id or ids" }, { status: 400 });
  }

  if (action === "delete") {
    await db.contactMessage.deleteMany({
      where: { id: { in: targetIds } },
    });
    return NextResponse.json({ ok: true });
  }

  const updateData: Record<string, boolean> = {};
  if (action === "read") updateData.read = true;
  if (action === "unread") updateData.read = false;
  if (action === "star") updateData.starred = true;
  if (action === "unstar") updateData.starred = false;
  if (action === "archive") {
    updateData.archived = true;
    updateData.read = true;
  }
  if (action === "unarchive") updateData.archived = false;

  await db.contactMessage.updateMany({
    where: { id: { in: targetIds } },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
