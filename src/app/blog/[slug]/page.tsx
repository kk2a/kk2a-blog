import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadingsFromMDX } from "@/lib/toc";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "ページが見つかりません",
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // MDXコンテンツから見出しを抽出
  const tocItems = extractHeadingsFromMDX(post.content);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article>
        {/* パンくずリスト */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/blog"
                className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                ブログ
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-gray-100">{post.title}</li>
          </ol>
        </nav>

        {/* 記事ヘッダー */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center">
              <span className="text-sm mr-2">公開:</span>
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
          </div>

          {/* カテゴリーとタグ */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Link
                  key={category}
                  href={`/categories/${category}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* 記事本文と目次 */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="prose dark:prose-invert prose-lg max-w-none">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>
          </div>

          {/* サイドバー（目次） */}
          <aside className="xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-4 xl:self-start">
            <TableOfContents className="xl:block hidden" tocItems={tocItems} />
          </aside>
        </div>

        {/* ナビゲーション */}
        <nav className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            ← 記事一覧に戻る
          </Link>
        </nav>
      </article>
    </div>
  );
}
