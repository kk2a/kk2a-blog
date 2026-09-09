#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface PostMapping {
  id: number;
  slug: string;
  status: "draft" | "published";
}

interface TopicMapping {
  id: number;
  name: string;
  slug: string;
}

interface D1Result<T> {
  results: T[];
}

interface IdMappings {
  posts: PostMapping[];
  topics: TopicMapping[];
}

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, "data", "id-mappings.json");
const databaseLocation =
  process.env.D1_DATABASE_LOCATION === "remote" ? "--remote" : "--local";

function execute<T>(command: string): T[] {
  const output = execFileSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "execute",
      "kk2a-blog",
      databaseLocation,
      "--config",
      "wrangler.jsonc",
      `--command=${command}`,
      "--json",
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const jsonStart = output.indexOf("[");
  if (jsonStart < 0) {
    throw new Error(`wrangler d1 execute returned no JSON: ${output}`);
  }

  const response = JSON.parse(output.slice(jsonStart)) as D1Result<T>[];
  return response[0]?.results ?? [];
}

function main(): void {
  const mappings: IdMappings = {
    posts: execute<PostMapping>(
      "SELECT id, slug, status FROM posts ORDER BY id ASC",
    ),
    topics: execute<TopicMapping>(
      "SELECT id, name, slug FROM topics ORDER BY id ASC",
    ),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(`${outputPath}`, `${JSON.stringify(mappings, null, 2)}\n`);
  console.log(
    `Synced ${mappings.posts.length} post IDs and ${mappings.topics.length} topic IDs from ${databaseLocation === "--remote" ? "remote" : "local"} D1.`,
  );
}

main();
