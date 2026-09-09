#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface PostMapping {
  id: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  excerpt: string;
  last_updated: string | null;
  content_hash: string;
  content_path: string;
  status: "draft" | "published";
  topics: Array<{ name: string; slug: string }>;
}

interface PostMappingRow {
  id: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  excerpt: string;
  last_updated: string | null;
  content_hash: string;
  content_path: string;
  status: "draft" | "published";
  topic_name: string | null;
  topic_slug: string | null;
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

function loadPosts(): PostMapping[] {
  const rows = execute<PostMappingRow>(
    "SELECT p.id, p.slug, p.title, p.date, p.description, p.excerpt, p.last_updated, p.content_hash, p.content_path, p.status, t.name AS topic_name, t.slug AS topic_slug FROM posts AS p LEFT JOIN post_topics AS pt ON pt.post_id = p.id LEFT JOIN topics AS t ON t.id = pt.topic_id ORDER BY p.id ASC, t.name ASC",
  );
  const posts = new Map<number, PostMapping>();

  for (const row of rows) {
    const post = posts.get(row.id) ?? {
      id: row.id,
      slug: row.slug,
      title: row.title,
      date: row.date,
      description: row.description,
      excerpt: row.excerpt,
      last_updated: row.last_updated,
      content_hash: row.content_hash,
      content_path: row.content_path,
      status: row.status,
      topics: [],
    };
    if (row.topic_name && row.topic_slug) {
      post.topics.push({ name: row.topic_name, slug: row.topic_slug });
    }
    posts.set(row.id, post);
  }

  return [...posts.values()];
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
    posts: loadPosts(),
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
