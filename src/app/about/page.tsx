import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPageData } from "@/lib/pages";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadingsFromMDX } from "@/lib/toc";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `このブログについて | ${siteConfig.name}`,
  description: `${siteConfig.name}の運営者情報とブログの目的について`,
};

export default async function AboutPage() {
  const pageData = await getPageData("about");

  if (!pageData) {
    notFound();
  }

  // MDXコンテンツから見出しを抽出
  const tocItems = extractHeadingsFromMDX(pageData.content);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col xl:flex-row gap-8">
        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            <MDXRemote source={pageData.content} components={mdxComponents} />
          </div>

          {pageData.lastUpdated && (
            <div className="mt-8 pt-4 border-t border-theme-border">
              <p className="text-sm text-theme-3">
                最終更新:{" "}
                {new Date(pageData.lastUpdated).toLocaleDateString("ja-JP")}
              </p>
            </div>
          )}
        </div>

        {/* サイドバー（目次） */}
        <aside className="xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-4 xl:self-start">
          <TableOfContents className="xl:block hidden" tocItems={tocItems} />
        </aside>
      </div>
    </div>
  );
}
