'use client'

import * as React from "react"
import { motion } from "framer-motion"
import {
  Code2,
  Cpu,
  Layers,
  Radio,
  Wrench,
  CircuitBoard,
  type LucideIcon,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { skillGroups } from "@/lib/cv/data"

const iconMap: Record<string, LucideIcon> = {
  code: Code2,
  cpu: Cpu,
  layers: Layers,
  radio: Radio,
  wrench: Wrench,
  "circuit-board": CircuitBoard,
}

function SkillBar({
  name,
  level,
  delay,
}: {
  name: string
  level: number
  delay: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">{level}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
    </div>
  )
}

export function Skills() {
  return (
    <section id="skills" className="relative py-20 sm:py-28 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeader
          index="02 / skills"
          title="Kỹ năng & Công nghệ"
          subtitle="Từ lập trình bare-metal đến RTOS, từ vi điều khiển 8-bit đến SoC đa lõi — đây là bộ công cụ tôi dùng mỗi ngày."
        />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillGroups.map((group, gi) => {
            const Icon = iconMap[group.icon] ?? Code2
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: gi * 0.06 }}
              >
                <Card className="h-full p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{group.title}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {group.skills.length} modules
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {group.skills.map((s, si) => (
                      <SkillBar
                        key={s.name}
                        name={s.name}
                        level={s.level}
                        delay={si * 0.06}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
