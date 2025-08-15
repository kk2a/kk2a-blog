import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { TableOfContents } from "@/components/TableOfContents";
import { siteConfig } from "@/config/site";
import remarkGfm from "remark-gfm";
import CategoryList from "@/components/CategoryList";
import TagList from "@/components/TagList";
// import { Tag } from "lucide-react";

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
  // console.log(post.content);
  const headingSelectors = [1, 2, 3, 4, 5, 6]
    .map((level) => `article > div > div > div > h${level}`)
    .join(", ");
  // console.log(headingSelectors);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article>
        {/* パンくずリスト */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-theme-3">
            <li>
              <Link href="/" className="hover:text-theme-1 transition-colors">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/blog"
                className="hover:text-theme-1 transition-colors"
              >
                ブログ
              </Link>
            </li>
            <li>/</li>
            <li className="text-theme-1">{post.title}</li>
          </ol>
        </nav>

        {/* 記事ヘッダー */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-theme-1 mb-6">{post.title}</h1>

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
          </div>

          {/* カテゴリーとタグ  ここはコンポーネント化しよう*/}
          <div className="flex flex-wrap gap-4 mb-8">
            <CategoryList categories={post.categories} />
            <TagList tags={post.tags} />
          </div>
        </header>

        {/* 記事本文と目次 */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </div>
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
          <Link
            href="/blog"
            className="inline-flex items-center text-url-1 hover:text-url-2 transition-colors"
          >
            ← 記事一覧に戻る
          </Link>
        </nav>
      </article>
    </div>
  );
}
