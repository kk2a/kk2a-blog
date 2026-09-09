export interface PostRow {
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

export interface TopicRow {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  excerpt: string;
  lastUpdated: string | null;
  contentHash: string;
  contentPath: string;
  topics: Array<{ name: string; slug: string }>;
}
