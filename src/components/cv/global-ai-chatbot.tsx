'use client'

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, RefreshCw, X, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useSiteData } from "@/components/cv/site-data-context"

type Message = {
  role: "user" | "assistant"
  content: string
}

const DEFAULT_GREETING = "Xin chào! Tôi là Trợ lý AI của Phan Huỳnh Văn Đô. Tôi có thể giúp bạn tìm hiểu về kinh nghiệm cá nhân, danh sách các DỰ ÁN nổi bật, các BÀI VIẾT kỹ thuật hoặc thông tin liên hệ."

const QUICK_PROMPTS = [
  {
    label: "✦ Các dự án nổi bật",
    prompt: "Liệt kê các dự án nổi bật nhất mà Phan Huỳnh Văn Đô đã thực hiện kèm theo đường link chi tiết."
  },
  {
    label: "◇ Bài viết kỹ thuật",
    prompt: "Gợi ý các bài viết kỹ thuật hay nhất trên blog kèm link đọc bài."
  },
  {
    label: "≋ Thông tin & Liên hệ",
    prompt: "Cho tôi biết thông tin cá nhân, kỹ năng chính và các kênh liên hệ (Facebook, GitHub, Email, SĐT...) của Văn Đô."
  },
  {
    label: "⊕ Kinh nghiệm & Kỹ năng",
    prompt: "Văn Đô có kinh nghiệm làm việc ở những công ty nào và thành thạo những công nghệ/vi điều khiển nào nhất?"
  }
]

export function GlobalAiChatbot() {
  const { profile, projects, experiences, posts } = useSiteData()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: DEFAULT_GREETING }
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
    if (isOpen) scrollToBottom()
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
    const speed = 15

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

  const getContextPayload = () => {
    const facebookSocial = profile.socials?.find((s: any) =>
      String(s?.network || s?.name || "").toLowerCase().includes("facebook")
    )
    return {
      profile: {
        name: profile.name || "Phan Huỳnh Văn Đô",
        role: profile.role || "Embedded Software Engineer",
        tagline: profile.tagline,
        location: profile.location,
        email: profile.email || "phanhuynhvando@gmail.com",
        phone: profile.phone || "",
        website: profile.website || "https://phanhuynh.id.vn",
        github: profile.github || "https://github.com/minhtenlado",
        linkedin: profile.linkedin || "",
        facebook: facebookSocial?.url || profile.website || "",
        summary: profile.summary,
        educations: profile.educations || [],
        certifications: profile.certifications || [],
        principles: profile.principles || [],
        stats: profile.stats || [],
        skillGroups: profile.skillGroups,
        experiences: experiences.map((e) => ({
          role: e.role,
          company: e.company,
          companyUrl: e.companyUrl,
          period: e.period,
          description: e.description,
          highlights: e.highlights,
          stack: e.stack
        })),
        socials: profile.socials
      },
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        category: p.category,
        description: p.description,
        tech: p.tech,
        demoUrl: p.link || null,
        repoUrl: p.repo || null,
        detailUrl: `#projects`
      })),
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        excerpt: p.excerpt,
        url: `/posts/${p.slug}`
      }))
    }
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
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi kết nối AI. Vui lòng thử lại sau." }
      ])
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
    setMessages([{ role: "assistant", content: DEFAULT_GREETING }])
    setError("")
  }

  const isBusy = isLoading || isTyping

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Floating Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[410px] h-[540px] border border-primary/20 dark:border-primary/30 rounded-[22px] bg-white/95 dark:bg-[#121316]/95 backdrop-blur-xl shrink-0 flex flex-col shadow-2xl dark:shadow-primary/10 transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 pb-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  AI Assistant
                </h3>
                <p className="text-[11px] text-muted-foreground">Phan Huỳnh Văn Đô Portfolio</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  title="Làm mới đoạn chat"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div 
            ref={chatContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 pr-2 scrollbar-hide"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-3.5 py-2.5 rounded-[16px] max-w-[92%] text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs"
                    : "bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-xs prose prose-sm dark:prose-invert prose-p:leading-snug prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => {
                          const isInternal = href?.startsWith("/") || href?.startsWith("#");
                          return (
                            <a
                              href={href}
                              target={isInternal ? "_self" : "_blank"}
                              rel={isInternal ? undefined : "noopener noreferrer"}
                              className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                              onClick={(e) => {
                                if (href?.startsWith("#")) {
                                  e.preventDefault();
                                  const el = document.querySelector(href);
                                  if (el) {
                                    el.scrollIntoView({ behavior: "smooth" });
                                    setIsOpen(false);
                                  }
                                }
                              }}
                            >
                              <span>{children}</span>
                              {!isInternal && <ExternalLink className="w-3 h-3 inline-block opacity-80" />}
                            </a>
                          );
                        }
                      }}
                    >
                      {msg.content || "..."}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && !isTyping && (
              <div className="flex flex-col items-start">
                <div className="px-3.5 py-2.5 rounded-[16px] bg-black/5 dark:bg-white/10 rounded-tl-xs flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>AI đang suy nghĩ và tìm câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 3 && !isBusy && (
            <div className="px-3 mb-2 shrink-0 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendPrompt(item.prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all text-left truncate max-w-full"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {error && <div className="text-[11px] text-red-500 mb-2 px-3">{error}</div>}

          {/* Input Form */}
          <div className="p-3 pt-0 relative shrink-0">
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi AI về Văn Đô, dự án hoặc bài viết..."
                className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-[14px] pl-3 pr-10 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[44px] max-h-[100px] overflow-hidden"
                rows={1}
                disabled={isBusy}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isBusy}
                className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
