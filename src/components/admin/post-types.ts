export const CATEGORIES = ["AI", "embedded", "IOT", "Robot", "ROS2"];

export const POST_LAYOUTS = [
  { id: "article", label: "Bài viết", icon: "📄", description: "Dạng bài viết khoa học / blog truyền thống" },
  { id: "tutorial", label: "Tutorial", icon: "📘", description: "Dạng hướng dẫn kỹ thuật theo phong cách documentation" },
] as const;

export type PostLayout = typeof POST_LAYOUTS[number]["id"];

export type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  category: string;
  layout: PostLayout;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  coverImage: string;
  pdfUrl: string;
};

export function supportsTutorialEditor(content: string): boolean {
  if (!content.trim()) return true;
  const match = content.match(/<!--TUTORIAL_DATA:\s*(.*?)\s*-->/);
  if (!match) return false;
  try {
    const data = JSON.parse(match[1]);
    if (typeof data?.intro !== "string" || !Array.isArray(data.objectives) || !data.objectives.every((item: unknown) => typeof item === "string") || !Array.isArray(data.blocks)) return false;
    const fields: Record<string, string[]> = {
      paragraph: ["content"], heading: ["content"], step: ["title", "content", "code", "lang"],
      code: ["code", "lang"], tip: ["content"], warning: ["content"], result: ["content"], image: ["url"], youtube: ["url"],
    };
    return data.blocks.every((block: Record<string, unknown> | null) => block && typeof block.id === "string" && typeof block.type === "string" && fields[block.type]?.every((key) => typeof block[key] === "string"));
  } catch { return false; }
}
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
