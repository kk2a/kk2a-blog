import fs from "fs";
import path from "path";

class IdMapper {
  private nameToId = new Map<string, number>();
  private idToName = new Map<number, string>();
  private filePath: string;
  private isLoaded = false;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), "data", fileName);
  }

  private loadFromFile(): void {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf8");
        const parsed = JSON.parse(data);
        if (parsed.mappings) {
          Object.entries(parsed.mappings).forEach(([name, id]) => {
            this.nameToId.set(name, id as number);
            this.idToName.set(id as number, name);
          });
        }
      } else {
        throw new Error(
          "IDマッピングファイルが見つかりません:" + this.filePath
        );
      }
    } catch (error) {
      console.error("IDマッピングファイルの読み込みに失敗:", error);
      throw error;
    }
    this.isLoaded = true;
  }

  getId(name: string): number {
    this.loadFromFile();
    const id = this.nameToId.get(name);
    if (id === undefined) {
      throw new Error("IDが見つかりません:" + name);
    }
    return id;
  }

  getNameById(id: number): string | undefined {
    this.loadFromFile();
    return this.idToName.get(id);
  }

  getAllIds(): number[] {
    this.loadFromFile();
    return Array.from(this.idToName.keys()).sort((a, b) => a - b);
  }

  getAllNames(): string[] {
    this.loadFromFile();
    return Array.from(this.nameToId.keys()).sort();
  }
}

export const tagIdMapper = new IdMapper("tag-ids.json");
export const categoryIdMapper = new IdMapper("category-ids.json");
