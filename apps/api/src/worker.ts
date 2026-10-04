import { findPost, listPosts, listTopics } from "./db";

const jsonHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300",
  "Content-Type": "application/json; charset=utf-8",
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(jsonHeaders);
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return Response.json(data, {
    ...init,
    headers,
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function api(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }
  if (request.method !== "GET") {
    return withCors(json({ error: "Method Not Allowed" }, { status: 405 }));
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 3 && segments[0] === "api" && segments[1] === "v1") {
    if (segments[2] === "topics") {
      return withCors(json({ topics: await listTopics(env.DB) }));
    }
    if (segments[2] === "posts") {
      const limit = Math.min(
        parsePositiveInt(url.searchParams.get("limit"), 20),
        100,
      );
      const offset = parsePositiveInt(url.searchParams.get("offset"), 0);
      const result = await listPosts(env.DB, {
        topic: url.searchParams.get("topic") ?? undefined,
        limit,
        offset,
      });
      return withCors(json({ ...result, limit, offset }));
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "posts"
  ) {
    const post = await findPost(env.DB, decodeURIComponent(segments[3]));
    return withCors(
      post
        ? json({ post })
        : json({ error: "Post not found" }, { status: 404 }),
    );
  }

  if (
    segments.length === 5 &&
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "topics" &&
    segments[4] === "posts"
  ) {
    const topic = decodeURIComponent(segments[3]);
    const result = await listPosts(env.DB, { topic, limit: 100, offset: 0 });
    return withCors(json({ topic, ...result }));
  }

  return withCors(json({ error: "Not Found" }, { status: 404 }));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await api(request, env);
      } catch (error) {
        console.error("API request failed", error);
        return withCors(
          json({ error: "Internal Server Error" }, { status: 500 }),
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

export { api };
