import { createHash } from "crypto";

/**
 * 文字列をSHA-256ハッシュに変換する
 * @param text ハッシュ化する文字列
 * @returns SHA-256ハッシュ（16進数）
 */
export function generateHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * ハッシュとオリジナル値のマッピングを管理するクラス
 */
class HashMapper {
  private hashToOriginal = new Map<string, string>();
  private originalToHash = new Map<string, string>();

  /**
   * 値を登録してハッシュを取得
   * @param original オリジナルの値
   * @returns SHA-256ハッシュ
   */
  register(original: string): string {
    if (this.originalToHash.has(original)) {
      return this.originalToHash.get(original)!;
    }

    const hash = generateHash(original);
    this.hashToOriginal.set(hash, original);
    this.originalToHash.set(original, hash);
    return hash;
  }

  /**
   * ハッシュからオリジナル値を取得
   * @param hash SHA-256ハッシュ
   * @returns オリジナルの値（見つからない場合はundefined）
   */
  getOriginal(hash: string): string | undefined {
    return this.hashToOriginal.get(hash);
  }

  /**
   * オリジナル値からハッシュを取得
   * @param original オリジナルの値
   * @returns SHA-256ハッシュ（見つからない場合はundefined）
   */
  getHash(original: string): string | undefined {
    return this.originalToHash.get(original);
  }

  /**
   * 全てのハッシュを取得
   * @returns 登録されている全てのハッシュの配列
   */
  getAllHashes(): string[] {
    return Array.from(this.hashToOriginal.keys());
  }

  /**
   * 全てのオリジナル値を取得
   * @returns 登録されている全てのオリジナル値の配列
   */
  getAllOriginals(): string[] {
    return Array.from(this.originalToHash.keys());
  }
}

// グローバルなマッパーインスタンス
export const tagMapper = new HashMapper();
export const categoryMapper = new HashMapper();
