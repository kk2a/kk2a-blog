import fs from "node:fs";
import path from "node:path";

export interface PostMapping {
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

export interface TopicMapping {
  id: number;
  name: string;
  slug: string;
}

interface IdMappings {
  posts: PostMapping[];
  topics: TopicMapping[];
}

let cachedMappings: IdMappings | undefined;

function loadMappings(): IdMappings {
  if (cachedMappings) return cachedMappings;

  const filePath = path.join(process.cwd(), "data", "id-mappings.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `D1 IDマッピングのスナップショットがありません: ${filePath}. pnpm build または pnpm dev を実行してください。`,
    );
  }

  cachedMappings = JSON.parse(fs.readFileSync(filePath, "utf8")) as IdMappings;
  return cachedMappings;
}

export function getPostId(slug: string): number | undefined {
  return loadMappings().posts.find((post) => post.slug === slug)?.id;
}

export function getPostMapping(slug: string): PostMapping | undefined {
  return loadMappings().posts.find((post) => post.slug === slug);
}

export function getPostSlug(id: number): string | undefined {
  return loadMappings().posts.find((post) => post.id === id)?.slug;
}

export function getPostStatus(
  slug: string,
): "draft" | "published" | undefined {
  return loadMappings().posts.find((post) => post.slug === slug)?.status;
}

export function getAllPostIds(): number[] {
  return loadMappings().posts.map((post) => post.id);
}

export function getTopicId(name: string): number | undefined {
  return loadMappings().topics.find((topic) => topic.name === name)?.id;
}

export function getTopicName(id: number): string | undefined {
  return loadMappings().topics.find((topic) => topic.id === id)?.name;
}

export function getAllTopicIds(): number[] {
  return loadMappings().topics.map((topic) => topic.id);
}

export function getAllTopicNames(): string[] {
  return loadMappings().topics.map((topic) => topic.name);
}

export function getTopicMappings(): TopicMapping[] {
  return loadMappings().topics;
}
