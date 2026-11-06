# Signal / Matter — Interactive Engineering Gallery

## Direction
Warm paper and ink form the reading and navigation surface. Cobalt marks actions; pale lime appears only in the dark signal stage and engineering notes. Media has a dark, unrounded exhibition stage, while the document body remains quiet. The original wire surface represents signal processing as graphic art. It is explicitly labelled an interactive graphic, not a manufactured device, measured signal, or project asset.

Typography: Be Vietnam Pro (400/600, display) and Manrope (variable, body), both with Vietnamese subsets, self-hosted through next/font/google. System monospace supplies technical labels. Public fluid type scales are separate from readable article text sizes. CMS custom headlines remain authoritative; only known previous defaults are upgraded.

## Rendered reference research, 21 October 2026
All six homepages were opened in the in-app browser, with actual screenshots inspected. No reference assets or code were copied or downloaded.

- **Lusion**: pale background, restrained header, large rounded dark 3D stage with blue/white solid forms. Scrolling moves the stage past the header into a widely spaced editorial section. Applied principle: one spatial visual anchored to a clear layout, with ordinary navigation. Our signal mesh, palette, geometry and layout are original.
- **Cuberto**: current homepage is a centered black/white agency headline, large moving project reel, then numbered service panels. Scrolled through service panels and moved the pointer over Projects. Applied principle: strong type hierarchy, image scale and short arrow/hover feedback. Did not reproduce its cursor, reel or brand typography.
- **Locomotive**: immersive warm video hero, low editorial heading and sparse navigation; next section has a narrow, offset image with text positioned around it. Cookie choice set to necessary only. Applied principle: change the rhythm between spatial hero, asymmetric project story, full index and editorial list.
- **Teenage Engineering**: monochrome department-store photograph with graphic navigation. Followed the visible Products link to the catalogue: large unobstructed hardware photography, tiny labels, neutral surface, selective orange. Applied principle: contain technical product media instead of cropping critical device details. Existing CMS media is used without asserting photographic provenance.
- **Active Theory**: initial black loader subsequently rendered a dark spatial metallic ribbon/loop, particles, small fixed Work/Contact navigation and a scroll prompt. Scrolled the scene. Applied principle: controlled spatial depth without replacing navigation with 3D. Did not investigate its complete work flow or reproduce scene assets.
- **Rauno**: horizontally progressing editorial panels, enormous black type on paper, yellow/orange circular accents and a small position marker. Scrolling revealed the Devouring Details/Craft panels. The Craft link click was not completed because the animated target moved; no successful subpage-transition claim. Applied principle: fine control feedback and editorial contrast, without copying the personal portfolio content or panel mechanism.

These are observations of the pages available on this date, not claims about every reference interaction.

## Architecture
- Central palette: src/components/cv/design-tokens.css. Shared physical timing/spring: src/lib/cv/motion.ts; matching CSS duration/easing tokens.
- Original native WebGL module, dynamically imported only when its sized stage intersects. One line-mesh draw call, GPU vertex deformation, no textures or third-party scene runtime. 30 fps ceiling desktop / 24 narrow, DPR max 1.5 / 1. These are configured caps, not measured FPS claims.
- Rendering stops offscreen, when the document is hidden, for reduced motion after a static draw, and on explicit pause. Context loss restores SVG; restoration recreates resources. Unmount cancels work and deletes buffers/program/shaders. No required content is in canvas.
- Native vertical sticky exhibition uses CMS order/featured flags, switches image on scroll/hover/focus, and becomes image/text chapters at tablet/mobile. No scroll hijacking or hover-only destinations.
- Existing Motion dependency supplies spring layout changes and finite filter entry/exit. CSS handles navigation, hover, image crossfades, menus, reader headers and lightbox. Reduced motion disables nonessential transforms/transitions.
- Project details use anchored sections, large contained cover/gallery and indexed reading sections. Existing YouTube visibility playback, fullscreen handling, reduced-motion policy and gallery suspension are preserved.
- Admin keeps its current authenticated components and data flow. Palette bindings are updated to shared dark surface and blue/lime tokens; no CRUD/API/schema/storage changes.

## Data and safety
No new library, migration, CMS content or fabricated performance claim. Existing five projects and three published articles remain the source. Existing unverified CMS benchmark/result claims and YOLO XX placeholders are not replaced with invented numbers. The previous ready production deployment b69584f is the rollback baseline. Preview protection must not be bypassed or weakened.

## Technical references
- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- https://motion.dev/docs/react-layout-animations
- Installed Next 16.3.8 guides: use-client, lazy-loading, image/font APIs.

The reference sites were [Lusion](https://lusion.co/), [Cuberto](https://cuberto.com/), [Locomotive](https://locomotive.ca/), [Teenage Engineering](https://teenage.engineering/), [Active Theory](https://activetheory.net/) and [Rauno](https://rauno.me/). Both font families use the SIL Open Font License. [Be Vietnam Pro](https://github.com/google/fonts/blob/main/ofl/bevietnampro/OFL.txt) and [Manrope](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt).

## Release security check

The release updates Next.js and its ESLint configuration to 16.4.3, Sharp to 0.35.5 and DOMPurify to 3.4.17. The lockfile also includes compatible fixes for YAML parsing, HTTP requests, source maps and validation. On 6 November 2026 the production dependency audit reported two low findings, both associated with the Quill editor's HTML export. No moderate, high or critical findings remained. The site sanitizes displayed article HTML. [Next.js release notes](https://github.com/vercel/next.js/releases/tag/v16.4.3) and [Quill advisory](https://github.com/advisories/GHSA-v3m3-f69x-jf25).
