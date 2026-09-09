#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assignPostIds,
  type ExistingPost,
  readPosts,
  renderSyncSql,
  samePost,
} from "./lib/content-sync";

interface WranglerResult<T> {
  results: T[];
}

const projectRoot = process.cwd();
const contentDirectory = path.join(projectRoot, "content", "blog");
const databaseLocation =
  process.env.D1_DATABASE_LOCATION === "remote" ? "--remote" : "--local";

function executeJson<T>(command: string): T[] {
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

  const response = JSON.parse(output.slice(jsonStart)) as WranglerResult<T>[];
  return response[0]?.results ?? [];
}

function currentCommit(): string {
  if (process.env.WORKERS_CI_COMMIT_SHA) {
    return process.env.WORKERS_CI_COMMIT_SHA;
  }

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: projectRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function executeFile(filePath: string): void {
  execFileSync(
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
      `--file=${filePath}`,
    ],
    { cwd: projectRoot, stdio: ["ignore", "ignore", "inherit"] },
  );
}

function main(): void {
  const posts = readPosts(contentDirectory);
  const existingPosts = executeJson<ExistingPost>(
    "SELECT id, slug, title, date, description, excerpt, last_updated, content_hash, status FROM posts ORDER BY id ASC",
  );
  const existingBySlug = new Map(
    existingPosts.map((post) => [post.slug, post]),
  );
  const postIds = assignPostIds(posts, existingPosts);
  const changedPosts = posts.filter((post) => {
    const existing = existingBySlug.get(post.slug);
    const assignedId = postIds.get(post.slug);
    return (
      !existing ||
      !samePost(post, existing) ||
      (assignedId !== undefined && assignedId !== existing.id)
    );
  });
  const deletedPosts = existingPosts.filter(
    (post) => !posts.some((current) => current.slug === post.slug),
  );
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "kk2a-blog-content-sync-"),
  );
  const sqlPath = path.join(temporaryDirectory, "content-sync.sql");

  try {
    fs.writeFileSync(
      sqlPath,
      renderSyncSql(posts, existingPosts, currentCommit()),
      "utf8",
    );
    executeFile(sqlPath);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }

  console.log(
    `Synchronized ${posts.length} posts (${changedPosts.length} changed, ${deletedPosts.length} deleted) and ${new Set(posts.flatMap((post) => post.topics)).size} topics to ${databaseLocation === "--remote" ? "remote" : "local"} D1.`,
  );
}

main();
