import { fetchGithubRepos, githubUsername, type GithubReposResponse } from "@/lib/cv/github";
import { getPublicGithubProfile } from "@/lib/cv/site-data-server";
import { NextResponse } from "next/server";

export async function GET() {
  const username = githubUsername(await getPublicGithubProfile());
  if (!username) {
    return NextResponse.json<GithubReposResponse>({ ok: false, repos: [] }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const repos = await fetchGithubRepos(username);
    return NextResponse.json<GithubReposResponse>(
      { ok: true, username, profileUrl: "https://github.com/" + username, repos },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("[github] repositories unavailable (" + (error instanceof Error ? error.message : "unknown") + ")");
    return NextResponse.json<GithubReposResponse>(
      { ok: false, username, profileUrl: "https://github.com/" + username, repos: [] },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
