import Link from "next/link";
import React from "react";

interface TopicListProps {
  topics: string[];
  displayLimit?: number;
}

export default function TopicList({ topics, displayLimit }: TopicListProps) {
  const visibleTopics = displayLimit ? topics.slice(0, displayLimit) : topics;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTopics.map((topic) => (
        <Link
          href={`/topics/${encodeURIComponent(topic)}`}
          key={topic}
          className="rounded-full px-3 py-1 text-sm bg-category-1 hover:bg-category-2 text-category-1 transition-colors duration-200"
        >
          {topic}
        </Link>
      ))}
      {displayLimit && topics.length > displayLimit && (
        <span className="py-1 text-center text-sm text-theme-3">
          +{topics.length - displayLimit}個
        </span>
      )}
    </div>
  );
}
