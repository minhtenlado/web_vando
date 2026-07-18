import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
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
    if (!accessKey) {
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
