/**
 * サイト全体の設定ファイル
 *
 * ブログ名やタイトル、説明文などをここで一括管理できます。
 * 新しいブログ名に変更したい場合は、このファイルの `name` と `title` を変更してください。
 *
 * 例：
 * name: 'My Tech Blog'
 * title: 'My Tech Blog - プログラミングと技術の記録'
 */

// サイト全体の設定
export const siteConfig = {
  // サイト基本情報
  name: "死人に口なし",
  title: "死人に口なし",
  description: "気になったことを書きます",

  // SEO設定
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "ブログ",
    "Web開発",
    "技術ブログ",
  ] as string[],
  author: "kk2a",

  // SNS・連絡先
  social: {
    twitter: "",
    github: "",
    email: "",
  },

  // ブログ設定
  blog: {
    postsPerPage: 6,
    excerptLength: 160,
  },

  // フッター設定
  footer: {
    copyright: `© 2025 死人に口なし. All rights reserved.`,
    links: [
      { name: "記事一覧", href: "/blog" },
      { name: "運営者情報", href: "/about" },
      { name: "プライバシーポリシー", href: "/privacy-policy" },
    ],
  },

  // ナビゲーション設定
  navigation: [
    { name: "home", href: "/" },
    { name: "blog", href: "/blog" },
    { name: "kk2a", href: "/about" },
  ],
} as const;

// 型定義
export type SiteConfig = typeof siteConfig;
