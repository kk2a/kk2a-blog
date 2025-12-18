import Link from "next/link";
import { BlogPost, getBlogId } from "@/lib/blog";
import CategoryList from "./CategoryList";
import TagList from "./TagList";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const blogId = getBlogId(post.slug);
  const isTestPost = blogId < 0;

  return (
    <article className="rounded-lg shadow-sm transition duration-200 overflow-hidden hover:shadow-md border border-theme-border">
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-theme-3 mb-2">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ja-JP")}
          </time>
          <div className="flex items-center gap-2">
            <span className="font-mono">#{blogId}</span>
            {isTestPost && (
              <span className="px-1.5 py-0.5 text-xs rounded test-badge">
                テスト
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-theme-1 mb-3 line-clamp-2">
          <Link
            href={`/blog/${blogId}`}
            className="hover:text-card text-transition"
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
