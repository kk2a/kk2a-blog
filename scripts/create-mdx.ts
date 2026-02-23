#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// パス設定
const projectRoot = path.dirname(__dirname);
const blogDir = path.join(projectRoot, "content", "blog");
const pagesDir = path.join(projectRoot, "content", "pages");

// コマンドライン引数の解析
function parseArgs(): {
  type: "blog" | "page";
  title: string;
  slug?: string;
  categories?: string[];
  tags?: string[];
  excerpt?: string;
} {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
MDXテンプレート作成スクリプト

使用方法:
  npm run create-mdx -- --title "記事タイトル" [オプション]

オプション:
  --title, -t <title>          記事タイトル（必須）
  --type <blog|page>           タイプ（デフォルト: blog）
  --slug, -s <slug>            ファイル名（デフォルト: タイトルから自動生成）
  --categories, -c <cat1,cat2> カテゴリ（カンマ区切り、blogのみ）
  --tags <tag1,tag2>           タグ（カンマ区切り、blogのみ）
  --excerpt, -e <excerpt>      抜粋文（blogのみ）
  --help, -h                   このヘルプを表示

例:
  # 基本的な使い方
  npm run create-mdx -- --title "新しい記事"
  
  # カテゴリとタグを指定
  npm run create-mdx -- -t "Stern-Brocot tree" -c "数学,データ構造" --tags "数学,アルゴリズム"
  
  # ページを作成
  npm run create-mdx -- --type page --title "プライバシーポリシー"
  
  # スラッグを指定
  npm run create-mdx -- -t "新記事" -s "my-custom-slug"
`);
    process.exit(0);
  }

  let type: "blog" | "page" = "blog";
  let title = "";
  let slug: string | undefined;
  let categories: string[] | undefined;
  let tags: string[] | undefined;
  let excerpt: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--title":
      case "-t":
        if (!nextArg) {
          console.error("エラー: --title にはタイトルが必要です");
          process.exit(1);
        }
        title = nextArg;
        i++;
        break;

      case "--type":
        if (nextArg !== "blog" && nextArg !== "page") {
          console.error(
            "エラー: --type は blog または page である必要があります"
          );
          process.exit(1);
        }
        type = nextArg;
        i++;
        break;

      case "--slug":
      case "-s":
        if (!nextArg) {
          console.error("エラー: --slug にはスラッグが必要です");
          process.exit(1);
        }
        slug = nextArg;
        i++;
        break;

      case "--categories":
      case "-c":
        if (!nextArg) {
          console.error("エラー: --categories にはカテゴリが必要です");
          process.exit(1);
        }
        categories = nextArg.split(",").map((c) => c.trim());
        i++;
        break;

      case "--tags":
        if (!nextArg) {
          console.error("エラー: --tags にはタグが必要です");
          process.exit(1);
        }
        tags = nextArg.split(",").map((t) => t.trim());
        i++;
        break;

      case "--excerpt":
      case "-e":
        if (!nextArg) {
          console.error("エラー: --excerpt には抜粋文が必要です");
          process.exit(1);
        }
        excerpt = nextArg;
        i++;
        break;

      default:
        console.error(`エラー: 不明なオプション: ${arg}`);
        console.error("ヘルプを表示するには --help を使用してください");
        process.exit(1);
    }
  }

  if (!title) {
    console.error("エラー: --title は必須です");
    console.error("ヘルプを表示するには --help を使用してください");
    process.exit(1);
  }

  return { type, title, slug, categories, tags, excerpt };
}

// スラッグ生成（タイトルから）
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // 英数字、スペース、ハイフン以外を削除
    .replace(/\s+/g, "-") // スペースをハイフンに
    .replace(/-+/g, "-") // 連続するハイフンを一つに
    .trim();
}

// 現在の日付を YYYY-MM-DD 形式で取得
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ブログ記事のテンプレート
function generateBlogTemplate(
  title: string,
  categories: string[] = [],
  tags: string[] = [],
  excerpt?: string
): string {
  const date = getCurrentDate();
  const defaultExcept = excerpt || `${title}についての記事`;

  return `---
title: "${title}"
date: "${date}"
excerpt: "${defaultExcept}"
categories: [${categories.map((c) => `"${c}"`).join(", ")}]
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
---


<FootnoteList />

<ReferenceList />
`;
}

// ページのテンプレート
function generatePageTemplate(title: string): string {
  return `---
title: "${title}"
---

# ${title}

（ここにページの内容を記述）
`;
}

// ファイル作成
function createMdxFile(
  type: "blog" | "page",
  title: string,
  slug: string,
  categories?: string[],
  tags?: string[],
  excerpt?: string
): void {
  const targetDir = type === "blog" ? blogDir : pagesDir;
  const filePath = path.join(targetDir, `${slug}.mdx`);

  // ファイルが既に存在する場合は確認
  if (fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが既に存在します: ${filePath}`);
    process.exit(1);
  }

  // テンプレート生成
  const content =
    type === "blog"
      ? generateBlogTemplate(title, categories, tags, excerpt)
      : generatePageTemplate(title);

  // ファイル書き込み
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`✓ MDXファイルを作成しました: ${filePath}`);
  console.log(`
次のステップ:
1. エディタで ${slug}.mdx を開く
2. コンテンツを編集
3. npm run dev で確認
`);
}

// メイン処理
function main() {
  try {
    const {
      type,
      title,
      slug: customSlug,
      categories,
      tags,
      excerpt,
    } = parseArgs();

    // スラッグ生成
    const slug = customSlug || generateSlug(title);

    if (!slug) {
      console.error("エラー: スラッグを生成できませんでした");
      process.exit(1);
    }

    // ファイル作成
    createMdxFile(type, title, slug, categories, tags, excerpt);
  } catch (error) {
    console.error("エラー:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
