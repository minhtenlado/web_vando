'use client'

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function PostAiChat({ postTitle, postContent }: { postTitle: string, postContent: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Chào bạn! Mình là trợ lý AI. Bạn có câu hỏi gì về bài viết này không?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
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

      setMessages([...newMessages, { role: "assistant", content: data.text }])
    } catch (err: any) {
      setError(err.message)
      setMessages([...newMessages, { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi kết nối AI. Vui lòng thử lại sau." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border border-black/5 dark:border-white/5 rounded-[18px] bg-white/70 dark:bg-white/5 backdrop-blur-[18px] shrink-0 flex flex-col h-[450px]">
      <div className="flex items-center gap-2 mb-3 font-sans text-[11px] font-extrabold tracking-[0.08em] text-[#8e96a5] uppercase shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Assistant
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto mb-3 space-y-3 pr-1 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-3 py-2.5 rounded-[14px] max-w-[90%] text-[13px] ${
              msg.role === "user" 
                ? "bg-primary/10 text-primary dark:text-primary-foreground dark:bg-primary/20 rounded-tr-sm" 
                : "bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-sm prose prose-sm dark:prose-invert prose-p:leading-snug prose-p:m-0 prose-ul:m-0 prose-li:m-0"
            }`}>
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="px-3 py-2.5 rounded-[14px] bg-black/5 dark:bg-white/10 rounded-tl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="text-[10px] text-red-500 mb-2 px-1">{error}</div>}

      <div className="relative shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi AI về bài viết..."
          className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-[14px] pl-3 pr-10 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[44px] max-h-[120px] overflow-hidden"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
