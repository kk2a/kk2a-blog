import { env, exports as workerExports } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";

const publishedPosts = [
  {
    id: 1,
    slug: "first-post",
    title: "First post",
    date: "2026-01-03T00:00:00+09:00",
    description: "First description",
    excerpt: "First excerpt",
    lastUpdated: null,
    contentHash: "first-hash",
    contentPath: "content/blog/first-post.mdx",
  },
  {
    id: 2,
    slug: "second-post",
    title: "Second post",
    date: "2026-01-02T00:00:00+09:00",
    description: "Second description",
    excerpt: "Second excerpt",
    lastUpdated: null,
    contentHash: "second-hash",
    contentPath: "content/blog/second-post.mdx",
  },
  {
    id: 3,
    slug: "third-post",
    title: "Third post",
    date: "2026-01-01T00:00:00+09:00",
    description: "Third description",
    excerpt: "Third excerpt",
    lastUpdated: null,
    contentHash: "third-hash",
    contentPath: "content/blog/third-post.mdx",
  },
];

async function request(path: string, init?: RequestInit): Promise<Response> {
  return workerExports.default.fetch(
    new Request(`https://blog.test${path}`, init),
  );
}

async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

beforeAll(async () => {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM post_topics"),
    env.DB.prepare("DELETE FROM posts"),
    env.DB.prepare("DELETE FROM topics"),
    ...publishedPosts.map((post) =>
      env.DB.prepare(
        "INSERT INTO posts (id, slug, title, date, description, excerpt, last_updated, content_hash, content_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(
        post.id,
        post.slug,
        post.title,
        post.date,
        post.description,
        post.excerpt,
        post.lastUpdated,
        post.contentHash,
        post.contentPath,
        "published",
      ),
    ),
    env.DB.prepare(
      "INSERT INTO posts (id, slug, title, date, description, excerpt, last_updated, content_hash, content_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(
      4,
      "draft-post",
      "Draft post",
      "2025-12-31T00:00:00+09:00",
      "Draft description",
      "Draft excerpt",
      null,
      "draft-hash",
      "content/blog/draft-post.mdx",
      "draft",
    ),
    env.DB.prepare("INSERT INTO topics (id, name, slug) VALUES (?, ?, ?)").bind(
      1,
      "Cloudflare",
      "cloudflare",
    ),
    env.DB.prepare("INSERT INTO topics (id, name, slug) VALUES (?, ?, ?)").bind(
      2,
      "TypeScript",
      "typescript",
    ),
    env.DB.prepare("INSERT INTO topics (id, name, slug) VALUES (?, ?, ?)").bind(
      3,
      "Draft topic",
      "draft-topic",
    ),
    env.DB.prepare(
      "INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?)",
    ).bind(1, 1),
    env.DB.prepare(
      "INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?)",
    ).bind(1, 2),
    env.DB.prepare(
      "INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?)",
    ).bind(2, 2),
    env.DB.prepare(
      "INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?)",
    ).bind(4, 3),
  ]);
});

describe("D1-backed blog API", () => {
  it("lists only published posts with pagination and topics", async () => {
    const response = await request("/api/v1/posts?limit=1&offset=1");

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await json(response)).toEqual({
      posts: [
        expect.objectContaining({
          id: 2,
          slug: "second-post",
          topics: [{ name: "TypeScript", slug: "typescript" }],
        }),
      ],
      total: 3,
      limit: 1,
      offset: 1,
    });
  });

  it("filters posts by topic and excludes draft posts", async () => {
    const response = await request("/api/v1/posts?topic=typescript");

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({
      posts: [
        expect.objectContaining({ slug: "first-post" }),
        expect.objectContaining({ slug: "second-post" }),
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });

    const draftResponse = await request("/api/v1/posts/draft-post");
    expect(draftResponse.status).toBe(404);
  });

  it("lists topics using published post counts", async () => {
    const response = await request("/api/v1/topics");

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({
      topics: [
        { id: 1, name: "Cloudflare", slug: "cloudflare", post_count: 1 },
        { id: 2, name: "TypeScript", slug: "typescript", post_count: 2 },
      ],
    });
  });

  it("supports topic routes and published post lookup", async () => {
    const topicResponse = await request("/api/v1/topics/typescript/posts");
    expect(topicResponse.status).toBe(200);
    expect(await json(topicResponse)).toEqual({
      topic: "typescript",
      posts: [
        expect.objectContaining({ slug: "first-post" }),
        expect.objectContaining({ slug: "second-post" }),
      ],
      total: 2,
    });

    const postResponse = await request("/api/v1/posts/first-post");
    expect(postResponse.status).toBe(200);
    expect(await json(postResponse)).toEqual({
      post: expect.objectContaining({
        slug: "first-post",
        topics: [
          { name: "Cloudflare", slug: "cloudflare" },
          { name: "TypeScript", slug: "typescript" },
        ],
      }),
    });
  });

  it("returns CORS preflight and not-found responses", async () => {
    const optionsResponse = await request("/api/v1/posts", {
      method: "OPTIONS",
    });
    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );

    const unknownResponse = await request("/api/v1/unknown");
    expect(unknownResponse.status).toBe(404);
    expect(await json(unknownResponse)).toEqual({ error: "Not Found" });
  });
});
