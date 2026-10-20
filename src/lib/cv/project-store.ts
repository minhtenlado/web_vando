import type { Prisma,PrismaClient,Project } from "@prisma/client";

type ProjectClient = Pick<PrismaClient, "project" | "$queryRaw">;
type ReadOptions = { locale?: string; id?: string; includeUnpublished?: boolean; limit?: number };

export const legacyProjectSelect = {
  id: true, locale: true, title: true, subtitle: true, overviewQuote: true,
  year: true, role: true, highlight: true, projectType: true, responsibilities: true,
  results: true, category: true, description: true, visualsTitle: true, videoTitle: true,
  features: true, tech: true, image: true, images: true, showVideoDemo: true,
  youtubeUrl: true, link: true, repo: true, order: true, createdAt: true, updatedAt: true,
} satisfies Prisma.ProjectSelect;

export function isMissingColumn(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2022";
}

/** Read old CMS rows during an additive schema rollout without exposing newer drafts. */
export async function readProjects(client: ProjectClient, options: ReadOptions = {}) {
  const where: Prisma.ProjectWhereInput = {
    ...(options.locale ? { locale: options.locale } : {}),
    ...(options.id ? { id: options.id } : {}),
    ...(!options.includeUnpublished ? { published: true } : {}),
  };
  const args = {
    where,
    orderBy: [{ order: "asc" as const }, { createdAt: "desc" as const }],
    ...(options.id ? { take: 1 } : options.limit ? { take: options.limit } : {}),
  };
  try {
    return { rows: await client.project.findMany(args), publicationControlsAvailable: true };
  } catch (error) {
    if (!isMissingColumn(error)) throw error;

    const columns = await client.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'Project'
      AND column_name IN ('published', 'featured', 'status')
    `;
    const available = new Set(columns.map((column) => column.column_name));
    if (available.size === 3) throw error;

    const compatibleWhere = { ...where };
    // Only schemas that never had publication controls retain the old all-public behavior.
    if (!available.has("published")) delete compatibleWhere.published;
    const rows = await client.project.findMany({
      ...args,
      where: compatibleWhere,
      select: {
        ...legacyProjectSelect,
        ...(available.has("published") ? { published: true } : {}),
        ...(available.has("featured") ? { featured: true } : {}),
        ...(available.has("status") ? { status: true } : {}),
      },
    });
    return {
      rows: rows.map((row) => ({
        ...row,
        published: row.published ?? true,
        featured: row.featured ?? false,
        status: row.status ?? "",
      })) as Project[],
      publicationControlsAvailable: false,
    };
  }
}
