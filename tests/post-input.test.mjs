import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const output = { exports: {} };
  new Function('require', 'module', 'exports', outputText)((name) => {
    assert.ok(name in dependencies, 'Unexpected dependency: ' + name);
    return dependencies[name];
  }, output, output.exports);
  return output.exports;
}
const input = load('src/lib/cv/post-input.ts');
const invalid = [null, [], false, { title: 123 }, { content: {} }, { excerpt: [] }, { slug: 1 }, { published: 'false' }, { createdAt: 'not-a-date' }, { createdAt: '' }, { title: '   ' }, { pdfUrl: {} }];

test('post input rejects malformed payloads before coercion or database access', () => {
  for (const body of invalid) assert.equal(typeof input.postPayloadError(body), 'string', JSON.stringify(body));
});

test('post input preserves rich content and supports partial publication updates', () => {
  for (const body of [
    { title: 'Stored article', content: '<h2>Heading</h2><pre><code>print(1)</code></pre>', published: false, createdAt: '2026-10-20T01:00:00.000Z' },
    { published: true }, { coverImage: null, pdfUrl: '' },
  ]) assert.equal(input.postPayloadError(body), undefined);
});

function routes(auth = async () => ({})) {
  const dependencies = {
    '@/lib/auth': { requireAuth: auth }, '@/lib/cv/post-input': input,
    '@/lib/db': { db: new Proxy({}, { get() { assert.fail('Malformed input reached database'); } }) },
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
  };
  return [load('src/app/api/admin/posts/route.ts', dependencies).POST, load('src/app/api/admin/posts/[id]/route.ts', dependencies).PUT];
}
const request = (body) => new Request('http://localhost/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('both Admin post mutation routes reject malformed JSON values without writes', async () => {
  for (const handler of routes()) {
    for (const body of invalid) {
      const response = await handler(request(body), { params: Promise.resolve({ id: 'stored-post' }) });
      assert.equal(response.status, 422, JSON.stringify(body));
    }
    const response = await handler(new Request('http://localhost/api/admin/posts', { method: 'POST', body: '{' }), { params: Promise.resolve({ id: 'stored-post' }) });
    assert.equal(response.status, 400);
  }
});

test('Admin post validation retains authentication before body processing', async () => {
  for (const handler of routes(async () => new Response(null, { status: 401 }))) {
    assert.equal((await handler(request(null), { params: Promise.resolve({ id: 'stored-post' }) })).status, 401);
  }
});
