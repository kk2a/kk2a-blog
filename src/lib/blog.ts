import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  getAllPostIds,
  getAllTopicIds,
  getAllTopicNames,
  getPostId,
  getPostSlug,
  getPostStatus,
  getTopicId,
  getTopicName,
} from "./id-mapping";

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
  /** @deprecated Use topics. Kept while old URLs are migrated. */
  categories: string[];
  /** @deprecated Use topics. Kept while old URLs are migrated. */
  tags: string[];
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
  return getAllPosts().filter((post) => !post.slug.startsWith("test-"));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return {
    slug,
    title: data.title || "",
    date: data.date || "",
    lastUpdated: data.lastUpdated || undefined,
    excerpt: data.excerpt || "",
    content,
    status: getPostStatus(slug) ?? "published",
    topics: [...new Set([...categories, ...tags])],
    categories,
    tags,
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

export function getPublicPostsByCategory(category: string): BlogPost[] {
  const allPosts = getPublicPosts();
  return allPosts.filter((post) => post.categories.includes(category));
}

export function getAllPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.categories.includes(category));
}

export function getPublicPostsByTag(tag: string): BlogPost[] {
  const allPosts = getPublicPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

export function getAllPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

export function getPublicCategories(): string[] {
  const allPosts = getPublicPosts();
  const categories = new Set<string>();
  allPosts.forEach((post) => {
    post.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories);
}

export function getAllCategories(): string[] {
  const allPosts = getAllPosts();
  const categories = new Set<string>();
  allPosts.forEach((post) => {
    post.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories);
}

export function getPublicTags(): string[] {
  const allPosts = getPublicPosts();
  const tags = new Set<string>();
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
}

export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tags = new Set<string>();
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
}

// ID管理のヘルパー関数
export function getTagId(tag: string): number {
  const id = getTopicId(tag);
  if (id === undefined) throw new Error(`トピックIDが見つかりません: ${tag}`);
  return id;
}

export function getTagFromId(id: number): string | undefined {
  return getTopicName(id);
}

export function getCategoryId(category: string): number {
  const id = getTopicId(category);
  if (id === undefined) {
    throw new Error(`トピックIDが見つかりません: ${category}`);
  }
  return id;
}

export function getCategoryFromId(id: number): string | undefined {
  return getTopicName(id);
}

// 静的生成用のID一覧を取得
export function getAllTagIds(): number[] {
  return getAllTopicIds();
}

export function getAllCategoryIds(): number[] {
  return getAllTopicIds();
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
  return getAllPostIds()
    .filter((id) => {
      const slug = getPostSlug(id);
      return slug ? getPostStatus(slug) === "published" : false;
    })
    .sort((a, b) => a - b);
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
