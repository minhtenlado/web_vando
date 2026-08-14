export const CATEGORIES = ["AI", "embedded", "IOT", "Robot", "ROS2"];

export type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  category: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  coverImage: string;
  pdfUrl: string;
};
