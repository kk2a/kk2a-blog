import { describe, expect, it } from "vitest";
import { api } from "../src/index";
import type { PostRow, TopicRow } from "../src/types";

const meta: D1Meta & Record<string, unknown> = {
  duration: 0,
  size_after: 0,
  rows_read: 0,
  rows_written: 0,
  last_row_id: 0,
  changed_db: false,
  changes: 0,
};

const postRows: PostRow[] = [
  {
    id: 1,
    slug: "hello",
    title: "Hello",
    date: "2026-01-01T00:00:00+09:00",
    description: "Description",
    excerpt: "Excerpt",
    last_updated: null,
    content_hash: "hash",
    content_path: "content/blog/hello.mdx",
    status: "published",
    topic_name: "技術",
    topic_slug: "技術",
  },
];

const topics: TopicRow[] = [
  { id: 1, name: "技術", slug: "技術", post_count: 1 },
];

function createDatabase(): D1Database {
  const database = {
    prepare(query: string): D1PreparedStatement {
      return {
        bind(..._values: unknown[]) {
          return this;
        },
        async first<T>() {
          if (query.includes("COUNT(*)")) return { total: 1 } as T;
          return null;
        },
        async all<T>() {
          const results = query.includes("FROM topics") ? topics : postRows;
          return { success: true, meta, results: results as T[] };
        },
        async run<T>() {
          return { success: true, meta, results: [] as T[] };
        },
        async raw<T>() {
          return [] as T;
        },
      };
    },
    async batch() {
      return [];
    },
    async exec() {
      return { count: 0, duration: 0 };
    },
    withSession() {
      throw new Error("not implemented in test");
    },
    async dump() {
      return new ArrayBuffer(0);
    },
  } as D1Database;

  return database;
}

function createEnv(): Env {
  return { DB: createDatabase() } as Env;
}

describe("blog API", () => {
  it("returns published posts with unified topics", async () => {
    const response = await api(
      new Request("https://blog.test/api/v1/posts"),
      createEnv(),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      posts: [
        expect.objectContaining({
          slug: "hello",
          topics: [{ name: "技術", slug: "技術" }],
        }),
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
  });

  it("returns topics", async () => {
    const response = await api(
      new Request("https://blog.test/api/v1/topics"),
      createEnv(),
    );
    expect(await response.json()).toEqual({ topics });
  });

  it("rejects unknown API paths", async () => {
    const response = await api(
      new Request("https://blog.test/api/v1/unknown"),
      createEnv(),
    );
    expect(response.status).toBe(404);
  });
});
