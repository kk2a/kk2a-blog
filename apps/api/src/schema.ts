import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    description: text("description").notNull(),
    excerpt: text("excerpt").notNull(),
    lastUpdated: text("last_updated"),
    contentHash: text("content_hash").notNull(),
    contentPath: text("content_path").notNull(),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("published"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check("posts_status_check", sql`${table.status} IN ('draft', 'published')`),
    index("idx_posts_date").on(table.date),
    index("idx_posts_status_date").on(table.status, table.date),
  ],
);

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const postTopics = sqliteTable(
  "post_topics",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.topicId] }),
    index("idx_post_topics_topic_id").on(table.topicId, table.postId),
  ],
);
