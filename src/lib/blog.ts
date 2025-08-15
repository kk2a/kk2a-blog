import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { tagMapper, categoryMapper } from "./hash";

const contentDirectory = path.join(process.cwd(), "content/blog");

// 初期化状態を管理する静的変数
let isInitialized = false;

// 必要時に自動初期化を行う関数
function ensureInitialized(): void {
  if (!isInitialized) {
    initializeHashMappings();
    isInitialized = true;
  }
}

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allPosts;
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

export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.categories.includes(category));
}

export function getPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

export function getAllCategories(): string[] {
  const allPosts = getAllPosts();
  const categories = new Set<string>();
  allPosts.forEach((post) => {
    post.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tags = new Set<string>();
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
}

// ハッシュベースのヘルパー関数
export function getTagHash(tag: string): string {
  ensureInitialized();
  return tagMapper.register(tag);
}

export function getTagFromHash(hash: string): string | undefined {
  ensureInitialized();
  return tagMapper.getOriginal(hash);
}

export function getCategoryHash(category: string): string {
  ensureInitialized();
  return categoryMapper.register(category);
}

export function getCategoryFromHash(hash: string): string | undefined {
  ensureInitialized();
  return categoryMapper.getOriginal(hash);
}

// 静的生成用のハッシュ一覧を取得
export function getAllTagHashes(): string[] {
  ensureInitialized();
  const tags = getAllTags();
  return tags.map((tag) => getTagHash(tag));
}

export function getAllCategoryHashes(): string[] {
  ensureInitialized();
  const categories = getAllCategories();
  return categories.map((category) => getCategoryHash(category));
}

// 初期化時に全てのタグとカテゴリをハッシュマッパーに登録
export function initializeHashMappings(): void {
  try {
    const tags = getAllTags();
    const categories = getAllCategories();

    // console.log(
    //   `初期化中: ${tags.length}個のタグ, ${categories.length}個のカテゴリ`
    // );

    tags.forEach((tag) => tagMapper.register(tag));
    categories.forEach((category) => categoryMapper.register(category));

    // console.log("ハッシュマッピング初期化完了");
  } catch (error) {
    console.error("ハッシュマッピング初期化エラー:", error);
    throw error;
  }
}
