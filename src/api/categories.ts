import { api } from "./client";

type Category = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
};

const CATEGORIES_PATH = process.env.NEXT_PUBLIC_API_URL?.includes("/api")
  ? "/categories"
  : "/api/categories";

export async function getCategories(): Promise<Category[]> {
  const fallback: Category[] = [
    { _id: "oziq-ovqat", slug: "oziq-ovqat", name: "Oziq-ovqat", icon: "ri-restaurant-line" },
    { _id: "elektronika", slug: "elektronika", name: "Elektronika", icon: "ri-smartphone-line" },
    { _id: "gozallik", slug: "gozallik", name: "Go‘zallik", icon: "ri-magic-line" },
    { _id: "avto-texnika", slug: "avto-texnika", name: "Avtomabil va texnika", icon: "ri-car-line" },
    { _id: "maishiy-uskunalar", slug: "maishiy-uskunalar", name: "Maishiy uskunalar", icon: "ri-home-gear-line" },
    { _id: "kiyim-kechak", slug: "kiyim-kechak", name: "Kiyim-kechak", icon: "ri-t-shirt-line" }
  ];

  try {
    const res = await api.get(CATEGORIES_PATH);
    const data = res.data;
    const items: Category[] =
      data?.categories ||
      data?.items ||
      data?.data?.categories ||
      data?.data?.items ||
      data ||
      [];

    const normalized = items.map((cat, idx) => ({
      ...cat,
      _id: cat._id || cat.id || String(idx),
      id: cat.id || cat._id || String(idx),
      slug: cat.slug || cat.name?.toLowerCase?.().replace(/\s+/g, "-") || String(idx),
      name: cat.name || cat.slug || `Category ${idx + 1}`
    }));

    return normalized.length ? normalized : fallback;
  } catch (err) {
    console.warn("Categories load failed, using fallback mock categories", err);
    return fallback;
  }
}
