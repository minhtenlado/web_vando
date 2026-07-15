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

type FieldErrors = Record<string, string>

export function Contact() {
  const { profile } = useSiteData()
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
          title: "Gửi không thành công",
          description: json.message ?? "Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Đã gửi tin nhắn ✓",
        description: json.message,
      })
      form.reset()
    } catch {
      toast({
        title: "Lỗi mạng",
        description: "Không thể kết nối tới máy chủ, vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const channels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: "Điện thoại", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Vị trí", value: profile.location, href: undefined },
    { icon: Globe, label: "Website", value: profile.website, href: `https://${profile.website}` },
  ]

  const socials = [
    { icon: Github, label: "GitHub", href: `https://${profile.github}` },
    { icon: Linkedin, label: "LinkedIn", href: `https://${profile.linkedin}` },
  ]

  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeader
          index="09 / contact"
          title="Liên hệ với tôi"
          subtitle="Đang tìm kiếm một kỹ sư nhúng cho dự án của bạn, hoặc đơn giản muốn trao đổi về vi điều khiển, RTOS và IoT? Hãy gửi vài dòng nhé."
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
                  <p className="text-sm font-semibold">Kênh liên lạc</p>
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
                <p className="text-xs text-muted-foreground mb-2">Mạng xã hội</p>
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
                Tôi hiện đang mở cho các cơ hội freelance, hợp đồng dự án hoặc
                vị trí toàn thời gian liên quan đến firmware, IoT và hệ thống nhúng.
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
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
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
                    Tin nhắn <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Mô tả ngắn gọn về dự án hoặc câu hỏi của bạn..."
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Gửi tin nhắn
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Bằng việc gửi form, bạn đồng ý tôi có thể liên hệ lại qua email.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
