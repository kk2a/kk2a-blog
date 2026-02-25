#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { calculateHash, getCurrentDateISO } from "./lib/mdx-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// パス設定
const projectRoot = path.dirname(__dirname);
const blogDir = path.join(projectRoot, "content", "blog");
const pagesDir = path.join(projectRoot, "content", "pages");

// コマンドライン引数の解析
function parseArgs(): {
  type: "blog" | "page";
  slug: string;
} {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
MDXテンプレート作成スクリプト

使用方法:
  npm run create-mdx -- --slug <slug> [オプション]

オプション:
  --slug, -s <slug>   ファイル名（必須）
  --type <blog|page>  タイプ（デフォルト: blog）
  --help, -h          このヘルプを表示

例:
  # ブログ記事を作成
  npm run create-mdx -- --slug my-article
  npm run create-mdx -- -s stern-brocot-tree
  
  # ページを作成
  npm run create-mdx -- --slug about --type page

注意:
  title, categories, tags, excerpt は作成後に直接MDXファイルを編集してください。
`);
    process.exit(0);
  }

  let type: "blog" | "page" = "blog";
  let slug = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--slug":
      case "-s":
        if (!nextArg) {
          console.error("エラー: --slug にはスラッグが必要です");
          process.exit(1);
        }
        slug = nextArg;
        i++;
        break;

      case "--type":
        if (nextArg !== "blog" && nextArg !== "page") {
          console.error(
            "エラー: --type は blog または page である必要があります",
          );
          process.exit(1);
        }
        type = nextArg;
        i++;
        break;

      default:
        console.error(`エラー: 不明なオプション: ${arg}`);
        console.error("ヘルプを表示するには --help を使用してください");
        process.exit(1);
    }
  }

  if (!slug) {
    console.error("エラー: --slug は必須です");
    console.error("ヘルプを表示するには --help を使用してください");
    process.exit(1);
  }

  return { type, slug };
}

// ブログ記事のテンプレート
function generateBlogTemplate(): string {
  const date = getCurrentDateISO();

  const content = `\n\n<FootnoteList />\n\n<ReferenceList />`;
  const contentHash = calculateHash(content);

  const frontMatter = {
    title: "記事タイトル",
    date,
    description: "記事の説明（SEO用）",
    excerpt: "記事の概要を記述してください",
    categories: ["カテゴリ1", "カテゴリ2"],
    tags: ["タグ1", "タグ2"],
    lastUpdated: date,
    contentHash,
  };

  return matter.stringify(content, frontMatter);
}

// ページのテンプレート
function generatePageTemplate(): string {
  const date = getCurrentDateISO();
  const content = `\n# ページタイトル\n\n（ここにページの内容を記述）\n`;
  const contentHash = calculateHash(content);

  const frontMatter = {
    title: "ページタイトル",
    description: "ページの説明（SEO用）",
    lastUpdated: date,
    contentHash,
  };

  return matter.stringify(content, frontMatter);
}

// ファイル作成
function createMdxFile(type: "blog" | "page", slug: string): void {
  const targetDir = type === "blog" ? blogDir : pagesDir;
  const filePath = path.join(targetDir, `${slug}.mdx`);

  // ファイルが既に存在する場合は確認
  if (fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが既に存在します: ${filePath}`);
    process.exit(1);
  }

  // テンプレート生成
  const content =
    type === "blog" ? generateBlogTemplate() : generatePageTemplate();

  // ファイル書き込み
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`✅ MDXファイルを作成しました: ${filePath}`);
}

// メイン処理
function main() {
  try {
    const { type, slug } = parseArgs();

    // ファイル作成
    createMdxFile(type, slug);
  } catch (error) {
    console.error("エラー:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
