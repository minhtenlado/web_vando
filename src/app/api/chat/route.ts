import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, postTitle, postContent } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Thiếu cấu hình GEMINI_API_KEY trong hệ thống." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({
      history,
      systemInstruction: `Bạn là trợ lý AI thông minh trên blog cá nhân của Phan Huỳnh Văn Đô. 
Người dùng đang đọc bài viết có tiêu đề: "${postTitle}".
Nội dung bài viết:
"""
${postContent}
"""
Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng dựa trên nội dung bài viết này một cách ngắn gọn, súc tích và thân thiện.
Nếu câu hỏi không liên quan đến bài viết, hãy khéo léo chuyển hướng họ về bài viết hoặc trả lời một cách lịch sự.`
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chatSession.sendMessage(userMessage);

    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("[chat api error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
