import { and, asc, count, desc, eq, exists, gt, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { posts, postTopics, topics } from "./schema";
import type { Post, PostRow, TopicRow } from "./types";

const postColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  date: posts.date,
  description: posts.description,
  excerpt: posts.excerpt,
  last_updated: posts.lastUpdated,
  content_hash: posts.contentHash,
  content_path: posts.contentPath,
  status: posts.status,
  topic_name: topics.name,
  topic_slug: topics.slug,
};

function toPost(rows: PostRow[]): Post | null {
  const first = rows[0];
  if (!first) return null;

  return {
    id: first.id,
    slug: first.slug,
    title: first.title,
    date: first.date,
    description: first.description,
    excerpt: first.excerpt,
    lastUpdated: first.last_updated,
    contentHash: first.content_hash,
    contentPath: first.content_path,
    topics: rows.flatMap((row) =>
      row.topic_name && row.topic_slug
        ? [{ name: row.topic_name, slug: row.topic_slug }]
        : [],
    ),
  };
}

function toPostRows(
  rows: Array<{
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
  }>,
): PostRow[] {
  return rows;
}

export async function listPosts(
  database: D1Database,
  options: { topic?: string; limit: number; offset: number },
): Promise<{ posts: Post[]; total: number }> {
  const db = drizzle(database);
  const topicFilter = options.topic
    ? exists(
        db
          .select({ postId: postTopics.postId })
          .from(postTopics)
          .innerJoin(topics, eq(topics.id, postTopics.topicId))
          .where(
            and(
              eq(postTopics.postId, posts.id),
              eq(topics.slug, options.topic),
            ),
          ),
      )
    : undefined;
  const where = and(eq(posts.status, "published"), topicFilter);

  const [countRow] = await db
    .select({ total: count(posts.id) })
    .from(posts)
    .where(where);
  const selectedPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(where)
    .orderBy(desc(posts.date), asc(posts.slug))
    .limit(options.limit)
    .offset(options.offset);
  const selectedPostIds = selectedPosts.map((post) => post.id);
  if (selectedPostIds.length === 0) {
    return { posts: [], total: countRow?.total ?? 0 };
  }

  const rows = await db
    .select(postColumns)
    .from(posts)
    .leftJoin(postTopics, eq(postTopics.postId, posts.id))
    .leftJoin(topics, eq(topics.id, postTopics.topicId))
    .where(
      and(eq(posts.status, "published"), inArray(posts.id, selectedPostIds)),
    )
    .orderBy(desc(posts.date), asc(posts.slug), asc(topics.name));

  const groupedPosts = new Map<number, PostRow[]>();
  for (const row of toPostRows(rows)) {
    const existing = groupedPosts.get(row.id) ?? [];
    existing.push(row);
    groupedPosts.set(row.id, existing);
  }

  return {
    posts: [...groupedPosts.values()].flatMap((postRows) => {
      const post = toPost(postRows);
      return post ? [post] : [];
    }),
    total: countRow?.total ?? 0,
  };
}

export async function findPost(
  database: D1Database,
  slug: string,
): Promise<Post | null> {
  const db = drizzle(database);
  const rows = await db
    .select(postColumns)
    .from(posts)
    .leftJoin(postTopics, eq(postTopics.postId, posts.id))
    .leftJoin(topics, eq(topics.id, postTopics.topicId))
    .where(and(eq(posts.status, "published"), eq(posts.slug, slug)))
    .orderBy(asc(topics.name));

  return toPost(toPostRows(rows));
}

export async function listTopics(database: D1Database): Promise<TopicRow[]> {
  const db = drizzle(database);
  const postCount = count(posts.id);
  const rows = await db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      post_count: postCount,
    })
    .from(topics)
    .leftJoin(postTopics, eq(postTopics.topicId, topics.id))
    .leftJoin(
      posts,
      and(eq(posts.id, postTopics.postId), eq(posts.status, "published")),
    )
    .groupBy(topics.id)
    .having(gt(postCount, 0))
    .orderBy(asc(topics.name));

  return rows;
}
