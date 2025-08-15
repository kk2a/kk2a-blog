// 全ハッシュマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import {
  getAllCategoryHashes,
  getAllTagHashes,
  getCategoryFromHash,
  getTagFromHash,
} from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsから全ての情報を取得
    const categoryHashes = getAllCategoryHashes();
    const tagHashes = getAllTagHashes();

    // ハッシュ → 名前のマッピングを構築
    const categories: Record<string, string> = {};
    const tags: Record<string, string> = {};

    categoryHashes.forEach((hash) => {
      const name = getCategoryFromHash(hash);
      if (name) {
        categories[hash] = name;
      }
    });

    tagHashes.forEach((hash) => {
      const name = getTagFromHash(hash);
      if (name) {
        tags[hash] = name;
      }
    });

    const hashMapping = {
      categories,
      tags,
      categoryHashes,
      tagHashes,
    };

    return NextResponse.json(hashMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("ハッシュマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load hash mappings" },
      { status: 500 }
    );
  }
}
