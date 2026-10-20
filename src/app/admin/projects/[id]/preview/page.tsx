import { LocaleProvider } from "@/components/cv/locale-context";
import { ProjectDetailView } from "@/components/cv/project-detail-view";
import { RichContent } from "@/components/cv/rich-content";
import { isAuthed } from "@/lib/auth";
import { getProjectById } from "@/lib/cv/site-data-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound,redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project preview | Engineering Lab",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminProjectPreview({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin");

  const { id } = await params;
  const project = await getProjectById(id, { includeUnpublished: true });
  if (!project) notFound();

  return (
    <LocaleProvider><div className="lab-site">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 text-sm text-foreground sm:px-8">
        <p className="m-0">Admin preview · {project.published ? "Published project" : "Draft; visible only to authenticated admins"}</p>
        <Link href="/admin" className="font-semibold text-primary hover:underline">Return to Control Center</Link>
      </div>
      <ProjectDetailView project={{ ...project, description: "" }} relatedProjects={[]}>
        {project.description.trim() ? <RichContent content={project.description} /> : null}
      </ProjectDetailView>
    </div></LocaleProvider>
  );
}
