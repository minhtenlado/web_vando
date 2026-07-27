'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { GraduationCap, Award, Calendar, BookOpen } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLocalized } from "@/lib/utils"
import { educations as staticEducations, certifications as staticCertifications } from "@/lib/cv/data"
import { useLocale } from "@/components/cv/locale-context"
import { useSiteData } from "@/components/cv/site-data-context"

export function Education() {
  const { t, locale } = useLocale()
  const { profile } = useSiteData()
  
  const edus = profile?.educations?.length ? profile.educations : staticEducations
  const certs = profile?.certifications?.length ? profile.certifications : staticCertifications
  
  const fallbackLanguages = [
    { name: { vi: "Tiếng Việt", en: "Vietnamese" }, level: { vi: "Bản ngữ", en: "Native" } },
    { name: { vi: "Tiếng Anh", en: "English" }, level: { vi: "IELTS 7.0", en: "IELTS 7.0" } }
  ]
  const langs = profile?.languages?.length ? profile.languages : fallbackLanguages

  const visibleCerts = certs.filter((c: any) => c.enabled !== false)
  const visibleLangs = langs.filter((l: any) => l.enabled !== false)
  const hasRightColumn = visibleCerts.length > 0 || visibleLangs.length > 0

  return (
    <section id="education" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Education */}
          <div>
            <SectionHeader
              index="08 / education"
              title={t("Học vấn", "Education")}
            />
            <div className="mt-10 relative border-l-2 border-border/60 pl-6 space-y-6 ml-2">
              {edus.map((edu, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="relative"
                >
                  <span className="absolute -left-[31px] top-4 grid place-items-center h-3.5 w-3.5 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                  <Card className="p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold leading-tight text-base sm:text-lg">
                            {getLocalized(edu.degree, locale)}
                          </h4>
                          <p className="mt-1.5 text-sm text-primary flex items-center gap-1.5 font-medium">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" /> {getLocalized(edu.school, locale)}
                          </p>
                          <div className="mt-2.5 flex items-center">
                            <Badge variant="secondary" className="gap-1 font-mono">
                              <Calendar className="h-3 w-3" /> {edu.period}
                            </Badge>
                          </div>
                        </div>

                        {edu.logo && (
                          <div className="relative shrink-0 h-16 min-w-[80px] max-w-[200px] sm:h-20 sm:min-w-[100px] sm:max-w-[240px] rounded-xl border border-border/80 bg-background/90 p-2.5 flex items-center justify-center overflow-hidden shadow-sm backdrop-blur">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={edu.logo}
                              alt={getLocalized(edu.school, locale)}
                              className="max-h-full max-w-full object-contain w-auto h-auto transition-transform hover:scale-105"
                            />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {getLocalized(edu.detail, locale)}
                      </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Certifications and Languages */}
          {hasRightColumn && (
            <div className="pt-2 lg:pt-0">
              {/* Certifications */}
              {visibleCerts.length > 0 && (
                <div className={visibleLangs.length > 0 ? "mb-10" : ""}>
                  <div className="flex items-center gap-2 mb-5 mt-2 lg:mt-0">
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
                        {visibleCerts.map((c: any, i: number) => (
                          <li
                            key={i}
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
                </div>
              )}

              {/* Languages */}
              {visibleLangs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5 mt-4 lg:mt-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t("Ngôn ngữ", "Languages")}</h3>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                  >
                    <Card className="p-5 border-border/60 bg-card/40 backdrop-blur">
                      <div className="grid grid-cols-2 gap-3">
                        {visibleLangs.map((l: any, i: number) => (
                          <div key={i} className="rounded-lg border border-border/60 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{getLocalized(l.name, locale)}</span>
                              <Badge variant="outline" className="font-mono text-[10px]">{getLocalized(l.level, locale)}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
