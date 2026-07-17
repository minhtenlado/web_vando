'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  index: string
  title: string
  subtitle?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeader({
  index,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className="flex items-center gap-2 font-mono text-xs text-primary">
        <span className="h-px w-8 bg-primary/60" />
        <span>{index}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-muted-foreground text-base sm:text-lg max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
