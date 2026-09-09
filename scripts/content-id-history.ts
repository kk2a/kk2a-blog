// These IDs were public before content metadata moved into D1.
// They are only used when bootstrapping an empty database; existing rows keep
// their D1 IDs and new rows use SQLite's AUTOINCREMENT sequence.
export const legacyPostIds: Record<string, number> = {
  "atcoder-irohen-yellow": 1,
  "omu-internship": 2,
  "stern-brocot-tree": 3,
  "tiku-ten": 4,
  "hon-no-jisui": 5,
  db_index: 6,
  "test-labelref": 7,
  "test-math-components-sample": 8,
  "test-mdx-annotation-sample": 9,
  "test-mdx-play-ground": 10,
  "test-template": 11,
};
