# 死人に口なし

ブログが欲しいなと思ったので作りました．

## 特徴

- **Modern Stack**: Next.js 16 + React 19 + TypeScript
- **pnpm Monorepo**: Web と Cloudflare Worker API を同一リポジトリで管理
- **MDX Support**: Markdown 記法で React コンポーネントを使用可能
- **D1 Content API**: 記事メタデータと topics を Cloudflare D1 で管理
- **レスポンシブデザイン**: Tailwind CSS によるモバイルファーストデザイン
- **静的サイト生成**: 高速なページ表示
- **Topics**: 旧カテゴリとタグを統合した記事の分類と検索
- **日本語 URL 対応**: SHA-256 ハッシュ化による安全な日本語カテゴリ・タグ URL
- **独自ドメイン**: Cloudflare DNS による独自ドメインでのアクセス
- **SEO 最適化**: メタデータと OpenGraph 対応

## 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **ライブラリ**: [React 19](https://reactjs.org/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **記事形式**: [MDX](https://mdxjs.com/)
- **ホスティング**: [Cloudflare Workers](https://workers.cloudflare.com/) + [D1](https://developers.cloudflare.com/d1/)
- **DBアクセス**: [Drizzle ORM](https://orm.drizzle.team/) + Cloudflare D1

## ホスティング・デプロイメント

### Cloudflare Workers 構成

このブログは、Next.js の静的 assets と D1 API を 1 つの Cloudflare Worker から配信します。

#### 主な特徴

- **静的サイト生成**: Next.js の `output: "export"` で静的ファイルを生成
- **独自ドメイン対応**: Cloudflare DNS 経由で独自ドメインからアクセス可能
- **日本語 URL 対応**: カテゴリ・タグの SHA-256 ハッシュ化による URL 安全化
- **カスタム API**: `apps/api` の Worker が `/api/v1/*` を処理
- **DB 管理**: `posts`、`topics`、`post_topics` を D1 migration で管理
- **高速配信**: Cloudflare のグローバルネットワークによる高速配信

## ディレクトリ構造

```
├── apps/
│   └── api/                  # D1 を利用する Cloudflare Worker API
│       ├── src/              # API と DB クエリ
│       ├── migrations/       # D1 migrations generated from schema.ts
│       ├── drizzle.config.ts # Drizzle Kit configuration
│       └── tests/            # API unit tests
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # 既存の静的互換 API Routes
│   │   │   ├── categories/  # 旧カテゴリマッピングAPI
│   │   │   ├── tags/        # 旧タグマッピングAPI
│   │   │   └── id-mappings/ # 旧マッピング情報API
│   │   ├── blog/            # ブログ記事関連ページ
│   │   ├── categories/      # カテゴリページ
│   │   ├── tags/            # タグページ
│   │   ├── topics/           # 統合後の topics ページ
│   │   ├── about/           # About ページ
│   │   └── privacy-policy/  # プライバシーポリシー
│   ├── components/          # Reactコンポーネント
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── Footer.tsx       # フッター
│   │   └── BlogCard.tsx     # 記事カード
│   ├── lib/                 # ユーティリティ関数
│   │   ├── blog.ts          # 記事管理関数
│   │   └── hash.ts          # SHA-256ハッシュ化ユーティリティ
├── scripts/                 # スクリプト
│   ├── lib/                 # 共通ユーティリティ
│   │   └── mdx-utils.ts     # MDX関連の共通関数
│   ├── create-mdx.ts        # MDXファイル作成
│   ├── sync-content.ts      # MDXとD1の差分同期
│   ├── prepare-content.ts   # migration・content同期・ID同期
│   ├── sync-id-mappings.ts  # D1のIDを静的ビルド用に同期
│   ├── update-mdx-metadata.ts # メタデータ更新
│   ├── validate-mdx.ts      # MDXバリデーション
│   └── migrate-mdx-dates.ts # 日付マイグレーション
├── content/
│   └── blog/                # MDX記事ファイル
└── public/                  # 静的ファイル
```

## サイト構造

- `/` - ホームページ（最新記事の表示）
- `/blog` - 記事一覧ページ
- `/blog/[slug]` - 記事詳細ページ
- `/topics/[topic]` - topics 別記事一覧
- `/categories/[category]`, `/tags/[tag]` - 既存 URL の互換ページ
- `/about` - 運営者情報
- `/privacy-policy` - プライバシーポリシー

## 開発ツール

### 開発コマンド

依存関係の管理には pnpm を使用します。

```bash
pnpm install
pnpm dev                 # Next.js 開発サーバー
pnpm check               # formatter / linter / typecheck / test / MDX validation
pnpm build               # ローカルD1を同期して静的 assets を生成
pnpm test                # backend test
```

### MDX と D1 の責務

記事本文と画像などのコンテンツは、引き続き `content/blog/*.mdx` と Git で管理します。記事の公開状態、表示用メタデータ、topics は D1 の `posts` / `topics` / `post_topics` に同期します。

既存の `0001_initial_schema.sql` は適用済みのD1 migrationとして保持し、今後のスキーマ変更は `pnpm --filter @kk2a/blog-api db:generate` でmigrationを生成します。

記事と topics のIDはD1の主キーを使います。ローカル開発・CIではローカルD1から、production deployではremote D1から、静的ページ生成に必要なIDだけを `data/id-mappings.json` へ一時同期します。このファイルはGit管理しません。通常の新規記事はD1の自動採番を使い、`test-*` の記事は同期時にD1の状態から負数を自動採番します。IDを含むコンテンツを復元する場合は、D1のバックアップを正とします。公開・下書きの判定はIDの値ではなく `posts.status` を使います。

MDXからD1のcontentデータを同期する場合は次を実行します。現在のMDXとD1のメタデータを比較し、追加・更新・削除とtopicsの関連を反映します。seed SQLをGitに生成・保存することはありません。

```bash
pnpm prepare-content

# production D1へ同期する場合
D1_DATABASE_LOCATION=remote pnpm prepare-content
```

API は次の read endpoint を提供します。

- `GET /api/v1/posts?limit=20&offset=0`
- `GET /api/v1/posts/:slug`
- `GET /api/v1/topics`
- `GET /api/v1/topics/:topic/posts`

### Cloudflare D1 の初回セットアップ

```bash
pnpm exec wrangler d1 create kk2a-blog
pnpm --filter @kk2a/blog-api db:migrate:local
pnpm --filter @kk2a/blog-api db:migrate:remote
```

リモートへ適用する前に、`wrangler.jsonc` の `d1_databases[0].database_id` に作成した UUID を設定してください。Workers Builds側にD1 migrationを実行できるCloudflare API tokenを設定します。

### MDX テンプレート作成スクリプト

新しいブログ記事やページを簡単に作成できるテンプレート生成スクリプトを用意しています。

```bash
# ブログ記事を作成
pnpm create-mdx -- --slug my-article
pnpm create-mdx -- -s stern-brocot-tree

# ページを作成
pnpm create-mdx -- --slug about --type page
```

**作成後の手順:**

1. 生成されたMDXファイルを開く
2. `title`, `description`, `excerpt`, `categories`, `tags` を編集
3. コンテンツを記述
4. `pnpm dev` で確認

詳しい使い方は [docs/create-mdx-guide.md](docs/create-mdx-guide.md) を参照してください。

### MDX バリデーション

MDXファイルが正しいフォーマットと必須フィールドを持っているかチェックできます。

```bash
# すべてのMDXファイルをバリデーション
pnpm validate-mdx
```

**チェック項目:**

- 必須フィールドの存在確認（title, date, description, excerpt, categories, tags, lastUpdated, contentHash）
- date と lastUpdated がタイムゾーン付きISO8601形式か
- contentHash が現在のコンテンツと一致するか

### 自動更新とCI/CD

**pre-commitフック:**

コミット時に自動実行される処理：
1. ステージングされたMDXファイルのメタデータを自動フォーマット（フィールドの順序を標準化）
2. コンテンツが変更された場合、`lastUpdated` と `contentHash` を自動更新
3. 更新されたファイルを自動的に再ステージング
4. すべてのMDXファイルをバリデーション（エラーがある場合はコミットを中断）

**GitHub Actions CI (`.github/workflows/ci.yml`):**

- MDXファイルのバリデーション
- Biome formatter/linter
- frontend/backend の TypeScript check
- backend API の Vitest test
- ビルド確認

Cloudflare Workers Buildsでmainへのpushを起点にデプロイします。Build commandは `D1_DATABASE_LOCATION=remote pnpm build`、Deploy commandは `pnpm exec wrangler deploy` を指定します。Build前処理でschema migration、MDXからD1へのcontent同期、remote D1からのID同期を順番に実行します。

### 共通ユーティリティ (scripts/lib/mdx-utils.ts)

MDX関連スクリプトで共通して使用される関数群：

- `calculateHash(content)` - コンテンツのSHA256ハッシュを計算
- `getCurrentDateISO()` - タイムゾーン付きISO8601形式の現在日時を取得
- `isISOWithTimezone(dateString)` - 日付文字列がISO8601形式かチェック
- `convertDateToISO(dateString)` - 日付文字列をISO8601形式に変換

これらの関数は各スクリプト（create-mdx, update-mdx-metadata, validate-mdx, migrate-mdx-dates）で共通利用されています。
