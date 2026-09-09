import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

// MDX is loaded from this repository, so allow expressions used by CodeBlock
// while keeping next-mdx-remote's dangerous-expression protection enabled.
export const blogMdxOptions = {
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
};
