import Link from "next/link";
import React from "react";

interface TagListProps {
  tags: string[];
  displayLimit?: number; // オプションで表示するタグの数を制限
}

const TagList: React.FC<TagListProps> = ({ tags, displayLimit }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {(displayLimit ? tags : tags.slice(0, displayLimit)).map((tag) => (
        <Link
          key={tag}
          href={`/tags/${tag}`}
          className="rounded px-2 py-1 text-sm bg-tag-1 hover:bg-tag-2 text-tag-1 transition-colors"
        >
          #{tag}
        </Link>
      ))}
      {displayLimit && tags.length > displayLimit && (
        <span className="py-1 text-center text-sm text-theme-3">
          +{tags.length - displayLimit}個
        </span>
      )}
    </div>
  );
};

export default TagList;
