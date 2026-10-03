import matter from "gray-matter";

const legacyFields = ["categories", "tags"] as const;

function readTopics(
  data: Record<string, unknown>,
  field: string,
): string[] {
  const value = data[field];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }
  return value.filter((topic): topic is string => typeof topic === "string");
}

export function migrateTopics(source: string): string {
  const { data, content } = matter(source);
  const hasLegacyFields = legacyFields.some((field) => data[field] !== undefined);
  if (!hasLegacyFields) return source;

  const topics = [
    ...readTopics(data, "topics"),
    ...legacyFields.flatMap((field) => readTopics(data, field)),
  ];
  const migratedData: Record<string, unknown> = {
    ...data,
    topics: [...new Set(topics)],
  };
  for (const field of legacyFields) {
    delete migratedData[field];
  }

  return matter.stringify(content, migratedData);
}
