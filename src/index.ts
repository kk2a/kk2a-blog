// Cloudflare Workers用のエントリーポイント

// Cloudflare Workers用の型定義
export interface Env {
  ASSETS: Fetcher;
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // IDベースのURLはそのまま静的ファイルとして配信
    // Next.jsの静的生成により、/tags/1, /categories/2 などのファイルが生成される

    try {
      // 静的生成されたページの存在をチェック
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

      // エラーが発生した場合も500を返す
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
