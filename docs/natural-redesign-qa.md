# Natural Engineering redesign — implementation and QA

Date: 2026-10-20. Repository: `web_vando`. This report covers the local changes after `a51d583adc6f10f0d284f8a4c6f528f1db355562`.

## Delivery status

QA was completed locally; the user subsequently authorized committing and pushing this revision. Git history and the Vercel dashboard are the authoritative publication status. No production records, files, or database schema were changed during QA. Pushing `main` can trigger Vercel automatically.

## What changed

- **Home / design system:** restrained charcoal palette, system fonts, compact introduction, project rows, real image fallbacks, mandatory latest articles, simpler header/footer. Removed the decorative hero, repeated cards, public career/profile presentation, glow, gradients, and continuous motion from the rebuilt public pages. Featured requires an explicit CMS flag; no first-three fallback.
- **Projects:** accent-insensitive search (including Vietnamese đ), combined category filters, compact mobile category select, existing detail URLs, technical document layout, conditional sections, responsive media, keyboard image gallery with Escape and focus restoration, click-to-load YouTube. Publication/status/Featured controls remain CMS-backed.
- **Notes:** actual published post summaries, search/category/date sorting, explicit loading/empty/error states, responsive editorial rows, load-more logic. All three original article routes remain supported. Existing HTML/Markdown is rendered server-side, sanitized, with code-copy controls and a table of contents. Comments load on demand. Removed duplicate article view tracking.
- **Admin:** neutral management tables and navigation; tabs/editors load on demand. Kept the existing authentication and rich text editor. Fixed manual-save messaging, stale draft/publish overrides, unsaved draft preview, legacy tutorial HTML compatibility, mobile editor scrolling, accessible field names, and tablet/mobile navigation. Tutorial settings and preview remain reachable on smaller screens.
- **Data/API:** independent project/article/settings reads, per-resource failures, narrow public profile selection, summary-only post query, per-request caching. Public API reports errors as HTTP 503 rather than successful empty arrays. Project reads tolerate the additive publication migration being absent while preserving publication filtering whenever that column exists. Unrelated database failures remain errors. Existing legacy project edits remain possible; creation and publication controls require the migration.
- **SEO:** retained direct routes, individual metadata/canonical URLs, structured data and sitemap. Protected previews use noindex. Sitemap failures are no longer silently represented as an empty successful sitemap.

No package dependency was added or removed. The package script `test` was added. Existing editors and unrelated dependencies were retained for compatibility; unused dependency removal was not claimed.

## Data investigation and limits

Read-only requests to the three production article URLs returned HTTP 200 during this work:

- `/posts/build-a-real-time-object-detection-system-with-yolo-and-edge-ai`
- `/posts/luong-tu-hoa-mo-hinh-ai-toi-uu-thiet-bi-bien`
- `/posts/huan-luyen-robot-mecanum-bang-giai-thuat-di-truyen-va-gru-tren-ros-2`

The previous data loader placed project, post, and profile reads in one failure path. A failed Project query discarded otherwise available articles. The new publication fields and pending additive migration make a missing Project column a plausible production trigger, but the production database schema/logs were not accessible, so that trigger has not been confirmed against production.

Production must use the database. The existing repository content export is available only with explicit `CONTENT_PREVIEW_SNAPSHOT=1` on a non-Vercel local run without `DATABASE_URL`. The UI labels this preview. It is disabled on Vercel and is not presented as restoration of production data. No article titles were hardcoded to repair production listing.

Authored content was preserved. Existing project metrics such as `< 15ms`, `100%`, and `Top 6 / 48`, the YOLO article's `XX` benchmark placeholders, and repeated portrait article covers originate in existing content. Their factual accuracy/image suitability was not independently verified. No new benchmark or project image was invented.

## Actual verification

### Automated

- `npm test`: **11 passed, 0 failed**. Covers current/legacy/partially migrated project reads, public draft filtering, privileged reads, unrelated errors, independent article loading, missing database behavior, snapshot disabled on Vercel, legacy tutorial compatibility, Vietnamese normalization, malformed project input. These use mocked database dependencies, not a live PostgreSQL integration.
- `npm run lint`: passed, no warnings reported.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, Next.js 16.3.1, 27 generated static entries and the existing dynamic route set, including protected article preview.
- `git diff --check`: passed after whitespace cleanup.

