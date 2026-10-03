import Link from "next/link";
import { getPublicPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import { siteConfig } from "@/config/site";

export default function Home() {
  const posts = getPublicPosts()
    .reverse()
    .slice(0, siteConfig.blog.postsPerPage); // 新しい記事を最初に表示

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ヒーローセクション */}
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold text-theme-1 mb-6">
          {siteConfig.name}
        </h1>
        <p className="text-xl text-theme-3 mb-8 max-w-3xl mx-auto">
          {siteConfig.description}
        </p>
        <Link
          href="/blog"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold btn-transition"
        >
          記事を読む
        </Link>
      </section>

      {/* 最新記事セクション */}
      <section className="py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-theme-1">最新記事</h2>
          <Link
            href="/blog"
            className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover font-medium text-transition"
          >
            すべて見る →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              まだ記事がありません。最初の記事をお楽しみに！
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
