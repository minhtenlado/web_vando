import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const { id } = await props.params;

    // Delete any nested child replies first
    await db.comment.deleteMany({
      where: { parentId: id },
    });

    // Delete the comment itself
    const deleted = await db.comment.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        category: "content",
        action: "delete",
        title: `Xóa bình luận`,
        detail: `Đã xóa bình luận của ${deleted.author} trên bài viết ${deleted.postSlug}`,
        resource: deleted.postSlug,
        user: "Admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, message: "Đã xóa bình luận thành công!" });
  } catch (error: any) {
    console.error("[Admin Comment DELETE Error]", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Lỗi khi xóa bình luận." },
      { status: 500 }
    );
  }
}
