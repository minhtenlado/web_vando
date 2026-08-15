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
  Terminal,
  Server,
  Database,
  Globe,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"
import { getLocalized } from "@/lib/utils"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

const iconMap: Record<string, LucideIcon> = {
  code: Code2,
  cpu: Cpu,
  layers: Layers,
  radio: Radio,
  wrench: Wrench,
  "circuit-board": CircuitBoard,
  terminal: Terminal,
  server: Server,
  database: Database,
  globe: Globe,
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
          className="h-full rounded-sm bg-primary"
        />
      </div>
    </div>
  )
}

export function Skills() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()
  
  const skillGroups = profile.skillGroups || []

  return (
    <section id="skills" className="relative py-8 sm:py-12 scroll-mt-16 md:scroll-mt-20 bg-muted/20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="02 / skills"
          title={t("Kỹ năng & Công nghệ", "Skills & Technologies")}
          subtitle={profile.skillsSubtitle || ""}
        />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillGroups.map((group, gi) => {
            const Icon = iconMap[group.icon] ?? HelpCircle
            return (
              <motion.div
                key={gi}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: gi * 0.06 }}
              >
                <Card className="h-full p-5 border-border bg-card hover:border-primary transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{getLocalized(group.title, locale)}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {group.skills.length} modules
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {group.skills.map((s: any, si: number) => (
                      <SkillBar
                        key={si}
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
