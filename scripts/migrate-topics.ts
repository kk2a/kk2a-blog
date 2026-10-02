#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { migrateTopics } from "./lib/topics-migration";

const blogDirectory = path.join(process.cwd(), "content", "blog");
const checkOnly = process.argv.includes("--check");
const files = fs
  .readdirSync(blogDirectory)
  .filter((fileName) => fileName.endsWith(".mdx"))
  .sort();
const pendingFiles: string[] = [];

for (const fileName of files) {
  const filePath = path.join(blogDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const migrated = migrateTopics(source);
  if (migrated === source) continue;

  pendingFiles.push(fileName);
  if (!checkOnly) {
    fs.writeFileSync(filePath, migrated, "utf8");
  }
}

if (checkOnly && pendingFiles.length > 0) {
  console.error(
    `Legacy categories/tags fields found in: ${pendingFiles.join(", ")}`,
  );
  process.exit(1);
}

console.log(
  checkOnly
    ? "All blog posts use the topics frontmatter."
    : `Migrated ${pendingFiles.length} blog post(s) to topics.`,
);
