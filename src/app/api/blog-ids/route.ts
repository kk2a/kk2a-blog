import { NextResponse } from "next/server";
import {
  getAllBlogIds,
  getBlogSlugFromId,
  getRegularBlogIds,
  getTestBlogIds,
} from "@/lib/blog";

// Static export対応
export const dynamic = "force-static";

export async function GET() {
  try {
    // lib/blog.tsからブログID情報を取得
    const allIds = getAllBlogIds();
    const regularIds = getRegularBlogIds();
    const testIds = getTestBlogIds();

    // ID → スラグのマッピングを構築
    const idToSlug: Record<number, string> = {};
    const slugToId: Record<string, number> = {};

    allIds.forEach((id) => {
      const slug = getBlogSlugFromId(id);
      if (slug) {
        idToSlug[id] = slug;
        slugToId[slug] = id;
      }
    });

    const blogMapping = {
      all: {
        ids: allIds,
        idToSlug,
        slugToId,
      },
      regular: {
        ids: regularIds,
        count: regularIds.length,
      },
      test: {
        ids: testIds,
        count: testIds.length,
      },
      message: "IDベースのブログマッピング情報",
      note: "正の数: 通常記事, 負の数: テスト/実験用記事",
    };

    return NextResponse.json(blogMapping, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("ブログIDマッピング読み込みエラー:", error);
    return NextResponse.json(
      { error: "Failed to load blog ID mappings" },
      { status: 500 }
    );
  }
}
