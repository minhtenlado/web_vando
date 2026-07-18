'use client'

import * as React from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

export function Contact() {
  const { profile } = useSiteData()
  const { t } = useLocale()

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
            "Đang tìm kiếm một kỹ sư nhúng cho dự án của bạn, hoặc đơn giản muốn trao đổi về vi điều khiển, RTOS và IoT? Hãy kết nối với tôi.",
            "Looking for an embedded engineer for your project, or just want to chat about microcontrollers, RTOS, and IoT? Let's connect."
          )}
        />

        <div className="mt-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Left Col: Channels */}
            <Card className="p-6 sm:p-8 border-border/60 bg-card/40 backdrop-blur flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6">{t("Kênh liên lạc", "Channels")}</h3>
              <ul className="space-y-5">
                {channels.map((c) => {
                  const Icon = c.icon
                  const content = (
                    <div className="flex items-center gap-4 group">
                      <span className="grid place-items-center h-12 w-12 rounded-xl bg-background border border-border group-hover:border-primary/40 group-hover:text-primary transition-colors shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-0.5">{c.label}</p>
                        <p className="text-base font-medium truncate">{c.value}</p>
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
            </Card>

            {/* Right Col: Status and Socials */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 sm:p-8 border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inset-0 rounded-full bg-primary opacity-75 pulse-ring" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                  </span>
                  <p className="font-mono text-sm text-primary font-medium tracking-wide uppercase">
                    {t("Hiện tại", "Status")}
                  </p>
                </div>
                <p className="text-base leading-relaxed text-foreground/90">
                  {t(
                    "Tôi hiện đang mở cho các cơ hội freelance, hợp đồng dự án hoặc vị trí toàn thời gian liên quan đến firmware, IoT và hệ thống nhúng.",
                    "I am currently open to freelance opportunities, project contracts, or full-time positions related to firmware, IoT, and embedded systems."
                  )}
                </p>
              </Card>

              <Card className="p-6 sm:p-8 border-border/60 bg-card/40 backdrop-blur">
                <h3 className="text-lg font-bold mb-4">{t("Mạng xã hội", "Socials")}</h3>
                <div className="flex gap-4">
                  {socials.map((s) => {
                    const Icon = s.icon
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="flex-1 grid place-items-center h-12 rounded-xl bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    )
                  })}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
