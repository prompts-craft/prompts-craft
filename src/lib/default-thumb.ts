import defaultThumb from "@/assets/promptcraft-default-thumb.jpg.asset.json";

export const DEFAULT_PROMPT_THUMB = defaultThumb.url;

export function promptThumb(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_PROMPT_THUMB;
}
