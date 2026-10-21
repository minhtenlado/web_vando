# Creative direction — Copper / Signal

The owner's Creative Engineering Experience brief supersedes the earlier minimal/no-gradient constraints. Baseline: `22d9f4b`, production deployment `JBbcNA2puMKXGVABe5LQCeFfj9aS`; five published projects, three articles, working authenticated CMS. No schema or production content changes are needed.

## Concepts considered

1. **Engineering After Dark:** petrol surfaces, controlled light and reactive circuitry. Strong identity, but a full-screen effects background would compete with real project photographs.
2. **Digital Artifact Museum:** generous project imagery, numbered exhibits, asymmetric composition and a quieter editorial reading experience. Best fit for mixed hardware/software projects and existing CMS media.
3. **Experimental Tech Studio:** expressive display type, graphic copper routes and stronger section contrasts. Useful for the hero and navigation, but applying the same drama to article bodies would harm reading.

Selected: **Copper / Signal**, combining the museum's image hierarchy with the studio's typography and an original circuit-package illustration. Ink/petrol form the base; copper and mint distinguish primary action and signal paths; warm paper provides an editorial counterpoint for Notes.

## Research

- [Lusion](https://lusion.co/) was inspected in a real browser: large visual stages and clear scale differences between navigation, introduction and work. Borrow the principle of visual hierarchy, not its graphics, layout or code. Its initial loading stage is deliberately not reproduced.
- Teenage Engineering's supplied product path and product-index navigation returned a missing-page view during research; no claim is made to have reviewed the product page. Its visible navigation uses sparse functional graphics, but this design does not copy those marks.
- Instrument did not load through the web tool; it is not treated as reviewed evidence.

## Implementation decisions

- Original SVG/CSS geometry represents a conceptual chip and signal routing. It is brand artwork, never a fabricated photograph or schematic for a real project.
- CSS perspective provides depth without a WebGL renderer. A static composition remains when motion is reduced or pointer/GPU features are unavailable. Signal animation pauses outside the viewport and when the document is hidden.
- Real CMS images remain the content of exhibition and project panels. Featured flags take precedence. If none are set, the exhibition uses the existing CMS order and is labelled as the collection rather than pretending records are Featured.
- Manrope's variable font supports Vietnamese and is self-hosted through Next's font loader. Code retains a system monospace stack.
- Public motion has three levels: quick controls, medium image/filter transitions and a slower hero/reveal rhythm. Reading paragraphs remain still.
- Search, category mapping, CMS content, URLs, publication guards, sanitization, authentication, code copy and gallery keyboard behavior are retained.
- Admin adopts the palette and brand mark but keeps its management forms, tables and subdued interactions.

This document describes direction, not completed QA. Actual build, visual and deployment evidence is recorded after implementation.
