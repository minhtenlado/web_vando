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
import { 
  Moon, 
  Sun, 
  FileDown, 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  Globe, 
  Search, 
  Link as LinkIcon, 
  Code2, 
  ArrowRight,
  FolderGit2,
  BookOpen,
  ShieldCheck,
  FileText,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { navLinks } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { useRouter } from "next/navigation"

export function CommandPalette() {
  const { profile, projects, posts } = useSiteData()
  const { t, locale, setLocale } = useLocale()
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

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
    if (href.startsWith("/")) {
      router.push(href)
      return
    }
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
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("Nhập lệnh hoặc tìm kiếm dự án, bài viết...", "Type a command or search projects, posts...")} />
        <CommandList className="max-h-[460px] custom-scrollbar">
          <CommandEmpty>{t("Không tìm thấy kết quả phù hợp.", "No matching results found.")}</CommandEmpty>
          
          {/* Group 1: Actions */}
          <CommandGroup heading={t("Thao tác nhanh", "Quick Actions")}>
            <CommandItem onSelect={() => runCommand(() => copyLink())}>
              <LinkIcon className="mr-2 h-4 w-4 text-primary" />
              <span>{t("Sao chép liên kết trang hiện tại", "Copy current page link")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4 text-amber-400" /> : <Moon className="mr-2 h-4 w-4 text-indigo-400" />}
              <span>{t("Đổi giao diện Sáng / Tối", "Toggle Light / Dark Theme")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setLocale(locale === "vi" ? "en" : "vi"))}>
              <Code2 className="mr-2 h-4 w-4 text-emerald-400" />
              <span>{t("Đổi ngôn ngữ hiển thị (VI / EN)", "Toggle Language (VI / EN)")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />

          {/* Group 2: Projects Search */}
          {projects && projects.length > 0 && (
            <>
              <CommandGroup heading={t("Dự án tiêu biểu", "Featured Projects")}>
                {projects.map((proj) => (
                  <CommandItem 
                    key={proj.id || proj.title} 
                    onSelect={() => go("#projects")}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{proj.title}</span>
                    </div>
                    {proj.projectType && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 ml-2">
                        {proj.projectType}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Group 3: Posts & Tutorials Search */}
          {posts && posts.length > 0 && (
            <>
              <CommandGroup heading={t("Bài viết & Hướng dẫn", "Articles & Tutorials")}>
                {posts.map((p) => (
                  <CommandItem 
                    key={p.id || p.slug} 
                    onSelect={() => go(`/posts/${p.slug}`)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{p.title}</span>
                    </div>
                    {p.category && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0 ml-2">
                        {p.category}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Group 4: Navigation */}
          <CommandGroup heading={t("Điều hướng trang", "Page Navigation")}>
            {navLinks.map((l) => (
              <CommandItem key={l.href} onSelect={() => go(l.href)}>
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{l[locale]}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />

          {/* Group 5: Legal Pages */}
          <CommandGroup heading={t("Trang pháp lý", "Legal & Policies")}>
            <CommandItem onSelect={() => go("/privacy")}>
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              <span>{t("Chính sách bảo mật (Privacy Policy)", "Privacy Policy")}</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/terms")}>
              <FileText className="mr-2 h-4 w-4 text-primary" />
              <span>{t("Điều khoản dịch vụ (Terms of Service)", "Terms of Service")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          
          {/* Group 6: Contact */}
          <CommandGroup heading={t("Thông tin liên hệ", "Contact Details")}>
            {profile.email && (
              <CommandItem onSelect={() => runCommand(() => window.open(`mailto:${profile.email}`, "_blank"))}>
                <Mail className="mr-2 h-4 w-4 text-sky-400" />
                <span>Email: {profile.email}</span>
              </CommandItem>
            )}
            {profile.phone && (
              <CommandItem onSelect={() => runCommand(() => window.location.href = `tel:${profile.phone.replace(/\s/g, "")}`)}>
                <Phone className="mr-2 h-4 w-4 text-emerald-400" />
                <span>{t("Điện thoại", "Phone")}: {profile.phone}</span>
              </CommandItem>
            )}
            {profile.website && (
              <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.website}`, "_blank"))}>
                <Globe className="mr-2 h-4 w-4 text-indigo-400" />
                <span>Website: {profile.website}</span>
              </CommandItem>
            )}
            {profile.github && (
              <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.github}`, "_blank"))}>
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </CommandItem>
            )}
            {profile.linkedin && (
              <CommandItem onSelect={() => runCommand(() => window.open(`https://${profile.linkedin}`, "_blank"))}>
                <Linkedin className="mr-2 h-4 w-4 text-blue-500" />
                <span>LinkedIn</span>
              </CommandItem>
            )}
          </CommandGroup>
          
          <CommandSeparator />
          <CommandGroup>
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span>{t("Gợi ý: Dùng phím ↑ ↓ để duyệt", "Tip: Use ↑ ↓ arrows to navigate")}</span>
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[10px]">ESC {t("để đóng", "to close")}</span>
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

