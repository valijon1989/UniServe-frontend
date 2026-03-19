const UPPERCASE_TOKENS = new Set([
  "AI",
  "API",
  "B2B",
  "B2C",
  "CRM",
  "DIY",
  "ERP",
  "HR",
  "IELTS",
  "IT",
  "KR",
  "PDF",
  "POS",
  "SEO",
  "SLA",
  "SMM",
  "TV",
  "UI",
  "UK",
  "UX",
  "US",
  "UZ"
]);

const normalizeToken = (token: string) => {
  const clean = token.trim();
  if (!clean) return "";
  const upper = clean.toUpperCase();
  if (UPPERCASE_TOKENS.has(upper)) return upper;
  if (/^\d+[a-z]{1,3}$/i.test(clean)) return clean.toUpperCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

export const normalizeMarketplaceTitle = (value?: string | null, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  const compact = raw
    .replace(/[_|]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  const looksSlugLike = /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/i.test(compact);
  const looksShouty = compact === compact.toUpperCase() && /[A-Z]/.test(compact);
  const looksMachineLike = /[_-]/.test(compact) && !/[a-z][a-z]/.test(compact.split(" ").join(""));

  if (looksSlugLike || looksShouty || looksMachineLike) {
    return compact
      .replace(/[-_]+/g, " ")
      .split(" ")
      .map(normalizeToken)
      .filter(Boolean)
      .join(" ");
  }

  return compact.charAt(0).toUpperCase() + compact.slice(1);
};

export const normalizeMarketplaceSubtitle = (value?: string | null, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  return raw.replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim();
};
