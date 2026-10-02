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

  it("assigns stable unique IDs to duplicate headings", async () => {
    const Heading = ({
      children,
      id,
    }: {
      children: ReactNode;
      id?: string;
    }) => React.createElement("h2", { id }, children);
    const source = "## Same heading\n\n## Same heading";

    const firstResult = await compileMDX({
      source,
      components: { h2: Heading },
      options: blogMdxOptions,
    });
    const secondResult = await compileMDX({
      source,
      components: { h2: Heading },
      options: blogMdxOptions,
    });

    const firstMarkup = renderToStaticMarkup(firstResult.content);
    const secondMarkup = renderToStaticMarkup(secondResult.content);

    expect(firstMarkup).toContain('id="same-heading"');
    expect(firstMarkup).toContain('id="same-heading-1"');
    expect(secondMarkup).toBe(firstMarkup);
  });
});
