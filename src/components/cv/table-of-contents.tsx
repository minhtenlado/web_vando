'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { useLocale } from "./locale-context"

type TocItem = {
  id: string
  text: string
  level: number
}

export function TableOfContents({ selector = ".prose" }: { selector?: string }) {
  const [items, setItems] = React.useState<TocItem[]>([])
  const [activeId, setActiveId] = React.useState<string>("")
  const { t } = useLocale()

  React.useEffect(() => {
    // Wait a bit for the content to render
    const timer = setTimeout(() => {
      const content = document.querySelector(selector)
      if (!content) return

      const headings = content.querySelectorAll("h1, h2, h3")
      const toc: TocItem[] = []

      headings.forEach((heading, i) => {
        // If heading doesn't have an ID, create one
        let id = heading.id
        if (!id) {
          const text = heading.textContent || `heading-${i}`
          id = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `heading-${i}`
          // ensure uniqueness
          if (document.getElementById(id)) {
            id = `${id}-${i}`
          }
          heading.id = id
        }

        const level = parseInt(heading.tagName.substring(1))
        toc.push({ id, text: heading.textContent || "", level })
      })

      setItems(toc)

      // Setup IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: "-10% 0px -80% 0px" }
      )

      headings.forEach((h) => observer.observe(h))

      return () => {
        observer.disconnect()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [selector])

  if (items.length === 0) return null

  return (
    <nav className="h-full overflow-auto hidden lg:block pr-6">
      <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        {t("Phụ lục", "Contents")}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "transition-colors hover:text-foreground cursor-pointer line-clamp-2 leading-snug",
              item.level === 1 ? "ml-0 font-medium" : item.level === 2 ? "ml-3" : "ml-6",
              activeId === item.id
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <a href={`#${item.id}`} onClick={(e) => {
              e.preventDefault()
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
            }}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
