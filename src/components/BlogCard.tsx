import Link from "next/link";
import { BlogPost } from "@/lib/blog";
import CategoryList from "./CategoryList";
import TagList from "./TagList";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-theme-border">
      <div className="p-6">
        <div className="flex items-center text-sm text-theme-3 mb-2">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </time>
        </div>

        <h2 className="text-xl font-bold text-theme-1 mb-3 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:dark:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-theme-3 mb-4 line-clamp-3">{post.excerpt}</p>

        <div className="categories mb-4">
          <CategoryList categories={post.categories} />
        </div>
        <div className="tags">
          <TagList tags={post.tags} displayLimit={3} />
        </div>
      </div>
    </article>
  );
}
