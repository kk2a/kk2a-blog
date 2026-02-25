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
├── scripts/                 # スクリプト
│   ├── lib/                 # 共通ユーティリティ
│   │   └── mdx-utils.ts     # MDX関連の共通関数
│   ├── create-mdx.ts        # MDXファイル作成
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
- `/categories/[category]` - カテゴリー別記事一覧
- `/tags/[tag]` - タグ別記事一覧
- `/about` - 運営者情報
- `/privacy-policy` - プライバシーポリシー

## 開発ツール

### MDX テンプレート作成スクリプト

新しいブログ記事やページを簡単に作成できるテンプレート生成スクリプトを用意しています。

```bash
# ブログ記事を作成
npm run create-mdx -- --slug my-article
npm run create-mdx -- -s stern-brocot-tree

# ページを作成
npm run create-mdx -- --slug about --type page
```

**作成後の手順:**

1. 生成されたMDXファイルを開く
2. `title`, `description`, `excerpt`, `categories`, `tags` を編集
3. コンテンツを記述
4. `npm run dev` で確認

詳しい使い方は [docs/create-mdx-guide.md](docs/create-mdx-guide.md) を参照してください。

### MDX バリデーション

MDXファイルが正しいフォーマットと必須フィールドを持っているかチェックできます。

```bash
# すべてのMDXファイルをバリデーション
npm run validate-mdx
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

**GitHub Actions CI:**

- MDXファイルのバリデーション
- ESLintチェック
- ビルド確認

すべてのチェックが通過しないとマージできません。

### 共通ユーティリティ (scripts/lib/mdx-utils.ts)

MDX関連スクリプトで共通して使用される関数群：

- `calculateHash(content)` - コンテンツのSHA256ハッシュを計算
- `getCurrentDateISO()` - タイムゾーン付きISO8601形式の現在日時を取得
- `isISOWithTimezone(dateString)` - 日付文字列がISO8601形式かチェック
- `convertDateToISO(dateString)` - 日付文字列をISO8601形式に変換

これらの関数は各スクリプト（create-mdx, update-mdx-metadata, validate-mdx, migrate-mdx-dates）で共通利用されています。
