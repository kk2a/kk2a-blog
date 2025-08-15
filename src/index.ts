// Cloudflare Workers用のルーター
import { generateHash } from "./lib/hash";

// Cloudflare Workers/Pages用の型定義
export interface Env {
  ASSETS: Fetcher;
}

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
async function getCategoryMapping(
  request: Request,
  env: Env
): Promise<HashMapping> {
  if (cachedCategoryMapping) {
    return cachedCategoryMapping;
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const response = await env.ASSETS.fetch(`${baseUrl}/api/categories`);
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
async function getTagMapping(request: Request, env: Env): Promise<HashMapping> {
  if (cachedTagMapping) {
    return cachedTagMapping;
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const response = await env.ASSETS.fetch(`${baseUrl}/api/tags`);
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
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    console.log(url.pathname);

    const tagMatch = pathname.match(/^\/tags\/(.+)$/);
    if (tagMatch) {
      const tagName = decodeURIComponent(tagMatch[1]);
      const tagHash = generateHash(tagName);
      const tagMapping = await getTagMapping(request, env);

      if (tagMapping.tags && tagHash in tagMapping.tags) {
        // 🚀【変更点 1】ハッシュ化されたパスに ".html" を付けてアセットを探す
        const assetUrl = new URL(`/tags/${tagHash}`, request.url);

        // 🚀【変更点 2】通常のfetchではなく、env.ASSETS.fetchで静的ファイルを取得
        return env.ASSETS.fetch(new Request(assetUrl));
      }
    }

    const categoryMatch = pathname.match(/^\/categories\/(.+)$/);
    if (categoryMatch) {
      const categoryName = decodeURIComponent(categoryMatch[1]);
      const categoryMapping = await getCategoryMapping(request, env);

      const categoryHash = generateHash(categoryName);
      // console.log(categoryName, categoryHash);
      // console.log(categoryMapping);

      if (
        categoryMapping.categories &&
        categoryHash in categoryMapping.categories
      ) {
        // 🚀【変更点 1】ハッシュ化されたパスに ".html" を付けてアセットを探す
        const assetUrl = new URL(`/categories/${categoryHash}`, request.url);

        // 🚀【変更点 2】env.ASSETS.fetchで静的ファイルを取得
        return env.ASSETS.fetch(new Request(assetUrl));
      }
    }

    // 🚀【変更点 3】カスタムルーティングに一致しなかった場合、
    //               リクエストをそのままASSETSに渡し、通常の静的ファイル配信を試みる。
    //               (例: /about や /styles.css などはこちらで処理される)

    // 静的生成されたページの存在をチェック
    try {
      const response = await env.ASSETS.fetch(request);

      // ページが存在する場合はそのまま返す
      if (response.status === 200) {
        return response;
      }

      // ページが存在しない場合は404処理を行う
      if (response.status === 404) {
        // カスタム404ページを取得を試行
        try {
          const notFoundUrl = new URL("/404", request.url);
          const notFoundResponse = await env.ASSETS.fetch(
            new Request(notFoundUrl)
          );

          if (notFoundResponse.ok) {
            return new Response(notFoundResponse.body, {
              status: 404,
              statusText: "Not Found",
              headers: {
                ...Object.fromEntries(notFoundResponse.headers),
                "Content-Type": "text/html; charset=utf-8",
              },
            });
          }
        } catch (error) {
          console.error("404ページ取得エラー:", error);
        }

        // カスタム404ページが取得できない場合はデフォルトの404を返す
        return new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      // その他のステータスコードはそのまま返す
      return response;
    } catch (error) {
      console.error("静的ページ取得エラー:", error);

      // エラーが発生した場合も404を返す
      return new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  },
};

export default handler;
