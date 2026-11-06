import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');

test('exhibition selects the chapter nearest the viewing band without flickering on partial observer updates', async (context) => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
  const previous = new Map(); let callback, disconnected = false;
  const observer = class { constructor(fn) { callback = fn; } observe() {} disconnect() { disconnected = true; } };
  for (const [name, value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true, IntersectionObserver: observer })) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  window.IntersectionObserver = observer;
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  const source = readFileSync(new URL('../src/components/cv/project-exhibition.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const result = { exports: {} };
  new Function('require', 'module', 'exports', outputText)((name) => {
    if (name === 'next/link') return { __esModule: true, default: ({ href, children }) => React.createElement('a', { href }, children) };
    if (name === './content-image') return { ContentImage: () => null };
    if (name === './project-summary') return { ProjectSummary: ({ project }) => React.createElement('h3', null, project.title) };
    if (name === './locale-context') return { useLocale: () => ({ t: (vi) => vi }) };
    return require(name);
  }, result, result.exports);
  const root = createRoot(document.getElementById('root'));
  context.after(async () => { await act(async () => root.unmount()); dom.window.close(); for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } });
  await act(async () => root.render(React.createElement(result.exports.ProjectExhibition, { projects: [{ id:'a',title:'A' }, { id:'b',title:'B' }] })));
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  let tops = [200, 600];
  chapters.forEach((element, index) => { element.getBoundingClientRect = () => ({ top: tops[index], height: 200 }); });
  await act(async () => callback([{ target: chapters[0], isIntersecting: true, intersectionRatio: .75 }]));
  await act(async () => callback([{ target: chapters[1], isIntersecting: true, intersectionRatio: .25 }]));
  assert.equal(chapters[0].dataset.active, 'true');
  tops = [0, 260];
  await act(async () => callback([{ target: chapters[0], isIntersecting: true, intersectionRatio: .5 }]));
  assert.equal(chapters[1].dataset.active, 'true');
  await act(async () => root.unmount());
  assert.equal(disconnected, true);
});
