import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, postTitle, postContent, contextData } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Thiếu cấu hình GEMINI_API_KEY trong hệ thống." }, { status: 500 });
    }

    let systemInstruction = "";

    if (postTitle || postContent) {
      // Post-specific chat (inside post page)
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
      // Global Unified Portfolio Chat
      let contextSummary = "";
      if (contextData) {
        contextSummary = JSON.stringify(contextData, null, 2);
      }

      systemInstruction = `Bạn là Trợ lý AI chính thức trên website Portfolio của Phan Huỳnh Văn Đô - Kỹ sư phần mềm nhúng (Embedded Software Engineer).

Nhiệm vụ của bạn là giải đáp toàn bộ thắc mắc của người dùng về Phan Huỳnh Văn Đô, bao gồm:
1. Thông tin cá nhân, định hướng công việc, kỹ năng chuyên môn (C/C++, FreeRTOS, STM32, ESP32, Embedded Linux, IoT, AI...).
2. Các DỰ ÁN nổi bật đã thực hiện.
3. Các BÀI VIẾT kỹ thuật trên Blog.
4. Thông tin liên hệ công việc (Email, Số điện thoại, GitHub, Facebook, LinkedIn...).

DƯỚI ĐÂY LÀ DỮ LIỆU ĐẦY ĐỦ VÀ CHÍNH XÁC CỦA VĂN ĐÔ ĐƯỢC TRÍCH XUẤT TỪ DATABASE:
"""
${contextSummary}
"""

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. KHI ĐƯỢC HỎI VỀ DỰ ÁN HOẶC LIỆT KÊ DỰ ÁN:
   - Bạn BẮT BUỘC phải đính kèm đường link Markdown tới từng dự án được nhắc đến.
   - Ưu tiên link demo/website nếu có: [Tên dự án](demoUrl)
   - Nếu có GitHub repo: [GitHub Repo](repoUrl)
   - Nếu không có link ngoài, dùng link phần dự án trên web: [Xem chi tiết](#projects)
   - Ví dụ: "- **[Autonomous Arena: Robot Mê Cung](#projects)**: Robot dò đường dùng STM32 & FreeRTOS. [Xem GitHub](https://github.com/...)"

2. KHI ĐƯỢC HỎI VỀ BÀI VIẾT HOẶC GỢI Ý BÀI KỸ THUẬT:
   - Bạn BẮT BUỘC phải đính kèm đường link Markdown dẫn thẳng đến bài viết theo định dạng URL \`/posts/slug\`.
   - Ví dụ: "- **[Kinh nghiệm lập trình FreeRTOS trên STM32](/posts/kinh-nghiem-freertos-stm32)**: Tóm tắt bài viết..."

3. KHI ĐƯỢC HỎI VỀ THÔNG TIN LIÊN HỆ / MẠNG XÃ HỘI:
   - Hãy liệt kê đầy đủ các kênh liên hệ kèm link Markdown:
     * Email: Lấy từ dữ liệu (hoặc phanhuynhvando@gmail.com)
     * Số điện thoại: Lấy từ dữ liệu
     * GitHub: Link Markdown từ profile.github
     * Facebook / LinkedIn / Website: Link Markdown từ profile.facebook, profile.linkedin, profile.website

4. THÁI ĐỘ & ĐỊNH DẠNG TRẢ LỜI:
   - Trả lời bằng tiếng Việt chuyên nghiệp, tự tin, thân thiện và hào hứng.
   - Trình bày dạng Markdown đẹp mắt (gạch đầu dòng, in đậm tên dự án/bài viết/công nghệ).
   - Trả lời ngắn gọn, đi thẳng vào vấn đề, không giải thích dài dòng dư thừa.`;
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
