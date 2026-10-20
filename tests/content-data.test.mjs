import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function loadSource(path, dependencies = {}) {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const testModule = { exports: {} };
  const require = (name) => { if (name in dependencies) return dependencies[name]; throw new Error('Unexpected test dependency: ' + name); };
  new Function('require', 'module', 'exports', outputText)(require, testModule, testModule.exports);
  return testModule.exports;
}
const projects = loadSource('src/lib/cv/project-store.ts');
const settings = loadSource('src/lib/cv/public-settings.ts');
const { normalizeSearch, formatContentDate } = loadSource('src/lib/cv/presentation.ts');
const { supportsTutorialEditor } = loadSource('src/components/admin/post-types.ts');
const { projectPayloadError } = loadSource('src/lib/cv/project-input.ts');
const missingColumn = Object.assign(new Error('Missing publication column'), { code: 'P2022' });

function projectClient({ rows = [], columns = [], error } = {}) {
  const calls = [];
  return {
    calls,
    project: { findMany: async (args) => { calls.push(args); if (calls.length === 1 && error) throw error; return rows; } },
    $queryRaw: async () => columns.map((column_name) => ({ column_name })),
  };
}

function withEnvironment(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  return Promise.resolve().then(callback).finally(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
}

test('current schema filters public reads and retains real publication flags', async () => {
  const row = { id: 'stored-project', published: true, featured: true, status: 'research' };
  const db = projectClient({ rows: [row] });
  const result = await projects.readProjects(db, { locale: 'vi' });
  assert.deepEqual(db.calls[0].where, { locale: 'vi', published: true });
  assert.equal(result.rows[0], row);
  assert.equal(result.publicationControlsAvailable, true);
});

test('older schemas read existing rows without a migration or a snapshot', async () => {
  const db = projectClient({ rows: [{ id: 'legacy-row', title: 'Existing CMS content' }], error: missingColumn });
  const result = await projects.readProjects(db, { locale: 'vi' });
  assert.deepEqual(db.calls[1].where, { locale: 'vi' });
  assert.equal(db.calls[1].select.published, undefined);
  assert.deepEqual(result.rows[0], { id: 'legacy-row', title: 'Existing CMS content', published: true, featured: false, status: '' });
  assert.equal(result.publicationControlsAvailable, false);
});

test('partial migrations still filter drafts whenever published exists', async () => {
  const db = projectClient({ rows: [{ id: 'visible', published: true }], columns: ['published'], error: missingColumn });
  await projects.readProjects(db, { id: 'visible' });
  assert.deepEqual(db.calls[1].where, { id: 'visible', published: true });
  assert.equal(db.calls[1].select.published, true);
  assert.equal(db.calls[1].select.featured, undefined);
  assert.equal(db.calls[1].take, 1);
});

test('admin reads can include drafts, with no public filtering bypass', async () => {
  const db = projectClient({ rows: [{ id: 'draft', published: false }] });
  await projects.readProjects(db, { includeUnpublished: true });
  assert.equal(db.calls[0].where.published, undefined);
});

test('unrelated column errors and connection failures remain errors', async () => {
  const unrelated = projectClient({ columns: ['published', 'featured', 'status'], error: missingColumn });
  await assert.rejects(projects.readProjects(unrelated), (error) => error === missingColumn);
  assert.equal(unrelated.calls.length, 1);
  const outage = Object.assign(new Error('Unavailable'), { code: 'P1001' });
  await assert.rejects(projects.readProjects(projectClient({ error: outage })), (error) => error === outage);
});

function serverWith(db) {
  return loadSource('src/lib/cv/site-data-server.ts', {
    '@/lib/db': { db }, react: { cache: (fn) => fn }, './project-store': projects,
    './public-settings': settings, './public-snapshot.json': JSON.parse(readFileSync(new URL('../src/lib/cv/public-snapshot.json', import.meta.url), 'utf8')),
  });
}

test('English library keeps published Vietnamese projects when no translation exists', async () => withEnvironment({ DATABASE_URL: 'postgresql://localhost/test', CONTENT_PREVIEW_SNAPSHOT: undefined }, async () => {
  const calls = [];
  const client = {
    project: { findMany: async (args) => { calls.push(args); return args.where.locale === 'vi' ? [{ id: 'stored-project', title: 'Existing CMS project', updatedAt: new Date('2026-01-01') }] : []; } },
    post: { findMany: async () => [] }, profile: { findMany: async () => [] },
  };
  const result = await serverWith(client).getSiteData('en');
  assert.equal(result.projects[0].id, 'stored-project');
  assert.deepEqual(calls.map((call) => call.where), [{ locale: 'en', published: true }, { locale: 'vi', published: true }]);
}));

test('article date remains identical across server/browser host timezones at midnight', async () => {
  const dates = [];
  for (const TZ of ['UTC', 'Asia/Ho_Chi_Minh', 'America/Los_Angeles']) {
    await withEnvironment({ TZ }, () => { dates.push(formatContentDate('2025-10-17T17:08:00.000Z', 'vi')); });
  }
  assert.equal(new Set(dates).size, 1);
  assert.match(dates[0], /18/);
  assert.equal(formatContentDate('invalid', 'vi'), '');
});

test('a Project failure cannot discard published articles or expose their full bodies', async () => withEnvironment({ DATABASE_URL: 'postgresql://localhost/test', CONTENT_PREVIEW_SNAPSHOT: undefined }, async () => {
  const date = new Date('2026-01-02T00:00:00Z');
  const client = projectClient({ error: Object.assign(new Error('Unavailable'), { code: 'P1001' }) });
  let postArgs;
  client.post = { findMany: async (args) => { postArgs = args; return [{ id: 'article', locale: 'vi', slug: 'stored-article', title: 'Stored article', excerpt: 'Stored excerpt', published: true, category: 'AI', createdAt: date, updatedAt: date }]; } };
  client.profile = { findMany: async () => [] };
  const result = await serverWith(client).getSiteData('vi');
  assert.equal(result.errors.projects, 'unavailable');
  assert.equal(result.errors.posts, undefined);
  assert.equal(result.posts[0].slug, 'stored-article');
  assert.equal(result.posts[0].content, '');
  assert.equal(postArgs.select.content, undefined);
  assert.equal(postArgs.where.published, true);
}));

test('a missing database is reported, never silently replaced by local data', async () => withEnvironment({ DATABASE_URL: '', CONTENT_PREVIEW_SNAPSHOT: undefined, VERCEL: undefined }, async () => {
  const result = await serverWith({}).getSiteData();
  assert.equal(result.projects.length, 0);
  assert.equal(result.posts.length, 0);
  assert.deepEqual(result.errors, { projects: 'unavailable', posts: 'unavailable', settings: 'unavailable' });
  assert.equal(result.source, 'database');
}));

test('the explicit local snapshot switch cannot enable fallback on Vercel', async () => withEnvironment({ DATABASE_URL: '', CONTENT_PREVIEW_SNAPSHOT: '1', VERCEL: '1' }, async () => {
  const result = await serverWith({}).getSiteData();
  assert.equal(result.source, 'database');
  assert.equal(result.errors.posts, 'unavailable');
}));

test('legacy tutorial HTML stays in the rich text editor', () => {
  assert.equal(supportsTutorialEditor('<h2>Existing tutorial</h2><pre><code>preserve me</code></pre>'), false);
  assert.equal(supportsTutorialEditor('<!--TUTORIAL_DATA: invalid -->'), false);
  assert.equal(supportsTutorialEditor('<!--TUTORIAL_DATA: {"intro":"","objectives":[],"blocks":[]} -->'), true);
  assert.equal(supportsTutorialEditor(''), true);
});

test('Vietnamese search normalizes accents and the crossed d', () => {
  assert.equal(normalizeSearch('Mạch Điều Khiển'), 'mach dieu khien');
  assert.ok(normalizeSearch('Lượng tử hóa mô hình').includes(normalizeSearch('luong tu hoa')));
});

test('malformed project payloads are rejected before string methods or database writes', () => {
  for (const body of [null, [], 1, { title: 42 }, { published: 'false' }, { images: 'not a list' }]) assert.ok(projectPayloadError(body));
  assert.equal(projectPayloadError({ title: 'Stored title', published: false, images: [] }), undefined);
});
