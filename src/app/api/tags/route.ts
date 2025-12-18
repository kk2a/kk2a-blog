// タグIDマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import { getAllTagIds, getTagFromId } from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsからタグID情報を取得
    const tagIds = getAllTagIds();

    // ID → 名前のマッピングを構築
    const idToTag: Record<number, string> = {};
    const tagToId: Record<string, number> = {};

    tagIds.forEach((id) => {
      const tagName = getTagFromId(id);
      if (tagName) {
        idToTag[id] = tagName;
        tagToId[tagName] = id;
      }
    });

    const tagMapping = {
      ids: tagIds,
      idToTag,
      tagToId,
      message: "IDベースのタグマッピング情報",
    };

    return NextResponse.json(tagMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("タグIDマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load tag ID mappings" },
      { status: 500 }
    );
  }
}
