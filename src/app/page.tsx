'use client'

import { Navbar } from "@/components/cv/navbar"
import { Hero } from "@/components/cv/hero"
import { About } from "@/components/cv/about"
import { Skills } from "@/components/cv/skills"
import { Experience } from "@/components/cv/experience"
import { Projects } from "@/components/cv/projects"
import { Education } from "@/components/cv/education"
import { Contact } from "@/components/cv/contact"
import { Footer } from "@/components/cv/footer"

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
