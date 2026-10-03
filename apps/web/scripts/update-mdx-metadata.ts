#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  calculateHash,
  getCurrentDateISO,
  BLOG_REQUIRED_FIELDS,
  PAGE_REQUIRED_FIELDS,
} from "./lib/mdx-utils";

/**
 * メタデータフィールドを標準的な順序に並び替え
 */
function sortMetadataFields(
  data: Record<string, unknown>,
  isBlog: boolean,
): Record<string, unknown> {
  const order = isBlog ? [...BLOG_REQUIRED_FIELDS] : [...PAGE_REQUIRED_FIELDS];

  const sorted: Record<string, unknown> = {};
  for (const key of order) {
    if (key in data) {
      sorted[key] = data[key];
    }
  }

  // 標準順序にないフィールドを最後に追加
  for (const key of Object.keys(data)) {
    if (!(key in sorted)) {
      sorted[key] = data[key];
    }
  }

  return sorted;
}

/**
 * MDXファイルのメタデータを更新
 * - コンテンツが変更された場合：lastUpdatedとcontentHashを更新
 * - メタデータの順序を標準化
 */
function updateMdxMetadata(filePath: string): boolean {
  if (!filePath.endsWith(".mdx")) {
    return false;
  }

  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const relativePath = path.relative(process.cwd(), filePath);
    const isBlog =
      relativePath.includes("content/blog") ||
      relativePath.includes("content\\blog");

    let updated = false;

    // コンテンツのハッシュを計算
    const currentHash = calculateHash(content);
    const previousHash = data.contentHash as string | undefined;

    // コンテンツが変更された場合のみlastUpdatedを更新
    if (currentHash !== previousHash) {
      const now = getCurrentDateISO();
      data.lastUpdated = now;
      data.contentHash = currentHash;
      console.log(
        `✅ ${path.basename(filePath)}: コンテンツが変更されたためlastUpdatedを更新`,
      );
      updated = true;
    }

    // メタデータの順序を標準化
    const sortedData = sortMetadataFields(data, isBlog);

    const updatedContent = matter.stringify(content, sortedData);

    // 実際にファイル内容が変わった場合のみ書き込み
    if (updatedContent !== fileContents) {
      fs.writeFileSync(filePath, updatedContent, "utf8");
      if (!updated) {
        console.log(`✅ ${path.basename(filePath)}: メタデータをフォーマット`);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ ${filePath} の処理に失敗:`, (error as Error).message);
    return false;
  }
}

/**
 * メイン処理
 */
function main(): void {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("更新するファイルが指定されていません");
    return;
  }

  for (const file of files) {
    updateMdxMetadata(file);
  }
}

// スクリプト実行
main();

export { updateMdxMetadata, main };
