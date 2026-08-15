'use client'

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, RefreshCw, X, MessageSquare, Briefcase, FileText, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useSiteData } from "@/components/cv/site-data-context"

type Message = {
  role: "user" | "assistant"
  content: string
}

type ChatContext = "home" | "projects" | "posts"

const CONTEXT_CONFIG: Record<ChatContext, {
  label: string
  icon: any
  greeting: string
  prompts: { label: string; prompt: string }[]
}> = {
  home: {
    label: "Giới thiệu",
    icon: User,
    greeting: "Xin chào! Tôi là trợ lý AI của Phan Huỳnh Văn Đô. Bạn muốn tìm hiểu gì về kinh nghiệm hay kỹ năng của Đô?",
    prompts: [
      { label: "✦ Tóm tắt kinh nghiệm", prompt: "Tóm tắt ngắn gọn lịch sử làm việc và kinh nghiệm chuyên môn của Phan Huỳnh Văn Đô." },
      { label: "◇ Kỹ năng chuyên môn", prompt: "Văn Đô thành thạo những ngôn ngữ, vi điều khiển và công nghệ nào nhất?" },
      { label: "≋ Liên hệ hợp tác", prompt: "Làm thế nào để liên hệ công việc hoặc gửi tin nhắn cho Văn Đô?" },
    ]
  },
  projects: {
    label: "Dự án",
    icon: Briefcase,
    greeting: "Chào bạn! Tôi là trợ lý chuyên về các DỰ ÁN. Bạn cần tìm hiểu dự án về chủ đề hay công nghệ nào?",
    prompts: [
      { label: "✦ Các dự án nổi bật", prompt: "Cho tôi danh sách các dự án nổi bật nhất mà Văn Đô đã xây dựng." },
      { label: "◇ Công nghệ dự án", prompt: "Những công nghệ phần cứng và phần mềm nào được dùng nhiều trong các dự án?" },
      { label: "≋ Dự án AI & IoT", prompt: "Văn Đô có những dự án nào về Trí tuệ nhân tạo (AI) và IoT?" },
    ]
  },
  posts: {
    label: "Bài viết",
    icon: FileText,
    greeting: "Chào mừng bạn! Tôi có thể tư vấn và tìm giúp bạn các BÀI VIẾT kỹ thuật phù hợp trên blog.",
    prompts: [
      { label: "✦ Gợi ý bài viết hay", prompt: "Gợi ý cho tôi những bài viết kỹ thuật hay nhất trên blog này." },
      { label: "◇ Bài viết về Embedded", prompt: "Blog có những bài viết nào chia sẻ kinh nghiệm về Lập trình nhúng và Firmware?" },
      { label: "≋ Tóm tắt các chủ đề", prompt: "Tóm tắt tổng quan các chủ đề chính được viết trên blog." },
    ]
  }
}

export function GlobalAiChatbot() {
  const { profile, projects, posts } = useSiteData()
  const [isOpen, setIsOpen] = useState(false)
  const [activeContext, setActiveContext] = useState<ChatContext>("home")
  const [messages, setMessages] = useState<Record<ChatContext, Message[]>>({
    home: [{ role: "assistant", content: CONTEXT_CONFIG.home.greeting }],
    projects: [{ role: "assistant", content: CONTEXT_CONFIG.projects.greeting }],
    posts: [{ role: "assistant", content: CONTEXT_CONFIG.posts.greeting }]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto detect active section from URL hash or scroll position
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === "#projects") setActiveContext("projects")
      else if (hash === "#posts") setActiveContext("posts")
      else if (hash === "#about" || hash === "") setActiveContext("home")
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const currentMessages = messages[activeContext]
  const currentConfig = CONTEXT_CONFIG[activeContext]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isTyping, isOpen, activeContext])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const animateTypewriter = (fullText: string, baseMessages: Message[]) => {
    setIsTyping(true)
    let index = 0
    const chunkSize = 3
    const speed = 15

    setMessages((prev) => ({
      ...prev,
      [activeContext]: [...baseMessages, { role: "assistant", content: "" }]
    }))

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
        const curList = prev[activeContext]
        const next = [...curList]
        if (next.length > 0 && next[next.length - 1].role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: revealed }
        }
        return {
          ...prev,
          [activeContext]: next
        }
      })
    }, speed)
  }

  const getContextPayload = () => {
    if (activeContext === "projects") {
      return projects.map((p: any) => ({ title: p.title, summary: p.summary, tags: p.tags }))
    }
    if (activeContext === "posts") {
      return posts.map((p: any) => ({ title: p.title, excerpt: p.excerpt, tags: p.tags }))
    }
    return {
      name: profile.name,
      role: profile.role,
      tagline: profile.tagline,
      location: profile.location,
      summary: profile.summary,
      skills: profile.skillGroups
    }
  }

  const sendPrompt = async (userMsg: string) => {
    if (!userMsg.trim() || isLoading || isTyping) return

    setInput("")
    setError("")
    
    const newMessages: Message[] = [...currentMessages, { role: "user", content: userMsg }]
    setMessages((prev) => ({ ...prev, [activeContext]: newMessages }))
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          pageContext: activeContext,
          contextData: getContextPayload(),
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi kết nối AI.")
      }

      animateTypewriter(data.text || "", newMessages)
    } catch (err: any) {
      setError(err.message)
      setMessages((prev) => ({
        ...prev,
        [activeContext]: [...newMessages, { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi kết nối AI. Vui lòng thử lại sau." }]
      }))
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
    setMessages((prev) => ({
      ...prev,
      [activeContext]: [{ role: "assistant", content: currentConfig.greeting }]
    }))
    setError("")
  }

  const isBusy = isLoading || isTyping

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Floating Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[390px] h-[520px] border border-primary/20 dark:border-primary/30 rounded-[22px] bg-white/90 dark:bg-[#121316]/90 backdrop-blur-xl shrink-0 flex flex-col shadow-2xl dark:shadow-primary/10 transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 pb-2.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  AI Assistant
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-mono">3.6 Flash</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentMessages.length > 1 && (
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
                title="Đóng chat"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Switcher Tabs */}
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-1 bg-black/5 dark:bg-white/5 shrink-0">
            {(Object.keys(CONTEXT_CONFIG) as ChatContext[]).map((key) => {
              const cfg = CONTEXT_CONFIG[key]
              const IconComp = cfg.icon
              const isActive = activeContext === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveContext(key)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-white dark:bg-white/10 text-primary shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{cfg.label}</span>
                </button>
              )
            })}
          </div>

          {/* Messages List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 pr-2 custom-scrollbar">
            {currentMessages.map((msg, i) => (
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
                  <span>AI đang phản hồi...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions for Current Context */}
          {currentMessages.length <= 3 && !isBusy && (
            <div className="px-3 mb-2 shrink-0 flex flex-wrap gap-1.5">
              {currentConfig.prompts.map((item, idx) => (
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

          {error && <div className="text-[11px] text-red-500 mb-2 px-3">{error}</div>}

          {/* Input Form */}
          <div className="p-3 pt-0 relative shrink-0">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Hỏi AI về ${currentConfig.label.toLowerCase()}...`}
                className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-[14px] pl-3 pr-10 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[44px] max-h-[100px] overflow-hidden"
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
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-300 font-sans font-bold text-xs"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Hỏi AI</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
        </button>
      )}
    </div>
  )
}
