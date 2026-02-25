/**
 * MDXファイル処理用の共通ユーティリティ関数
 */

import crypto from "crypto";

/**
 * ブログ記事の必須フィールドと標準順序
 */
export const BLOG_REQUIRED_FIELDS = [
  "title",
  "date",
  "description",
  "excerpt",
  "categories",
  "tags",
  "lastUpdated",
  "contentHash",
] as const;

/**
 * ページの必須フィールドと標準順序
 */
export const PAGE_REQUIRED_FIELDS = [
  "title",
  "description",
  "lastUpdated",
  "contentHash",
] as const;

/**
 * 文字列のSHA256ハッシュを計算
 * @param content - ハッシュ化する文字列
 * @returns SHA256ハッシュ（16進数文字列）
 */
export function calculateHash(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * 現在の日時をタイムゾーン付きISO8601形式で取得
 * @returns ISO8601形式の日時文字列（例: 2026-02-25T21:30:00+09:00）
 */
export function getCurrentDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}

/**
 * 日付文字列がタイムゾーン付きISO8601形式かチェック
 * @param dateString - チェックする日付文字列
 * @returns ISO8601形式の場合true
 * @example
 * isISOWithTimezone("2026-02-25T21:30:00+09:00") // true
 * isISOWithTimezone("2026-02-25T21:30:00.123+09:00") // true (ミリ秒付き)
 * isISOWithTimezone("2026-02-25") // false
 */
export function isISOWithTimezone(dateString: string): boolean {
  // YYYY-MM-DDTHH:MM:SS+09:00 または YYYY-MM-DDTHH:MM:SS.mmm+09:00 形式かチェック
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?[+-]\d{2}:\d{2}$/;
  return isoRegex.test(dateString);
}

/**
 * 日付文字列をタイムゾーン付きISO8601形式に変換
 * @param dateString - 変換する日付文字列
 * @returns ISO8601形式の日時文字列
 * @example
 * convertDateToISO("2025-10-10") // "2025-10-10T00:00:00+09:00"
 * convertDateToISO("2025-10-10T00:00:00+09:00") // "2025-10-10T00:00:00+09:00" (変更なし)
 */
export function convertDateToISO(dateString: string): string {
  // 既にタイムゾーン付きの場合はそのまま返す
  if (
    dateString.includes("T") &&
    (dateString.includes("+") || dateString.includes("Z"))
  ) {
    return dateString;
  }
  return `${dateString}T00:00:00+09:00`;
}
