import {
  getAllCategoryHashes,
  getPostsByCategory,
  getCategoryFromHash,
} from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categoryHashes = getAllCategoryHashes();
  return categoryHashes.map((categoryHash) => ({
    category: categoryHash,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  // console.log(getAllCategoryHashes());
  const originalCategory = getCategoryFromHash(category);

  if (!originalCategory) {
    return {
      title: `カテゴリが見つかりません | ${siteConfig.name}`,
      description: `指定されたカテゴリは存在しません`,
    };
  }

  return {
    title: `${originalCategory}の記事 | ${siteConfig.name}`,
    description: `${originalCategory}カテゴリの記事一覧`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const originalCategory = getCategoryFromHash(category);

  if (!originalCategory) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-theme-1 mb-4">
            カテゴリが見つかりません
          </h1>
          <p className="text-xl text-theme-2 mb-8">
            指定されたカテゴリは存在しません。
          </p>
          <Link
            href="/blog"
            className="text-url-1 hover:text-url-2 transition-colors"
          >
            すべての記事を見る
          </Link>
        </div>
      </div>
    );
  }

  const posts = getPostsByCategory(originalCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            <Link href="/blog" className="hover:text-theme-1 transition-colors">
              ブログ
            </Link>
          </li>
          <li>/</li>
          <li className="text-theme-1">カテゴリー: {originalCategory}</li>
        </ol>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-theme-1 mb-4">
          {originalCategory}の記事
        </h1>
        <p className="text-xl text-theme-2">
          {posts.length}件の記事が見つかりました
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
          <p className="text-theme-2 text-lg">
            このカテゴリーにはまだ記事がありません。
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-block text-url-1 hover:text-url-2 transition-colors"
          >
            すべての記事を見る
          </Link>
        </div>
      )}
    </div>
  );
}
