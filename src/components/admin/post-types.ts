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
