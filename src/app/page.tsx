import { getSiteData } from "@/lib/cv/site-data-server"
import { HashScrollHandler } from "@/components/cv/hash-scroll-handler"
import { Navbar } from "@/components/cv/navbar"
import { ScrollProgress } from "@/components/cv/scroll-progress"
import { CommandPalette } from "@/components/cv/command-palette"
import { SiteDataProvider } from "@/components/cv/site-data-context"
import { Hero } from "@/components/cv/hero"
import { About } from "@/components/cv/about"
import { Skills } from "@/components/cv/skills"
import { Experience } from "@/components/cv/experience"
import { Projects } from "@/components/cv/projects"
import { Posts } from "@/components/cv/posts"
import { Education } from "@/components/cv/education"
import { Contact } from "@/components/cv/contact"
import { Footer } from "@/components/cv/footer"
import { LocaleProvider } from "@/components/cv/locale-context"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function Home() {
  const cookieStore = await cookies()
  const locale = cookieStore.get("cv-locale")?.value || "vi"
  const initialData = await getSiteData(locale)

  return (
    <LocaleProvider initialLocale={locale}>
      <SiteDataProvider initialData={initialData}>
        <div className="relative min-h-screen flex flex-col bg-background">
          <HashScrollHandler />
          <ScrollProgress />
          <CommandPalette />
          <Navbar />
          <main className="flex-1">
            <Hero />
            <About />
            <Skills />
            <Experience />
            <Projects />
            <Posts />
            <Education />
            <Contact />
          </main>
          <Footer />
        </div>
      </SiteDataProvider>
    </LocaleProvider>
  )
}
