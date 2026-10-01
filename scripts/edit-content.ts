#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeTopics,
  renderContentEditSql,
  type EditableStatus,
  type ContentEdit,
} from "./lib/content-edit";

interface WranglerResult<T> {
  results: T[];
}

interface PostCheck {
  id: number;
  status: EditableStatus;
}

interface TopicCheck {
  name: string;
}

interface Options extends ContentEdit {
  location: "local" | "remote";
  dryRun: boolean;
  yes: boolean;
  backupPath?: string;
}

const projectRoot = process.cwd();
const databaseName = "kk2a-blog";

function usage(): string {
  return `Usage:
  pnpm content:edit -- --slug <slug> [--status draft|published] [--topic <topic> ...]

Options:
  --local                 Edit the local D1 database (default)
  --remote                Edit the remote D1 database
  --slug <slug>           Target post slug
  --status <status>       Set draft or published
  --publish               Set status to published
  --unpublish             Set status to draft
  --topic <topic>         Replace topics; repeat for multiple topics
  --clear-topics          Remove all topics from the post
  --backup-path <path>    Write the pre-update export to this path
  --dry-run               Print SQL without exporting or changing D1
  --yes                   Required for non-dry-run remote edits
  --help                  Show this help`;
}

function requireValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseStatus(value: string): EditableStatus {
  if (value === "draft" || value === "published") return value;
  throw new Error(`Invalid status: ${value}`);
}

function parseArgs(args: string[]): Options {
  let location: Options["location"] = "local";
  let slug: string | undefined;
  let status: EditableStatus | undefined;
  let topics: string[] | undefined;
  let dryRun = false;
  let yes = false;
  let backupPath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case "--":
        break;
      case "--local":
        location = "local";
        break;
      case "--remote":
        location = "remote";
        break;
      case "--slug":
        slug = requireValue(args, index, argument);
        index += 1;
        break;
      case "--status":
        status = parseStatus(requireValue(args, index, argument));
        index += 1;
        break;
      case "--publish":
        status = "published";
        break;
      case "--unpublish":
        status = "draft";
        break;
      case "--topic":
        topics ??= [];
        topics.push(requireValue(args, index, argument));
        index += 1;
        break;
      case "--clear-topics":
        topics = [];
        break;
      case "--backup-path":
        backupPath = requireValue(args, index, argument);
        index += 1;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--yes":
        yes = true;
        break;
      case "--help":
        console.log(usage());
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown option: ${argument}\n\n${usage()}`);
    }
  }

  if (!slug) throw new Error(`--slug is required\n\n${usage()}`);
  if (status === undefined && topics === undefined) {
    throw new Error(
      "At least one of --status, --publish, --unpublish, --topic, or --clear-topics is required",
    );
  }
  if (location === "remote" && !dryRun && !yes) {
    throw new Error("Remote edits require --yes. Use --dry-run to preview SQL.");
  }

  return {
    slug,
    status,
    topics,
    location,
    dryRun,
    yes,
    backupPath,
  };
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function runWrangler(args: string[], stdio: "inherit" | "pipe" = "inherit"):
  | string
  | undefined {
  const output = execFileSync(
    "pnpm",
    ["exec", "wrangler", ...args],
    stdio === "pipe"
      ? { cwd: projectRoot, encoding: "utf8" }
      : { cwd: projectRoot, stdio: "inherit" },
  );
  return typeof output === "string" ? output : undefined;
}

function executeJson<T>(options: Options, command: string): T[] {
  const output = runWrangler(
    [
      "d1",
      "execute",
      databaseName,
      `--${options.location}`,
      "--config",
      "wrangler.jsonc",
      `--command=${command}`,
      "--json",
    ],
    "pipe",
  );
  const jsonStart = output?.indexOf("[") ?? -1;
  if (jsonStart < 0 || !output) {
    throw new Error(`wrangler d1 execute returned no JSON: ${output ?? ""}`);
  }

  const response = JSON.parse(output.slice(jsonStart)) as WranglerResult<T>[];
  return response[0]?.results ?? [];
}

function getBackupPath(options: Options): string {
  if (options.backupPath) return path.resolve(projectRoot, options.backupPath);

  const timestamp = new Date()
    .toISOString()
    .replaceAll(/[-:]/g, "")
    .replace(".", "-");
  return path.join(
    projectRoot,
    ".local",
    "d1-backups",
    `${databaseName}-${timestamp}.sql`,
  );
}

function exportBackup(options: Options): string {
  const backupPath = getBackupPath(options);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  runWrangler([
    "d1",
    "export",
    databaseName,
    `--${options.location}`,
    "--config",
    "wrangler.jsonc",
    `--output=${backupPath}`,
    "--skip-confirmation",
  ]);
  return backupPath;
}

function executeSql(options: Options, sql: string): void {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "kk2a-blog-content-edit-"),
  );
  const sqlPath = path.join(temporaryDirectory, "content-edit.sql");

  try {
    fs.writeFileSync(sqlPath, sql, "utf8");
    runWrangler([
      "d1",
      "execute",
      databaseName,
      `--${options.location}`,
      "--config",
      "wrangler.jsonc",
      `--file=${sqlPath}`,
      "--yes",
    ]);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function verify(options: Options): void {
  const posts = executeJson<PostCheck>(
    options,
    `SELECT id, status FROM posts WHERE slug = ${sqlString(options.slug)}`,
  );
  const post = posts[0];
  if (!post) throw new Error(`Post not found: ${options.slug}`);
  if (options.status !== undefined && post.status !== options.status) {
    throw new Error(
      `Status verification failed: expected ${options.status}, got ${post.status}`,
    );
  }

  if (options.topics !== undefined) {
    const expected = normalizeTopics(options.topics).sort();
    const actual = executeJson<TopicCheck>(
      options,
      `SELECT t.name FROM topics AS t INNER JOIN post_topics AS pt ON pt.topic_id = t.id WHERE pt.post_id = ${post.id} ORDER BY t.name`,
    )
      .map((topic) => topic.name)
      .sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Topic verification failed: expected ${expected.join(", ")}, got ${actual.join(", ")}`,
      );
    }
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const edit: ContentEdit = {
    slug: options.slug,
    status: options.status,
    topics: options.topics,
  };
  const sql = renderContentEditSql(edit);

  if (options.dryRun) {
    process.stdout.write(sql);
    return;
  }

  const backupPath = exportBackup(options);
  executeSql(options, sql);
  verify(options);
  console.log(`Updated ${options.slug} in ${options.location} D1.`);
  console.log(`Backup: ${backupPath}`);
}

main();
