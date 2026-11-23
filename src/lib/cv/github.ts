export type GithubRepo = {
  name: string
  description: string
  url: string
  homepage: string | null
  language: string | null
  stars: number
  forks: number
  pushedAt: string
  topics: string[]
}

export type GithubReposResponse = {
  ok: boolean
  username?: string
  profileUrl?: string
  repos: GithubRepo[]
}

const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Accepts "github.com/name", "https://github.com/name/..." or a bare username. */
export function githubUsername(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (USERNAME.test(raw)) return raw;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    if (!/^(?:www\.)?github\.com$/i.test(url.hostname)) return null;
    const name = url.pathname.split("/").filter(Boolean)[0] || "";
    return USERNAME.test(name) ? name : null;
  } catch {
    return null;
  }
}

/** Repository name for a GitHub URL owned by `username`, used to link repositories to case studies. */
export function githubRepoName(value: unknown, username: string): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    if (!/^(?:www\.)?github\.com$/i.test(url.hostname)) return null;
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repo || owner.toLowerCase() !== username.toLowerCase()) return null;
    return repo.replace(/\.git$/i, "").toLowerCase();
  } catch {
    return null;
  }
}

type ApiRepo = {
  name?: unknown; description?: unknown; html_url?: unknown; homepage?: unknown; language?: unknown;
  stargazers_count?: unknown; forks_count?: unknown; pushed_at?: unknown; topics?: unknown;
  fork?: unknown; archived?: unknown; private?: unknown;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const count = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;

function safeHttpsUrl(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

/** Public, non-fork repositories, most recently pushed first. Cached for an hour by the Next data cache. */
export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  if (!USERNAME.test(username)) throw new Error("Invalid GitHub username");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "engineering-lab-site",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = "Bearer " + token;
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=pushed`,
    { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error("GitHub responded " + response.status);
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error("Unexpected GitHub response");
  return (body as ApiRepo[])
    .filter((repo) => repo && repo.fork !== true && repo.archived !== true && repo.private !== true)
    .filter((repo) => text(repo.name) && text(repo.name).toLowerCase() !== username.toLowerCase())
    .map((repo) => ({
      name: text(repo.name),
      description: text(repo.description).slice(0, 300),
      url: safeHttpsUrl(repo.html_url) || `https://github.com/${username}/${encodeURIComponent(text(repo.name))}`,
      homepage: safeHttpsUrl(repo.homepage),
      language: text(repo.language) || null,
      stars: count(repo.stargazers_count),
      forks: count(repo.forks_count),
      pushedAt: text(repo.pushed_at),
      topics: Array.isArray(repo.topics) ? repo.topics.filter((topic): topic is string => typeof topic === "string").slice(0, 6) : [],
    }))
    .sort((a, b) => Date.parse(b.pushedAt || "0") - Date.parse(a.pushedAt || "0"));
}
