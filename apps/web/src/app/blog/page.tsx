import { getPublicPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";

export default function BlogPage() {
  const posts = getPublicPosts().reverse(); // 新しい記事を最初に表示

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-theme-1 mb-4">ブログ記事一覧</h1>
        <p className="text-xl text-theme-2">
          技術的な学習内容や知見を共有しています
        </p>
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
    </div>
  );
}
