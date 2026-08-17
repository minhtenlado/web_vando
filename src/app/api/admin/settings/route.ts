import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const profile = await db.profile.findFirst({
      where: { id: "profile-vi" },
    });

    if (!profile) {
      return NextResponse.json({ settings: "{}" });
    }

    return NextResponse.json({ settings: profile.settings });
  } catch (error) {
    console.error("GET Settings error:", error);
    return NextResponse.json(
      { error: "Lỗi lấy dữ liệu cấu hình" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { settings } = body;

    const profile = await db.profile.findFirst({
      where: { id: "profile-vi" },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Không tìm thấy profile" },
        { status: 404 }
      );
    }

    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: { settings: JSON.stringify(settings) },
    });

    await db.activityLog.create({
      data: {
        category: "system",
        action: "settings",
        title: "Cập nhật cấu hình",
        status: "success",
        detail: "Quản trị viên đã thay đổi cài đặt hệ thống.",
      }
    });

    return NextResponse.json({ settings: updatedProfile.settings });
  } catch (error) {
    console.error("POST Settings error:", error);
    return NextResponse.json(
      { error: "Lỗi lưu cấu hình" },
      { status: 500 }
    );
  }
}
