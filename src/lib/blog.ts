import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { tagIdMapper, categoryIdMapper } from "./id-mapper";
import { blogIdMapper } from "./blog-id-mapper";

const contentDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  lastUpdated?: string;
  excerpt: string;
  content: string;
  categories: string[];
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

  return {
    slug,
    title: data.title || "",
    date: data.date || "",
    lastUpdated: data.lastUpdated || undefined,
    excerpt: data.excerpt || "",
    content,
    categories: data.categories || [],
    tags: data.tags || [],
  };
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
  return tagIdMapper.getId(tag);
}

export function getTagFromId(id: number): string | undefined {
  return tagIdMapper.getNameById(id);
}

export function getCategoryId(category: string): number {
  return categoryIdMapper.getId(category);
}

export function getCategoryFromId(id: number): string | undefined {
  return categoryIdMapper.getNameById(id);
}

// 静的生成用のID一覧を取得
export function getAllTagIds(): number[] {
  const tags = getAllTags();
  return tags.map((tag) => getTagId(tag));
}

export function getAllCategoryIds(): number[] {
  const categories = getAllCategories();
  return categories.map((category) => getCategoryId(category));
}

// ブログID管理のヘルパー関数
export function getBlogId(slug: string): number {
  return blogIdMapper.getId(slug);
}

export function getBlogSlugFromId(id: number): string | undefined {
  return blogIdMapper.getSlugById(id);
}

// 静的生成用のブログID一覧を取得
export function getAllBlogIds(): number[] {
  const posts = getAllPosts();
  return posts.map((post) => getBlogId(post.slug));
}

export function getRegularBlogIds(): number[] {
  return blogIdMapper.getRegularIds();
}

export function getTestBlogIds(): number[] {
  return blogIdMapper.getTestIds();
}

// ブログ記事をIDで取得
export function getBlogPostById(id: number): BlogPost | null {
  const slug = getBlogSlugFromId(id);
  if (!slug) return null;
  return getPostBySlug(slug);
}
