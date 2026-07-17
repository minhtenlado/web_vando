'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Send,
  Loader2,
  Terminal,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

type FieldErrors = Record<string, string>

export function Contact() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()
  const { toast } = useToast()
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors as FieldErrors)
        toast({
          title: t("Gửi không thành công", "Failed to send"),
          description: json.message ?? t("Vui lòng kiểm tra lại thông tin.", "Please check your information."),
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("Đã gửi tin nhắn ✓", "Message sent ✓"),
        description: json.message,
      })
      form.reset()
    } catch {
      toast({
        title: t("Lỗi mạng", "Network error"),
        description: t("Không thể kết nối tới máy chủ, vui lòng thử lại.", "Could not connect to the server, please try again."),
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const channels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: t("Điện thoại", "Phone"), value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: t("Vị trí", "Location"), value: profile.location, href: undefined },
    { icon: Globe, label: "Website", value: profile.website, href: `https://${profile.website}` },
  ]

  const socials = [
    { icon: Github, label: "GitHub", href: `https://${profile.github}` },
    { icon: Linkedin, label: "LinkedIn", href: `https://${profile.linkedin}` },
  ]

  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="09 / contact"
          title={t("Liên hệ với tôi", "Contact Me")}
          subtitle={t(
            "Đang tìm kiếm một kỹ sư nhúng cho dự án của bạn, hoặc đơn giản muốn trao đổi về vi điều khiển, RTOS và IoT? Hãy gửi vài dòng nhé.",
            "Looking for an embedded engineer for your project, or just want to chat about microcontrollers, RTOS, and IoT? Drop me a line."
          )}
        />

        <div className="mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <Card className="p-6 border-border/60 bg-card/40 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Terminal className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {"$"} ping --me
                  </p>
                  <p className="text-sm font-semibold">{t("Kênh liên lạc", "Channels")}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {channels.map((c) => {
                  const Icon = c.icon
                  const content = (
                    <div className="flex items-center gap-3 group">
                      <span className="grid place-items-center h-10 w-10 rounded-lg bg-background border border-border group-hover:border-primary/40 group-hover:text-primary transition-colors">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="text-sm font-medium truncate">{c.value}</p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a href={c.href} className="block hover:opacity-80 transition-opacity">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="mt-5 pt-5 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-2">{t("Mạng xã hội", "Socials")}</p>
                <div className="flex gap-2">
                  {socials.map((s) => {
                    const Icon = s.icon
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="grid place-items-center h-10 w-10 rounded-lg bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/60 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inset-0 rounded-full bg-primary opacity-75 pulse-ring" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <p className="font-mono text-xs text-primary">status: available</p>
              </div>
              <p className="text-sm leading-relaxed">
                {t(
                  "Tôi hiện đang mở cho các cơ hội freelance, hợp đồng dự án hoặc vị trí toàn thời gian liên quan đến firmware, IoT và hệ thống nhúng.",
                  "I am currently open to freelance opportunities, project contracts, or full-time positions related to firmware, IoT, and embedded systems."
                )}
              </p>
            </Card>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  ~/contact/send.sh
                </span>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">
                    {t("Họ và tên", "Full Name")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("Nguyễn Văn A", "John Doe")}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm">
                    {t("Tin nhắn", "Message")} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder={t("Mô tả ngắn gọn về dự án hoặc câu hỏi của bạn...", "Brief description of your project or your question...")}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-xs text-destructive">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("Đang gửi...", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> {t("Gửi tin nhắn", "Send Message")}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("Bằng việc gửi form, bạn đồng ý tôi có thể liên hệ lại qua email.", "By submitting this form, you agree that I can contact you back via email.")}
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
