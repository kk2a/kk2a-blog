import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { getCodeText } from "./code-content";

describe("getCodeText", () => {
  it("keeps text from MDX expression children", () => {
    expect(getCodeText("\n  const answer = 42;\n")).toBe(
      "\n  const answer = 42;\n",
    );
  });

  it("joins arrays and nested elements", () => {
    const children = [
      "\n  const answer = ",
      createElement("span", null, 42),
      ";\n",
    ];

    expect(getCodeText(children)).toBe("\n  const answer = 42;\n");
  });

  it("ignores empty React children", () => {
    expect(getCodeText([null, false, undefined, "code"])).toBe("code");
  });
});
