// タグマッピング情報を返すAPIエンドポイント
import { NextResponse } from "next/server";
import { getAllTagHashes, getTagFromHash } from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsからタグ情報を取得
    const tagHashes = getAllTagHashes();

    // ハッシュ → 名前のマッピングを構築
    const tags: Record<string, string> = {};

    tagHashes.forEach((hash) => {
      const name = getTagFromHash(hash);
      if (name) {
        tags[hash] = name;
      }
    });

    const tagMapping = {
      tags,
      tagHashes,
    };

    return NextResponse.json(tagMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("タグマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load tag mappings" },
      { status: 500 }
    );
  }
}
