'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { testimonials } from "@/lib/cv/data"

export function Testimonials() {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % testimonials.length),
    []
  )
  const prev = () =>
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)

  React.useEffect(() => {
    if (paused) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [paused, next])

  const active = testimonials[index]

  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-28 bg-muted/20 overflow-hidden"
    >
      <div className="absolute -top-20 right-10 text-primary/5 pointer-events-none select-none">
        <Quote className="h-64 w-64 rotate-180" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative">
        <SectionHeader
          index="06 / testimonials"
          title="Đánh giá từ đồng nghiệp"
          subtitle="Những gì đồng nghiệp và quản lý nói về cách làm việc của tôi."
        />

        <div
          className="mt-10 max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="relative p-6 sm:p-8 border-border/60 bg-card/40 backdrop-blur overflow-hidden">
              <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/15" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>

              <blockquote className="text-lg sm:text-xl leading-relaxed font-medium">
                <span className="text-primary">“</span>
                {active.quote}
                <span className="text-primary">”</span>
              </blockquote>

              <div className="mt-6 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {active.name
                      .split(" ")
                      .slice(-2)
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold leading-tight">{active.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {active.title} · {active.company}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Xem đánh giá ${i + 1}`}
                  className={
                    "h-2 rounded-full transition-all " +
                    (i === index
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/50")
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                aria-label="Đánh giá trước"
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                aria-label="Đánh giá tiếp theo"
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
