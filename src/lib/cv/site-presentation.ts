import type { SiteData } from "./site-data-server";

/** List pages and search need summaries; full articles stay on their reader routes. */
export function toPresentationData(data: SiteData): SiteData {
  return {
    ...data,
    posts: data.posts
      .filter((post) => post.published)
      .map((post) => ({ ...post, content: "" })),
  };
}
