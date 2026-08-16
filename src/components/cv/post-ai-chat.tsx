'use client'

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, RefreshCw, ChevronDown, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"

type Message = {
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  { label: "✦ Tóm tắt bài viết", prompt: "Hãy tóm tắt ngắn gọn các ý chính trong bài viết này giúp tôi." },
  { label: "◇ Giải thích phương pháp", prompt: "Phương pháp hoặc công nghệ được đề cập trong bài viết này là gì? Giải thích dễ hiểu giúp tôi." },
  { label: "≋ Tìm điểm quan trọng", prompt: "Những điểm quan trọng nhất (key takeaways) mà tôi cần nhớ từ bài viết này là gì?" },
  { label: "⊕ Ứng dụng thực tế", prompt: "Bài viết này có ứng dụng gì trong thực tế công việc Embedded / AI?" }
]

export function PostAiChat({ postTitle, postContent }: { postTitle: string, postContent: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Chào bạn! Mình là trợ lý AI. Bạn có thể chọn câu hỏi gợi ý bên dưới hoặc tự nhập thắc mắc về bài viết này nhé!" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping, isOpen])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const animateTypewriter = (fullText: string, baseMessages: Message[]) => {
    setIsTyping(true)
    let index = 0
    const chunkSize = 3
    const speed = 15 // ms per tick

    setMessages([...baseMessages, { role: "assistant", content: "" }])

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      index += chunkSize
      if (index >= fullText.length) {
        index = fullText.length
        if (timerRef.current) clearInterval(timerRef.current)
        setIsLoading(false)
        setIsTyping(false)
      }

      const revealed = fullText.slice(0, index)
      setMessages((prev) => {
        const next = [...prev]
        if (next.length > 0 && next[next.length - 1].role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: revealed }
        }
        return next
      })
    }, speed)
  }

  const sendPrompt = async (userMsg: string) => {
    if (!userMsg.trim() || isLoading || isTyping) return

    setInput("")
    setError("")
    
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          postTitle,
          postContent: postContent.substring(0, 15000), // Prevent payload too large
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi gọi AI.")
      }

      animateTypewriter(data.text || "", newMessages)
    } catch (err: any) {
      setError(err.message)
      setMessages([...newMessages, { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi kết nối AI. Vui lòng thử lại sau." }])
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    sendPrompt(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsLoading(false)
    setIsTyping(false)
    setMessages([
      { role: "assistant", content: "Đã làm mới cuộc trò chuyện. Bạn muốn hỏi điều gì tiếp theo?" }
    ])
    setError("")
  }

  const isBusy = isLoading || isTyping

  // Collapsed Button View
  if (!isOpen) {
    return (
      <div className="p-4 border border-black/5 dark:border-white/5 rounded-[18px] bg-white/70 dark:bg-white/5 backdrop-blur-[18px] shrink-0 transition-all hover:border-primary/30">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between gap-3 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-sans text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                Hỏi AI về bài viết <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">New</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Tóm tắt, giải thích & hỏi đáp với Gemini
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    )
  }

  // Expanded Full Chat View
  return (
    <div className="p-4 border border-primary/20 dark:border-primary/30 rounded-[18px] bg-white/80 dark:bg-white/5 backdrop-blur-[18px] shrink-0 flex flex-col h-[520px] transition-all shadow-lg dark:shadow-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0 pb-2 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 font-sans text-[11px] font-extrabold tracking-[0.08em] text-[#8e96a5] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Assistant
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              title="Làm mới đoạn chat"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            title="Thu gọn đoạn chat"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Messages List */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto mb-3 space-y-3 pr-1 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-3 py-2.5 rounded-[14px] max-w-[92%] text-[13px] leading-relaxed ${
              msg.role === "user" 
                ? "bg-primary text-primary-foreground font-medium rounded-tr-xs" 
                : "bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-xs prose prose-sm dark:prose-invert prose-p:leading-snug prose-p:my-1 prose-ul:my-1 prose-li:my-0"
            }`}>
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && !isTyping && (
          <div className="flex flex-col items-start">
            <div className="px-3 py-2.5 rounded-[14px] bg-black/5 dark:bg-white/10 rounded-tl-xs flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>AI đang suy nghĩ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length <= 3 && !isBusy && (
        <div className="mb-3 shrink-0 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => sendPrompt(item.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-left truncate max-w-full"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {error && <div className="text-[11px] text-red-500 mb-2 px-1">{error}</div>}

      {/* Input Form */}
      <div className="relative shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi AI về bài viết..."
          className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-[14px] pl-3 pr-10 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[44px] max-h-[120px] overflow-hidden"
          rows={1}
          disabled={isBusy}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isBusy}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
