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

    // Strip HTML tags from postContent for clean text context
    const cleanContent = (postContent || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    const systemInstruction = `Bạn là trợ lý AI thông minh trên blog cá nhân của Phan Huỳnh Văn Đô. 
Người dùng đang đọc bài viết có tiêu đề: "${postTitle || ""}".
Nội dung bài viết:
"""
${cleanContent}
"""
Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng dựa trên nội dung bài viết này một cách ngắn gọn, súc tích và thân thiện.
Nếu câu hỏi không liên quan đến bài viết, hãy khéo léo chuyển hướng họ về bài viết hoặc trả lời một cách lịch sự.`;

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
