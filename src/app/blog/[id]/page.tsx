import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllBlogIds, getBlogPostById } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { FootnoteProvider } from "@/components/mdx/Footnote";
import { ReferenceProvider } from "@/components/mdx/Reference";
import { MathProvider } from "@/components/mdx/MathComponents";
import { TableOfContents } from "@/components/TableOfContents";
import { siteConfig } from "@/config/site";
import remarkGfm from "remark-gfm";
import TopicList from "@/components/TopicList";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const blogIds = getAllBlogIds();
  return blogIds.map((blogId) => ({
    id: blogId.toString(),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const blogId = parseInt(id);
  const post = getBlogPostById(blogId);

  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }

  const isTestPost = post.status === "draft";
  const titleSuffix = isTestPost ? " [テスト]" : "";

  return {
    title: `${post.title}${titleSuffix} | ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title + titleSuffix,
      description: post.excerpt,
      siteName: siteConfig.name,
      type: "article",
      images: ["https://blog.kk2a.net/ogp-image.jpg"],
    },
    twitter: {
      card: "summary",
      title: post.title + titleSuffix,
      description: post.excerpt,
      images: ["https://blog.kk2a.net/ogp-image.jpg"],
    },
  };
}

export default async function BlogPostById({ params }: Props) {
  const { id } = await params;
  const blogId = parseInt(id);
  const post = getBlogPostById(blogId);

  if (!post || isNaN(blogId)) {
    notFound();
  }

  const isTestPost = post.status === "draft";

  // MDXコンテンツから見出しを抽出
  let headingSelectors = [1, 2, 3, 4, 5, 6]
    .map((level) => `article > div > div > div > h${level}`)
    .join(", ");
  headingSelectors += ", #footnotes";
  headingSelectors += ", #references";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* テスト記事の警告バナー */}
      {isTestPost && (
        <div className="mb-8 p-4 rounded-lg border test-warning-box">
          <div className="flex items-center">
            <span className="text-lg mr-2">🧪</span>
            <div>
              <h3 className="font-semibold test-warning-text">
                テスト・実験用記事
              </h3>
              <p className="text-sm test-warning-text opacity-80">
                この記事は実験や動作確認用のものです。内容は予告なく変更される場合があります。
              </p>
            </div>
          </div>
        </div>
      )}
      <article>
        {/* パンくずリスト */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-theme-3">
            <li>
              <Link href="/" className="hover:text-theme-1 text-transition">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-theme-1 text-transition">
                ブログ
              </Link>
            </li>
            <li>/</li>
            <li className="text-theme-1">
              {post.title}
              {isTestPost && (
                <span className="ml-1 test-warning-text">[テスト]</span>
              )}
            </li>
          </ol>
        </nav>

        {/* 記事ヘッダー */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-theme-1">{post.title}</h1>
            {isTestPost && (
              <span className="px-2 py-1 text-xs rounded test-badge">
                テスト
              </span>
            )}
          </div>

          <div className="flex items-center mb-6 text-theme-2">
            <div className="flex items-center">
              <span className="mr-2">公開:</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ja-JP")}
              </time>
            </div>
            {post.lastUpdated && post.lastUpdated !== post.date && (
              <>
                <span className="mx-3">•</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">更新:</span>
                  <time dateTime={post.lastUpdated}>
                    {new Date(post.lastUpdated).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              </>
            )}
            <span className="mx-3">•</span>
            <div className="flex items-center">
              <span className="text-sm mr-2">ID:</span>
              <span className="font-mono text-sm">{blogId}</span>
            </div>
          </div>

          {/* トピック（旧カテゴリとタグを統合） */}
          <div className="flex flex-wrap gap-4 mb-8">
            <TopicList topics={post.topics} />
          </div>
        </header>

        {/* 記事本文と目次 */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            <FootnoteProvider>
              <ReferenceProvider>
                <MathProvider>
                  <div className="prose prose-lg max-w-none">
                    <MDXRemote
                      source={post.content}
                      components={mdxComponents}
                      options={{
                        mdxOptions: {
                          remarkPlugins: [remarkGfm, remarkMath],
                          rehypePlugins: [rehypeKatex],
                        },
                      }}
                    />
                  </div>
                </MathProvider>
              </ReferenceProvider>
            </FootnoteProvider>
          </div>

          {/* サイドバー（目次） */}
          <aside className="xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-4 xl:self-start">
            <TableOfContents
              className="xl:block hidden"
              headingSelector={headingSelectors}
            />
          </aside>
        </div>

        {/* ナビゲーション */}
        <nav className="mt-16 pt-8 border-t border-theme-border">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover text-transition"
            >
              ← 記事一覧に戻る
            </Link>
          </div>
        </nav>
      </article>
    </div>
  );
}
