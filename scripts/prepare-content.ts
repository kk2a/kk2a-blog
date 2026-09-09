#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const location =
  process.env.D1_DATABASE_LOCATION === "remote" ? "remote" : "local";

function runPnpm(args: string[]): void {
  execFileSync("pnpm", args, { stdio: "inherit" });
}

runPnpm([`db:migrate:${location}`]);
runPnpm(["exec", "tsx", "scripts/sync-content.ts"]);
runPnpm(["sync-id-mappings"]);
