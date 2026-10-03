export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * テキストからスラッグ（URL-safe ID）を生成
 */
export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // 日本語文字とアルファベット、数字以外を除去
      .replace(/[^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\w\s-]/g, "")
      // 複数のスペースやハイフンを単一のハイフンに変換
      .replace(/[\s-]+/g, "-")
      // 先頭と末尾のハイフンを除去
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * MDXコンテンツから見出しを抽出してTOCアイテムを生成
 */
export function extractHeadingsFromMDX(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const tocItems: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // # の数でレベルを判定
    let text = match[2].trim();

    // マークダウンリンクを除去 [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    // コードブロック記号を除去 `code` -> code
    text = text.replace(/`([^`]+)`/g, "$1");

    // markdownの強調記号を除去 **text** -> text
    text = text.replace(/\*\*([^*]+)\*\*/g, "$1");

    // 絵文字を除去
    text = text.replace(/[\u{1F600}-\u{1F6FF}|\u{2600}-\u{26FF}]/gu, "").trim();

    // IDを生成（テキストベースのスラッグ）
    const slug = generateSlug(text);
    const id = slug || `heading-${tocItems.length}`;

    tocItems.push({
      id,
      text,
      level,
    });
  }

  return tocItems;
}
