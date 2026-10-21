export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}

export interface YouTubeAPI {
  Player: new (element: HTMLElement, options: {
    host: string;
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady(event: { target: YouTubePlayer }): void;
      onStateChange(event: { data: number }): void;
      onAutoplayBlocked(): void;
      onError(): void;
    };
  }) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let pending: Promise<YouTubeAPI> | undefined;

/** Shared, on-demand SDK load. Failed loads can be retried without duplicate scripts. */
export function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise<YouTubeAPI>((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(timer);
      script.onerror = null;
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous;
    };
    const ready = () => {
      if (!window.YT?.Player) { fail(); return; }
      cleanup();
      resolve(window.YT);
      previous?.();
    };
    const fail = () => {
      cleanup();
      script.remove();
      reject(new Error('YouTube player API did not load'));
    };
    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = fail;
    timer = setTimeout(fail, 15000);
    document.head.appendChild(script);
  }).catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
