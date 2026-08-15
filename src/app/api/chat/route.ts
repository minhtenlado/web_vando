import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, postTitle, postContent, pageContext, contextData } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Thiếu cấu hình GEMINI_API_KEY trong hệ thống." }, { status: 500 });
    }

    let systemInstruction = "";

    if (postTitle || postContent) {
      // Post-specific chat
      const cleanContent = (postContent || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      systemInstruction = `Bạn là trợ lý AI thông minh trên blog cá nhân của Phan Huỳnh Văn Đô. 
Người dùng đang đọc bài viết có tiêu đề: "${postTitle || ""}".
Nội dung bài viết:
"""
${cleanContent}
"""
Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng dựa trên nội dung bài viết này một cách ngắn gọn, súc tích và thân thiện.
Nếu câu hỏi không liên quan đến bài viết, hãy khéo léo chuyển hướng họ về bài viết hoặc trả lời một cách lịch sự.`;
    } else {
      // Global / Section-based chat
      const section = pageContext || "home";
      let contextSummary = "";
      if (contextData) {
        contextSummary = JSON.stringify(contextData, null, 2);
      }

      if (section === "projects") {
        systemInstruction = `Bạn là trợ lý AI chuyên về phần DỰ ÁN (Projects) của Phan Huỳnh Văn Đô - Kỹ sư phần mềm nhúng (Firmware / Embedded Linux / IoT / AI).
Dữ liệu dự án:
"""
${contextSummary}
"""
Nhiệm vụ của bạn:
- Giải đáp thắc mắc về các dự án mà Phan Huỳnh Văn Đô đã thực hiện (kiến trúc hệ thống, công nghệ C/C++, RTOS, STM32, ESP32, Yocto, OpenCV, TensorFlow...).
- Gợi ý các dự án nổi bật theo nhu cầu tìm hiểu của người dùng.
- Trả lời ngắn gọn, lịch sự, chuyên nghiệp bằng tiếng Việt.`;
      } else if (section === "posts") {
        systemInstruction = `Bạn là trợ lý AI chuyên về phần BÀI VIẾT (Blog / Technical Articles) của Phan Huỳnh Văn Đô.
Dữ liệu danh sách bài viết:
"""
${contextSummary}
"""
Nhiệm vụ của bạn:
- Giúp người đọc tìm kiếm và gợi ý các bài viết kỹ thuật phù hợp về Lập trình nhúng, Firmware, IoT, Linux Embedded.
- Tóm tắt chủ đề các bài viết.
- Trả lời ngắn gọn, thân thiện và chính xác.`;
      } else {
        // Default Home / About context
        systemInstruction = `Bạn là trợ lý AI cá nhân đại diện cho website Portfolio của Phan Huỳnh Văn Đô - Kỹ sư phần mềm nhúng (Embedded Software Engineer).
Thông tin cá nhân & kỹ năng:
"""
${contextSummary}
"""
Nhiệm vụ của bạn:
- Giới thiệu về bản thân Phan Huỳnh Văn Đô, kinh nghiệm làm việc, kỹ năng chuyên môn (C/C++, Python, STM32, ESP32, Embedded Linux, RTOS).
- Hướng dẫn liên hệ hợp tác công việc.
- Trả lời ngắn gọn, hào hứng và chuyên nghiệp.`;
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
    });

    const rawHistory = messages.slice(0, -1);
    const firstUserIdx = rawHistory.findIndex((m: any) => m.role === "user");

    const history = firstUserIdx !== -1
      ? rawHistory.slice(firstUserIdx).map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }))
      : [];

    const chatSession = model.startChat({ history });

    const userMessage = messages[messages.length - 1].content;
    const result = await chatSession.sendMessage(userMessage);

    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("[chat api error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
