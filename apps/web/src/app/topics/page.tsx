import Link from "next/link";
import { getPublicPostsByTopic, getPublicTopics } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `topics | ${siteConfig.name}`,
  description: `${siteConfig.name}の記事をtopicsから探す`,
};

export default function TopicsPage() {
  const topics = getPublicTopics().sort((left, right) =>
    left.localeCompare(right),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-theme-1 mb-4">topics</h1>
        <p className="text-xl text-theme-2">
          記事をtopicから探せます
        </p>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const postCount = getPublicPostsByTopic(topic).length;

            return (
              <Link
                key={topic}
                href={`/topics/${encodeURIComponent(topic)}`}
                className="rounded-lg border border-theme-border bg-theme-background p-6 transition-colors hover:border-theme-1"
              >
                <h2 className="text-xl font-semibold text-theme-1">{topic}</h2>
                <p className="mt-2 text-theme-3">{postCount}件の記事</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-theme-2 text-lg">
          公開されているtopicはまだありません。
        </p>
      )}
    </div>
  );
}
