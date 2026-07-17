'use client'

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import { Moon, Sun, FileDown, Github, Linkedin, Mail, Phone, Globe, Search, Link as LinkIcon, Code2, ArrowRight } from "lucide-react"
import { navLinks } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

export function CommandPalette() {
  const { profile, projects } = useSiteData()
  const { t, locale, setLocale } = useLocale()
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    
    // Custom event to open from buttons
    const handleOpen = () => setOpen(true)
    window.addEventListener("open-command-palette", handleOpen)
    
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-command-palette", handleOpen)
    }
  }, [])

  const go = (href: string) => {
    setOpen(false)
    setTimeout(() => {
      if (history.replaceState) {
        history.replaceState(null, "", href)
      }
      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth"
      })
    }, 150)
  }

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("Nhập lệnh hoặc tìm kiếm...", "Type a command or search...")} />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{t("Không tìm thấy kết quả.", "No results found.")}</CommandEmpty>
          
          <CommandGroup heading={t("Hành động", "Actions")}>
            <CommandItem onSelect={() => runCommand(() => copyLink())}>
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>{t("Sao chép liên kết trang", "Copy page link")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{t("Đổi giao diện Sáng/Tối", "Toggle Light/Dark Theme")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setLocale(locale === "vi" ? "en" : "vi"))}>
              <Code2 className="mr-2 h-4 w-4" />
              <span>{t("Đổi ngôn ngữ (Anh/Việt)", "Toggle Language (EN/VI)")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />

          <CommandGroup heading={t("Điều hướng", "Navigation")}>
            {navLinks.map((l) => (
              <CommandItem key={l.href} onSelect={() => go(l.href)}>
                <Search className="mr-2 h-4 w-4" />
                <span>{l[locale]}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          
          <CommandGroup heading={t("Liên hệ", "Contact")}>
            <CommandItem onSelect={() => runCommand(() => window.open(`mailto:${profile.email}`, "_blank"))}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Email: {profile.email}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.location.href = `tel:${profile.phone.replace(/\s/g, "")}`)}>
              <Phone className="mr-2 h-4 w-4" />
              <span>{t("Điện thoại", "Phone")}: {profile.phone}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.website}`, "_blank"))}>
              <Globe className="mr-2 h-4 w-4" />
              <span>Website: {profile.website}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.github}`, "_blank"))}>
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.linkedin}`, "_blank"))}>
              <Linkedin className="mr-2 h-4 w-4" />
              <span>LinkedIn</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          <CommandGroup>
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span>{t("Gợi ý: Dùng phím lên/xuống để duyệt", "Tip: Use up/down arrows to navigate")}</span>
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[10px]">ESC {t("để đóng", "to close")}</span>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
