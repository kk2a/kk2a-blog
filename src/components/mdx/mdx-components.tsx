import { AlertBox, CodeBlock, ImageWithCaption } from "./index";
import { GithubIcon, TwitterIcon } from "@/components/icons/SocialIcons";
import { siteConfig } from "@/config/site";
import { generateSlug } from "@/lib/toc";
import React from "react";

// サイト名を表示するコンポーネント
const SiteName = () => siteConfig.name;

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
    // 外部から渡されたIDがある場合はそれを使用
    // なければ、children（テキスト）からスラッグを生成
    let headingId = id;

    if (!headingId && typeof children === "string") {
      const slug = generateSlug(children);
      headingId = slug || `heading-${Math.random().toString(36).substr(2, 9)}`;
    } else if (!headingId) {
      // childrenが文字列でない場合（JSX要素など）の場合
      headingId = `heading-${Math.random().toString(36).substr(2, 9)}`;
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
  GithubIcon,
  TwitterIcon,
  SiteName,
  // HTML要素のカスタマイズ
  h1: createHeading(1, "text-4xl font-bold text-gray-100 mb-6"),
  h2: createHeading(2, "text-3xl font-semibold text-gray-50 mb-4 mt-8"),
  h3: createHeading(3, "text-2xl font-semibold text-gray-50 mb-3 mt-6"),
  h4: createHeading(4, "text-xl font-semibold text-gray-50 mb-3 mt-6"),
  h5: createHeading(5, "text-lg font-semibold text-gray-50 mb-2 mt-4"),
  h6: createHeading(6, "text-base font-semibold text-gray-50 mb-2 mt-4"),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="text-gray-300 mb-4 list-disc ml-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="text-gray-300 mb-4 list-decimal ml-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-300 leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="border border-gray-700 rounded-lg p-4 overflow-x-auto my-4">
      <code className="text-gray-100 text-sm font-mono">{children}</code>
    </pre>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
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
