# Project video viewport playback

Request: automatically play the existing project video when scrolling into it, pause when scrolling elsewhere, and resume at the previous position.

## Behavior and scope

- All existing project demo videos use the shared `ProjectVideo` component. Stored video IDs, CMS visibility flags and Admin input remain unchanged.
- At least half the video must be visible, excluding the sticky header, before the YouTube SDK/player loads and starts. Initial playback is muted and inline; native controls still allow sound, pause, seeking and fullscreen.
- Leaving that visible area, hiding the document or opening the image lightbox pauses playback. Returning resumes the same player rather than recreating it or resetting the playback position. Fullscreen is treated as visible. A manually paused video is not immediately forced to play again.
- Reduced motion keeps a manual player. Blocked autoplay exposes a play button. SDK/network failures offer retry and the real YouTube link. Browsers without IntersectionObserver retain manual playback.
- SDK loading is shared and on demand. Observer/media/visibility/fullscreen listeners and player instances are cleaned up. Late readiness after scrolling away or route teardown cannot start playback.
- The existing CSP gains only the official `www.youtube.com/iframe_api` endpoint and `www.youtube.com/s/player/` script path. Other directives, authentication, database schema and content are unchanged. No dependencies or credentials were added.

## Actual validation before release

- `npm test`: 36 passed, including seven new video tests for viewport/visibility/overlay pause, readiness races, unmount while loading, fullscreen exit, reduced motion/manual fallback, failure/retry and shared SDK loading.
- Targeted ESLint passed for all changed TypeScript/test/config files. Production build and TypeScript passed; local build skipped the schema rollout.
- Real YouTube player was rendered under the production CSP in the local standalone production server with the explicitly labelled existing-content snapshot. No YouTube script or iframe was present above the video before scrolling into it.
- Actual YouTube API state at 1440px: playing `1` at 34.36s → offscreen paused `2` at 34.38s → visible playing `1` at 34.67s. The video retained its position.
- Actual API state at 390px: `1` at 46.70s → `2` at 46.71s → `1` at 46.99s. Video height was 200px and document width did not overflow.
- Reduced-motion emulation paused the real visible player (`2`); resetting it resumed (`1`). Navigating to Notes left no YouTube iframe. The local application console error sample was empty.
- The in-app browser keeps its background test tabs marked visible, so actual tab hiding was not simulated by opening a second tool tab. The document visibility path passed the automated DOM/React test. Physical Safari/iOS and fullscreen rendering are not certified by the local browser run; fullscreen behavior passed its automated test.

Evidence is in the task workspace's `qa-video-2026-10-21` directory. Production deployment and original-domain results are recorded after rollout.

## References

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference): lifecycle, mute, play/pause and autoplay-blocked events.
- [YouTube player parameters](https://developers.google.com/youtube/player_parameters): origin, JavaScript control and inline playback.
