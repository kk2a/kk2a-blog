"use client";

import React, { useState, useEffect } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

// 参考文献の情報を管理するコンテキスト
const ReferenceContext = React.createContext<{
  references: Array<{ id: string; content: React.ReactNode; order: number }>;
  addReference: (id: string, content: React.ReactNode) => number;
  getReferences: () => Array<{
    id: string;
    content: React.ReactNode;
    order: number;
  }>;
  clearReferences: () => void;
}>({
  references: [],
  addReference: () => 0,
  getReferences: () => [],
  clearReferences: () => {},
});

// 参考文献プロバイダー
export const ReferenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [references, setReferences] = useState<
    Array<{ id: string; content: React.ReactNode; order: number }>
  >([]);
  const [citationOrder, setCitationOrder] = useState<string[]>([]);

  const addReference = (id: string, content: React.ReactNode): number => {
    // 既に引用されている場合は既存の番号を返す
    const existingIndex = citationOrder.indexOf(id);
    if (existingIndex !== -1) {
      return existingIndex + 1;
    }

    // 新しい引用の場合、順序を記録
    setCitationOrder((prev) => [...prev, id]);

    // 参考文献情報を追加（まだ存在しない場合）
    setReferences((prev) => {
      const existing = prev.find((r) => r.id === id);
      if (existing) {
        return prev;
      }
      return [...prev, { id, content, order: citationOrder.length }];
    });

    return citationOrder.length + 1;
  };

  const getReferences = () => {
    // 引用順序に基づいてソート
    return references
      .filter((ref) => citationOrder.includes(ref.id))
      .sort(
        (a, b) => citationOrder.indexOf(a.id) - citationOrder.indexOf(b.id)
      );
  };

  const clearReferences = () => {
    setReferences([]);
    setCitationOrder([]);
  };

  return (
    <ReferenceContext.Provider
      value={{ references, addReference, getReferences, clearReferences }}
    >
      {children}
    </ReferenceContext.Provider>
  );
};

// 参考文献参照コンポーネント（LaTeX風の \cite{} に相当）
export const ReferenceRef: React.FC<{
  id: string;
}> = ({ id }) => {
  const { addReference, references } = React.useContext(ReferenceContext);
  const [refNumber, setRefNumber] = useState<number>(0);
  const [referenceContent, setReferenceContent] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    // 対応する Reference コンポーネントの内容を探す
    const referenceData = references.find((ref) => ref.id === id);
    if (referenceData) {
      const number = addReference(id, referenceData.content);
      setRefNumber(number);
      setReferenceContent(referenceData.content);
    } else {
      // Reference が見つからない場合の警告
      console.warn(
        `Reference with id "${id}" not found. Make sure to define it with <Reference id="${id}" ... />`
      );
      setRefNumber(0);
      setReferenceContent(null);
    }
  }, [id, addReference, references]);

  if (refNumber === 0) {
    return (
      <sup
        className="reference-ref text-red-500"
        title={`Reference "${id}" not found`}
      >
        [?]
      </sup>
    );
  }

  return (
    <sup className="reference-ref" id={`reference-ref-${id}`}>
      <HoverCard.Root openDelay={10} closeDelay={10}>
        <HoverCard.Trigger asChild>
          <a
            href={`#reference-${id}`}
            className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover no-underline text-transition"
            title="参考文献を見る"
          >
            [{refNumber}]
          </a>
        </HoverCard.Trigger>
        {referenceContent && (
          <HoverCard.Portal>
            <HoverCard.Content
              className="label-ref-tooltip z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              side="top"
              align="start"
              sideOffset={8}
              collisionPadding={16}
            >
              <div className="label-ref-tooltip-header">
                参考文献 [{refNumber}]
              </div>
              <div className="label-ref-tooltip-content">
                {referenceContent}
              </div>
              <HoverCard.Arrow
                className="fill-[var(--tooltip-border)]"
                width={12}
                height={8}
              />
            </HoverCard.Content>
          </HoverCard.Portal>
        )}
      </HoverCard.Root>
    </sup>
  );
};

// 参考文献リスト表示コンポーネント（LaTeX風の \bibliography{} に相当）
export const ReferenceList: React.FC = () => {
  const { getReferences } = React.useContext(ReferenceContext);
  const sortedReferences = getReferences();

  if (sortedReferences.length === 0) {
    return null;
  }

  return (
    <div className="references mt-12 pt-8 border-t border-theme-border">
      <h2
        id="references"
        className="text-3xl font-semibold text-theme-1 mb-4 mt-8"
      >
        参考文献
      </h2>
      <ol className="space-y-3">
        {sortedReferences.map((reference, index) => (
          <li
            key={reference.id}
            id={`reference-${reference.id}`}
            className="text-sm text-theme-2 leading-relaxed"
          >
            <div className="flex">
              <span className="font-medium mr-3 flex-shrink-0">
                [{index + 1}]
              </span>
              <div className="flex-1">{reference.content}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

// 個別の参考文献定義コンポーネント（LaTeX風の \bibitem{} に相当）
export const Reference: React.FC<{
  id: string;
  authors: string;
  year: string;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
}> = ({
  id,
  authors,
  year,
  title,
  journal,
  volume,
  issue,
  pages,
  doi,
  url,
  publisher,
}) => {
  const { references, addReference } = React.useContext(ReferenceContext);

  useEffect(() => {
    const formattedReference = (
      <span>
        {authors} ({year}). <em>{title}</em>
        {journal && (
          <>
            . <strong>{journal}</strong>
            {volume && <>, {volume}</>}
            {issue && <>({issue})</>}
            {pages && <>, {pages}</>}
          </>
        )}
        {publisher && !journal && <>, {publisher}</>}
        {doi && (
          <>
            . DOI:{" "}
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover text-transition"
            >
              {doi}
            </a>
          </>
        )}
        {url && !doi && (
          <>
            .{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-url-1 hover:text-url-2 visited:text-url-visited visited:hover:text-url-visited-hover text-transition"
            >
              {url}
            </a>
          </>
        )}
        .
      </span>
    );

    // 参考文献データベースに登録（引用されていなくても登録）
    if (!references.find((ref) => ref.id === id)) {
      addReference(id, formattedReference);
    }
  }, [
    id,
    authors,
    year,
    title,
    journal,
    volume,
    issue,
    pages,
    doi,
    url,
    publisher,
    references,
    addReference,
  ]);

  // このコンポーネント自体は何も表示しない（定義のみ）
  return null;
};
