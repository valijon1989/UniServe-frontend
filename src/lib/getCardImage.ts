const API_BASE = "http://localhost:5001";
export const CARD_PLACEHOLDER_IMAGE = "/placeholders/default-card.jpg";

const resolveImageValue = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.url || value.src || value.path || value.location || value.thumbnail || value.cover;
  }
  return undefined;
};

const normalizeImageUrl = (value?: string) => {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith("/")) return value;
  return `/${value}`;
};

const ensureAbsoluteUrl = (value?: string) => {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return undefined;
  if (normalized.startsWith("/uploads") || normalized.startsWith("/static")) {
    return `${API_BASE}${normalized}`;
  }
  return normalized;
};

const tryArray = (arr?: Array<any>) => {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  for (const entry of arr) {
    const resolved = resolveImageValue(entry) || entry;
    const absolute = ensureAbsoluteUrl(resolved);
    if (absolute) return absolute;
  }
  return undefined;
};

export function getCardImage(item?: any) {
  if (!item) return CARD_PLACEHOLDER_IMAGE;
  const candidates = [
    item.cardImageUrl,
    item.coverImageUrl,
    item.thumbnailUrl,
    item.imageUrl,
    item.cover,
    item.banner,
    item.image,
    item.thumbnail,
    item.photo,
    item.picture,
    item.mediaUrl,
    tryArray(item.images),
    tryArray(item.media),
    tryArray(item.photos),
    tryArray(item.gallery)
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = resolveImageValue(candidate) || candidate;
    const absolute = ensureAbsoluteUrl(resolved);
    if (absolute) return absolute;
  }

  const firstImageFromArray = tryArray(item.images);
  if (firstImageFromArray) return firstImageFromArray;

  return CARD_PLACEHOLDER_IMAGE;
}
