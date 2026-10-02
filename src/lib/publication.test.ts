import { describe, expect, it } from "vitest";
import { getPublishedIds, getPublishedTopicIds } from "./publication";

describe("publication filtering", () => {
  it("returns only published IDs in stable order", () => {
    expect(
      getPublishedIds([
        { id: 42, status: "published" },
        { id: -1, status: "draft" },
        { id: 7, status: "published" },
      ]),
    ).toEqual([7, 42]);
  });

  it("returns only topics attached to published posts", () => {
    expect(
      getPublishedTopicIds(
        [
          { id: 1, name: "Public topic" },
          { id: 2, name: "Draft-only topic" },
        ],
        new Set(["Public topic"]),
      ),
    ).toEqual([1]);
  });
});
