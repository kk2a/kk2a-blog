import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white bg-theme-card rounded-lg shadow-md overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-200 border-theme-border">
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 text-theme-muted-foreground mb-2">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </time>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-theme-card-foreground mb-3 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-600 text-theme-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((category) => (
            <Link
              key={category}
              href={`/categories/${category}`}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="px-2 py-1 bg-gray-100 bg-theme-muted text-gray-700 text-theme-muted-foreground text-xs rounded hover:bg-gray-200 hover:bg-theme-accent transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-500 text-theme-muted-foreground">
              +{post.tags.length - 3}個
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
