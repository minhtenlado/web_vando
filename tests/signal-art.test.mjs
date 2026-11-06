import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');

async function fixture(context, { reduced = false, delayed = false, unavailable = false } = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
  const previous = new Map(); const frames = new Map(); const changes = new Set();
  const renderers = []; let intersection, resize, resolveModule, nextFrame = 0, disconnected = 0, loads = 0;
  const media = { matches: reduced, addEventListener: (_, fn) => changes.add(fn), removeEventListener: (_, fn) => changes.delete(fn) };
  const rendererModule = { createSignalField: () => { const renderer = { draws: [], disposed: 0, draw(...args) { this.draws.push(args); }, dispose() { this.disposed++; } }; if (unavailable) return null; renderers.push(renderer); return renderer; } };
  const waiting = new Promise(resolve => { resolveModule = resolve; });
  for (const [name, value] of Object.entries({
    window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true,
    matchMedia: () => media,
    IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} disconnect() { disconnected++; } },
    ResizeObserver: class { constructor(fn) { resize = fn; } observe() {} disconnect() { disconnected++; } },
    requestAnimationFrame: (fn) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
  })) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  dom.window.IntersectionObserver = globalThis.IntersectionObserver;
  dom.window.ResizeObserver = globalThis.ResizeObserver;
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  const source = readFileSync(new URL('../src/components/cv/signal-art.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: false } });
  const output = { exports: {} };
  new Function('require', 'module', 'exports', outputText)((name) => {
    if (name === '@/lib/cv/signal-field') { loads++; return delayed ? waiting : rendererModule; }
    if (name === './locale-context') return { useLocale: () => ({ t: (vi) => vi }) };
    return require(name);
  }, output, output.exports);
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(output.exports.SignalArt, { label: 'Interactive graphic' })));
  const canvas = document.querySelector('canvas');
  context.after(async () => {
    await act(async () => root.unmount()); dom.window.close();
    for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  });
  return {
    root, canvas, renderers, frames, changes, loads: () => loads, disconnected: () => disconnected,
    intersect: (value) => act(async () => intersection([{ isIntersecting: value }])),
    flush: (time = 100) => act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); }),
    hidden: (value) => act(async () => { Object.defineProperty(document, 'hidden', { configurable: true, value }); document.dispatchEvent(new dom.window.Event('visibilitychange')); }),
    context: (type) => act(async () => canvas.dispatchEvent(new dom.window.Event(type, { cancelable: true }))),
    release: () => act(async () => resolveModule(rendererModule)),
    click: () => act(async () => document.querySelector('button')?.click()),
    resize: () => act(async () => resize()),
    ready: () => document.querySelector('figure')?.dataset.ready,
  };
}

test('signal field loads on intersection, pauses offscreen/hidden, resumes and releases its GPU renderer', async (context) => {
  const f = await fixture(context);
  assert.equal(f.loads(), 0);
  await f.intersect(true); await f.flush();
  assert.equal(f.renderers.length, 1); assert.equal(f.ready(), 'true');
  assert.equal(f.renderers[0].draws.length, 1); assert.equal(f.frames.size, 1);
  await f.intersect(false); assert.equal(f.frames.size, 0);
  await f.intersect(true); await f.flush(200);
  await f.hidden(true); assert.equal(f.frames.size, 0);
  await f.hidden(false); await f.flush(300);
  assert.equal(f.renderers[0].draws.length, 3);
  await act(async () => f.root.unmount());
  assert.equal(f.frames.size, 0); assert.equal(f.renderers[0].disposed, 1);
  assert.equal(f.disconnected(), 2); assert.equal(f.changes.size, 0);
});

test('signal field reduced motion draws only static frames, without a misleading resume control', async (context) => {
  const f = await fixture(context, { reduced: true });
  await f.intersect(true); await f.flush();
  assert.equal(f.frames.size, 0); assert.equal(f.renderers[0].draws[0][0], 0);
  await f.resize(); await f.flush(200); assert.equal(f.frames.size, 0);
  assert.equal(document.querySelector('button'), null);
});

test('signal field context loss exposes SVG and restoration creates a fresh renderer', async (context) => {
  const f = await fixture(context);
  await f.intersect(true); await f.flush();
  await f.context('webglcontextlost');
  assert.equal(f.ready(), 'false'); assert.equal(f.frames.size, 0); assert.equal(f.renderers[0].disposed, 1);
  await f.context('webglcontextrestored'); await f.flush(200);
  assert.equal(f.ready(), 'true'); assert.equal(f.renderers.length, 2); assert.equal(f.renderers[1].draws.length, 1);
});

test('signal field cannot initialize after navigation during a delayed import', async (context) => {
  const f = await fixture(context, { delayed: true });
  await f.intersect(true); assert.equal(f.loads(), 1);
  await act(async () => f.root.unmount()); await f.release();
  assert.equal(f.renderers.length, 0); assert.equal(f.frames.size, 0);
});

test('signal field retains a sized SVG fallback when WebGL is unavailable', async (context) => {
  const f = await fixture(context, { unavailable: true });
  await f.intersect(true); await f.flush();
  assert.equal(f.ready(), 'false'); assert.ok(document.querySelector('svg.signal-fallback'));
  assert.equal(f.frames.size, 0);
});


test('signal field pause control stops and resumes the continuous loop', async (context) => {
  const f = await fixture(context);
  await f.intersect(true); await f.flush();
  await f.click(); await f.flush(200);
  assert.equal(document.querySelector('button').getAttribute('aria-label'), 'Tiếp tục chuyển động');
  assert.equal(f.frames.size, 0);
  await f.click(); await f.flush(300);
  assert.equal(document.querySelector('button').getAttribute('aria-label'), 'Dừng chuyển động');
  assert.equal(f.frames.size, 1);
});