### Browser / local production build

Windows in-app browser, local standalone production build, explicitly labelled existing-content snapshot, with public Cloudinary images accessible. No database writes were attempted.

- Home, Notes, representative project detail and YOLO article checked at **360, 375, 390, 768, 1024, 1440px**. Each had one H1 and document scroll width equal to client width at every checked width. This is desktop browser viewport emulation, not a physical Android device test.
- Screenshots inspected at mobile and desktop sizes. Existing project images loaded. Home showed five exported projects and three exported articles; no Featured section appeared when none was flagged.
- Project accent-insensitive search, repeated typing with a stable accessible name, combined category/search, empty state and clear/reset verified.
- Notes accent-insensitive search (`luong tu hoa`), no-match state, clear/reset, category AI and oldest-first ordering verified.
- Project gallery opened; arrow-key navigation, Escape dismissal and return of focus to its opener verified.
- YOLO code copy verified against clipboard contents. Vietnamese quantization and ROS article routes rendered; code and narrow-screen layout were inspected. The two legacy articles were additionally checked at 360px.
- Local Admin login/logout succeeded through the existing flow using disposable process-only credentials. No real password was changed. Missing-database errors were visible. Mobile/tablet menu and Escape focus return were verified. Article and tutorial editors had no document overflow at all six widths; small-screen tutorial settings were visible. Unsaved article preview displayed typed draft text without saving/publishing.
- Missing-database mode without the preview flag: `/api/site-data` returned **503**; Notes showed a retryable data error rather than “no articles”; detail displayed the transient error boundary. A streamed Next.js detail error can retain HTTP 200 after the shell is sent; it was not misreported here as a 503 response.
- Unauthenticated project/post GETs returned **401**. Unauthenticated project/post/upload-image POSTs returned **401**. Protected article preview navigated to Admin login without exposing content (its streamed redirect initially returned HTTP 200, then the browser navigated to `/admin`).
- Snapshot sitemap returned **200** with 12 URLs. Without database/snapshot it returned **500**, avoiding a misleading empty index. Canonical URLs were present on Home, Notes, project and article HTML.
- Browser log inspection found the existing third-party AdSense warning about Next's `data-nscript` attribute. No new application runtime exception was observed in the successful preview flows. Backend-error tests intentionally produced server errors.

Screenshots are in the parent workspace `qa-natural-design/`: `home-desktop.png`, `home-mobile.png`, `notes-desktop.png`, `project-desktop.png`, `article-desktop.png`.

## Measured payloads

Same local production-build method before/after: raw HTML bytes plus the sum of unique initial `/_next/*.js` script responses, uncompressed. Baseline was the pushed revision `a51d583`; both used the existing local content export. These are initial script payloads, not gzip transfer, total lazy-loaded bytes, Lighthouse, or Core Web Vitals.

| Route | HTML before | HTML after | Initial JS before | Initial JS after |
|---|---:|---:|---:|---:|
| Home | 110,348 B | 62,618 B | 725,045 B | 724,578 B |
| Notes | 72,426 B | 51,492 B | 702,162 B | 717,390 B |
| Autonomous Arena project | 89,933 B | 77,493 B | 858,069 B | 721,661 B |
| YOLO article | 102,696 B | 62,824 B | 889,711 B | 715,449 B |

Detail initial JS fell by approximately 15.9% (project) and 19.6% (article). Home JS was essentially unchanged; Notes increased approximately 2.2% with the library controls/shared image UI. No LCP/INP/CLS or Lighthouse score was measured or claimed. Improvements include eliminating public animation/CDN highlighter code, server rendering rich content, excluding post bodies from listing payloads, dynamic Admin editors/tabs, responsive optimized images and deferred comments/video/AdSense.

## Unverified / remaining work

