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
    let observer: IntersectionObserver | null = null;

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
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: "-10% 0px -80% 0px" }
      )

      headings.forEach((h) => observer?.observe(h))
    }, 100)

    return () => {
      clearTimeout(timer)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [selector])

  if (items.length === 0) return null

  return (
    <nav className="hidden lg:block" aria-label="Mục lục bài viết">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a 
              href={`#${item.id}`} 
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(item.id)
                if (element) {
                  const headerOffset = 100
                  const elementPosition = element.getBoundingClientRect().top
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" })
                }
              }}
              className={cn(
                "relative block w-full px-3 py-2 border-0 rounded-lg text-left text-xs leading-[1.45] transition-all duration-300",
                item.level >= 3 ? "pl-5" : "",
                activeId === item.id
                  ? "text-gray-900 dark:text-white bg-gradient-to-r from-primary/10 to-transparent before:absolute before:left-0 before:top-[7px] before:bottom-[7px] before:w-[2px] before:rounded-[4px] before:bg-gradient-to-b before:from-primary before:to-primary/60 before:shadow-sm dark:from-[rgba(124,140,255,0.13)] dark:before:from-[#8b96ff] dark:before:to-[#b36dff] dark:before:shadow-[0_0_10px_rgba(130,120,255,0.7)]"
                  : "text-gray-500 dark:text-[#777f8e] hover:text-gray-900 dark:hover:text-[#d9dde6] hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-[2px]"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
