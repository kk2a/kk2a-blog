import { describe, expect, it } from "vitest";
import { normalizeTopics, renderContentEditSql } from "./content-edit";

describe("content editing SQL", () => {
  it("normalizes duplicate and blank topics", () => {
    expect(normalizeTopics([" DB ", "", "DB", "SQL"])).toEqual([
      "DB",
      "SQL",
    ]);
  });

  it("renders a safe publish and topic replacement", () => {
    const sql = renderContentEditSql({
      slug: "author's-post",
      status: "published",
      topics: ["O'Reilly"],
    });

    expect(sql).toContain("status = 'published'");
    expect(sql).toContain("WHERE slug = 'author''s-post'");
    expect(sql).toContain("VALUES ('O''Reilly', 'O''Reilly')");
    expect(sql).toContain("DELETE FROM post_topics");
    expect(sql).not.toContain("BEGIN");
  });

  it("can clear topics without changing status", () => {
    const sql = renderContentEditSql({ slug: "post", topics: [] });

    expect(sql).toContain("UPDATE posts SET updated_at = CURRENT_TIMESTAMP");
    expect(sql).toContain("DELETE FROM post_topics");
    expect(sql).not.toContain("status =");
  });
});
