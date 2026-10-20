import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProjectById, getSiteData } from "@/lib/cv/site-data-server"
import { ProjectDetailView } from "@/components/cv/project-detail-view"
import { normalizeProjectImage } from "@/lib/cv/project-input"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return {
      title: "Project not found | Engineering Lab",
      description: "Dự án không tồn tại hoặc đã được chuyển hướng.",
    }
  }

  const title = `${project.title} — Case Study | Engineering Lab`
  const description =
    project.subtitle ||
    project.overviewQuote ||
    project.description?.replace(/<[^>]*>?/gm, "").slice(0, 160) ||
    "Chi tiết kiến trúc phần cứng, phần mềm và giải pháp triển khai dự án."

  const coverImage = normalizeProjectImage(project.image)
  const images = coverImage ? [{ url: coverImage }] : []

  return {
    title,
    description,
    keywords: [
      project.title,
      project.category,
      project.role,
      ...(project.tech || []),
      "Engineering Lab",
      "Embedded Systems",
      "IoT",
      "Robotics",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: `/projects/${id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://phanhuynh.id.vn/projects/${id}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverImage ? [coverImage] : [],
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const [project, siteData] = await Promise.all([
    getProjectById(id),
    getSiteData("vi"),
  ])

  if (!project) {
    notFound()
  }
  const coverImage = normalizeProjectImage(project.image)

  // Relate projects only when the stored category or technology overlaps.
  const relatedProjects = siteData.projects
    .filter((p) => p.id !== project.id)
    .map((candidate) => {
      const sameCategory = Boolean(project.category?.trim()) &&
        candidate.category?.trim().toLocaleLowerCase() === project.category.trim().toLocaleLowerCase();
      const projectTech = new Set((project.tech ?? []).map((item) => item.trim().toLocaleLowerCase()).filter(Boolean));
      const sharedTech = (candidate.tech ?? []).filter((item) => projectTech.has(item.trim().toLocaleLowerCase())).length;
      return { candidate, score: (sameCategory ? 100 : 0) + sharedTech };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ candidate }) => candidate)
    .slice(0, 3)

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.subtitle || project.overviewQuote || project.description?.replace(/<[^>]*>?/gm, "").slice(0, 200),
    image: coverImage ? [coverImage] : undefined,
    author: { "@type": "Organization", name: "Engineering Lab" },
    publisher: {
      "@type": "Organization",
      name: "Engineering Lab",
      url: "https://phanhuynh.id.vn",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://phanhuynh.id.vn/projects/${id}`,
    },
    about: project.category,
    keywords: project.tech?.join(", "),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProjectDetailView
        project={project}
        relatedProjects={relatedProjects}
      />
    </>
  )
}
