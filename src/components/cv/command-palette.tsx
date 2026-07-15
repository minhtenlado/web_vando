'use client'

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import { Moon, Sun, FileDown, Github, Linkedin, Mail, Phone, Globe } from "lucide-react"
import { navLinks, profile, codeSnippets, projects } from "@/lib/cv/data"

type CommandAction = {
  label: string
  hint?: string
  icon: React.ElementType
  onSelect: () => void
  group: string
  keywords?: string
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const openPalette = () => setOpen(true)
    window.addEventListener("keydown", down)
    window.addEventListener("open-command-palette", openPalette as EventListener)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("open-command-palette", openPalette as EventListener)
    }
  }, [])

  const go = (href: string) => {
    setOpen(false)
    // Wait for dialog to unmount before scrolling, then use hash navigation
    // which triggers the browser's native smooth scroll reliably.
    setTimeout(() => {
      if (history.replaceState) {
        history.replaceState(null, "", href)
      }
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 150)
  }

  const actions: CommandAction[] = [
    ...navLinks.map((l) => ({
      label: l.label,
      hint: "Đi tới mục",
      icon: Search,
      onSelect: () => go(l.href),
      group: "Điều hướng",
      keywords: l.href,
    })),
    ...projects.map((p) => ({
      label: p.title,
      hint: "Xem dự án",
      icon: Search,
      onSelect: () => go("#projects"),
      group: "Dự án",
      keywords: p.category,
    })),
    ...codeSnippets.map((s) => ({
      label: s.title,
      hint: "Xem code",
      icon: Search,
      onSelect: () => go("#code"),
      group: "Code snippets",
      keywords: s.filename,
    })),
    {
      label: "Đổi giao diện sáng/tối",
      hint: `Hiện tại: ${theme}`,
      icon: theme === "dark" ? Sun : Moon,
      onSelect: () => {
        setTheme(theme === "dark" ? "light" : "dark")
        setOpen(false)
      },
      group: "Hành động",
    },
    {
      label: "Tải CV (PDF)",
      hint: "In / Lưu thành PDF",
      icon: FileDown,
      onSelect: () => {
        setOpen(false)
        setTimeout(() => window.print(), 120)
      },
      group: "Hành động",
    },
    {
      label: "Mở GitHub",
      icon: Github,
      onSelect: () => {
        setOpen(false)
        window.open(`https://${profile.github}`, "_blank")
      },
      group: "Liên kết",
    },
    {
      label: "Mở LinkedIn",
      icon: Linkedin,
      onSelect: () => {
        setOpen(false)
        window.open(`https://${profile.linkedin}`, "_blank")
      },
      group: "Liên kết",
    },
    {
      label: "Gửi email",
      icon: Mail,
      onSelect: () => {
        setOpen(false)
        window.location.href = `mailto:${profile.email}`
      },
      group: "Liên kết",
    },
    {
      label: "Gọi điện",
      icon: Phone,
      onSelect: () => {
        setOpen(false)
        window.location.href = `tel:${profile.phone.replace(/\s/g, "")}`
      },
      group: "Liên kết",
    },
    {
      label: "Mở website",
      icon: Globe,
      onSelect: () => {
        setOpen(false)
        window.open(`https://${profile.website}`, "_blank")
      },
      group: "Liên kết",
    },
  ]

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandAction[]>()
    actions.forEach((a) => {
      if (!map.has(a.group)) map.set(a.group, [])
      map.get(a.group)!.push(a)
    })
    return Array.from(map.entries())
  }, [actions])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Gõ lệnh hoặc tìm kiếm..." />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
          {groups.map(([group, items], gi) => (
            <React.Fragment key={group}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((a, i) => (
                  <CommandItem
                    key={`${group}-${i}`}
                    value={`${a.label} ${a.hint ?? ""} ${a.keywords ?? ""}`}
                    onSelect={() => a.onSelect()}
                    className="gap-2"
                  >
                    <a.icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{a.label}</span>
                      {a.hint && (
                        <span className="block text-xs text-muted-foreground truncate">
                          {a.hint}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
          <CommandSeparator />
          <CommandGroup>
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex h-4 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px]">
                  <ArrowUp className="h-2.5 w-2.5" />
                  <ArrowDown className="h-2.5 w-2.5" />
                </kbd>
                di chuyển
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex h-4 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px]">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                chọn
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[10px]">
                  esc
                </kbd>
                đóng
              </span>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
