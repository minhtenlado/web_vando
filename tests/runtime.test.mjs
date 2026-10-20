import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { ensurePublicationColumns } from '../scripts/ensure-project-publication.mjs';

function loadRoute(path, db) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const output = { exports: {} };
  const dependencies = { '@/lib/db': { db }, 'next/server': { NextResponse: { json: (value, init) => Response.json(value, init) } } };
  new Function('require', 'module', 'exports', outputText)((name) => dependencies[name], output, output.exports);
  return output.exports;
}
const commentsPath = 'src/app/api/posts/[slug]/comments/route.ts';
const statsPath = 'src/app/api/posts/[slug]/stats/route.ts';
const params = { params: Promise.resolve({ slug: 'published-post' }) };
const request = (body) => new Request('http://localhost/api/posts/published-post/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('CMS profile loader uses authenticated records and preserves stored fields', async (context) => {
  const stored = { name: 'Stored profile', educations: [], certifications: [], languages: [] };
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/admin/profile?locale=en');
    assert.equal(options.cache, 'no-store');
    return Response.json({ ok: true, profile: stored });
  });
  const { readAdminProfile } = loadRoute('src/lib/cv/admin-profile.ts', {});
  assert.deepEqual(await readAdminProfile('en'), stored);
});

test('CMS profile loader rejects unauthorized and malformed responses instead of blank defaults', async (context) => {
  let response = Response.json({ ok: false }, { status: 401 });
  context.mock.method(globalThis, 'fetch', async () => response);
  const { readAdminProfile } = loadRoute('src/lib/cv/admin-profile.ts', {});
  await assert.rejects(readAdminProfile('vi'), /Không tải được/);
  response = Response.json({ ok: true, profile: [] });
  await assert.rejects(readAdminProfile('vi'), /Không tải được/);
});

test('sanitizer loads when require(ESM) is disabled, as on the failing Vercel runtime', () => {
  const result = execFileSync(process.execPath, ['--no-experimental-require-module', '-e', "const p=require('isomorphic-dompurify'); const h=p.sanitize('<p>Safe</p><img src=x onerror=alert(1)><script>alert(1)</script>'); if(/onerror|script/.test(h))process.exit(1);process.stdout.write('safe')"], { encoding: 'utf8' });
  assert.equal(result, 'safe');
});

test('CMS sanitizer keeps code/tables and trusted embeds while removing executable markup', () => {
  const source = readFileSync(new URL('../src/lib/validation.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const output = { exports: {} }, require = createRequire(import.meta.url);
  new Function('require', 'module', 'exports', outputText)(require, output, output.exports);
  const html = output.exports.sanitizePostHtml('<h2>Title</h2><pre><code>x &lt; 1</code></pre><table><tr><td>Data</td></tr></table><iframe src="https://www.youtube.com/embed/abc"></iframe><iframe src="https://evil.example"></iframe><img src=x onerror=alert(1)><script>alert(1)</script>');
  for (const expected of ['<h2>', '<pre>', '<code>', '<table>', 'youtube.com']) assert.ok(html.includes(expected));
  for (const forbidden of ['evil.example', 'onerror', '<script']) assert.ok(!html.includes(forbidden));
});

test('draft/missing article comments cannot be listed or created', async () => {
  const route = loadRoute(commentsPath, { post: { findFirst: async (args) => { assert.equal(args.where.published, true); return null; } }, comment: {} });
  assert.equal((await route.GET(request({}), params)).status, 404);
  assert.equal((await route.POST(request({ content: 'Valid text', isAnonymous: true }), params)).status, 404);
});

test('malformed comments are rejected and cross-article likes/replies cannot mutate rows', async () => {
  const db = { post: { findFirst: async () => ({ id: 'post' }) }, comment: { findFirst: async (args) => { assert.equal(args.where.postSlug, 'published-post'); return null; } } };
  const route = loadRoute(commentsPath, db);
  assert.equal((await route.POST(request(null), params)).status, 400);
  assert.equal((await route.POST(request({ content: {} }), params)).status, 422);
  assert.equal((await route.POST(request({ action: 'like', commentId: 'other-post-comment' }), params)).status, 404);
  assert.equal((await route.POST(request({ content: 'A reply', parentId: 'other-post-parent' }), params)).status, 422);
});

test('comment unlike uses an atomic non-negative filter and server result', async () => {
  let update;
  const route = loadRoute(commentsPath, { post: { findFirst: async () => ({ id: 'post' }) }, comment: {
    findFirst: async () => ({ id: 'comment', likes: 0 }), updateMany: async (args) => { update = args; return { count: 0 }; },
  } });
  const response = await route.POST(request({ action: 'unlike', commentId: 'comment' }), params);
  assert.equal(response.status, 200);
  assert.deepEqual(update.where, { id: 'comment', postSlug: 'published-post', likes: { gt: 0 } });
  assert.equal((await response.json()).likes, 0);
});

test('stats reject malformed input and cannot decrement counters below zero', async () => {
  let update;
  const route = loadRoute(statsPath, { post: { findFirst: async () => ({ id: 'post', likes: 0, views: 5, bookmarks: 0 }), updateMany: async (args) => { update = args; } } });
  assert.equal((await route.POST(request(null), params)).status, 400);
  assert.equal((await route.POST(request({ action: 'unlike' }), params)).status, 200);
  assert.deepEqual(update.where, { slug: 'published-post', published: true, likes: { gt: 0 } });
});

function migrationClient(columns, changeRows = false) {
  const commands = []; let reads = 0;
  const tx = {
    $executeRaw: async (parts) => { commands.push(parts.join('')); return 0; },
    $queryRaw: async (parts) => {
      const query = parts.join('');
      if (query.includes('information_schema')) return columns.map((column_name) => ({ column_name }));
      if (query.includes('to_jsonb')) return [{ row: { id: 'stored', title: changeRows && reads++ ? 'unexpected change' : 'Preserve this' } }];
      return [];
    },
  };
  return { commands, $transaction: (fn) => fn(tx) };
}

test('approved additive rollout preserves rows and only adds missing controls', async () => {
  const client = migrationClient(['published']);
  assert.deepEqual(await ensurePublicationColumns(client), { changed: true, preservedRows: 1 });
  const ddl = client.commands.filter((query) => query.includes('ALTER TABLE'));
  assert.equal(ddl.length, 2);
  assert.ok(ddl.some((query) => query.includes('"featured"')));
  assert.ok(!ddl.some((query) => query.includes('"published"')));
});

test('schema rollout is idempotent and aborts if existing row data changes', async () => {
  const complete = migrationClient(['published', 'featured', 'status']);
  assert.deepEqual(await ensurePublicationColumns(complete), { changed: false });
  assert.ok(!complete.commands.some((query) => query.includes('ALTER TABLE')));
  await assert.rejects(ensurePublicationColumns(migrationClient([], true)), /verification failed/);
});
