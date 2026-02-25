import type { Config } from "drizzle-kit";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const contents = readFileSync(envPath, "utf8");
    const line = contents
      .split(/\r?\n/)
      .find((l) => l.trimStart().startsWith("DATABASE_URL="));

    if (!line) return undefined;

    const value = line.slice("DATABASE_URL=".length).trim();
    return value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  } catch {
    return undefined;
  }
}

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
