import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body không hợp lệ." },
      { status: 400 }
    );
  }

  const password = (body.password ?? "").toString();
  if (!password) {
    return NextResponse.json(
      { ok: false, message: "Vui lòng nhập mật khẩu." },
      { status: 422 }
    );
  }

  // Small delay to mitigate brute force regardless of result.
  await new Promise((r) => setTimeout(r, 250));

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { ok: false, message: "Mật khẩu không đúng." },
      { status: 401 }
    );
  }

  await createSession();
  return NextResponse.json({ ok: true, message: "Đăng nhập thành công." });
}
