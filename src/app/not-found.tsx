import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-theme-1 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-theme-2 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-theme-2 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ホームに戻る
        </Link>
        <Link
          href="/blog"
          className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          記事一覧を見る
        </Link>
      </div>
    </div>
  );
}
