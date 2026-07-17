'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Terminal, Zap, ShieldCheck, Layers } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { stats } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

export function About() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()

  const principles = [
    {
      icon: Terminal,
      title: { vi: "Code Sạch & Dễ Bảo Trì", en: "Clean & Maintainable Code" },
      desc: { 
        vi: "Tuân thủ MISRA C và các chuẩn lập trình an toàn. Thiết kế kiến trúc phần mềm modular để dễ dàng tái sử dụng và mở rộng.",
        en: "Adhere to MISRA C and secure coding standards. Design modular software architecture for easy reuse and scalability."
      },
    },
    {
      icon: Zap,
      title: { vi: "Tối Ưu Hiệu Năng", en: "Performance Optimization" },
      desc: {
        vi: "Viết firmware chạy mượt mà với tài nguyên RAM/Flash tối thiểu. Sử dụng hiệu quả các chế độ Low Power để kéo dài tuổi thọ pin.",
        en: "Write firmware that runs smoothly with minimal RAM/Flash footprint. Effectively utilize Low Power modes to extend battery life."
      },
    },
    {
      icon: ShieldCheck,
      title: { vi: "An Toàn & Đáng Tin Cậy", en: "Safety & Reliability" },
      desc: {
        vi: "Thiết kế hệ thống có khả năng chịu lỗi (fault-tolerant) với Watchdog, brown-out reset và các cơ chế xử lý lỗi chặt chẽ.",
        en: "Design fault-tolerant systems with Watchdog, brown-out reset, and robust error handling mechanisms."
      },
    },
    {
      icon: Layers,
      title: { vi: "Tích Hợp Toàn Diện", en: "Full-Stack Integration" },
      desc: {
        vi: "Từ vi điều khiển lên tới Cloud. Đảm bảo dữ liệu từ cảm biến được xử lý và truyền tải chính xác đến server và dashboard.",
        en: "From microcontrollers to the Cloud. Ensure sensor data is processed and transmitted accurately to servers and dashboards."
      },
    },
  ]

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
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
<span className="text-primary">{"#"}</span> {t("Sơ lược về tôi", "A bit about me")}{"\n"}
<span className="text-muted-foreground">{"$"}</span> cat profile.md{"\n\n"}
{profile.summary}{"\n\n"}
<span className="text-primary">{"#"}</span> {t("Triết lý làm việc", "Working principles")}{"\n"}
<span className="text-muted-foreground">{"$"}</span> ./run --principles
                </pre>

                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {principles.map((p) => {
                    const Icon = p.icon
                    return (
                      <div
                        key={p.title.vi}
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
                key={s.label}
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

            <div className="col-span-2 rounded-xl border border-border/60 bg-primary/5 p-5">
              <p className="font-mono text-xs text-primary mb-2">{">_ now"}</p>
              <p className="text-sm leading-relaxed">
                {t(
                  "Hiện đang xây dựng nền tảng firmware thế hệ thứ 3 cho dòng smart meter, với mục tiêu đạt chứng nhận DLMS/COSEM trong quý tới.",
                  "Currently building the 3rd generation firmware platform for smart meters, aiming for DLMS/COSEM certification next quarter."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
