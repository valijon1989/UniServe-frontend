"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { serviceCatalog } from "@/data/serviceCatalog";
import type { ServiceCategoryNode } from "@/lib/servicesTypes";

type ApiCategory = {
  slug?: string;
  name?: string;
  children?: ApiCategory[];
};

const fallbackCategories: ServiceCategoryNode[] = serviceCatalog.map((group) => ({
  slug: group.id,
  name: group.title,
  children: group.categories.map((cat) => ({
    slug: cat.id,
    name: cat.title
  }))
}));

const normalizeCategories = (data: ApiCategory[] | undefined) => {
  if (!data || data.length === 0) return fallbackCategories;
  return data.map((cat) => ({
    slug: cat.slug || cat.name || "",
    name: cat.name || cat.slug || "",
    children:
      cat.children?.map((child) => ({
        slug: child.slug || child.name || "",
        name: child.name || child.slug || ""
      })) || []
  }));
};

export function useServiceCategories() {
  const { data, error, isLoading } = useSWR<ApiCategory[]>(
    "/api/service-categories",
    fetcher,
    {
      dedupingInterval: 600000,
      revalidateOnFocus: false,
      fallbackData: fallbackCategories as ApiCategory[]
    }
  );

  return {
    categories: normalizeCategories(data),
    isLoading,
    error
  };
}
