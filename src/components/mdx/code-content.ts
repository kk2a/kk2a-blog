import { isValidElement, type ReactNode } from "react";

/**
 * Extracts the source text from the different React child shapes produced by
 * MDX expressions, including arrays and nested elements.
 */
export function getCodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getCodeText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(children)) {
    return getCodeText(children.props.children);
  }

  return "";
}
