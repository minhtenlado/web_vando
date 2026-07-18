'use client'

import { Navbar } from "@/components/cv/navbar"
import { ScrollProgress } from "@/components/cv/scroll-progress"
import { CommandPalette } from "@/components/cv/command-palette"
import { SiteDataProvider } from "@/components/cv/site-data-context"
import { Hero } from "@/components/cv/hero"
import { About } from "@/components/cv/about"
import { Skills } from "@/components/cv/skills"
import { Experience } from "@/components/cv/experience"
import { Projects } from "@/components/cv/projects"
import { CodeShowcase } from "@/components/cv/code-showcase"
import { Testimonials } from "@/components/cv/testimonials"
import { Posts } from "@/components/cv/posts"
import { Education } from "@/components/cv/education"
import { Contact } from "@/components/cv/contact"
import { Footer } from "@/components/cv/footer"

import { LocaleProvider } from "@/components/cv/locale-context"

export default function Home() {
  return (
    <LocaleProvider>
      <SiteDataProvider>
        <div className="relative min-h-screen flex flex-col bg-background">
          <ScrollProgress />
          <CommandPalette />
          <Navbar />
          <main className="flex-1">
            <Hero />
            <About />
            <Skills />
            <Experience />
            <Projects />
            <CodeShowcase />
            <Testimonials />
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
