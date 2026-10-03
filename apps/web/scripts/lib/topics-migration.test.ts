import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { migrateTopics } from "./topics-migration";

describe("topics migration", () => {
  it("merges legacy categories and tags without duplicates", () => {
    const migrated = migrateTopics(`---
title: Example
categories:
  - Database
  - TypeScript
tags:
  - TypeScript
  - D1
---

本文
`);
    const { data, content } = matter(migrated);

    expect(data.topics).toEqual(["Database", "TypeScript", "D1"]);
    expect(data.categories).toBeUndefined();
    expect(data.tags).toBeUndefined();
    expect(content).toContain("本文");
  });

  it("keeps an already migrated document unchanged", () => {
    const source = `---
title: Example
topics:
  - D1
---

本文
`;

    expect(migrateTopics(source)).toBe(source);
  });
});