- Live database CRUD, deletion, publish/unpublish persistence, Featured persistence and storage upload round trips were **not tested**. Project creation is intentionally disabled when data cannot load or migration controls are unavailable. These require a connected test database/storage account.
- The previously approved additive production migration was **not applied**: no usable production database URL or linked/authenticated Vercel CLI was available. Current migration history/baseline must be inspected before rollout. The compatibility adapter is regression-tested but has not been exercised against production PostgreSQL.
- Load-more buttons were not exercised in-browser beyond the limit because the export has only five projects and three posts. No synthetic production records were created.
- No full screen-reader, automated WCAG audit, physical mobile device, field Core Web Vitals, or comprehensive content fact-check was performed. Common field labels/focus behavior were improved, not certified as full WCAG compliance.
- Existing GitHub dependency alerts were reported on the previous push (35 total). This redesign is not a dependency/security remediation release; no claim is made that those advisories were resolved.

## Run / rollout

From this repository: `npm ci`, `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, then `npm start` (standalone local output). Development: `npm run dev`.

Configure real `DATABASE_URL`, existing authentication secrets and existing storage credentials privately in local/Vercel environment settings. Never commit `.env`, `.vercel` or credentials. For a deliberately labelled local content preview only, clear `DATABASE_URL` and set `CONTENT_PREVIEW_SNAPSHOT=1` in that process; remove the flag for database verification.

Before an authorized rollout: inspect `npx prisma migrate status` and the existing database migration baseline; back up the database; apply only the reviewed additive `20261020000000_project_publication_controls` migration using the appropriate established migration process. Do not use `db:reset`, seed, or `db:push` against production. Verify CMS CRUD/upload/publish in an isolated connected environment. Review the commit and secret diff before pushing; a main-branch push can deploy automatically. After authorized deployment, verify real database listings, all old detail URLs and CMS publication controls.

## Files changed

Paths below are repository-relative actual files; `git status` is the authoritative current list.

- `docs/natural-redesign-qa.md`
- `next.config.ts`
- `package.json`
- `src/app/admin/posts/[id]/preview/page.tsx`
- `src/app/admin/projects/[id]/preview/page.tsx`
- `src/app/api/admin/projects/[id]/route.ts`
- `src/app/api/admin/projects/route.ts`
- `src/app/api/posts/[slug]/stats/route.ts`
- `src/app/api/site-data/route.ts`
- `src/app/error.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/loading.tsx`
- `src/app/notes/page.tsx`
- `src/app/opengraph-image.tsx`
- `src/app/posts/[slug]/page.tsx`
- `src/app/projects/[id]/page.tsx`
- `src/app/sitemap.ts`
- `src/components/admin/admin-app.tsx`
- `src/components/admin/admin-pro.css`
- `src/components/admin/admin.css`
- `src/components/admin/home-settings-tab.tsx`
- `src/components/admin/login-form.tsx`
- `src/components/admin/post-editor.tsx`
- `src/components/admin/post-preview.tsx`
- `src/components/admin/post-types.ts`
- `src/components/admin/posts-tab.tsx`
- `src/components/admin/projects-tab.tsx`
- `src/components/admin/rich-text-editor.tsx`
- `src/components/admin/settings-tab.tsx`
- `src/components/admin/tutorial-editor.css`
- `src/components/admin/tutorial-editor.tsx`
- `src/components/cv/content-image.tsx`
- `src/components/cv/content-state.tsx`
- `src/components/cv/detail-polish.css`
- `src/components/cv/engineering-lab.css`
- `src/components/cv/footer.tsx`
- `src/components/cv/navbar.tsx`
- `src/components/cv/notes-library.tsx`
- `src/components/cv/portfolio-home.tsx`
- `src/components/cv/post-engagement-bar.tsx`
- `src/components/cv/post-reader.tsx`
- `src/components/cv/project-detail-view.tsx`
- `src/components/cv/rich-content.tsx`
- `src/components/cv/site-data-context.tsx`
- `src/components/cv/table-of-contents.tsx`
- `src/lib/cv/presentation.ts`
- `src/lib/cv/project-input.ts`
- `src/lib/cv/project-store.ts`
- `src/lib/cv/public-settings.ts`
- `src/lib/cv/site-data-server.ts`
- `src/lib/cv/site-presentation.ts`
- `tests/content-data.test.mjs`
