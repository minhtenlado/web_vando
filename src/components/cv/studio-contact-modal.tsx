"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AlertCircle, ArrowUpRight, Check, Cpu, Loader2, Mail, X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import "./contact-dialog.css"

const TOPIC_OPTIONS = [
  { id: "embedded", label: { vi: "Hệ thống nhúng & IoT", en: "Embedded & IoT" } },
  { id: "software", label: { vi: "Web & phần mềm", en: "Web & software" } },
  { id: "career", label: { vi: "Cơ hội nghề nghiệp", en: "Career opportunity" } },
  { id: "other", label: { vi: "Trao đổi khác", en: "Something else" } },
] as const

type FieldName = "name" | "email" | "message"
type FieldErrors = Partial<Record<FieldName, string>>
type ContactResponse = {
  ok?: boolean
  ticket?: string
  message?: string
  errors?: FieldErrors
}

export function StudioContactModal() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()
  const id = React.useId()
  const nameInput = React.useRef<HTMLInputElement>(null)
  const opener = React.useRef<HTMLElement | null>(null)
  const feedback = React.useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [selectedTopic, setSelectedTopic] = React.useState<string>("embedded")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [ticketId, setTicketId] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  React.useEffect(() => {
    const handleOpen = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (!isSubmitting) {
        setStatus("idle")
        setStatusMessage("")
        setFieldErrors({})
        setTicketId("")
      }
      setIsOpen(true)
    }
    window.addEventListener("open-contact-modal", handleOpen)
    return () => window.removeEventListener("open-contact-modal", handleOpen)
  }, [isSubmitting])

  React.useEffect(() => {
    if (isOpen && status !== "idle") feedback.current?.focus()
  }, [isOpen, status])

  function clearFieldError(field: FieldName) {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const errors: FieldErrors = {}
    if (name.trim().length < 2) errors.name = t("Vui lòng nhập ít nhất 2 ký tự.", "Please enter at least 2 characters.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = t("Vui lòng nhập email hợp lệ.", "Please enter a valid email address.")
    if (message.trim().length < 10) errors.message = t("Vui lòng nhập ít nhất 10 ký tự.", "Please enter at least 10 characters.")
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setStatus("error")
      setStatusMessage(t("Vui lòng kiểm tra các trường được đánh dấu.", "Please check the highlighted fields."))
      return
    }

    setIsSubmitting(true)
    setStatus("idle")
    setStatusMessage("")
    setTicketId("")
    const topic = TOPIC_OPTIONS.find((option) => option.id === selectedTopic)
    const topicLabel = topic?.label[locale] ?? selectedTopic

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topicLabel,
          message: `[Mục đích: ${topicLabel}]\n\n${message.trim()}`,
        }),
      })
      const data: ContactResponse = await response.json().catch(() => ({}))

      if (response.ok && data.ok) {
        setStatus("success")
        setTicketId(typeof data.ticket === "string" ? data.ticket : "")
        setStatusMessage(t("Cảm ơn bạn đã liên hệ. Tin nhắn đã được nhận thành công.", "Thanks for reaching out. Your message has been received."))
        setName("")
        setEmail("")
        setMessage("")
      } else {
        setStatus("error")
        if (data.errors) {
          const responseErrors: FieldErrors = {}
          for (const field of ["name", "email", "message"] as const) {
            const fieldError = data.errors[field]
            if (typeof fieldError === "string") {
              responseErrors[field] = t(fieldError, "Please check this field and remove unsupported content.")
            }
          }
          setFieldErrors(responseErrors)
        }
        setStatusMessage(
          response.status === 429
            ? t("Bạn gửi quá nhanh. Vui lòng đợi một phút rồi thử lại.", "Please wait a minute before trying again.")
            : response.status === 422
              ? t("Vui lòng kiểm tra thông tin và thử lại.", "Please check your details and try again.")
              : t("Chưa thể gửi tin nhắn. Vui lòng thử lại hoặc liên hệ qua email.", "Your message could not be sent. Please try again or use email.")
        )
      }
    } catch {
      setStatus("error")
      setStatusMessage(t("Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.", "Could not connect. Please check your connection and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setStatus("idle")
    setStatusMessage("")
    setTicketId("")
    setFieldErrors({})
    requestAnimationFrame(() => nameInput.current?.focus())
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogPortal>
        <DialogOverlay className="contact-dialog-overlay" />
        <DialogPrimitive.Content
          className="contact-dialog-panel"
          lang={locale}
          onOpenAutoFocus={(event) => {
            if (nameInput.current && !isSubmitting) {
              event.preventDefault()
              nameInput.current.focus()
            }
          }}
          onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected) {
              event.preventDefault()
              opener.current.focus()
            }
          }}
        >
          <DialogClose className="contact-dialog-close" aria-label={t("Đóng biểu mẫu liên hệ", "Close contact form")}>
            <X size={19} aria-hidden="true" />
          </DialogClose>

          <aside className="contact-dialog-intro">
            <span className="contact-dialog-eyebrow"><span />{t("BẮT ĐẦU CUỘC TRÒ CHUYỆN", "START A CONVERSATION")}</span>
            <div className="contact-dialog-symbol" aria-hidden="true"><Cpu size={34} strokeWidth={1.4} /></div>
            <DialogTitle className="contact-dialog-title">
              {t("Cùng tạo nên", "Let’s build")}<br />
              <span>{t("điều hữu ích.", "something useful.")}</span>
            </DialogTitle>
            <DialogDescription className="contact-dialog-description">
              {t(
                "Một ý tưởng IoT, sản phẩm mới hay cơ hội cộng tác? Chia sẻ điều bạn đang nghĩ tới.",
                "An IoT idea, a new product, or an opportunity to collaborate? Tell me what you have in mind."
              )}
            </DialogDescription>
            {profile.email && (
              <a className="contact-dialog-email" href={`mailto:${profile.email}`}>
                <span className="contact-dialog-email-label"><Mail size={15} aria-hidden="true" />{t("HOẶC GỬI EMAIL TRỰC TIẾP", "OR EMAIL ME DIRECTLY")}</span>
                <span className="contact-dialog-email-address">{profile.email}<ArrowUpRight size={17} aria-hidden="true" /></span>
              </a>
            )}
          </aside>

          <div className="contact-dialog-form-panel">
            {status === "success" ? (
              <div className="contact-dialog-success" ref={feedback} tabIndex={-1} role="status">
                <span className="contact-dialog-success-icon"><Check size={28} aria-hidden="true" /></span>
                <p className="contact-dialog-eyebrow">{t("TIN NHẮN ĐÃ ĐƯỢC NHẬN", "MESSAGE RECEIVED")}</p>
                <h3>{t("Cảm ơn bạn.", "Thank you.")}</h3>
                <p>{statusMessage}</p>
                {ticketId && <p className="contact-dialog-ticket">{t("Mã tham chiếu", "Reference")}: <code>{ticketId}</code></p>}
                <button className="contact-dialog-submit" type="button" onClick={handleReset}>
                  {t("Gửi tin nhắn khác", "Send another message")}<ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-dialog-form" aria-busy={isSubmitting}>
                <div className="contact-dialog-form-heading">
                  <p className="contact-dialog-eyebrow">{t("CHI TIẾT CỦA BẠN", "YOUR DETAILS")}</p>
                  <p>{t("Các trường có dấu * là bắt buộc.", "Fields marked * are required.")}</p>
                </div>
                <fieldset className="contact-dialog-fields" disabled={isSubmitting}>
                  <div className="contact-dialog-field-row">
                    <div className="contact-dialog-field">
                      <label htmlFor={`${id}-name`}>{t("Họ và tên", "Your name")} <span aria-hidden="true">*</span></label>
                      <input
                        ref={nameInput}
                        id={`${id}-name`}
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder={t("Tên của bạn", "How should I call you?")}
                        value={name}
                        onChange={(event) => { setName(event.target.value); clearFieldError("name") }}
                        required
                        minLength={2}
                        maxLength={80}
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? `${id}-name-error` : undefined}
                      />
                      {fieldErrors.name && <span className="contact-dialog-field-error" id={`${id}-name-error`}>{fieldErrors.name}</span>}
                    </div>
                    <div className="contact-dialog-field">
                      <label htmlFor={`${id}-email`}>{t("Địa chỉ email", "Email address")} <span aria-hidden="true">*</span></label>
                      <input
                        id={`${id}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => { setEmail(event.target.value); clearFieldError("email") }}
                        required
                        maxLength={100}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
                      />
                      {fieldErrors.email && <span className="contact-dialog-field-error" id={`${id}-email-error`}>{fieldErrors.email}</span>}
                    </div>
                  </div>

                  <fieldset className="contact-dialog-topics">
                    <legend>{t("Bạn muốn trao đổi về", "What’s on your mind?")}</legend>
                    <div className="contact-dialog-topic-list">
                      {TOPIC_OPTIONS.map((topic) => (
                        <label key={topic.id} className="contact-dialog-topic" data-selected={selectedTopic === topic.id}>
                          <input
                            type="radio"
                            name="topic"
                            value={topic.id}
                            checked={selectedTopic === topic.id}
                            onChange={() => setSelectedTopic(topic.id)}
                          />
                          <span>{topic.label[locale]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="contact-dialog-field">
                    <label htmlFor={`${id}-message`}>{t("Tin nhắn", "Your message")} <span aria-hidden="true">*</span></label>
                    <textarea
                      id={`${id}-message`}
                      name="message"
                      placeholder={t("Một vài dòng về ý tưởng, dự án hoặc điều bạn muốn trao đổi…", "A few lines about your idea, project, or what you’d like to discuss…")}
                      value={message}
                      onChange={(event) => { setMessage(event.target.value); clearFieldError("message") }}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={`${id}-message-hint${fieldErrors.message ? ` ${id}-message-error` : ""}`}
                    />
                    <div className="contact-dialog-message-meta">
                      <span id={`${id}-message-hint`}>{t("Ít nhất 10 ký tự.", "At least 10 characters.")}</span>
                      <span aria-hidden="true">{message.length}/2000</span>
                    </div>
                    {fieldErrors.message && <span className="contact-dialog-field-error" id={`${id}-message-error`}>{fieldErrors.message}</span>}
                  </div>
                </fieldset>

                {status === "error" && (
                  <div className="contact-dialog-error" role="alert" ref={feedback} tabIndex={-1}>
                    <AlertCircle size={18} aria-hidden="true" /><span>{statusMessage}</span>
                  </div>
                )}
                <div className="contact-dialog-form-bottom">
                  <p>{t("Thông tin được dùng để tiếp nhận và phản hồi tin nhắn của bạn.", "Your details are used to receive and respond to your message.")}</p>
                  <button type="submit" className="contact-dialog-submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="contact-dialog-spinner" aria-hidden="true" /> : null}
                    {isSubmitting ? t("Đang gửi…", "Sending…") : t("Gửi tin nhắn", "Send message")}
                    {!isSubmitting && <ArrowUpRight size={18} aria-hidden="true" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
