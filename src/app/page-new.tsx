import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';

export default function Home() {
  const posts = getAllPosts().slice(0, 6); // 最新6記事を表示

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ヒーローセクション */}
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          KK2A Blog
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          モダンなWeb技術の学習と共有を目的としたブログサイトです。
          Next.js、React、TypeScriptなどの技術について学んだことを記録し、
          知見を共有していきます。
        </p>
        <Link
          href="/blog"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          記事を読む
        </Link>
      </section>

      {/* 最新記事セクション */}
      <section className="py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">最新記事</h2>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
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
            <p className="text-gray-600 text-lg">
              まだ記事がありません。最初の記事をお楽しみに！
            </p>
          </div>
        )}
      </section>

      {/* 紹介セクション */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            このブログについて
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                学習記録
              </h3>
              <p className="text-gray-600">
                新しい技術を学んだ過程や躓いた点、解決方法を詳しく記録しています。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                実践的な内容
              </h3>
              <p className="text-gray-600">
                実際にコードを書きながら学んだ内容を、具体例とともに紹介します。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                継続的な更新
              </h3>
              <p className="text-gray-600">
                学習を続けながら定期的に新しい記事を追加していきます。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
