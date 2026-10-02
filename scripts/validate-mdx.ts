#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import {
  calculateHash,
  isISOWithTimezone,
  BLOG_REQUIRED_FIELDS,
  PAGE_REQUIRED_FIELDS,
} from "./lib/mdx-utils";

interface ValidationError {
  file: string;
  errors: string[];
}

/**
 * MDXファイルをバリデーション
 */
function validateMdxFile(filePath: string): ValidationError | null {
  const errors: string[] = [];

  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const relativePath = path.relative(process.cwd(), filePath);
    const isBlog =
      relativePath.includes("content/blog") ||
      relativePath.includes("content\\blog");

    // ブログ記事の場合の必須フィールドチェック
    if (isBlog) {
      for (const field of BLOG_REQUIRED_FIELDS) {
        if (!data[field]) {
          errors.push(`必須フィールド '${field}' がありません`);
        }
      }

      // date形式チェック
      if (data.date && typeof data.date === "string") {
        if (!isISOWithTimezone(data.date)) {
          errors.push(
            `date フィールドがタイムゾーン付きISO形式ではありません: ${data.date}`,
          );
        }
      }

      // lastUpdated形式チェック
      if (data.lastUpdated && typeof data.lastUpdated === "string") {
        if (!isISOWithTimezone(data.lastUpdated)) {
          errors.push(
            `lastUpdated フィールドがタイムゾーン付きISO形式ではありません: ${data.lastUpdated}`,
          );
        }
      }

      // topics配列チェック
      if (data.topics && !Array.isArray(data.topics)) {
        errors.push("topics フィールドは配列である必要があります");
      }

      if (data.categories !== undefined || data.tags !== undefined) {
        errors.push(
          "categories / tags は廃止されています。topics フィールドへ移行してください",
        );
      }
    } else {
      for (const field of PAGE_REQUIRED_FIELDS) {
        if (!data[field]) {
          errors.push(`必須フィールド '${field}' がありません`);
        }
      }

      // lastUpdated形式チェック（ページ用）
      if (data.lastUpdated && typeof data.lastUpdated === "string") {
        if (!isISOWithTimezone(data.lastUpdated)) {
          errors.push(
            `lastUpdated フィールドがタイムゾーン付きISO形式ではありません: ${data.lastUpdated}`,
          );
        }
      }
    }

    // contentHashの検証
    if (data.contentHash) {
      const currentHash = calculateHash(content);
      if (currentHash !== data.contentHash) {
        errors.push(
          `contentHash が一致しません（記事を編集後、git commitしてください）`,
        );
      }
    }

    if (errors.length > 0) {
      return {
        file: relativePath,
        errors,
      };
    }

    return null;
  } catch (error) {
    return {
      file: path.relative(process.cwd(), filePath),
      errors: [`ファイルの読み込みに失敗: ${(error as Error).message}`],
    };
  }
}

/**
 * ディレクトリ内のすべてのMDXファイルを再帰的にバリデーション
 */
function validateDirectory(dirPath: string): ValidationError[] {
  const validationErrors: ValidationError[] = [];

  if (!fs.existsSync(dirPath)) {
    return validationErrors;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      validationErrors.push(...validateDirectory(fullPath));
    } else if (entry.name.endsWith(".mdx")) {
      const error = validateMdxFile(fullPath);
      if (error) {
        validationErrors.push(error);
      }
    }
  }

  return validationErrors;
}

/**
 * メイン処理
 */
function main(): void {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const contentDir = path.join(__dirname, "..", "content");

  if (!fs.existsSync(contentDir)) {
    console.error(`❌ contentディレクトリが見つかりません: ${contentDir}`);
    process.exit(1);
  }

  console.log("🔍 MDXファイルをバリデーション中...\n");

  const errors = validateDirectory(contentDir);

  if (errors.length === 0) {
    console.log("✅ すべてのMDXファイルが正常です！");
    process.exit(0);
  } else {
    console.error("❌ バリデーションエラーが見つかりました:\n");

    for (const error of errors) {
      console.error(`📄 ${error.file}`);
      for (const err of error.errors) {
        console.error(`   - ${err}`);
      }
      console.error("");
    }

    console.error(`\n合計 ${errors.length} ファイルにエラーがあります。`);
    process.exit(1);
  }
}

// スクリプト実行
main();
