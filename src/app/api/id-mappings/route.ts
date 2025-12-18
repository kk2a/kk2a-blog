// 全IDマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import {
  getAllCategoryIds,
  getAllTagIds,
  getCategoryFromId,
  getTagFromId,
} from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsから全てのID情報を取得
    const categoryIds = getAllCategoryIds();
    const tagIds = getAllTagIds();

    // ID → 名前のマッピングを構築
    const idToCategory: Record<number, string> = {};
    const categoryToId: Record<string, number> = {};
    const idToTag: Record<number, string> = {};
    const tagToId: Record<string, number> = {};

    categoryIds.forEach((id) => {
      const categoryName = getCategoryFromId(id);
      if (categoryName) {
        idToCategory[id] = categoryName;
        categoryToId[categoryName] = id;
      }
    });

    tagIds.forEach((id) => {
      const tagName = getTagFromId(id);
      if (tagName) {
        idToTag[id] = tagName;
        tagToId[tagName] = id;
      }
    });

    const idMapping = {
      categories: {
        ids: categoryIds,
        idToCategory,
        categoryToId,
      },
      tags: {
        ids: tagIds,
        idToTag,
        tagToId,
      },
      message: "IDベースの全マッピング情報",
    };

    return NextResponse.json(idMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("IDマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load ID mappings" },
      { status: 500 }
    );
  }
}
