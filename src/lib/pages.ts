import fs from "fs";
import path from "path";
import matter from "gray-matter";

const pagesDirectory = path.join(process.cwd(), "content/pages");

export interface PageData {
  slug: string;
  title: string;
  description?: string;
  lastUpdated?: string;
  content: string;
}

export async function getPageData(slug: string): Promise<PageData | null> {
  try {
    const fullPath = path.join(pagesDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      description: data.description,
      lastUpdated: data.lastUpdated,
      content,
    };
  } catch (error) {
    console.error(`Error reading page ${slug}:`, error);
    return null;
  }
}

export async function getAllPages(): Promise<PageData[]> {
  try {
    if (!fs.existsSync(pagesDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(pagesDirectory);
    const pages = await Promise.all(
      fileNames
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => {
          const slug = name.replace(/\.mdx$/, "");
          return getPageData(slug);
        })
    );

    return pages.filter((page): page is PageData => page !== null);
  } catch (error) {
    console.error("Error reading pages:", error);
    return [];
  }
}
