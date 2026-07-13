// Thin typed wrapper around blueimp-md5 (which ships without types).
// Used only to derive the anonymous reviewer_hash for the current signed-in
// user so we can match it against publicly readable review rows.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no bundled types
import md5Fn from "blueimp-md5";

export function md5(input: string): string {
  return (md5Fn as (s: string) => string)(input);
}

export function reviewerHashFor(userId: string): string {
  return md5(userId).slice(0, 8);
}
