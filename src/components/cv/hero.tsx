'use client'

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Mail, Github, Linkedin, ArrowDown, Cpu, Radio, Brain, Camera, Microchip, Network, Code, Terminal, Cloud, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

const badgeIconMap: Record<string, React.ElementType> = {
  cpu: Cpu, radio: Radio, brain: Brain, camera: Camera, microchip: Microchip,
  network: Network, code: Code, terminal: Terminal, cloud: Cloud, bookopen: BookOpen, lightbulb: Lightbulb,
  Cpu, Radio, Brain, Camera, Microchip, Network, Code, Terminal, Cloud, BookOpen, Lightbulb
}

const defaultRoles = [
  "Embedded Software Engineer",
  "Firmware Developer",
  "RTOS Specialist",
  "IoT Systems Architect",
]

export function Hero() {
  const { profile } = useSiteData()
  const { t } = useLocale()
  const displayRoles = profile.animatedRoles && profile.animatedRoles.length > 0 
    ? profile.animatedRoles 
    : defaultRoles;

  const [roleIdx, setRoleIdx] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => setRoleIdx((i) => (i + 1) % displayRoles.length), 2400)
    return () => clearInterval(timer)
  }, [displayRoles.length])

  return (
    <section
      id="top"
      className="relative pt-20 pb-8 md:pt-28 md:pb-12 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-4 md:py-8 relative">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-primary opacity-75 pulse-ring" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {profile.available ? t("Sẵn sàng cho cơ hội mới", "Available for new opportunities") : t("Đang bận", "Currently busy")}
              </span>
            </div>

            <div className="space-y-3">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] break-words">
                {profile.name}
              </h1>
              <div className="min-h-[2.25rem] sm:min-h-[2.5rem] h-auto flex items-center">
                <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary font-mono tracking-widest uppercase">
                  {displayRoles[roleIdx]}
                  <span className="cursor-blink" />
                </span>
              </div>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {profile.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {((profile.techBadges && profile.techBadges.length > 0) ? profile.techBadges : [
                { icon: "cpu", text: "STM32 · ESP32 · nRF52" },
                { icon: "radio", text: "FreeRTOS · Zephyr" },
                { icon: "", text: "C / C++ / Python" }
              ]).map((badge, idx) => {
                const iconKey = badge.icon ? badge.icon.toLowerCase() : "";
                const IconComponent = badgeIconMap[iconKey] || null;

                return (
                  <Badge key={idx} variant="secondary" className="gap-1.5 py-1.5">
                    {IconComponent && <IconComponent className="h-3.5 w-3.5 text-primary" />}
                    {badge.text}
                  </Badge>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg">
                <a href="#projects">
                  {t("Xem dự án", "View projects")} <ArrowDown className="h-4 w-4 ml-1.5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={`mailto:${profile.email}`}>
                  <Mail className="h-4 w-4 mr-1.5" /> {t("Liên hệ", "Contact")}
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <a
                href={`https://${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href={`https://${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {profile.location}
              </span>
            </div>
          </motion.div>

          {/* Right: avatar card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="relative rounded-sm border border-border bg-card p-3">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={profile.avatar}
                  alt={t(`Ảnh đại diện của ${profile.name}`, `Avatar of ${profile.name}`)}
                  fill
                  priority
                  sizes="(max-width: 768px) 80vw, 400px"
                  className="object-cover"
                />
              </div>

              {/* Floating chips */}
              <div className="absolute -top-3 -right-3 rounded-sm bg-card border border-border px-3 py-1.5 shadow-sm">
                <span className="text-xs font-mono font-medium text-foreground">{'</>'}</span>
              </div>
              <div className="absolute -bottom-3 -left-3 rounded-sm bg-card border border-border px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono text-xs">6+ yrs</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs font-mono">scroll</span>
          <div className="h-8 w-5 rounded-full border border-border flex items-start justify-center p-1">
            <motion.span
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
