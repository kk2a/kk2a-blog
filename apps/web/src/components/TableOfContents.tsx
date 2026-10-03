"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  className?: string;
  headingSelector?: string; // カスタムセレクタ（オプション）
}

function getHeadingsFromMain(customSelector?: string): NodeListOf<Element> {
  // カスタムセレクタが指定されている場合はそれを使用
  if (customSelector) {
    const customHeadings = document.querySelectorAll(customSelector);
    return customHeadings;
  }

  return document.querySelectorAll("h1, h2, h3, h4, h5, h6");
}

export function TableOfContents({
  className = "",
  headingSelector,
}: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const updateToc = () => {
      const headings = getHeadingsFromMain(headingSelector);
      const tocItemsFromDom: TocItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1)) || 2; // デフォルトレベル2（注釈・参考文献用）
        const text = heading.textContent || "";
        let id = heading.id;

        // IDが設定されていない場合、自動生成
        if (!id) {
          id = `heading-${index}`;
          heading.id = id;
        }

        tocItemsFromDom.push({ id, text, level });
      });

      setToc(tocItemsFromDom);
    };

    // 初回実行
    updateToc();

    // MutationObserverでDOM変更を監視
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // 見出し要素や注釈・参考文献セクションが追加されたかチェック
              const hasHeadings =
                element.matches("h1, h2, h3, h4, h5, h6") ||
                element.querySelector("h1, h2, h3, h4, h5, h6");
              const hasFootnotes =
                element.id === "footnotes" ||
                element.querySelector("#footnotes");
              const hasReferences =
                element.id === "references" ||
                element.querySelector("#references");

              if (hasHeadings || hasFootnotes || hasReferences) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        // 少し遅延してから更新（レンダリング完了を待つ）
        setTimeout(updateToc, 100);
      }
    });

    // ドキュメント全体を監視
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // フォールバック: 一定時間後に再チェック
    const fallbackTimer = setTimeout(updateToc, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [headingSelector]);

  useEffect(() => {
    // スクロール時のアクティブな見出しを追跡
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -80% 0%",
      }
    );

    // 少し遅延してから観察開始（DOM生成待ち）
    const timer = setTimeout(() => {
      toc.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        } else {
          console.warn(`Element with id "${id}" not found`);
        }
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [toc]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // ヘッダーなどの固定要素のオフセットを考慮
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // アクティブIDを即座に更新（視覚的なフィードバック）
      setActiveId(id);
    } else {
      console.warn(`Element with id "${id}" not found for scrolling`);
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className={`toc ${className}`}>
      <div className="sticky top-4">
        <div className="backdrop-blur-sm rounded-lg border border-theme-border shadow-lg overflow-hidden">
          <div className="p-2">
            <h3 className="text-lg font-semibold text-theme-1 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              目次
            </h3>
          </div>
          <div className="p-1 max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
            <ul className="space-y-1">
              {toc.map(({ id, text, level }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToHeading(id)}
                    className={`
                      block w-full text-left text-sm tob-transition
                      hover:text-table-of-contents-2 rounded px-2 py-1
                      cursor-pointer border-l-2
                      ${
                        activeId === id
                          ? "text-table-of-contents-1 border-blue-400 bg-table-of-contents-1"
                          : "text-theme-3 border-transparent hover:border-gray-600"
                      }
                      ${level === 1 ? "ml-0" : ""}
                      ${level === 2 ? "ml-3" : ""}
                      ${level === 3 ? "ml-6" : ""}
                      ${level === 4 ? "ml-9" : ""}
                      ${level >= 5 ? "ml-12" : ""}
                    `}
                    title={`${text}に移動`}
                  >
                    <span className="block truncate">{text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
