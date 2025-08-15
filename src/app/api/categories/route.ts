// カテゴリマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import { getAllCategoryHashes, getCategoryFromHash } from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsからカテゴリ情報を取得
    const categoryHashes = getAllCategoryHashes();

    // ハッシュ → 名前のマッピングを構築
    const categories: Record<string, string> = {};

    categoryHashes.forEach((hash) => {
      const name = getCategoryFromHash(hash);
      if (name) {
        categories[hash] = name;
      }
    });

    const categoryMapping = {
      categories,
      categoryHashes,
    };

    return NextResponse.json(categoryMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("カテゴリマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load category mappings" },
      { status: 500 }
    );
  }
}
