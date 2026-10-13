import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Vercel manages its own output. Local standalone builds need static assets copied.
if (!process.env.VERCEL && existsSync(".next/standalone")) {
  for (const source of [".next/static", "public"]) {
    if (!existsSync(source)) continue;
    const target = join(".next/standalone", source);
    mkdirSync(target, { recursive: true });
    cpSync(source, target, { recursive: true });
  }
}
