import { NextRequest, NextResponse } from "next/server";
import { hasDangerousContent, DANGEROUS_CONTENT_MSG } from "@/lib/validation";
import { db } from "@/lib/db";

type ContactPayload = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiting (best-effort for serverless environments)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

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
    const topic = (body.topic ?? "").trim();
    const message = (body.message ?? "").trim();

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Vui lòng nhập họ tên (tối thiểu 2 ký tự).";
    if (!EMAIL_RE.test(email)) errors.email = "Địa chỉ email không hợp lệ.";
    if (message.length < 10)
      errors.message = "Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự).";

    if (hasDangerousContent(name)) {
      errors.name = DANGEROUS_CONTENT_MSG;
    }
    if (hasDangerousContent(message)) {
      errors.message = DANGEROUS_CONTENT_MSG;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, errors, message: "Dữ liệu không hợp lệ." },
        { status: 422 }
      );
    }

    const ticket = `ST-${Date.now().toString(36).toUpperCase()}`;

    // Save to database first (primary storage)
    await db.contactMessage.create({
      data: {
        name,
        email,
        topic,
        message,
        ticket,
        ip: ip.split(",")[0]?.trim() || "unknown",
      },
    });

    // Try Web3Forms email notification (best-effort, don't fail if it errors)
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (accessKey && accessKey.trim() !== "") {
      const subject = topic
        ? `[Studio] [${topic}] Tin nhắn mới từ ${name}`
        : `[Studio] Tin nhắn mới từ ${name}`;
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            name,
            email,
            message,
            subject,
          }),
        });
      } catch (emailErr) {
        console.warn("[Web3Forms] Email notification failed (non-critical):", emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      ticket,
      message: `Cảm ơn ${name}! Tôi đã nhận được tin nhắn của bạn (mã ${ticket}) và sẽ phản hồi sớm nhất có thể.`,
      received: { name, email, messageLength: message.length },
    });
  } catch (err) {
    console.error("[Contact API Error]", err);
    return NextResponse.json(
      { ok: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
