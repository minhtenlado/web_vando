# UI, accessibility and performance review — 2026-10-21

Baseline: production commit `9b2bc22`, Vercel deployment `FSzymvtYnAjbSwQTJLPnZyuajgot`. This review follows the owner's updated authorization for preview and production releases. No new database schema, CMS content or authentication changes were made.

## Verified problems and changes

- **Missing article covers reserved large empty rectangles.** All three current public article records have `coverImage: null`. Notes now omit the image column when no valid image exists; genuinely failed image requests retain their fallback. Editorial excerpts are limited to three listing lines; article bodies remain complete.
- **Long, inconsistent project categories.** A presentation-only mapping groups existing categories into Embedded, AI, Robotics, IoT, Hardware and Software when those terms are present. Projects can match multiple groups. Unrecognized categories remain selectable. Original CMS values and Admin fields are unchanged.
- **Project headers displayed 8–11 technology labels.** Headers now show four; the complete existing stack appears in the document when there are more than four. Arena retained all 11 technologies in the browser check.
- **Justified mobile paragraphs produced large word gaps.** Quill's justified paragraphs use start alignment at widths up to 760px. Desktop alignment, stored content and editor formatting are preserved.
- **Anchor offsets were applied twice.** Homepage project navigation landed at approximately 168px below the viewport top with a 65px header. Section/heading margins no longer duplicate the document's 84px scroll padding; the checked target landed at approximately 84px.
- **Skip navigation did not focus the main landmark.** Main content on the four core public views is now programmatically focusable. Tab → Enter on the skip link focused `MAIN#main-content` in the browser.
- **Mobile menu and gallery close targets were 16×16px.** Scoped public styles now provide 44×44px controls. Reading and code-copy controls also have 44px minimum height. Escape and focus return were verified for the menu and gallery.
- **Article hydration moved content.** The desktop article grid previously changed when the client-generated TOC appeared. The aside now has stable server-rendered space. Code blocks reserve room for the copy button before hydration. The baseline YOLO navigation recorded a layout-shift entry of about 0.066; the checked local build recorded no non-input layout-shift entries. These are laboratory observations, not field CLS certification.
- **Advertising scripts loaded without an ad placement.** The measured homepage loaded two AdSense scripts totalling 680,635 decoded bytes despite no rendered ad unit. Loading now belongs to the existing `GoogleAd` component rather than every page's root layout. Publisher verification metadata remains. Actual ad delivery/Auto Ads was not certified.
- **Interaction changes were abrupt or inconsistent.** Shared 140/200/280ms motion tokens now drive public color/border transitions and a restrained 1.015 image scale for fine-pointer hover. The public mobile sheet uses 200ms instead of the shared component's 500ms default. No animation dependency was added.
- Project thumbnails now use accurate responsive `sizes` and avoid repeating the adjacent title as an image's accessible name.
- The local preview snapshot still contained a personal avatar as six article covers. Those fields were synchronized to the current public records' null covers. This only affects the explicitly enabled local snapshot; Vercel continues to require database reads.

## Actual tests before release

- **29 automated tests passed.** New cases cover legacy category membership, Vietnamese labels and preservation of unknown categories. Existing publication, sanitizer, authentication, input-validation and CMS-loading regression checks remain passing.
- **Lint, TypeScript and production build passed.** The build's schema guard skipped the rollout locally.
- **35 isolated HTTP integration assertions passed** against the final production build, Prisma and a fresh temporary PGlite database. Covered project/article draft/create/preview/publish/edit/unpublish/delete, Featured persistence, actual detail content, comments/replies, non-negative likes, profile persistence, malformed article requests, forged PNG rejection and logout protection. Synthetic data stayed in the temporary local database; no real storage upload was performed.
- **50 responsive cases passed:** Home, Notes, all five project details and all three article details at **360, 390, 768, 1024 and 1440px**. Each had one H1, no document overflow, and no failed completed image at inspection. Lazy images not yet requested were not counted as verified downloads.
- Screenshots inspected for desktop, tablet and mobile Home, mobile Notes and article, and the mobile project header/gallery. The preview notice is visible in local screenshots to distinguish them from production evidence.
- Search `dieu khien` returned three real projects. IoT returned three projects and AI two. Menu open/close, Escape/focus restoration, keyboard skip navigation, gallery arrow navigation and full technology preservation passed.
- Reduced-motion emulation matched the media query, reduced button transitions to 0.00001s and changed smooth scrolling to `auto`; emulation was reset afterwards.
- The local browser reported no application console errors during the final responsive pass.
- Authenticated production Admin was inspected without saving: project listing at 390/768/1440px, existing project dialog, mobile Admin drawer, article listing and structured YOLO editor. No document overflow or offscreen input fields were observed in the checked mobile editor. The existing session was logged out successfully. This pre-release check does not replace post-release verification.

## Performance evidence and limits

Measurements used the in-app Chromium browser's buffered PerformanceObserver entries and Resource Timing. Observers were disconnected after sampling; no monitoring script was added to the product. Runs were unthrottled, with browser cache and real network/server variability.

| Baseline production sample, 1440px | Observed value |
| --- | --- |
| Homepage LCP candidate | 1,344ms |
| Homepage decoded script bytes, including third parties | 1,280,141 |
| Homepage non-input layout-shift entries | 0 |
| YOLO article LCP candidate | 1,532ms |
| YOLO article non-input layout-shift entry | 0.066146 |

Decoded bytes describe uncompressed resources, **not transferred bytes**; cache can make transfer sizes zero. The local YOLO check had no non-input layout-shift entries, but local timing is not comparable to production latency. Post-release measurements must be identified separately.

No Lighthouse score, field INP/p75 Core Web Vitals, physical-device performance or full screen-reader certification is claimed. Buffered interaction durations, if sampled, are laboratory interaction observations rather than field INP.

## Content requiring owner verification

These were read from public CMS data or the actual article. They were retained; no benchmark values were invented.

| Location | Existing content to verify |
| --- | --- |
| YOLO article, “Benchmark the System” | Three benchmark rows contain `XX`, `XX MB`, `XX%`. The excerpt repeats as the tutorial introduction. Stored SEO description begins `uild…`. |
| Arena results | `< 15ms`, `100%` power stability, `Top 6 / 48`: measurement method and supporting results. |
| Maze results | `97%` success and the conditions used to calculate it. |
| ESP32 relay results | `10A/250V`, complete optical isolation, ESPHome compatibility: hardware specifications, safety conditions and actual testing. |
| Parking results | `93.0%`, `< 2.0s`, `3–5 FPS`, `82.5/100 SUS`: dataset, hardware, test procedure and sample size. |

## Remaining checks

- Production upload success, external email/AI delivery and real CMS mutations were not executed. Database write paths passed in isolation.
- `npm audit --omit=dev`: **0 critical, 5 high, 3 moderate, 3 low** advisories remain. This UI review did not claim dependency advisories were resolved.
- The authenticated Admin workflow and the original domain must be checked again after release. The known stable deployment above is the rollback target; this release has no database changes to reverse.
- Credentials, cookies, `.env` and `.vercel` files are excluded from commits and this report. Temporary QA packages/scripts are ignored local fixtures.
