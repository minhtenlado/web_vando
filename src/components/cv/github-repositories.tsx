'use client';

import { githubRepoName, githubUsername, type GithubRepo, type GithubReposResponse } from '@/lib/cv/github';
import type { SiteProject } from '@/lib/cv/site-data-server';
import { ArrowRight, ArrowUpRight, GitFork, Github, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from './locale-context';
import { Reveal } from './reveal';

const LANGUAGE_COLORS: Record<string, string> = {
  C: '#555555', 'C++': '#f34b7d', Python: '#3572a5', TypeScript: '#3178c6', JavaScript: '#e0c400',
  HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', Rust: '#dea584', Go: '#00add8', Java: '#b07219',
};
const INITIAL = 6;

type State = { status: 'idle' | 'loading' | 'ready' | 'error'; data?: GithubReposResponse };

/** Public repositories, loaded when the section approaches the viewport and linked to case studies when one exists. */
export function GithubRepositories({ projects, profile, index }: { projects: SiteProject[]; profile: string; index: string }) {
  const { t, locale } = useLocale();
  const root = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>({ status: 'idle' });
  const [expanded, setExpanded] = useState(false);
  const fallbackUser = githubUsername(profile);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let cancelled = false;
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      setState({ status: 'loading' });
      fetch('/api/github')
        .then(async (response) => {
          const data: GithubReposResponse = await response.json();
          if (cancelled) return;
          setState(response.ok && data.ok && Array.isArray(data.repos) ? { status: 'ready', data } : { status: 'error', data });
        })
        .catch(() => { if (!cancelled) setState({ status: 'error' }); });
    };
    if (!('IntersectionObserver' in window)) { load(); return () => { cancelled = true; }; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); load(); }
    }, { rootMargin: '600px 0px' });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); };
  }, []);

  const username = state.data?.username || fallbackUser || '';
  const profileUrl = state.data?.profileUrl || (fallbackUser ? 'https://github.com/' + fallbackUser : '');
  const caseStudies = useMemo(() => {
    const map = new Map<string, SiteProject>();
    if (!username) return map;
    for (const project of projects) {
      const name = githubRepoName(project.repo, username);
      if (name && !map.has(name)) map.set(name, project);
    }
    return map;
  }, [projects, username]);
  const repos = useMemo(() => {
    // Repositories with a case study lead; the API already orders each group by the latest push.
    const all = state.data?.repos || [];
    return [...all.filter((repo) => caseStudies.has(repo.name.toLowerCase())), ...all.filter((repo) => !caseStudies.has(repo.name.toLowerCase()))];
  }, [state.data, caseStudies]);
  const visible = expanded ? repos : repos.slice(0, INITIAL);
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }), [locale]);
  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((repo) => { if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [repos]);

  if (!profileUrl) return null;
  return <section ref={root} className="lab-section lab-container lab-github" id="github" aria-labelledby="github-title">
    <Reveal><div className="lab-section-heading"><div><p className="lab-eyebrow">{index} / {t('Mã nguồn mở', 'Open source')}</p><h2 id="github-title">{t('Kho mã nguồn.', 'From the repository.')}</h2></div>
      <p className="lab-section-caption">{t('Các repository công khai trên GitHub, tự động cập nhật. Repository đã có bài giới thiệu sẽ liên kết tới trang dự án.', 'Public GitHub repositories, updated automatically. Repositories with a case study link to their project page.')}</p></div></Reveal>

    <div className="lab-github-summary">
      <a className="lab-github-profile" href={profileUrl} target="_blank" rel="noopener noreferrer"><Github size={20} aria-hidden="true" /><span>github.com/{username}</span><ArrowUpRight size={16} aria-hidden="true" /></a>
      {state.status === 'ready' && <dl className="lab-github-stats">
        <div><dt>{t('Repository', 'Repositories')}</dt><dd>{String(repos.length).padStart(2, '0')}</dd></div>
        <div><dt>{t('Có trang dự án', 'With case study')}</dt><dd>{String(repos.filter((repo) => caseStudies.has(repo.name.toLowerCase())).length).padStart(2, '0')}</dd></div>
        {languages.length > 0 && <div className="lab-github-languages"><dt>{t('Ngôn ngữ', 'Languages')}</dt><dd>{languages.slice(0, 4).map(([language]) => <span key={language}><i style={{ background: LANGUAGE_COLORS[language] || 'var(--lab-muted)' }} aria-hidden="true" />{language}</span>)}</dd></div>}
      </dl>}
    </div>

    {state.status === 'error' ? <div className="lab-empty" role="status"><p>{t('Chưa tải được danh sách repository từ GitHub.', 'GitHub repositories could not be loaded right now.')}</p><a className="lab-text-link" href={profileUrl} target="_blank" rel="noopener noreferrer">{t('Mở hồ sơ GitHub', 'Open GitHub profile')}<ArrowUpRight size={15} aria-hidden="true" /></a></div>
      : state.status !== 'ready' ? <ul className="lab-repo-grid" aria-busy="true" aria-label={t('Đang tải repository', 'Loading repositories')}>{Array.from({ length: INITIAL }, (_, i) => <li key={i} className="lab-repo-card lab-repo-skeleton" aria-hidden="true"><span /><span /><span /></li>)}</ul>
      : repos.length === 0 ? <p className="lab-empty" role="status">{t('Chưa có repository công khai.', 'No public repositories yet.')}</p>
      : <>
        <ul className="lab-repo-grid">{visible.map((repo) => <RepoCard key={repo.name} repo={repo} project={caseStudies.get(repo.name.toLowerCase())} date={repo.pushedAt ? formatter.format(new Date(repo.pushedAt)) : ''} />)}</ul>
        <div className="lab-list-footer"><p role="status">{visible.length} / {repos.length} {t('repository', 'repositories')}</p>
          {repos.length > INITIAL && <button type="button" className="lab-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? t('Thu gọn', 'Show fewer') : t('Xem tất cả repository', 'Show all repositories')}</button>}</div>
      </>}
  </section>;
}

function RepoCard({ repo, project, date }: { repo: GithubRepo; project?: SiteProject; date: string }) {
  const { t } = useLocale();
  return <li className="lab-repo-card" data-linked={project ? 'true' : undefined}>
    <div className="lab-repo-top">
      <span className="lab-repo-language">{repo.language && <i style={{ background: LANGUAGE_COLORS[repo.language] || 'var(--lab-muted)' }} aria-hidden="true" />}{repo.language || t('Phần cứng / tài liệu', 'Hardware / docs')}</span>
      {date && <span>{t('Cập nhật ', 'Updated ')}{date}</span>}
    </div>
    <h3><a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name.replace(/[_-]+/g, ' ')}<ArrowUpRight size={16} aria-hidden="true" /></a></h3>
    <p>{repo.description || (project ? project.subtitle : '') || t('Chưa có mô tả.', 'No description yet.')}</p>
    <div className="lab-repo-bottom">
      <span className="lab-repo-counts"><span title={t('Sao', 'Stars')}><Star size={13} aria-hidden="true" />{repo.stars}<span className="sr-only"> {t('sao', 'stars')}</span></span><span title="Forks"><GitFork size={13} aria-hidden="true" />{repo.forks}<span className="sr-only"> forks</span></span></span>
      {project && <Link className="lab-repo-case" href={'/projects/' + encodeURIComponent(project.id)}>{t('Xem dự án', 'Case study')}<ArrowRight size={14} aria-hidden="true" /></Link>}
    </div>
  </li>;
}
