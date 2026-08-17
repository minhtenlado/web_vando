import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const authCheck = await requireAuth();
  if ("status" in authCheck) return authCheck;

  // 2. Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ ok: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ ok: false, message: "Mật khẩu xác nhận không khớp" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ ok: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
  }

  // 3. Verify current password
  const isValid = await verifyPassword(currentPassword);
  if (!isValid) {
    return NextResponse.json({ ok: false, message: "Mật khẩu hiện tại không đúng" }, { status: 401 });
  }

  // 4. Update password
  try {
    const newPasswordHash = hashPassword(newPassword);

    await db.profile.updateMany({
      data: { passwordHash: newPasswordHash },
    });

    // 5. Ghi log activity
    await db.activityLog.create({
      data: {
        category: "security",
        action: "update",
        title: "Đổi mật khẩu thành công",
        detail: "Quản trị viên đã thay đổi mật khẩu đăng nhập hệ thống.",
        user: "Admin",
        status: "warning", // cảnh báo bảo mật
      },
    });

    return NextResponse.json({ ok: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("[change-password]", error);
    return NextResponse.json({ ok: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
