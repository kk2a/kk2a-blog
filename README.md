# 死人に口なし

モダンな Web 技術の学習と共有を目的としたブログサイトです。Next.js App Router と MDX を使用して構築されています。

## 特徴

- **Modern Stack**: Next.js 15 + React 19 + TypeScript
- **MDX Support**: Markdown 記法で React コンポーネントを使用可能
- **レスポンシブデザイン**: Tailwind CSS によるモバイルファーストデザイン
- **静的サイト生成**: 高速なページ表示
- **カテゴリー・タグ機能**: 記事の分類と検索
- **SEO 最適化**: メタデータと OpenGraph 対応

## 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **ライブラリ**: [React 19](https://reactjs.org/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **記事形式**: [MDX](https://mdxjs.com/)
- **ホスティング**: [Vercel](https://vercel.com/)

## ディレクトリ構造

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── blog/            # ブログ記事関連ページ
│   │   ├── categories/      # カテゴリページ
│   │   ├── tags/            # タグページ
│   │   ├── about/           # About ページ
│   │   └── privacy-policy/  # プライバシーポリシー
│   ├── components/          # Reactコンポーネント
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── Footer.tsx       # フッター
│   │   └── BlogCard.tsx     # 記事カード
│   └── lib/                 # ユーティリティ関数
│       └── blog.ts          # 記事管理関数
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
