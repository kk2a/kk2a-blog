import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import { getAllTopics, getPublicPostsByTopic } from "@/lib/blog";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return getAllTopics().map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props) {
  const topic = decodeURIComponent((await params).topic);
  return {
    title: `${topic}の記事 | ${siteConfig.name}`,
    description: `${topic}に関する記事一覧`,
  };
}

export default async function TopicPage({ params }: Props) {
  const topic = decodeURIComponent((await params).topic);
  const posts = getPublicPostsByTopic(topic).reverse();

  if (!getAllTopics().includes(topic)) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <nav className="mb-8">
        <Link href="/blog" className="text-url-1 hover:text-url-2 text-transition">
          ← 記事一覧に戻る
        </Link>
      </nav>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-theme-1 mb-4">{topic}の記事</h1>
        <p className="text-xl text-theme-2">{posts.length}件の記事が見つかりました</p>
      </div>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      ) : (
        <p className="text-center text-theme-2 text-lg">このトピックにはまだ記事がありません。</p>
      )}
    </div>
  );
}
