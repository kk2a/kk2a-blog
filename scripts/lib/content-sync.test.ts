import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assignPostIds,
  type CurrentPost,
  type ExistingPost,
  readPosts,
  renderSyncSql,
} from "./content-sync";

const temporaryDirectories: string[] = [];

function currentPost(slug: string, topics: string[] = []): CurrentPost {
  return {
    slug,
    title: slug,
    date: "2026-01-01T00:00:00+09:00",
    description: "description",
    excerpt: "excerpt",
    lastUpdated: null,
    contentHash: "hash",
    topics,
    status: slug.startsWith("test-") ? "draft" : "published",
  };
}

function existingPost(slug: string, id: number): ExistingPost {
  const post = currentPost(slug);
  return {
    id,
    slug,
    title: post.title,
    date: post.date,
    description: post.description,
    excerpt: post.excerpt,
    last_updated: post.lastUpdated,
    content_hash: post.contentHash,
    status: post.status,
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("content synchronization", () => {
  it("extracts and merges topics from blog frontmatter", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "kk2a-blog-content-sync-test-"),
    );
    temporaryDirectories.push(directory);
    fs.writeFileSync(
      path.join(directory, "hello.mdx"),
      `---
title: Hello
date: "2026-01-01T00:00:00+09:00"
description: Description
excerpt: Excerpt
contentHash: hash
categories: [技術, MDX]
tags: [MDX, SQLite]
---

本文
`,
      "utf8",
    );

    expect(readPosts(directory)).toEqual([
      expect.objectContaining({
        slug: "hello",
        title: "Hello",
        topics: ["技術", "MDX", "SQLite"],
        status: "published",
      }),
    ]);
  });

  it("assigns negative IDs to new tests and preserves existing negative IDs", () => {
    const posts = [
      currentPost("hello"),
      currentPost("test-existing"),
      currentPost("test-new"),
    ];
    const ids = assignPostIds(posts, [
      existingPost("hello", 42),
      existingPost("test-existing", -7),
    ]);

    expect(ids).toEqual(
      new Map([
        ["test-existing", -7],
        ["test-new", -8],
      ]),
    );
  });

  it("moves an existing positive test ID to a negative ID", () => {
    expect(
      assignPostIds(
        [currentPost("test-migrated")],
        [existingPost("test-migrated", 7)],
      ),
    ).toEqual(new Map([["test-migrated", -1]]));
  });

  it("generates SQL with automatic regular IDs and explicit test IDs", () => {
    const sql = renderSyncSql(
      [currentPost("hello", ["O'Reilly"]), currentPost("test-sample", ["MDX"])],
      [],
      "commit",
    );

    expect(sql).toContain(
      "INSERT INTO posts (slug, title, date, description, excerpt, last_updated, content_hash, content_path, status)",
    );
    expect(sql).toContain(
      "INSERT INTO posts (id, slug, title, date, description, excerpt, last_updated, content_hash, content_path, status)",
    );
    expect(sql).toContain("'O''Reilly'");
    expect(sql).toContain("'MDX'");
  });
});
