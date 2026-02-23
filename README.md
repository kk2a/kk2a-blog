# 死人に口なし

ブログが欲しいなと思ったので作りました．

## 特徴

- **Modern Stack**: Next.js 15 + React 19 + TypeScript
- **MDX Support**: Markdown 記法で React コンポーネントを使用可能
- **レスポンシブデザイン**: Tailwind CSS によるモバイルファーストデザイン
- **静的サイト生成**: 高速なページ表示
- **カテゴリー・タグ機能**: 記事の分類と検索
- **日本語 URL 対応**: SHA-256 ハッシュ化による安全な日本語カテゴリ・タグ URL
- **独自ドメイン**: Cloudflare DNS による独自ドメインでのアクセス
- **SEO 最適化**: メタデータと OpenGraph 対応

## 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **ライブラリ**: [React 19](https://reactjs.org/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **記事形式**: [MDX](https://mdxjs.com/)
- **ホスティング**: [Cloudflare Workers](https://workers.cloudflare.com/)

## ホスティング・デプロイメント

### Cloudflare Pages + Workers 構成

このブログは**Cloudflare Pages**と**Cloudflare Workers**を組み合わせた構成でホスティングされています。

#### 主な特徴

- **静的サイト生成**: Next.js の `output: "export"` で静的ファイルを生成
- **独自ドメイン対応**: Cloudflare DNS 経由で独自ドメインからアクセス可能
- **日本語 URL 対応**: カテゴリ・タグの SHA-256 ハッシュ化による URL 安全化
- **カスタムルーティング**: Cloudflare Workers による動的ルーティング
- **高速配信**: Cloudflare のグローバルネットワークによる高速配信

## ディレクトリ構造

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API Routes (hash-mappings)
│   │   │   ├── categories/  # カテゴリマッピングAPI
│   │   │   ├── tags/        # タグマッピングAPI
│   │   │   └── hash-mappings/ # 全マッピング情報API
│   │   ├── blog/            # ブログ記事関連ページ
│   │   ├── categories/      # カテゴリページ
│   │   ├── tags/            # タグページ
│   │   ├── about/           # About ページ
│   │   └── privacy-policy/  # プライバシーポリシー
│   ├── components/          # Reactコンポーネント
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── Footer.tsx       # フッター
│   │   └── BlogCard.tsx     # 記事カード
│   ├── lib/                 # ユーティリティ関数
│   │   ├── blog.ts          # 記事管理関数
│   │   └── hash.ts          # SHA-256ハッシュ化ユーティリティ
│   └── index.ts             # Cloudflare Workers エントリーポイント
├── content/
│   └── blog/                # MDX記事ファイル
└── public/                  # 静的ファイル
```

## サイト構造

- `/` - ホームページ（最新記事の表示）
- `/blog` - 記事一覧ページ
- `/blog/[slug]` - 記事詳細ページ
- `/categories/[category]` - カテゴリー別記事一覧
- `/tags/[tag]` - タグ別記事一覧
- `/about` - 運営者情報
- `/privacy-policy` - プライバシーポリシー

## 開発ツール

### MDX テンプレート作成スクリプト

新しいブログ記事やページを簡単に作成できるテンプレート生成スクリプトを用意しています。

```bash
# 基本的な使い方
npm run create-mdx -- --title "記事タイトル"

# カテゴリとタグを指定
npm run create-mdx -- -t "新記事" -c "カテゴリ1,カテゴリ2" --tags "タグ1,タグ2"

# ページを作成
npm run create-mdx -- --type page --title "新しいページ"
```

詳しい使い方は [docs/create-mdx-guide.md](docs/create-mdx-guide.md) を参照してください。
