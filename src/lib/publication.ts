export type PublicationStatus = "draft" | "published";

export interface IdentifiedPublication {
  id: number;
  status: PublicationStatus;
}

export function getPublishedIds(
  records: IdentifiedPublication[],
): number[] {
  return records
    .filter((record) => record.status === "published")
    .map((record) => record.id)
    .sort((left, right) => left - right);
}
