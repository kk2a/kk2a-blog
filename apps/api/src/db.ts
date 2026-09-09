import type { Post, PostRow, TopicRow } from "./types";

const postSelect = `
  SELECT
    p.id, p.slug, p.title, p.date, p.description, p.excerpt,
    p.last_updated, p.content_hash, p.content_path, p.status,
    t.name AS topic_name, t.slug AS topic_slug
  FROM posts AS p
  LEFT JOIN post_topics AS pt ON pt.post_id = p.id
  LEFT JOIN topics AS t ON t.id = pt.topic_id
`;

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

export async function listPosts(
  db: D1Database,
  options: { topic?: string; limit: number; offset: number },
): Promise<{ posts: Post[]; total: number }> {
  const conditions = ["p.status = 'published'"];
  const params: string[] = [];

  if (options.topic) {
    conditions.push(
      "EXISTS (SELECT 1 FROM post_topics AS filter_pt JOIN topics AS filter_t ON filter_t.id = filter_pt.topic_id WHERE filter_pt.post_id = p.id AND filter_t.slug = ?)",
    );
    params.push(options.topic);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const count = await db
    .prepare(`SELECT COUNT(*) AS total FROM posts AS p ${where}`)
    .bind(...params)
    .first<{ total: number }>();
  const rows = await db
    .prepare(
      `${postSelect} ${where} ORDER BY p.date DESC, p.slug ASC, t.name ASC LIMIT ? OFFSET ?`,
    )
    .bind(...params, options.limit, options.offset)
    .all<PostRow>();

  const posts = new Map<number, PostRow[]>();
  for (const row of rows.results) {
    const existing = posts.get(row.id) ?? [];
    existing.push(row);
    posts.set(row.id, existing);
  }

  return {
    posts: [...posts.values()].flatMap((postRows) => {
      const post = toPost(postRows);
      return post ? [post] : [];
    }),
    total: count?.total ?? 0,
  };
}

export async function findPost(
  db: D1Database,
  slug: string,
): Promise<Post | null> {
  const rows = await db
    .prepare(`${postSelect} WHERE p.status = 'published' AND p.slug = ?`)
    .bind(slug)
    .all<PostRow>();
  return toPost(rows.results);
}

export async function listTopics(db: D1Database): Promise<TopicRow[]> {
  const rows = await db
    .prepare(
      `
        SELECT t.id, t.name, t.slug, COUNT(p.id) AS post_count
        FROM topics AS t
        LEFT JOIN post_topics AS pt ON pt.topic_id = t.id
        LEFT JOIN posts AS p ON p.id = pt.post_id AND p.status = 'published'
        GROUP BY t.id
        HAVING post_count > 0
        ORDER BY t.name COLLATE NOCASE ASC
      `,
    )
    .all<TopicRow>();
  return rows.results;
}
