'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Terminal, Zap, ShieldCheck, Layers } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card, CardContent } from "@/components/ui/card"
import { stats } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"

const principles = [
  {
    icon: Zap,
    title: "Tối ưu hiệu năng",
    desc: "Profile và tối ưu ở mức bit, chu kỳ clock và microamp — mỗi byte RAM đều có lý do để tồn tại.",
  },
  {
    icon: ShieldCheck,
    title: "Tin cậy & an toàn",
    desc: "Phát triển theo tiêu chuẩn IEC 62304 / IEC 61508, với chiến lược lỗi an toàn và watchdog đầy đủ.",
  },
  {
    icon: Layers,
    title: "Kiến trúc mô-đun",
    desc: "Tách biệt HAL, driver, middleware và ứng dụng — code tái sử dụng được trên nhiều MCU khác nhau.",
  },
  {
    icon: Terminal,
    title: "Code sạch, có tài liệu",
    desc: "Tuân thủ MISRA-C, static analysis, CI/CD và tài liệu API tự động sinh cho mọi dự án.",
  },
]

export function About() {
  const { profile } = useSiteData()
  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeader
          index="01 / about"
          title="Giới thiệu"
          subtitle="Hành trình của một kỹ sư nhúng — từ dòng code đầu tiên trên AVR đến những hệ thống IoT quy mô hàng chục nghìn thiết bị."
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
<span className="text-primary">{"#"}</span> Sơ lược về tôi{"\n"}
<span className="text-muted-foreground">{"$"}</span> cat profile.md{"\n\n"}
{profile.summary}{"\n\n"}
<span className="text-primary">{"#"}</span> Triết lý làm việc{"\n"}
<span className="text-muted-foreground">{"$"}</span> ./run --principles
                </pre>

                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {principles.map((p) => (
                    <div
                      key={p.title}
                      className="rounded-lg border border-border/60 bg-background/40 p-4 hover:border-primary/40 transition-colors"
                    >
                      <p.icon className="h-5 w-5 text-primary mb-2" />
                      <h4 className="text-sm font-semibold mb-1">{p.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
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
                    {s.label}
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
                Hiện đang xây dựng nền tảng firmware thế hệ thứ 3 cho dòng smart meter,
                với mục tiêu đạt chứng nhận DLMS/COSEM trong quý tới.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
