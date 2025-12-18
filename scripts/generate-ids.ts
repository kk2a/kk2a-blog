#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// パス設定（スクリプトディレクトリから一つ上がプロジェクトルート）
const projectRoot = path.dirname(__dirname);
const contentDir = path.join(projectRoot, "content", "blog");
const dataDir = path.join(projectRoot, "data");

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 型定義
interface IdMappingData {
  nextId: number;
  mappings: Record<string, number>;
  lastUpdated: string;
  note: string;
}

interface BlogIdMappingData extends IdMappingData {
  nextTestId: number;
}

interface BlogPost {
  slug: string;
  date: string;
  categories: string[];
  tags: string[];
}

// IDマッパークラス
class IdMapper {
  private fileName: string;
  private itemType: string;
  private filePath: string;
  private mappings: Record<string, number> = {};
  private nextId: number = 1;

  constructor(fileName: string, itemType: string) {
    this.fileName = fileName;
    this.itemType = itemType;
    this.filePath = path.join(dataDir, fileName);
    this.loadFromFile();
  }

  private loadFromFile(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const data: IdMappingData = JSON.parse(
          fs.readFileSync(this.filePath, "utf8")
        );
        this.mappings = data.mappings || {};
        this.nextId = data.nextId || 1;
      } catch (error) {
        console.warn(
          `${this.fileName}の読み込みに失敗しました:`,
          (error as Error).message
        );
        this.mappings = {};
        this.nextId = 1;
      }
    }
  }

  register(item: string): number {
    if (this.mappings[item] !== undefined) {
      return this.mappings[item];
    }

    const id = this.nextId++;
    this.mappings[item] = id;
    return id;
  }

  saveToFile(): void {
    const data: IdMappingData = {
      nextId: this.nextId,
      mappings: this.mappings,
      lastUpdated: new Date().toISOString(),
      note: `${this.itemType}のIDマッピング`,
    };

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  getStats(): string {
    const count = Object.keys(this.mappings).length;
    return `${count}個の${this.itemType}`;
  }
}

// ブログIDマッパークラス
class BlogIdMapper {
  private fileName: string;
  private filePath: string;
  private mappings: Record<string, number> = {};
  private nextId: number = 1;
  private nextTestId: number = -1;
  private testPatterns: string[] = ["test-", "sample-", "demo-", "experiment-"];

  constructor(fileName: string) {
    this.fileName = fileName;
    this.filePath = path.join(dataDir, fileName);
    this.loadFromFile();
  }

  private loadFromFile(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const data: BlogIdMappingData = JSON.parse(
          fs.readFileSync(this.filePath, "utf8")
        );
        this.mappings = data.mappings || {};
        this.nextId = data.nextId || 1;
        this.nextTestId = data.nextTestId || -1;
      } catch (error) {
        console.warn(
          `${this.fileName}の読み込みに失敗しました:`,
          (error as Error).message
        );
        this.mappings = {};
        this.nextId = 1;
        this.nextTestId = -1;
      }
    }
  }

  private isTestSlug(slug: string): boolean {
    return this.testPatterns.some(
      (pattern) => slug.includes(pattern) || slug.startsWith(pattern)
    );
  }

  register(slug: string): number {
    if (this.mappings[slug] !== undefined) {
      return this.mappings[slug];
    }

    const id = this.isTestSlug(slug) ? this.nextTestId-- : this.nextId++;
    this.mappings[slug] = id;
    return id;
  }

  saveToFile(): void {
    const data: BlogIdMappingData = {
      nextId: this.nextId,
      nextTestId: this.nextTestId,
      mappings: this.mappings,
      lastUpdated: new Date().toISOString(),
      note: "正の数: 通常記事, 負の数: テスト/実験用記事",
    };

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  getStats(): string {
    const regularCount = Object.values(this.mappings).filter(
      (id) => id > 0
    ).length;
    const testCount = Object.values(this.mappings).filter(
      (id) => id < 0
    ).length;
    return `${regularCount}個の通常記事, ${testCount}個のテスト記事`;
  }
}

// ブログ記事を読み込んで解析
function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) {
    console.warn("ブログコンテンツディレクトリが見つかりません:", contentDir);
    return [];
  }

  const fileNames = fs.readdirSync(contentDir);
  const allPosts = fileNames
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, "");
      const filePath = path.join(contentDir, name);

      try {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const { data } = matter(fileContents);

        return {
          slug,
          date: data.date || "",
          categories: data.categories || [],
          tags: data.tags || [],
        };
      } catch (error) {
        console.warn(`記事の読み込みに失敗: ${name}`, (error as Error).message);
        return null;
      }
    })
    .filter((post): post is BlogPost => post !== null)
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

// メイン処理
function main(): void {
  console.log("🔄 IDマッピングを生成しています...\n");

  // ブログ記事を取得
  const posts = getAllPosts();
  console.log(`📚 ${posts.length}個のブログ記事を発見しました`);

  // タグとカテゴリを収集
  const allTags = new Set<string>();
  const allCategories = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => allTags.add(tag));
    post.categories.forEach((category) => allCategories.add(category));
  });

  console.log(`🏷️  ${allTags.size}個のタグを発見しました`);
  console.log(`📁 ${allCategories.size}個のカテゴリを発見しました\n`);

  // IDマッパーを初期化
  const tagMapper = new IdMapper("tag-ids.json", "タグ");
  const categoryMapper = new IdMapper("category-ids.json", "カテゴリ");
  const blogMapper = new BlogIdMapper("blog-ids.json");

  // IDを生成
  console.log("🔢 IDを生成中...");

  // タグIDを生成
  Array.from(allTags)
    .sort()
    .forEach((tag) => {
      tagMapper.register(tag);
    });

  // カテゴリIDを生成
  Array.from(allCategories)
    .sort()
    .forEach((category) => {
      categoryMapper.register(category);
    });

  // ブログIDを生成（日付順）
  posts.forEach((post) => {
    blogMapper.register(post.slug);
  });

  // ファイルに保存
  console.log("💾 ファイルに保存中...");
  tagMapper.saveToFile();
  categoryMapper.saveToFile();
  blogMapper.saveToFile();

  console.log("✅ 完了しました!\n");
}

// スクリプト実行
main();

export { main };
