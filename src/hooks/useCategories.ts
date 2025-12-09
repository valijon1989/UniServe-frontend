import { useEffect, useState } from "react";
import { getCategories } from "@/api/categories";

export function useCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((cats) => {
        if (active) {
          setItems(cats);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}
