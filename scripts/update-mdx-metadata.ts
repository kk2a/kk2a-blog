#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * MDXファイルのメタデータを更新
 */
function updateMdxMetadata(filePath: string): boolean {
  if (!filePath.endsWith(".mdx")) {
    return false;
  }

  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    // lastUpdated を常に現在時刻に更新
    const now = new Date().toISOString();
    if (data.lastUpdated !== now) {
      data.lastUpdated = now;
      console.log(`✅ ${path.basename(filePath)}: lastUpdated を更新`);

      const updatedContent = matter.stringify(content, data);
      fs.writeFileSync(filePath, updatedContent, "utf8");
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

  console.log("🔄 MDXメタデータを更新中...\n");

  let updatedCount = 0;
  for (const file of files) {
    if (updateMdxMetadata(file)) {
      updatedCount++;
    }
  }

  console.log(`\n✨ ${updatedCount}/${files.length} ファイルを更新しました`);
}

// スクリプト実行
main();

export { updateMdxMetadata, main };
