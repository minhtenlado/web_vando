# Copper / Signal — implementation and QA

The latest Creative Engineering Experience brief supersedes the earlier minimal visual constraints. Direction and three concept comparisons are in `creative-direction-2026-10-21.md`. Stable baseline: `22d9f4b`, Vercel deployment `dpl_JBbcNA2puMKXGVABe5LQCeFfj9aS`.

## Delivered design

- Ink/petrol surfaces, copper actions and mint signals; warm-paper Notes section. Manrope variable typography with Vietnamese subsets is self-hosted by Next Font.
- Original chip mark, matching favicon/share palette, expressive three-line hero and pointer-responsive CSS perspective circuit illustration. This is labelled identity artwork, not a fabricated product photograph.
- Asymmetric CMS exhibition, large two-column project explorer, separate editorial article rows, quieter technical readers and specification panels. Empty and failed content states remain available.
- Featured records take precedence; otherwise the existing first three published projects are labelled as the collection. No flags or data are changed.
- Motion: 160ms controls, 320ms navigation/gallery, 420ms filter entry, 680ms finite scroll reveals and 900ms staggered hero entry. The six-second SVG signal pauses offscreen, when hidden and under reduced motion. Paragraphs remain still. No new animation/WebGL dependency was added: CSS depth and SVG achieve the intended scene with a static fallback.
- Gallery retains keyboard controls and opener focus; horizontal swipe handling was added with a vertical/pinch allowance. A source-level handler is not proof of physical-device touch behavior.
- Admin palette/mark match the public site. Article rows flag existing `XX` placeholders without modifying stored content. Legal page introductions/metadata use Engineering Lab; actual ownership/contact statements are retained.

## Actual local verification

- `npm test`: 29 passed. `npm run lint`: passed. Subsequent Admin JSX passed targeted ESLint. Final `npm run build`: passed, including TypeScript and standalone output. Schema guard skipped local rollout.
- 35 HTTP assertions passed on a fresh, disposable loopback PGlite database with Prisma and the production Next server: project/article draft, preview, publication, edit, delete; comments/replies/likes; profile round trip; malformed article requests; forged PNG rejection; logout protection. No production CMS writes or successful external uploads were made.
- 60 responsive DOM checks: Home, Notes, all five project and three article details at 360, 390, 768, 1024, 1440 and 1920px. One H1 each, no document overflow and no failed completed image at inspection. Unrequested lazy images are not certified by this check.
- Actual screenshots reviewed for desktop/tablet/mobile hero, exhibition, Notes, project header/lightbox, technical article and mobile navigation. The first mobile pass exposed decorative glow overflow; clipping the illustration fixed it. Local screenshots explicitly display the snapshot/database-disconnected notice.
- Project accent-insensitive search `dieu khien`: three records; AI filter: two; reset and English locale retained five projects. Gallery next/ArrowRight changed 1/6 → 2/6 → 3/6; Escape restored focus to its opener. Article copy wrote real code to clipboard and TOC navigation updated the fragment. Mobile menu opened and closed with Escape.
- Reduced-motion emulation: hero opacity 1, circuit inactive, signal duration 0.00001s, scrolling `auto`; override reset. Offscreen circuit was observed inactive and visible circuit active.
- Computed palette contrast: main text 16.30:1, muted 9.04:1, mint 12.34:1, copper 9.90:1 against ink; paper muted 5.26:1 and link 5.13:1; Admin muted on surface 7.32:1. This does not certify every CMS color or a complete accessibility audit.
- In-app browser does not support `Input.dispatchTouchEvent`; swipe remains unverified on a real device. No physical-device, screen-reader, FPS or field INP certification is claimed.

Evidence is saved outside the repository in the task workspace's `qa-creative-2026-10-21` folder. Release measurements and production verification are recorded after rollout.

## Content and security limits

- Existing CMS benchmark claims were preserved. YOLO contains `XX`, `XX MB`, `XX%`; Admin now flags these. Its repeated introduction and stored SEO typo still need editorial correction. Arena, Maze, relay and parking result claims need owner evidence; see the prior UI review for the exact values. No performance or hardware benchmark was invented.
- `npm audit --omit=dev`: 11 existing advisories, 0 critical / 5 high / 3 moderate / 3 low. Dependency remediation is not claimed by this visual release.
- External upload success, email/AI delivery and production CRUD writes were not exercised. Production verification uses read-only CMS inspection and ordinary login/logout.
- No database/schema change is included. No credentials, `.env`, `.vercel`, session files or ignored QA tooling are intended for the commit. Preview protection must remain enabled; no new automation-bypass credential is required.
- Rollback is the stable baseline deployment above (or a revert of this code-only release). No database rollback is needed.
