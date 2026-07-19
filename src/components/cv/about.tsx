'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Terminal, Zap, ShieldCheck, Layers, Code, Cpu, Server, Database, Globe, Smartphone, HelpCircle } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { useSiteData } from "@/components/cv/site-data-context"
import DOMPurify from "isomorphic-dompurify"
import { useLocale } from "@/components/cv/locale-context"

const iconMap: Record<string, React.ElementType> = {
  Terminal, Zap, ShieldCheck, Layers, Code, Cpu, Server, Database, Globe, Smartphone
}

export function About() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()

  const principles = profile.principles || []
  const stats = profile.stats || []

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="01 / about"
          title={t("Giới thiệu", "About")}
          subtitle={t(
            "Hành trình của một kỹ sư nhúng — từ dòng code đầu tiên trên AVR đến những hệ thống IoT quy mô hàng chục nghìn thiết bị.",
            "The journey of an embedded engineer — from the first line of code on AVR to IoT systems scaling tens of thousands of devices."
          )}
        />

        <div className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          {/* Bio card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  ~/about/me.sh
                </span>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {t("Sơ lược về tôi", "A bit about me")}
                </h3>
                <div 
                  className="text-sm leading-relaxed text-foreground/90 my-4 prose prose-sm dark:prose-invert max-w-none ql-editor-display"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((profile.summary || "").replace(/&nbsp;/g, ' '), { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "class"] }) }} 
                />
                <h3 className="text-lg font-semibold text-primary mt-8 mb-4">
                  {t("Triết lý làm việc", "Working principles")}
                </h3>

                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {principles.map((p, idx) => {
                    const Icon = iconMap[p.icon] || HelpCircle
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-border/60 bg-background/40 p-4 hover:border-primary/40 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-primary mb-2" />
                        <h4 className="text-sm font-semibold mb-1">{p.title[locale]}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {p.desc[locale]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats column */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-dots opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-emerald font-mono">
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {s.label[locale]}
                  </div>
                </div>
                <span className="absolute top-2 right-2 font-mono text-[10px] text-muted-foreground/60">
                  0{i + 1}
                </span>
              </div>
            ))}

            {profile.nowText && (
              <div className="col-span-2 rounded-xl border border-border/60 bg-primary/5 p-5">
                <h3 className="text-sm font-bold text-primary mb-2 tracking-wide uppercase">
                  {t("Hiện tại", "Now")}
                </h3>
                <div 
                  className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none ql-editor-display" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((profile.nowText || "").replace(/&nbsp;/g, ' '), { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "class"] }) }} 
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
