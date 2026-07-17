'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { GraduationCap, Award, Calendar, BookOpen } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { educations, certifications } from "@/lib/cv/data"
import { useLocale } from "@/components/cv/locale-context"

export function Education() {
  const { t, locale } = useLocale()
  return (
    <section id="education" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="08 / education"
          title={t("Học vấn & Chứng chỉ", "Education & Certifications")}
          subtitle={t(
            "Nền tảng học thuật và các chứng chỉ chuyên môn đã đạt được trong hành trình trở thành kỹ sư nhúng.",
            "Academic background and professional certifications acquired during the journey to become an embedded engineer."
          )}
        />

        <div className="mt-10 grid lg:grid-cols-2 gap-8">
          {/* Education */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("Học vấn", "Education")}</h3>
            </div>
            <div className="space-y-4">
              {educations.map((edu, i) => (
                <motion.div
                  key={edu.degree}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                >
                  <Card className="p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold leading-tight">
                          {edu.degree[locale]}
                        </h4>
                        <p className="mt-1 text-sm text-primary flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> {edu.school[locale]}
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1 font-mono shrink-0">
                        <Calendar className="h-3 w-3" /> {edu.period}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {edu.detail[locale]}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("Chứng chỉ", "Certifications")}</h3>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
            >
              <Card className="p-5 border-border/60 bg-card/40 backdrop-blur">
                <ul className="divide-y divide-border">
                  {certifications.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <Award className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.issuer}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {c.year}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-4"
            >
              <Card className="p-5 border-border/60 bg-card/40 backdrop-blur">
                <h4 className="text-sm font-semibold mb-3">{t("Ngôn ngữ", "Languages")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("Tiếng Việt", "Vietnamese")}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">{t("Bản ngữ", "Native")}</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t("Tiếng Anh", "English")}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">IELTS 7.0</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
