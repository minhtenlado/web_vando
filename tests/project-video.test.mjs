import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');

function loadSource(path, dependencies = {}) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } });
  const output = { exports: {} };
  new Function('require', 'module', 'exports', outputText)((name) => name in dependencies ? dependencies[name] : require(name), output, output.exports);
  return output.exports;
}

function environment(context, reduced = false) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
  const previous = new Map();
  let intersection;
  let disconnected = false;
  const changes = new Set();
  const media = { matches: reduced, addEventListener: (_, fn) => changes.add(fn), removeEventListener: (_, fn) => changes.delete(fn) };
  for (const [name, value] of Object.entries({
    window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true,
    matchMedia: () => media,
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; }
      observe() {}
      disconnect() { disconnected = true; }
    },
  })) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  context.after(() => {
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  return {
    dom, media, changes, disconnected: () => disconnected,
    intersect: (ratio) => act(async () => intersection([{ isIntersecting: ratio > 0, intersectionRatio: ratio }])),
    hidden: (value) => act(async () => {
      Object.defineProperty(document, 'hidden', { configurable: true, value });
      document.dispatchEvent(new dom.window.Event('visibilitychange'));
    }),
  };
}

async function mountVideo(context, { reduced = false, load } = {}) {
  const env = environment(context, reduced);
  const players = [];
  let loads = 0;
  const api = { Player: class {
    constructor(element, options) {
      this.options = options;
      this.calls = [];
      this.frame = document.createElement('iframe');
      element.replaceWith(this.frame);
      players.push(this);
    }
    playVideo() { this.calls.push('play'); }
    pauseVideo() { this.calls.push('pause'); }
    mute() { this.calls.push('mute'); }
    destroy() { this.calls.push('destroy'); this.frame.remove(); }
    getIframe() { return this.frame; }
  } };
  const { ProjectVideo } = loadSource('src/components/cv/project-video.tsx', {
    '@/lib/cv/youtube-api': { loadYouTubeAPI: () => { loads++; return load ? load(api) : Promise.resolve(api); } },
    './locale-context': { useLocale: () => ({ t: (vi) => vi }) },
  });
  const root = createRoot(document.getElementById('root'));
  const render = (suspended = false) => act(async () => root.render(React.createElement(ProjectVideo, { videoId: 'qBpzAxFBo4M', title: 'Stored project video', suspended })));
  await render();
  return { ...env, players, loads: () => loads, render, root,
    ready: () => act(async () => players[0].options.events.onReady({ target: players[0] })),
  };
}

test('project video loads at half visibility, pauses outside/hidden/overlaid and resumes without resetting', async (context) => {
  const video = await mountVideo(context);
  assert.equal(video.loads(), 0);
  await video.intersect(.49);
  assert.equal(video.loads(), 0);
  await video.intersect(.6);
  assert.equal(video.loads(), 1);
  await video.ready();
  const player = video.players[0];
  assert.deepEqual(player.calls, ['mute', 'play']);
  assert.equal(player.options.host, 'https://www.youtube-nocookie.com');
  assert.equal(player.options.playerVars.origin, 'https://example.test');
  assert.match(player.frame.allow, /autoplay/);
  await video.intersect(.4);
  assert.equal(player.calls.at(-1), 'pause');
  await video.intersect(.8);
  assert.equal(player.calls.at(-1), 'play');
  await video.hidden(true);
  assert.equal(player.calls.at(-1), 'pause');
  await video.hidden(false);
  assert.equal(player.calls.at(-1), 'play');
  await video.render(true);
  assert.equal(player.calls.at(-1), 'pause');
  await video.render(false);
  assert.equal(player.calls.at(-1), 'play');
  assert.equal(video.players.length, 1);
  await act(async () => video.root.unmount());
  assert.equal(player.calls.at(-1), 'destroy');
  assert.equal(video.disconnected(), true);
  assert.equal(video.changes.size, 0);
  const calls = player.calls.length;
  await video.hidden(true);
  assert.equal(player.calls.length, calls);
});

test('late player readiness after scrolling away cannot start background playback', async (context) => {
  const video = await mountVideo(context);
  await video.intersect(.8);
  await video.intersect(0);
  await video.ready();
  assert.deepEqual(video.players[0].calls, ['mute', 'pause']);
  await act(async () => video.root.unmount());
});

test('fullscreen playback remains visible and exiting fullscreen restores scroll-based pause', async (context) => {
  const video = await mountVideo(context);
  await video.intersect(.8);
  await video.ready();
  const player = video.players[0];
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: player.frame });
  await video.intersect(0);
  assert.equal(player.calls.at(-1), 'play');
  await act(async () => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    document.dispatchEvent(new video.dom.window.Event('fullscreenchange'));
  });
  assert.equal(player.calls.at(-1), 'pause');
  await act(async () => video.root.unmount());
});

test('leaving the route while the SDK loads cannot create a detached playing iframe', async (context) => {
  let resolve;
  let api;
  const video = await mountVideo(context, { load: (value) => { api = value; return new Promise((done) => { resolve = done; }); } });
  await video.intersect(.8);
  await act(async () => video.root.unmount());
  await act(async () => resolve(api));
  assert.equal(video.players.length, 0);
});

test('reduced motion keeps a ready manual player; a blocked autoplay exposes a working play control', async (context) => {
  const video = await mountVideo(context, { reduced: true });
  await video.intersect(.8);
  await video.ready();
  const player = video.players[0];
  assert.deepEqual(player.calls, ['mute', 'pause']);
  await act(async () => player.options.events.onAutoplayBlocked());
  const button = document.querySelector('.lab-video-state button');
  assert.equal(button.textContent, 'Phát video');
  await act(async () => button.click());
  assert.equal(player.calls.at(-1), 'play');
  const plays = player.calls.filter((call) => call === 'play').length;
  await act(async () => player.options.events.onStateChange({ data: 2 }));
  assert.equal(player.calls.filter((call) => call === 'play').length, plays);
  await act(async () => video.root.unmount());
});

test('SDK failure leaves a real external link and can be retried', async (context) => {
  let first = true;
  const video = await mountVideo(context, { load: (api) => {
    if (first) { first = false; return Promise.reject(new Error('network unavailable')); }
    return Promise.resolve(api);
  } });
  await video.intersect(.8);
  assert.equal(document.querySelector('.lab-video-state a').href, 'https://www.youtube.com/watch?v=qBpzAxFBo4M');
  const retry = document.querySelector('.lab-video-state button');
  assert.equal(retry.textContent, 'Thử lại');
  await act(async () => retry.click());
  await video.ready();
  assert.deepEqual(video.players[0].calls, ['mute', 'play']);
  await act(async () => video.root.unmount());
});

test('YouTube SDK loader shares one script and recovers after a failed request', async (context) => {
  environment(context);
  const { loadYouTubeAPI } = loadSource('src/lib/cv/youtube-api.ts');
  const first = loadYouTubeAPI();
  const duplicate = loadYouTubeAPI();
  assert.equal(first, duplicate);
  assert.equal(document.querySelectorAll('script').length, 1);
  const rejected = assert.rejects(first, /did not load/);
  document.querySelector('script').onerror();
  await rejected;
  assert.equal(document.querySelectorAll('script').length, 0);
  const retry = loadYouTubeAPI();
  assert.equal(document.querySelectorAll('script').length, 1);
  const api = { Player: class {} };
  window.YT = api;
  window.onYouTubeIframeAPIReady();
  assert.equal(await retry, api);
  assert.equal(await loadYouTubeAPI(), api);
});
