"use client";

import React, { useState, useEffect } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

// 脚注の参照番号を管理するコンテキスト
const FootnoteContext = React.createContext<{
  footnotes: Array<{ id: string; content: React.ReactNode }>;
  addFootnote: (id: string, content: React.ReactNode) => number;
  clearFootnotes: () => void;
}>({
  footnotes: [],
  addFootnote: () => 0,
  clearFootnotes: () => {},
});

// 脚注プロバイダー
export const FootnoteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [footnotes, setFootnotes] = useState<
    Array<{ id: string; content: React.ReactNode }>
  >([]);

  const addFootnote = (id: string, content: React.ReactNode): number => {
    setFootnotes((prev) => {
      const existing = prev.findIndex((f) => f.id === id);
      if (existing !== -1) {
        return prev;
      }
      return [...prev, { id, content }];
    });
    return footnotes.findIndex((f) => f.id === id) + 1 || footnotes.length + 1;
  };

  const clearFootnotes = () => {
    setFootnotes([]);
  };

  return (
    <FootnoteContext.Provider
      value={{ footnotes, addFootnote, clearFootnotes }}
    >
      {children}
    </FootnoteContext.Provider>
  );
};

// 脚注参照コンポーネント
export const FootnoteRef: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const { addFootnote } = React.useContext(FootnoteContext);
  const [refNumber, setRefNumber] = useState<number>(0);

  useEffect(() => {
    const number = addFootnote(id, children);
    setRefNumber(number);
  }, [id, children, addFootnote]);

  return (
    <sup className="footnote-ref" id={`footnote-ref-${id}`}>
      <HoverCard.Root openDelay={10} closeDelay={10}>
        <HoverCard.Trigger asChild>
          <a
            href={`#footnote-${id}`}
            className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover no-underline text-transition"
            title="脚注を見る"
          >
            {refNumber}
          </a>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="footnote-tooltip z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            side="top"
            align="start"
            sideOffset={8}
            collisionPadding={16}
            alignOffset={0}
          >
            <div className="footnote-tooltip-header">注釈 {refNumber}</div>
            <div className="footnote-tooltip-content">{children}</div>
            <HoverCard.Arrow
              className="fill-[var(--tooltip-border)]"
              width={12}
              height={8}
            />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </sup>
  );
};

// 脚注リスト表示コンポーネント
export const FootnoteList: React.FC = () => {
  const { footnotes } = React.useContext(FootnoteContext);

  if (footnotes.length === 0) {
    return null;
  }

  return (
    <div className="footnotes mt-12 pt-8 border-t border-theme-border">
      <h2
        id="footnotes"
        className="text-3xl font-semibold text-theme-1 mb-4 mt-8"
      >
        注釈
      </h2>
      <ol className="space-y-2">
        {footnotes.map((footnote) => (
          <li
            key={footnote.id}
            id={`footnote-${footnote.id}`}
            className="text-sm text-theme-2 leading-relaxed"
          >
            <a
              href={`#footnote-ref-${footnote.id}`}
              className="mr-2 text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover no-underline inline-block"
              title="本文に戻る"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                className="inline transform hover:scale-110 hover:rotate-12 transition-all duration-200"
                aria-label="本文に戻る"
              >
                {/* 本/ページ戻りアイコン */}
                <path
                  d="M2 2 L2 10 L6 8 L10 10 L10 2 Z"
                  fill="currentColor"
                  opacity="0.8"
                />
              </svg>
            </a>
            {footnote.content}
          </li>
        ))}
      </ol>
    </div>
  );
};
