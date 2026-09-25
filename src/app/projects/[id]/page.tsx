import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { getProjectById, getSiteData, type SiteProject } from "@/lib/cv/site-data-server"
import { ProjectDetailView } from "@/components/cv/project-detail-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    return {
      title: "Không tìm thấy dự án — Phan Huỳnh Văn Đô",
      description: "Dự án không tồn tại hoặc đã được chuyển hướng.",
    }
  }

  const title = `${project.title} — Case Study | Phan Huỳnh Văn Đô`
  const description =
    project.subtitle ||
    project.overviewQuote ||
    project.description?.replace(/<[^>]*>?/gm, "").slice(0, 160) ||
    "Chi tiết kiến trúc phần cứng, phần mềm và giải pháp triển khai dự án."

  const images = project.image ? [{ url: project.image }] : []

  return {
    title,
    description,
    keywords: [
      project.title,
      project.category,
      project.role,
      ...(project.tech || []),
      "Phan Huỳnh Văn Đô",
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
      authors: ["Phan Huỳnh Văn Đô"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.image ? [project.image] : [],
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

  // Get up to 3 related projects
  const relatedProjects = siteData.projects
    .filter((p) => p.id !== project.id)
    .slice(0, 3)

  const authorName = siteData.profile?.name || "Phan Huỳnh Văn Đô"
  const authorAvatar = siteData.profile?.avatar || "/uploads/avatar.jpg"

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.subtitle || project.overviewQuote || project.description?.replace(/<[^>]*>?/gm, "").slice(0, 200),
    image: project.image ? [project.image] : undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: "https://phanhuynh.id.vn",
    },
    publisher: {
      "@type": "Person",
      name: authorName,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailView
        project={project}
        relatedProjects={relatedProjects}
        authorName={authorName}
        authorAvatar={authorAvatar}
      />
    </>
  )
}
