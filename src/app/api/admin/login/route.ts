import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";

// ===== RATE LIMITING =====
// In-memory rate limiting cho login (best-effort trên serverless)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;       // Tối đa 5 lần thử
const LOCKOUT_WINDOW = 60 * 1000;   // Trong vòng 1 phút
const LOCKOUT_DURATION = 5 * 60 * 1000; // Khóa 5 phút sau khi vượt limit

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const data = loginAttempts.get(ip);

  if (!data) return { limited: false };

  // Reset window nếu đã hết thời gian lockout
  if (now - data.firstAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { limited: false };
  }

  // Kiểm tra nếu đã vượt quá số lần cho phép
  if (data.count >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((LOCKOUT_DURATION - (now - data.firstAttempt)) / 1000);
    return { limited: true, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  return { limited: false };
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const data = loginAttempts.get(ip);

  if (!data || now - data.firstAttempt > LOCKOUT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    data.count += 1;
  }
}

// Cleanup: xóa entries cũ mỗi 10 phút để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts) {
    if (now - data.firstAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// ===== LOGIN HANDLER =====
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // 1. Kiểm tra rate limit TRƯỚC KHI xử lý body
  const rateCheck = isRateLimited(ip);
  if (rateCheck.limited) {
    return NextResponse.json(
      {
        ok: false,
        message: `Quá nhiều lần thử. Vui lòng đợi ${rateCheck.retryAfterSeconds} giây.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  // 2. Parse body
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

  // 3. Delay cố định để chống timing attack (bất kể kết quả)
  await new Promise((r) => setTimeout(r, 300));

  // 4. Xác thực
  if (!verifyPassword(password)) {
    // Ghi nhận lần thử thất bại
    recordAttempt(ip);

    return NextResponse.json(
      { ok: false, message: "Mật khẩu không đúng." },
      { status: 401 }
    );
  }

  // 5. Đăng nhập thành công — xóa record rate limit
  loginAttempts.delete(ip);

  await createSession();
  return NextResponse.json({ ok: true, message: "Đăng nhập thành công." });
}
