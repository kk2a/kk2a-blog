export type PublicationStatus = "draft" | "published";

export interface IdentifiedPublication {
  id: number;
  status: PublicationStatus;
}

export interface IdentifiedTopic {
  id: number;
  name: string;
}

export function getPublishedIds(
  records: IdentifiedPublication[],
): number[] {
  return records
    .filter((record) => record.status === "published")
    .map((record) => record.id)
    .sort((left, right) => left - right);
}

export function getPublishedTopicIds(
  topics: IdentifiedTopic[],
  publicTopicNames: ReadonlySet<string>,
): number[] {
  return topics
    .filter((topic) => publicTopicNames.has(topic.name))
    .map((topic) => topic.id)
    .sort((left, right) => left - right);
}
