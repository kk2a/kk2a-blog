# 死人に口なし

ブログが欲しくなったので作りました。

## 特徴

Next.js 16、React 19、TypeScriptで構築しています。WebとCloudflare Worker APIは、pnpmのmonorepoで同じリポジトリにまとめています。

記事はMDXで記述でき、MDX内ではReactコンポーネントも利用できます。記事本文や画像などのコンテンツはGitに置き、記事メタデータとtopicsはCloudflare D1で管理します。

ページは静的サイトとして生成し、Tailwind CSSによるモバイルファーストのレスポンシブデザインで表示します。旧カテゴリとタグはtopicsに統合して記事の分類と検索に使い、D1で管理する連番IDを記事URLに使います。Cloudflare DNSによる独自ドメイン、メタデータ、OpenGraphにも対応しています。

## 技術スタック

- フレームワーク: [Next.js 16](https://nextjs.org/) (App Router)
- ライブラリ: [React 19](https://reactjs.org/)
- 言語: [TypeScript](https://www.typescriptlang.org/)
- スタイリング: [Tailwind CSS](https://tailwindcss.com/)
- 記事形式: [MDX](https://mdxjs.com/)
- ホスティング: [Cloudflare Workers](https://workers.cloudflare.com/) + [D1](https://developers.cloudflare.com/d1/)
- DBアクセス: [Drizzle ORM](https://orm.drizzle.team/) + Cloudflare D1

## ホスティング・デプロイメント

### Cloudflare Workers 構成

このブログは、Next.jsの静的assetsとD1 APIを1つのCloudflare Workerから配信します。

#### 主な特徴

- 静的サイト生成: Next.jsの `output: "export"` で静的ファイルを生成
- 独自ドメイン対応: Cloudflare DNS経由で独自ドメインからアクセス可能
- topics URL対応: topics名をURLエンコードして一覧ページへ遷移
- カスタムAPI: `apps/api` のWorkerが `/api/v1/*` を処理
- DB管理: `posts`、`topics`、`post_topics` をD1 migrationで管理
- 高速配信: Cloudflareのグローバルネットワークから配信

## ディレクトリ構造

```
├── apps/
│   ├── api/                  # D1を利用するCloudflare Worker API
│   │   ├── worker/           # Workerのエントリーポイントと生成型
│   │   ├── src/              # APIとDBクエリ
│   │   ├── migrations/       # schema.tsから生成したD1 migration
│   │   ├── drizzle.config.ts # Drizzle Kit configuration
│   │   └── tests/            # API unit tests
│   └── web/                  # Next.jsの静的サイト
│       ├── src/              # Next.js App RouterとReactコンポーネント
│       ├── scripts/          # MDXとD1を同期するスクリプト
│       ├── content/          # MDX記事とページ
│       └── public/           # 静的ファイル
├── package.json              # workspace共通コマンド
├── biome.jsonc              # workspace共通のformatter/linter設定
└── wrangler.jsonc            # Worker、Assets、D1の設定
```

Webで配信する画像やPDFなどの公開資産は、`apps/web/public` に配置します。ルート直下にはWebアプリの資産を置きません。

## サイト構造

- `/` - ホームページ（最新記事の表示）
- `/blog` - 記事一覧ページ
- `/blog/[id]` - 記事詳細ページ
- `/topics` - topics一覧ページ
- `/topics/[topic]` - topics別記事一覧
- `/about` - 運営者情報
- `/privacy-policy` - プライバシーポリシー
- `/api/blog-ids` - 静的生成された公開記事IDマッピング

## 開発ツール

### 開発コマンド

依存関係の管理にはpnpmを使います。

```bash
pnpm install
pnpm dev                 # Next.js 開発サーバー
pnpm check               # formatter / linter / typecheck / test / MDX validation
pnpm prepare-content     # migration・MDX同期・IDスナップショット生成
pnpm content:edit        # D1の記事公開状態・topicsを編集
pnpm topics:migrate      # 旧categories/tagsをtopicsへ一度だけ移行
pnpm build               # D1へ書き込まず静的assetsを生成
pnpm test                # scripts と backend のテスト
```

### MDX と D1 の責務

記事本文や画像などのコンテンツは、引き続き `apps/web/content/blog/*.mdx` とGitで管理します。記事の公開状態、表示用メタデータ、topicsはD1の `posts` / `topics` / `post_topics` へ同期します。

既存の `0001_initial_schema.sql` は適用済みのD1 migrationとして保持し、今後のスキーマ変更は `pnpm --filter @kk2a/blog-api db:generate` でmigrationを生成します。

記事とtopicsのIDにはD1の主キーを使います。ローカル開発とCIではローカルD1から、production deployではremote D1から、静的ページ生成に必要なIDだけを `apps/web/data/id-mappings.json` へ一時的に同期します。このファイルはGitで管理しません。

通常の記事にはD1の自動採番を使い、`test-*` の記事には同期時にD1の状態から負数を自動採番します。通常のpostsとtopicsはD1のAUTOINCREMENTを使うため、削除済みのIDは再利用しません。IDを含むコンテンツを復元する場合は、D1のバックアップを正とします。公開・下書きはIDの値ではなく `posts.status` で判定し、productionの静的ページと公開用ID APIではdraft記事を除外します。

MDXの差分をD1の記事メタデータへ反映するには、`pnpm prepare-content` を使います。新しい記事ではメタデータとtopicsを登録し、既存記事ではMDX本文のハッシュとパスだけを更新します。既存記事のtitle、date、excerpt、公開状態、topicsはD1側の値を保持します。seed SQLをGitに生成・保存する運用はありません。

記事の分類は `topics` に統一しています。旧 `categories` と `tags` を含むMDXを移行する場合は、最初に `pnpm topics:migrate` を実行してください。移行後は `pnpm topics:migrate --check` で旧フィールドが残っていないことを確認できます。

`pnpm build` はD1を書き換えません。事前に `pnpm prepare-content` を実行して、ビルドが読むローカルD1とIDスナップショットを用意してください。

既存記事のメタデータをMDXから意図的に上書きする場合は、`prepare-content:overwrite` を使います。通常の公開作業ではD1編集用の `content:edit` を使ってください。

```bash
pnpm prepare-content
pnpm build

# MDXをD1へ明示的に上書きする場合
pnpm prepare-content:overwrite

# production D1へ同期する場合
D1_DATABASE_LOCATION=remote pnpm prepare-content
pnpm build

# remote D1で記事を公開する場合。実行前にexportを自動作成します。
pnpm content:edit -- --remote --slug my-article --publish --yes

# remote D1のtopicsを置き換える場合
pnpm content:edit -- --remote --slug my-article --topic TypeScript --topic Next.js --yes
```

`content:edit` はデフォルトでlocal D1を対象にします。`--remote` を指定した更新には `--yes` が必要です。`--dry-run` を付けるとSQLだけを表示し、D1を変更しません。更新前のD1 exportは `apps/web/.local/d1-backups/` に保存します。

APIでは、次のread endpointを提供します。

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

リモートへ適用する前に、`wrangler.jsonc` の `d1_databases[0].database_id` に作成したUUIDを設定してください。Workers Builds側には、D1 migrationを実行できるCloudflare API tokenを設定します。

### MDX テンプレート作成スクリプト

新しいブログ記事やページを作るテンプレート生成スクリプトを用意しています。

```bash
# ブログ記事を作成
pnpm create-mdx -- --slug my-article
pnpm create-mdx -- -s stern-brocot-tree

# ページを作成
pnpm create-mdx -- --slug about --type page
```

作成後の作業は、次のとおりです。

1. 生成されたMDXファイルを開く
2. `title`, `description`, `excerpt`, `topics` を編集
3. コンテンツを記述
4. `pnpm dev` で確認

詳しいオプションは、次のコマンドで確認できます。

```bash
pnpm create-mdx -- --help
```

### MDX バリデーション

MDXファイルの形式と必須フィールドを検証できます。

```bash
# すべてのMDXファイルをバリデーション
pnpm validate-mdx
```

次の項目を確認します。

- 必須フィールドの存在確認（title, date, description, excerpt, topics, lastUpdated, contentHash）
- dateとlastUpdatedがタイムゾーン付きISO8601形式か
- contentHash が現在のコンテンツと一致するか

### 自動更新とCI/CD

#### pre-commitフック

コミット時には、次の処理を実行します。
1. ステージングされたMDXファイルのメタデータを自動フォーマット（フィールドの順序を標準化）
2. コンテンツが変更された場合、`lastUpdated` と `contentHash` を自動更新
3. 更新されたファイルを自動的に再ステージング
4. すべてのMDXファイルをバリデーション（エラーがある場合はコミットを中断）

#### GitHub Actions CI (`.github/workflows/ci.yml`)

次の項目を確認します。

- MDXファイルのバリデーション
- Biome formatter/linter
- frontend/backendのTypeScript check
- backend APIのVitest test
- ビルド

Cloudflare Workers Buildsは、mainへのpushを起点にデプロイします。Build commandには `D1_DATABASE_LOCATION=remote pnpm prepare-content && pnpm build` を、Deploy commandには `pnpm exec wrangler deploy` を指定します。Build commandの前半でschema migration、MDXからD1へのcontent同期、remote D1からのID同期を実行し、後半でD1を書き換えずに静的assetsを生成します。

### 共通ユーティリティ (`apps/web/scripts/lib/mdx-utils.ts`)

MDX関連スクリプトでは、次の関数を共通して使います。

- `calculateHash(content)` - コンテンツのSHA256ハッシュを計算
- `getCurrentDateISO()` - タイムゾーン付きISO8601形式の現在日時を取得
- `isISOWithTimezone(dateString)` - 日付文字列がISO8601形式かチェック
- `convertDateToISO(dateString)` - 日付文字列をISO8601形式に変換

これらの関数は、`create-mdx`、`update-mdx-metadata`、`validate-mdx` などのスクリプトで共通して使われています。
