import { normalizeSearch } from './presentation';

const groups = [
  ['Embedded', /\bembedded\b|he thong nhung/],
  ['AI', /\bai\b|artificial intelligence|tri tue nhan tao/],
  ['Robotics', /\brobot(?:ics)?\b/],
  ['IoT', /\biot\b|internet of things/],
  ['Hardware', /\bhardware\b|phan cung/],
  ['Software', /\bsoftware\b|phan mem/],
] as const;

/** Presentation-only groups. Keep the original CMS category and unfamiliar values. */
export function projectCategoryGroups(category: string | undefined): string[] {
  const original = category?.trim() || '';
  if (!original) return [];
  const normalized = normalizeSearch(original);
  const matched = groups.filter(([, pattern]) => pattern.test(normalized)).map(([label]) => label);
  return matched.length ? matched : [original];
}
