import {
  AlertBox,
  CodeBlock,
  ImageWithCaption,
  FootnoteRef,
  FootnoteList,
  ReferenceRef,
  ReferenceList,
  Reference,
  Equation,
  Theorem,
  Proposition,
  Lemma,
  Corollary,
  Definition,
  Example,
  Proof,
  Remark,
  Problem,
  Solution,
  LabelRef,
} from "./index";
import { GithubIcon, TwitterIcon } from "@/components/icons/SocialIcons";
import { siteConfig } from "@/config/site";
import { generateSlug } from "@/lib/toc";
import React from "react";

// サイト名を表示するコンポーネント
const SiteName = () => siteConfig.name;

// 見出しIDの重複を防ぐためのカウンター
let headingCounter = 0;

// ユニークなIDを生成する関数
const generateUniqueId = (baseId: string): string => {
  return baseId + `-${headingCounter++}`;
};

// 見出しコンポーネント作成関数
const createHeading = (level: number, className: string) => {
  const HeadingComponent = ({
    children,
    id,
    ...props
  }: {
    children: React.ReactNode;
    id?: string;
    [key: string]: unknown;
  }) => {
    // 外部から渡されたIDがある場合はそれを使用（ユニーク性をチェック）
    let headingId = id;

    if (headingId) {
      headingId = generateUniqueId(headingId);
    } else if (typeof children === "string") {
      // children（テキスト）からスラッグを生成
      const slug = generateSlug(children);
      const baseId = slug || `heading`;
      headingId = generateUniqueId(baseId);
    } else {
      // childrenが文字列でない場合（JSX要素など）
      const baseId = `heading`;
      headingId = generateUniqueId(baseId);
    }

    return React.createElement(
      `h${level}`,
      { id: headingId, className, ...props },
      children
    );
  };

  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
};

export const mdxComponents = {
  AlertBox,
  CodeBlock,
  ImageWithCaption,
  FootnoteRef,
  FootnoteList,
  ReferenceRef,
  ReferenceList,
  Reference,
  Equation,
  Theorem,
  Proposition,
  Lemma,
  Corollary,
  Definition,
  Example,
  Proof,
  Remark,
  Problem,
  Solution,
  GithubIcon,
  TwitterIcon,
  SiteName,
  LabelRef,
  // HTML要素のカスタマイズ
  h1: createHeading(1, "text-4xl font-bold text-theme-1 mb-6"),
  h2: createHeading(2, "text-3xl font-semibold text-theme-1 mb-4 mt-8"),
  h3: createHeading(3, "text-2xl font-semibold text-theme-1 mb-3 mt-6"),
  h4: createHeading(4, "text-xl font-semibold text-theme-1 mb-3 mt-6"),
  h5: createHeading(5, "text-lg font-semibold text-theme-1 mb-2 mt-4"),
  h6: createHeading(6, "text-base font-semibold text-theme-1 mb-2 mt-4"),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-theme-2 mb-4 leading-relaxed text-justify">{children}</p>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    // MDX内の<strong>タグの色を変更（リンクと近いが区別される強調色）
    <strong className="text-strong font-semibold">{children}</strong>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="text-theme-2 mb-4 list-disc ml-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="text-theme-2 mb-4 list-decimal ml-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-theme-2 leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-theme-3 my-4">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code
      className="px-1 py-0.5 rounded text-sm font-mono bg-code text-code"
      style={{ backgroundColor: "var(--code-bg)", color: "var(--code-text)" }}
    >
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="border border-theme-border rounded-lg p-4 overflow-x-auto my-4 bg-code custom-scrollbar">
      <code className="text-sm font-mono text-code">{children}</code>
    </pre>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  // テーブル要素
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="table-container overflow-x-auto my-6">
      <table className="prose w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  th: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  td: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  hr: () => <hr className="border-t border-theme-border mb-1" />,
  // カスタムdivクラス（MDXで使用可能）
  div: ({
    className,
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
};
