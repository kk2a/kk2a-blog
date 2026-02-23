"use client";

import React from "react";

interface QuoteProps {
  children: React.ReactNode;
  source?: string; // 引用元の名前
  url?: string; // 引用元のURL
  author?: string; // 著者名
}

export const Quote: React.FC<QuoteProps> = ({
  children,
  source,
  url,
  author,
}) => {
  return (
    <div className="quote-container my-6">
      <blockquote
        className="border-l-4 pl-4 py-3 italic rounded-r-lg"
        style={{
          backgroundColor: "var(--quote-bg)",
          borderColor: "var(--quote-border)",
          color: "var(--quote-text)",
        }}
      >
        <div className="quote-content">{children}</div>
      </blockquote>
      {(source || author || url) && (
        <div className="quote-citation text-right text-sm text-theme-3 mt-2 mr-2">
          {author && <span className="quote-author">— {author}</span>}
          {source && !url && (
            <span className="quote-source">
              {author && ", "}
              {source}
            </span>
          )}
          {source && url && (
            <span className="quote-source">
              {author && ", "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover underline"
              >
                {source}
              </a>
            </span>
          )}
          {!source && url && (
            <span className="quote-source">
              {author && ", "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover underline"
              >
                {url}
              </a>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
