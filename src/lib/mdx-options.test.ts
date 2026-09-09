import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";
import { describe, expect, it } from "vitest";
import { blogMdxOptions } from "./mdx-options";

describe("blog MDX options", () => {
  it("preserves JavaScript expression content for CodeBlock", async () => {
    const CodeBlock = ({ children }: { children?: ReactNode }) =>
      React.createElement("pre", null, children);
    const result = await compileMDX({
      source: "<CodeBlock>{`const answer = 42;\\n`}</CodeBlock>",
      components: { CodeBlock },
      options: blogMdxOptions,
    });

    expect(renderToStaticMarkup(result.content)).toContain(
      "const answer = 42;",
    );
  });
});
