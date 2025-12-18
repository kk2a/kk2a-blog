import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true, // Disable Next.js image optimization
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

export default withMDX(nextConfig);
