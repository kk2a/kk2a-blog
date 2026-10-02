import { describe, expect, it } from "vitest";
import { getPublishedIds } from "./publication";

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
});
