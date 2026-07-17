'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Briefcase, MapPin, Calendar, ChevronRight } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { ExternalLink } from "lucide-react"

export function Experience() {
  const { experiences } = useSiteData()
  const { t } = useLocale()
  return (
    <section id="experience" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          index="03 / experience"
          title={t("Kinh nghiệm làm việc", "Work Experience")}
          subtitle={t(
            "Hơn 6 năm xây dựng sản phẩm nhúng thương mại — từ nguyên mẫu nghiên cứu đến triển khai hàng chục nghìn thiết bị ngoài thực địa.",
            "Over 6 years of building commercial embedded products — from research prototypes to deploying tens of thousands of devices in the field."
          )}
        />

        <div className="mt-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent sm:-translate-x-1/2"
            aria-hidden
          />

          <ol className="space-y-10">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0
              return (
                <motion.li
                  key={exp.role + exp.company}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-12 sm:pl-0"
                >
                  {/* Node */}
                  <span className="absolute left-4 sm:left-1/2 top-2 -translate-x-1/2 z-10 grid place-items-center">
                    <span className="h-3.5 w-3.5 rounded-full bg-primary border-4 border-background ring-1 ring-primary/30" />
                  </span>

                  <div
                    className={
                      "sm:w-1/2 sm:pr-10 " +
                      (isLeft
                        ? "sm:mr-auto sm:text-right"
                        : "sm:ml-auto sm:pl-10 sm:pr-0")
                    }
                  >
                    <Card className="p-5 border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 transition-colors">
                      <div
                        className={
                          "flex flex-wrap items-center gap-2 mb-2 " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        <Badge variant="secondary" className="gap-1 font-mono">
                          <Calendar className="h-3 w-3" /> {exp.period}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {exp.role}
                      </h3>
                      <div
                        className={
                          "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary font-medium hover:underline"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> {exp.company}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Briefcase className="h-3.5 w-3.5" /> {exp.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {exp.location}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {exp.description}
                      </p>

                      <ul
                        className={
                          "mt-3 space-y-1.5 " +
                          (isLeft ? "sm:text-right" : "")
                        }
                      >
                        {exp.highlights.map((h) => (
                          <li
                            key={h}
                            className={
                              "flex gap-1.5 text-sm leading-relaxed " +
                              (isLeft
                                ? "sm:flex-row-reverse sm:text-right"
                                : "")
                            }
                          >
                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        className={
                          "mt-4 flex flex-wrap gap-1.5 " +
                          (isLeft ? "sm:justify-end" : "")
                        }
                      >
                        {exp.stack.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="font-mono text-[10px] py-0.5"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
