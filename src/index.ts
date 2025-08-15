// Cloudflare Workers用のルーター
import { generateHash } from "./lib/hash";

// Cloudflare Workers/Pages用の型定義
// interface Env {
//   ASSETS?: {
//     fetch: (request: Request) => Promise<Response>;
//   };
// }

interface HashMapping {
  categories?: Record<string, string>; // hash -> original name
  tags?: Record<string, string>; // hash -> original name
  categoryHashes?: string[];
  tagHashes?: string[];
}

// キャッシュされたマッピング
let cachedCategoryMapping: HashMapping | null = null;
let cachedTagMapping: HashMapping | null = null;

/**
 * カテゴリマッピングをAPI経由で取得
 */
async function getCategoryMapping(request: Request): Promise<HashMapping> {
  if (cachedCategoryMapping) {
    return cachedCategoryMapping;
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const response = await fetch(`${baseUrl}/api/categories`);
    if (response.ok) {
      cachedCategoryMapping = await response.json();
      return cachedCategoryMapping || {};
    }
  } catch (error) {
    console.error("カテゴリマッピング取得エラー:", error);
  }

  return {};
}

/**
 * タグマッピングをAPI経由で取得
 */
async function getTagMapping(request: Request): Promise<HashMapping> {
  if (cachedTagMapping) {
    return cachedTagMapping;
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const response = await fetch(`${baseUrl}/api/tags`);
    if (response.ok) {
      cachedTagMapping = await response.json();
      return cachedTagMapping || {};
    }
  } catch (error) {
    console.error("タグマッピング取得エラー:", error);
  }

  return {};
}

const handler = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 通常のURLパターンをハッシュベースのパスにリダイレクト
    const tagMatch = pathname.match(/^\/tags\/(.+)$/);
    const categoryMatch = pathname.match(/^\/categories\/(.+)$/);

    if (tagMatch) {
      const tagName = decodeURIComponent(tagMatch[1]);
      const tagHash = generateHash(tagName);

      try {
        // タグマッピングを取得してハッシュの存在を確認
        const tagMapping = await getTagMapping(request);
        if (tagMapping.tags && tagHash in tagMapping.tags) {
          // ハッシュベースのHTMLファイルを取得
          const hashBasedUrl = new URL(`/tags/${tagHash}`, request.url);
          const response = await fetch(new Request(hashBasedUrl));

          if (response.ok) {
            return new Response(response.body, {
              status: 200,
            });
          }
        }
      } catch (error) {
        console.error(`タグページ取得エラー: ${tagName}`, error);
      }
    }

    if (categoryMatch) {
      const categoryName = decodeURIComponent(categoryMatch[1]);
      const categoryHash = generateHash(categoryName);
      // console.log(categoryName, categoryHash);

      try {
        // カテゴリマッピングを取得してハッシュの存在を確認
        const categoryMapping = await getCategoryMapping(request);
        // console.log(categoryMapping);
        if (
          categoryMapping.categories &&
          categoryHash in categoryMapping.categories
        ) {
          // ハッシュベースのHTMLファイルを取得
          const hashBasedUrl = new URL(
            `/categories/${categoryHash}`,
            request.url
          );
          const response = await fetch(new Request(hashBasedUrl));

          if (response.ok) {
            return new Response(response.body, {
              status: 200,
            });
          }
        }
      } catch (error) {
        console.error(`カテゴリページ取得エラー: ${categoryName}`, error);
      }
    }

    // 通常の404処理
    try {
      const notFoundUrl = new URL("/404", request.url);
      const notFoundResponse = await fetch(new Request(notFoundUrl));

      if (notFoundResponse.ok) {
        return new Response(notFoundResponse.body, {
          status: 404,
          statusText: "Not Found",
        });
      }
    } catch (error) {
      console.error("404.html取得エラー:", error);
    }

    return new Response("Not Found", {
      status: 404,
      statusText: "Not Found",
    });
  },
};

export default handler;
