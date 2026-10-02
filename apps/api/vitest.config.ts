import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

const projectRoot = path.resolve(import.meta.dirname, "../..");

function hasSqlStatement(query: string): boolean {
  return query.replaceAll(/--[^\n]*(?:\n|$)/g, "").trim().length > 0;
}

export default defineConfig({
  plugins: [
    cloudflareTest(async () => {
      const migrations = await readD1Migrations(
        path.join(projectRoot, "apps/api/migrations"),
      );

      return {
        wrangler: {
          configPath: path.join(projectRoot, "wrangler.jsonc"),
        },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations
              .map((migration) => ({
                ...migration,
                queries: migration.queries.filter(hasSqlStatement),
              }))
              .filter((migration) => migration.queries.length > 0),
          },
        },
      };
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
});
