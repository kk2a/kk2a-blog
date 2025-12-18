// カテゴリIDマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import { getAllCategoryIds, getCategoryFromId } from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsからカテゴリID情報を取得
    const categoryIds = getAllCategoryIds();

    // ID → 名前のマッピングを構築
    const idToCategory: Record<number, string> = {};
    const categoryToId: Record<string, number> = {};

    categoryIds.forEach((id) => {
      const categoryName = getCategoryFromId(id);
      if (categoryName) {
        idToCategory[id] = categoryName;
        categoryToId[categoryName] = id;
      }
    });

    const categoryMapping = {
      ids: categoryIds,
      idToCategory,
      categoryToId,
      message: "IDベースのカテゴリマッピング情報",
    };

    return NextResponse.json(categoryMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("カテゴリIDマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load category ID mappings" },
      { status: 500 }
    );
  }
}
