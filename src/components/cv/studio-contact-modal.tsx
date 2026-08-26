'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Globe
} from "lucide-react"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

const TOPIC_OPTIONS = [
  { id: "project", label: { vi: "Dự án mới", en: "A new brand" } },
  { id: "website", label: { vi: "Web & Phần mềm", en: "A website" } },
  { id: "consulting", label: { vi: "Tư vấn kỹ thuật", en: "Editorial" } },
  { id: "other", label: { vi: "Chủ đề khác", en: "Something else" } },
]

export function StudioContactModal() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()

  const [isOpen, setIsOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [selectedTopic, setSelectedTopic] = React.useState("website")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [ticketId, setTicketId] = React.useState("")

  // Global event listener to open modal from anywhere
  React.useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setStatus("idle")
      setStatusMessage("")
    }
    window.addEventListener("open-contact-modal", handleOpen)

    // Also support escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("open-contact-modal", handleOpen)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error")
      setStatusMessage(t("Vui lòng điền đầy đủ các trường thông tin.", "Please fill in all required fields."))
      return
    }

    setIsSubmitting(true)
    setStatus("idle")
    setStatusMessage("")

    const topicObj = TOPIC_OPTIONS.find((o) => o.id === selectedTopic)
    const topicLabel = topicObj ? topicObj.label[locale === "en" ? "en" : "vi"] : selectedTopic

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topicLabel,
          message: `[Mục đích: ${topicLabel}]\n\n${message.trim()}`,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.ok) {
        setStatus("success")
        setTicketId(data.ticket || `ST-${Date.now().toString(36).toUpperCase()}`)
        setStatusMessage(
          data.message ||
            t(
              "Tin nhắn của bạn đã được gửi thành công! Tôi sẽ liên hệ lại sớm nhất.",
              "Your message has been sent successfully! I will get back to you shortly."
            )
        )
        // Clear fields
        setName("")
        setEmail("")
        setMessage("")
      } else {
        setStatus("error")
        setStatusMessage(
          data.message ||
            t(
              "Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại sau.",
              "An error occurred while sending your message. Please try again."
            )
        )
      }
    } catch {
      setStatus("error")
      setStatusMessage(
        t(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
          "Could not connect to the server. Please check your network connection."
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setStatus("idle")
    setStatusMessage("")
    setTicketId("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
            aria-hidden
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.05 }}
            className="relative w-full max-w-5xl rounded-[28px] sm:rounded-[32px] border border-[#e5dfd5] dark:border-[#262c3a] bg-[#f9f7f2] dark:bg-[#0e121a] text-[#1e1b18] dark:text-[#f3f4f6] shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full bg-[#ede8df] dark:bg-[#1a202c] text-[#555] dark:text-[#a0aec0] hover:text-foreground hover:bg-[#e2dcce] dark:hover:bg-[#2d3748] transition-colors z-20 cursor-pointer shadow-sm"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] divide-y lg:divide-y-0 lg:divide-x divide-[#e8e2d8] dark:divide-[#202736]">
              {/* ================= LEFT COLUMN: STUDIO INFO ================= */}
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  {/* Tag Header */}
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-primary tracking-[0.14em] uppercase">
                    <span>04 — CORRESPONDENCE</span>
                  </div>

                  {/* Main Title */}
                  <h2 className="text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight leading-[1.15] text-[#1c1917] dark:text-[#f8fafc] font-serif">
                    {t("Write to the studio.", "Write to the studio.")}
                  </h2>

                  {/* Editorial Subtitle */}
                  <p className="text-sm sm:text-[15px] leading-relaxed text-[#665f57] dark:text-[#94a3b8]">
                    {t(
                      "Các đề xuất dự án mới hoặc trao đổi kỹ thuật được phản hồi nhanh chóng trong vòng 24–48 giờ. Tôi luôn sẵn sàng thảo luận về các cơ hội hợp tác phù hợp.",
                      "New commissions and project inquiries are reviewed on schedule. If the work is a fit, you will hear back within 24–48 hours — usually sooner."
                    )}
                  </p>
                </div>

                {/* Metadata List */}
                <div className="space-y-5 pt-4 border-t border-[#eae4da] dark:border-[#1e2533]">
                  {/* Email */}
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                      EMAIL
                    </span>
                    <a
                      href={`mailto:${profile.email || "phanhuynhvando2004@gmail.com"}`}
                      className="text-sm sm:text-[15px] font-medium text-[#1c1917] dark:text-[#e2e8f0] hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      {profile.email || "phanhuynhvando2004@gmail.com"}
                    </a>
                  </div>

                  {/* Studio / Location */}
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                      STUDIO / LOCATION
                    </span>
                    <p className="text-sm sm:text-[15px] font-medium text-[#1c1917] dark:text-[#e2e8f0]">
                      {profile.location || "Đà Nẵng, Việt Nam"}
                    </p>
                  </div>

                  {/* Availability */}
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                      AVAILABILITY
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {t("Sẵn sàng nhận dự án mới (Booking Q4 2026)", "Booking Q4 2026 / Open for projects")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT COLUMN: INTERACTIVE FORM ================= */}
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="my-auto py-12 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {t("Đã gửi tin nhắn thành công!", "Letter sent successfully!")}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {statusMessage}
                    </p>
                    {ticketId && (
                      <div className="inline-block px-3 py-1.5 rounded-lg bg-muted text-xs font-mono text-foreground font-semibold border border-border">
                        Mã tham chiếu: {ticketId}
                      </div>
                    )}
                    <div className="pt-4">
                      <button
                        onClick={handleReset}
                        className="px-5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
                      >
                        {t("Gửi tin nhắn khác", "Send another letter")}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                          {t("NAME", "NAME")} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t("Họ và tên của bạn", "Your name")}
                          required
                          maxLength={80}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ded8cd] dark:border-[#262e3d] bg-[#f2eee6] dark:bg-[#151a24] text-sm text-[#1e1b18] dark:text-[#f3f4f6] placeholder-[#9c9387] dark:placeholder-[#5a677d] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                          {t("EMAIL", "EMAIL")} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@studio.com"
                          required
                          maxLength={100}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ded8cd] dark:border-[#262e3d] bg-[#f2eee6] dark:bg-[#151a24] text-sm text-[#1e1b18] dark:text-[#f3f4f6] placeholder-[#9c9387] dark:placeholder-[#5a677d] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 2: What are you writing about? (Topic Pills) */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                        {t("WHAT ARE YOU WRITING ABOUT?", "WHAT ARE YOU WRITING ABOUT?")}
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {TOPIC_OPTIONS.map((topic) => {
                          const isSelected = selectedTopic === topic.id
                          const labelText = topic.label[locale === "en" ? "en" : "vi"]
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => setSelectedTopic(topic.id)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? "bg-[#1f2922] text-[#f8fafc] border-[#1f2922] dark:bg-primary dark:text-primary-foreground dark:border-primary shadow-sm scale-[1.02]"
                                  : "bg-[#ece6db] text-[#4a443c] border-[#ddd7cc] dark:bg-[#181f2c] dark:text-[#94a3b8] dark:border-[#283244] hover:bg-[#e4ded2] dark:hover:bg-[#1f2838]"
                              }`}
                            >
                              {labelText}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Row 3: Message */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a8175] dark:text-[#64748b]">
                        {t("MESSAGE", "MESSAGE")} <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t(
                          "Mô tả ngắn gọn về dự án, tiến độ mong muốn hoặc nội dung bạn muốn trao đổi...",
                          "A few lines on the project, timing, and how you found the studio."
                        )}
                        required
                        rows={4}
                        maxLength={2000}
                        className="w-full p-4 rounded-2xl border border-[#ded8cd] dark:border-[#262e3d] bg-[#f2eee6] dark:bg-[#151a24] text-sm text-[#1e1b18] dark:text-[#f3f4f6] placeholder-[#9c9387] dark:placeholder-[#5a677d] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary leading-relaxed resize-none transition-all shadow-inner"
                      />
                    </div>

                    {/* Status Feedback */}
                    {status === "error" && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs border border-rose-500/20">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{statusMessage}</span>
                      </div>
                    )}

                    {/* Bottom Bar: Privacy Note + Submit Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <p className="text-[11px] text-[#8a8175] dark:text-[#64748b] text-center sm:text-left">
                        {t("Không spam. Tin nhắn được gửi trực tiếp đến Phan Huỳnh Văn Đô.", "No mailing list. Notes stay in this browser.")}
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#203629] hover:bg-[#2a4736] text-[#eaf3ed] dark:bg-primary dark:text-primary-foreground dark:hover:brightness-110 font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isSubmitting ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>{t("Đang gửi...", "Sending...")}</span>
                          </>
                        ) : (
                          <>
                            <span>{t("Send letter", "Send letter")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
