export async function fetcher<T = any>(url: string): Promise<T> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const shouldPrefix = apiBase && url.startsWith("/api/");
  const finalUrl = shouldPrefix ? `${apiBase}${url.replace(/^\/api/, "")}` : url;
  const res = await fetch(finalUrl);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function toQuery(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    search.set(key, String(value));
  });
  return search.toString();
}
