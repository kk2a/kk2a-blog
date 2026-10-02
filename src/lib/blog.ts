import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  getAllPostIds,
  getAllTopicNames,
  getPostId,
  getPostMapping,
  getPostSlug,
  getPostStatus,
} from "./id-mapping";
import { getPublishedIds } from "./publication";

const contentDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  lastUpdated?: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  topics: string[];
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const allPosts = fileNames
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, "");
      return getPostBySlug(slug);
    })
    .filter((post) => post !== null)
    .sort((a, b) => {
      // 日付で比較（古い順）
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      // 日付が同じ場合はスラグの辞書順
      return a.slug.localeCompare(b.slug);
    });

  return allPosts;
}

// 一覧表示用: テスト記事を除外
export function getPublicPosts(): BlogPost[] {
  return getAllPosts().filter((post) => post.status === "published");
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContents);
  const mapping = getPostMapping(slug);
  if (!mapping) {
    throw new Error(`D1 content mapping not found for post: ${slug}`);
  }

  return {
    slug,
    title: mapping.title,
    date: mapping.date,
    lastUpdated: mapping.last_updated ?? undefined,
    excerpt: mapping.excerpt,
    content,
    status: mapping.status,
    topics: mapping.topics.map((topic) => topic.name),
  };
}

export function getPublicPostsByTopic(topic: string): BlogPost[] {
  return getPublicPosts().filter((post) => post.topics.includes(topic));
}

export function getAllPostsByTopic(topic: string): BlogPost[] {
  return getAllPosts().filter((post) => post.topics.includes(topic));
}

export function getPublicTopics(): string[] {
  return getAllTopics().filter((topic) =>
    getPublicPosts().some((post) => post.topics.includes(topic)),
  );
}

export function getAllTopics(): string[] {
  return getAllTopicNames();
}

// ブログID管理のヘルパー関数
export function getBlogId(slug: string): number {
  const id = getPostId(slug);
  if (id === undefined) throw new Error(`ブログIDが見つかりません: ${slug}`);
  return id;
}

export function getBlogSlugFromId(id: number): string | undefined {
  return getPostSlug(id);
}

// 静的生成用のブログID一覧を取得
export function getAllBlogIds(): number[] {
  return getAllPostIds();
}

export function getRegularBlogIds(): number[] {
  return getPublishedIds(
    getAllPostIds().flatMap((id) => {
      const slug = getPostSlug(id);
      const status = slug ? getPostStatus(slug) : undefined;
      return status ? [{ id, status }] : [];
    }),
  );
}

export function getTestBlogIds(): number[] {
  return getAllPostIds()
    .filter((id) => {
      const slug = getPostSlug(id);
      return slug ? getPostStatus(slug) === "draft" : false;
    })
    .sort((a, b) => a - b);
}

// ブログ記事をIDで取得
export function getBlogPostById(id: number): BlogPost | null {
  const slug = getBlogSlugFromId(id);
  if (!slug) return null;
  return getPostBySlug(slug);
}
