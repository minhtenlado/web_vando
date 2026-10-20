import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const migration = '20261020000000_project_publication_controls';

// The approved rollout only adds these three columns; it never updates CMS rows.
export async function ensurePublicationColumns(client) {
  return client.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL lock_timeout = '10s'`;
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(20261020)::text`;
    const columns = await tx.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'Project'
      AND column_name IN ('published', 'featured', 'status')
    `;
    const available = new Set(columns.map((column) => column.column_name));
    if (available.size === 3) return { changed: false };

    const readRows = () => tx.$queryRaw`
      SELECT to_jsonb(p) - ARRAY['published', 'featured', 'status'] AS row
      FROM "Project" p ORDER BY id
    `;
    const before = await readRows();
    if (!available.has('published')) await tx.$executeRaw`ALTER TABLE "Project" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true`;
    if (!available.has('featured')) await tx.$executeRaw`ALTER TABLE "Project" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false`;
    if (!available.has('status')) await tx.$executeRaw`ALTER TABLE "Project" ADD COLUMN "status" TEXT NOT NULL DEFAULT ''`;
    const after = await readRows();
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Project row verification failed; transaction rolled back.');
    return { changed: true, preservedRows: before.length };
  }, { maxWait: 10000, timeout: 30000 });
}

async function recorded(client) {
  const [table] = await client.$queryRaw`SELECT to_regclass(format('%I._prisma_migrations', current_schema()))::text AS name`;
  if (!table?.name) return false;
  const rows = await client.$queryRaw`SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = ${migration} AND finished_at IS NOT NULL AND rolled_back_at IS NULL`;
  return rows.length > 0;
}

async function main() {
  if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') {
    console.log('[schema] Local/preview build: production rollout skipped.');
    return;
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[SENSITIVE]')) throw new Error('Production database is unavailable.');
  const client = new PrismaClient({ log: [] });
  try {
    const result = await ensurePublicationColumns(client);
    if (!await recorded(client)) {
      // Register only the migration whose DDL was verified above, including existing databases.
      const command = spawnSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'resolve', '--applied', migration], { encoding: 'utf8' });
      if (command.status !== 0 && !await recorded(client)) throw new Error('Could not record the approved migration.');
    }
    console.log('[schema] Publication controls ready.', result.changed ? `${result.preservedRows} existing rows preserved.` : 'No schema change needed.');
  } finally { await client.$disconnect(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => { console.error('[schema] Approved additive rollout failed; build stopped. No credentials are logged.'); process.exitCode = 1; });
}
