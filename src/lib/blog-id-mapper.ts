import fs from "fs";
import path from "path";

/**
 * ブログ記事のIDマッピングを読み込むクラス（読み込み専用）
 */
class BlogIdMapper {
  private slugToId = new Map<string, number>();
  private idToSlug = new Map<number, string>();
  private filePath: string;
  private isLoaded = false;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), "data", fileName);
  }

  /**
   * ファイルからマッピングデータを読み込み
   */
  private loadFromFile(): void {
    if (this.isLoaded) return;

    try {
      // dataディレクトリが存在しない場合は作成
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf8");
        const parsed = JSON.parse(data);

        // マッピングデータを復元
        if (parsed.mappings) {
          Object.entries(parsed.mappings).forEach(([slug, id]) => {
            this.slugToId.set(slug, id as number);
            this.idToSlug.set(id as number, slug);
          });
        }
      } else {
        throw new Error(
          `ブログIDマッピングファイルが見つかりません: ${this.filePath}. まず 'npm run generate-ids' を実行してください。`
        );
      }
    } catch (error) {
      console.error(
        `ブログIDマッピングファイルの読み込みに失敗: ${this.filePath}`,
        error
      );
      throw error;
    }

    this.isLoaded = true;
  }

  /**
   * スラグからIDを取得
   */
  getId(slug: string): number {
    this.loadFromFile();
    const id = this.slugToId.get(slug);
    if (id === undefined) {
      throw new Error(
        `ブログIDが見つかりません: ${slug}. 'npm run generate-ids' を実行してIDを生成してください。`
      );
    }
    return id;
  }

  /**
   * IDからスラグを取得
   * @param id ID
   * @returns スラグ（見つからない場合はundefined）
   */
  getSlugById(id: number): string | undefined {
    this.loadFromFile();
    return this.idToSlug.get(id);
  }

  /**
   * スラグからIDを取得
   * @param slug スラグ
   * @returns ID（見つからない場合はundefined）
   */
  getIdBySlug(slug: string): number | undefined {
    this.loadFromFile();
    return this.slugToId.get(slug);
  }

  /**
   * 全てのIDを取得
   * @returns 登録されている全てのIDの配列
   */
  getAllIds(): number[] {
    this.loadFromFile();
    return Array.from(this.idToSlug.keys()).sort((a, b) => a - b);
  }

  /**
   * 通常記事のIDのみを取得
   * @returns 正の数のIDの配列
   */
  getRegularIds(): number[] {
    this.loadFromFile();
    return Array.from(this.idToSlug.keys())
      .filter((id) => id > 0)
      .sort((a, b) => a - b);
  }

  /**
   * テスト記事のIDのみを取得
   * @returns 負の数のIDの配列
   */
  getTestIds(): number[] {
    this.loadFromFile();
    return Array.from(this.idToSlug.keys())
      .filter((id) => id < 0)
      .sort((a, b) => b - a);
  }

  /**
   * 全てのスラグを取得
   * @returns 登録されている全てのスラグの配列
   */
  getAllSlugs(): string[] {
    this.loadFromFile();
    return Array.from(this.slugToId.keys());
  }

  /**
   * マッピング情報をデバッグ用に出力
   */
  debug(): void {
    this.loadFromFile();
    console.log(`BlogIdMapper (${this.filePath}):`);
    console.log("Mappings:", Object.fromEntries(this.slugToId));
  }
}

// グローバルなマッパーインスタンス
export const blogIdMapper = new BlogIdMapper("blog-ids.json");
