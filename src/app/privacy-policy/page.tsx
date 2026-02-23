import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPageData } from "@/lib/pages";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { TableOfContents } from "@/components/TableOfContents";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${siteConfig.name}`,
  description: `${siteConfig.name}のプライバシーポリシーと個人情報の取り扱いについて`,
};

export default async function PrivacyPolicyPage() {
  const pageData = await getPageData("privacy-policy");

  if (!pageData) {
    notFound();
  }

  // MDXコンテンツから見出しを抽出
  const headingSelectors = [1, 2, 3, 4, 5, 6]
    .map((level) => `article > div > div > div > h${level}`)
    .join(", ");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article>
        <div className="flex flex-col xl:flex-row gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-invert max-w-none">
              <MDXRemote source={pageData.content} components={mdxComponents} />
            </div>

            {/* 最終更新日 */}
            {pageData.lastUpdated && (
              <div className="mt-12 pt-6 border-t border-theme-border">
                <div className="text-sm text-theme-3">
                  <span className="mr-2">最終更新:</span>
                  <time dateTime={pageData.lastUpdated}>
                    {new Date(pageData.lastUpdated).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </time>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー（目次） */}
          <aside className="xl:w-64 xl:flex-shrink-0 xl:sticky xl:top-4 xl:self-start">
            <TableOfContents
              className="xl:block hidden"
              headingSelector={headingSelectors}
            />
          </aside>
        </div>
      </article>
    </div>
  );
}
