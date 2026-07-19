import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiting (best-effort for serverless environments)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count += 1;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS) {
      return NextResponse.json(
        { ok: false, message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ContactPayload;
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Vui lòng nhập họ tên (tối thiểu 2 ký tự).";
    if (!EMAIL_RE.test(email)) errors.email = "Địa chỉ email không hợp lệ.";
    if (message.length < 10)
      errors.message = "Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự).";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, errors, message: "Dữ liệu không hợp lệ." },
        { status: 422 }
      );
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!accessKey || accessKey.trim() === "") {
      return NextResponse.json(
        { ok: false, message: "Hệ thống chưa được cấu hình Access Key gửi mail." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: name,
        email: email,
        message: message,
        subject: `[Portfolio] Tin nhắn mới từ ${name}`,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      console.error("[Web3Forms Error]", result);
      return NextResponse.json(
        { ok: false, message: "Gửi tin nhắn thất bại, vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    const ticket = `CV-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      ok: true,
      ticket,
      message: `Cảm ơn ${name}! Tôi đã nhận được tin nhắn của bạn (mã ${ticket}) và sẽ phản hồi sớm nhất có thể.`,
      received: { name, email, messageLength: message.length },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
