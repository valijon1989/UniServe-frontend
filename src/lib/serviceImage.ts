import { getCategoryImagePool } from "@/data/serviceCatalog";

const hashValue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};

export const getServiceImageUrl = (categoryId: string, identity: string) => {
  const pool = getCategoryImagePool(categoryId);
  if (!pool || pool.length === 0) return "/placeholder.png";
  const idx = Math.abs(hashValue(identity)) % pool.length;
  return pool[idx].src;
};
