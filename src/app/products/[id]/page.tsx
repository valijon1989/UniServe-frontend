"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addProductView, getProductDetail, likeProduct, purchaseProduct, type Product } from "@/api/products";
import { Spinner } from "@/components/shared/Spinner";
import { useAuthStore } from "@/store/auth";

const PRODUCT_IMAGE_POOL_SIZE = 36;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const makeProductImages = (pool: string, seed: string, count = 8) => {
  const safeCount = Math.min(20, Math.max(5, count));
  const base = (hashString(`${pool}-${seed}`) % PRODUCT_IMAGE_POOL_SIZE) + 1;
  return Array.from({ length: safeCount }, (_, idx) => {
    const value = ((base + idx * 5) % PRODUCT_IMAGE_POOL_SIZE) + 1;
    return `/services/${pool}/${String(value).padStart(2, "0")}.jpg`;
  });
};

const resolveProductPool = (product: Product) => {
  const category = (product.category || "").toLowerCase();
  const id = (product.id || product._id || "").toString().toLowerCase();

  if (category.includes("oziq") || id.startsWith("ready-") || id.startsWith("semi") || id.startsWith("meat-") || id.startsWith("ex-")) {
    return "delivery";
  }
  if (category.includes("gozallik") || id.startsWith("frag-") || id.startsWith("skin-") || id.startsWith("hair-") || id.startsWith("bath-") || id.startsWith("sun-")) {
    return "marketing";
  }
  if (category.includes("elektronika") || id.startsWith("pc-") || id.startsWith("mobile-") || id.startsWith("tv-") || id.startsWith("cam-") || id.startsWith("oth-")) {
    return "technical";
  }
  if (id.startsWith("game-") || id.startsWith("console-")) {
    return "technical";
  }
  if (category.includes("avto") || id.startsWith("car-") || id.startsWith("carpart-") || id.startsWith("tools-") || id.startsWith("techpart-")) {
    return "taxi";
  }
  if (category.includes("maishiy") || id.startsWith("vac-") || id.startsWith("kitchen-") || id.startsWith("air-") || id.startsWith("otherhome-")) {
    return "cleaning";
  }
  if (category.includes("kiyim") || id.startsWith("men-") || id.startsWith("women-") || id.startsWith("kidswear-") || id.startsWith("elder-") || id.startsWith("spec-")) {
    return "sport";
  }
  return "technical";
};

const resolveProductImageCount = (product: Product) => {
  const id = (product.id || product._id || "").toString().toLowerCase();
  if (id.startsWith("mobile-")) return 8;
  return 3;
};

const getDeliveryMeta = (data: Product) => {
  const seed = (data._id || data.id || data.name || data.title || "").toString();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const options = [
    { key: "today", label: "Bugun" },
    { key: "tomorrow", label: "Ertaga" },
    { key: "standard", label: "Oddiy" }
  ];
  const delivery = options[Math.abs(hash) % options.length];
  return {
    delivery,
    free: (data.price ?? 0) >= 100 || Math.abs(hash) % 2 === 0
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = useMemo(() => {
    if (!params?.id) return null;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);
  const router = useRouter();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!id) return;
    const cached = loadCachedProduct(id);
    if (cached) {
      setData((prev) => mergeProductData(cached, prev));
    }
    let active = true;
    setLoading(true);
    void addProductView(id);
    getProductDetail(id)
      .then((res) => {
        if (active) setData((prev) => mergeProductData(cached, res ?? prev ?? undefined));
      })
      .catch((err) => {
        console.error("Product detail load error", err);
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const redirectToAuth = () => {
    router.push("/login");
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      redirectToAuth();
      return;
    }
    if (!id) return;
    try {
      setActionLoading(true);
      await purchaseProduct(id);
      alert("Purchase recorded");
    } catch (err) {
      console.error("Purchase error", err);
      alert("Sotib olishni qayd etib bo'lmadi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      redirectToAuth();
      return;
    }
    if (!id) return;
    try {
      setLikePending(true);
      await likeProduct(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                likes: (prev.stats?.likes ?? prev.likes ?? 0) + 1,
                views: prev.stats?.views ?? prev.views ?? 0,
                purchases: prev.stats?.purchases ?? prev.orders ?? 0
              }
            }
          : prev
      );
    } catch (err) {
      console.error("Like error", err);
    } finally {
      setLikePending(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      redirectToAuth();
      return;
    }
    alert("Savatchaga qo'shildi (demo)");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: data?.name || "Mahsulot",
          text: data?.description || "",
          url: window.location.href
        })
        .catch(() => {});
    } else {
      if (typeof window !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => alert("Havola nusxalandi"))
          .catch(() => alert("Havolani nusxalab bo'lmadi"));
      } else {
        alert("Havola nusxalandi (demo)");
      }
    }
  };

  if (loading) return <Spinner label="Mahsulot yuklanmoqda" />;
  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600 shadow-sm">
        Mahsulot topilmadi.
      </div>
    );
  }

  const stats = data.stats || { views: data.views ?? 0, likes: data.likes ?? 0, purchases: data.orders ?? 0 };
  const priceValue = data.price ?? null;
  const price = priceValue !== null ? priceValue.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—";
  const oldPriceValue = data.oldPrice ?? null;
  const oldPrice = oldPriceValue !== null ? oldPriceValue.toLocaleString("en-US", { maximumFractionDigits: 2 }) : null;
  const discount =
    priceValue !== null && oldPriceValue !== null && oldPriceValue > 0 ? Math.round(((oldPriceValue - priceValue) / oldPriceValue) * 100) : null;
  const deliveryMeta = getDeliveryMeta(data);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ImageSlider images={data.images?.length ? data.images : [data.thumbnail || "/placeholder.png"]} alt={data.name || data.title} />

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mahsulot tafsiloti</p>
              <h1 className="text-3xl font-black text-slate-900">{data.name || data.title}</h1>
              {data.category && <p className="mt-1 text-sm font-semibold text-emerald-600">{data.category}</p>}
            </div>
            <RatingBadge
              rating={data.rating?.avg ?? 0}
              count={data.rating?.count ?? 0}
              onClick={() => {
                const node = document.getElementById("reviews");
                if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>

          <Badges
            brand={data.brand}
            condition={data.condition}
            audience={data.audience}
            size={data.size}
            season={data.season}
            createdAt={data.createdAt}
          />

          <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {data.description || "Mahsulot haqidagi batafsil ma'lumot hali qo'shilmagan."}
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Narx</p>
              <p className="text-4xl font-extrabold text-slate-900">${price}</p>
              <div className="flex items-center gap-2">
                {oldPrice && <p className="text-sm text-slate-400 line-through">${oldPrice}</p>}
                {discount !== null && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">-{discount}%</span>}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-700"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAuthenticated}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-lg text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                🛒↩️
              </button>
              <button
                type="button"
                onClick={handleLike}
                disabled={likePending || !isAuthenticated}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-red-500 shadow-sm transition hover:border-emerald-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ❤️
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={actionLoading || !isAuthenticated}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>🛍</span> <span>Xarid qilish</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">Yetkazish: {deliveryMeta.delivery.label}</p>
            <p className="text-[11px] text-emerald-700">
              {deliveryMeta.free ? "Bepul yetkazish shartlari bajarilgan" : "Bepul yetkazish 100$+ buyurtmada"}
            </p>
          </div>

          <StatsRow stats={stats} />

          <QuickFacts data={data} />

          <VendorBox vendor={data.vendor} />
        </div>
      </section>

      <Specifications data={data.specifications} />
      <Description text={data.description} category={data.category} images={data.images} />
      <ReviewsPreview rating={data.rating?.avg ?? 0} count={data.rating?.count ?? 0} />
      <RelatedProducts images={data.images} />

      <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700"
        >
          Savatga
        </button>
        <button
          type="button"
          onClick={handlePurchase}
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-white"
        >
          Tez sotib olish
        </button>
        <button
          type="button"
          onClick={handleLike}
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}

function ImageSlider({ images, alt }: { images?: string[]; alt?: string }) {
  const safeImages = useMemo(() => normalizeImagesList(images), [images]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= safeImages.length) setActive(0);
  }, [active, safeImages.length]);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg">
      <div className="overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={safeImages[active]}
          alt={alt || "Product image"}
          className="h-[420px] w-full cursor-zoom-in object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`overflow-hidden rounded-xl border transition ${
                active === idx ? "border-emerald-500 shadow-md" : "border-slate-200 hover:border-emerald-400"
              }`}
            >
              <img
                src={src}
                alt={`Image ${idx + 1}`}
                className="h-20 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingBadge({
  rating,
  count,
  onClick
}: {
  rating: number;
  count: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm"
    >
      ⭐ {rating.toFixed(1)} ({count})
    </button>
  );
}

function StatsRow({ stats }: { stats: { views?: number; likes?: number; purchases?: number } }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-700">
      <span className="rounded-full bg-slate-100 px-3 py-2">👁 {stats.views ?? 0}</span>
      <span className="rounded-full bg-slate-100 px-3 py-2">❤️ {stats.likes ?? 0}</span>
      <span className="rounded-full bg-slate-100 px-3 py-2">🛒 {stats.purchases ?? 0}</span>
    </div>
  );
}

function Description({ text, category, images }: { text?: string; category?: string; images?: string[] }) {
  const highlights = getCategoryHighlights(category);
  const previewImages = normalizeImagesList(images).slice(0, 3);
  if (!text && highlights.length === 0 && previewImages.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Batafsil tavsif</h2>
      {text && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{text}</p>}

      {highlights.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{item.title}</p>
                <p className="text-sm font-semibold text-slate-900">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {previewImages.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm"
            >
              <img
                src={src}
                alt={`Preview ${idx + 1}`}
                className="h-28 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Specifications({ data }: { data?: Record<string, string> }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Xususiyatlar</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            <span className="font-semibold text-slate-800">{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsPreview({ rating, count }: { rating: number; count: number }) {
  const breakdown = [
    { star: 5, value: 62 },
    { star: 4, value: 22 },
    { star: 3, value: 9 },
    { star: 2, value: 5 },
    { star: 1, value: 2 }
  ];
  return (
    <section id="reviews" className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Sharhlar</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          ⭐ {rating.toFixed(1)} · {count} review
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Rating breakdown</p>
          <p className="mt-2 text-xs text-slate-500">Foto reviewlar va eng foydali izohlar</p>
        </div>
        <div className="space-y-2">
          {breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs text-slate-600">
              <span className="w-10">{row.star}⭐</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-amber-400" style={{ width: `${row.value}%` }} />
              </div>
              <span className="w-10 text-right">{row.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <button type="button" className="rounded-full border border-slate-200 px-3 py-1">
          Photo reviews
        </button>
        <button type="button" className="rounded-full border border-slate-200 px-3 py-1">
          Most helpful
        </button>
      </div>
    </section>
  );
}

function RelatedProducts({ images }: { images?: string[] }) {
  const list = normalizeImagesList(images).slice(0, 6);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Related products</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {list.map((src, idx) => (
          <div key={`${src}-${idx}`} className="min-w-[160px] overflow-hidden rounded-2xl border border-slate-100">
            <img
              src={src}
              alt={`Related ${idx + 1}`}
              className="h-32 w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Badges({
  brand,
  condition,
  audience,
  size,
  season,
  createdAt
}: {
  brand?: string;
  condition?: string;
  audience?: string;
  size?: string;
  season?: string;
  createdAt?: string;
}) {
  const items = [
    brand ? `Brend: ${brand}` : null,
    condition ? `Holati: ${condition}` : null,
    audience ? `Auditoriya: ${audience}` : null,
    size ? `O'lcham: ${size}` : null,
    season ? `Mavsum: ${season}` : null,
    createdAt ? `Joylandi: ${formatDate(createdAt)}` : null
  ].filter(Boolean);

  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function QuickFacts({ data }: { data: Product }) {
  const facts = [
    { label: "Kategoriya", value: data.category },
    { label: "Brend", value: data.brand },
    { label: "Holati", value: data.condition },
    { label: "O'lcham", value: data.size },
    { label: "Mavsum", value: data.season },
    { label: "Auditoriya", value: data.audience },
    { label: "Tashkil etilgan", value: data.createdAt ? formatDate(data.createdAt) : undefined },
    { label: "ID", value: data.id || data._id }
  ].filter((item) => item.value);

  if (facts.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Asosiy ma'lumotlar</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{fact.label}</p>
            <p className="mt-1 font-semibold text-slate-900">{fact.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorBox({ vendor }: { vendor?: Product["vendor"] }) {
  if (!vendor) return null;
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <p className="text-xs uppercase tracking-[0.15em] text-emerald-600">Sotuvchi</p>
      <div className="mt-1 font-semibold text-emerald-900">{vendor.name || vendor.username}</div>
      <div className="flex flex-wrap gap-3 text-xs text-emerald-700">
        {vendor.rating && <span>⭐ {vendor.rating.toFixed(1)}</span>}
        {vendor.location && <span>📍 {vendor.location}</span>}
        {vendor.contact && <span>☎️ {vendor.contact}</span>}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" });
}

function loadCachedProduct(id: string): Product | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `product-preview-${id}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Product;
  } catch {
    return null;
  }
}

function mergeProductData(base?: Product | null, next?: Product | null): Product | null {
  if (!base && !next) return null;
  const combined: Product = { ...(base || {}), ...(next || {}) };
  combined.rating = next?.rating || base?.rating;
  combined.stats = next?.stats || base?.stats || {
    views: next?.views ?? base?.views ?? 0,
    likes: next?.likes ?? base?.likes ?? 0,
    purchases: (next?.orders ?? base?.orders) || 0
  };
  combined.images = normalizeImagesList(next?.images || base?.images);
  combined.thumbnail = next?.thumbnail || base?.thumbnail || combined.images?.[0];
  combined.name = next?.name || next?.title || base?.name || base?.title;
  combined.title = combined.name || next?.title || base?.title;
  combined.description = next?.description || base?.description;
  combined.price = next?.price ?? base?.price;
  combined.oldPrice = next?.oldPrice ?? base?.oldPrice;
  combined.category = next?.category || base?.category;
  const pool = resolveProductPool(combined);
  const key = (combined.id || combined._id || combined.name || "").toString();
  if (key) {
    const images = makeProductImages(pool, key, resolveProductImageCount(combined));
    combined.images = images;
    combined.thumbnail = images[0];
  }
  return combined;
}

function normalizeImagesList(images?: string[]) {
  const base = (images ?? []).filter(Boolean);
  const prepared = base.length ? base.slice(0, 20) : ["/placeholder.png"];
  const result = [...prepared];

  while (result.length < 5) {
    const next = prepared[result.length % prepared.length] || "/placeholder.png";
    result.push(next);
  }

  return result.slice(0, 20);
}

function getCategoryHighlights(category?: string) {
  if (!category) return [];
  const key = category.toLowerCase();
  const presets: Record<string, { title: string; desc: string; icon: string }[]> = {
    electronics: [
      { title: "Texnik", desc: "Energiyani tejovchi va yuqori unumli protsessor", icon: "🔋" },
      { title: "Monitor", desc: "Yorqin va ravshan displey, ko'z uchun qulay", icon: "🖥️" }
    ],
    fashion: [
      { title: "Material", desc: "Yumshoq va havo o'tkazuvchi mato", icon: "🧵" },
      { title: "Dizayn", desc: "Kundalik va bayramona uslubda mos keladi", icon: "👗" }
    ],
    grocery: [
      { title: "Yangi", desc: "Mahalliy fermadan yetkazilgan yangiligi tekshirilgan", icon: "🥬" },
      { title: "Paket", desc: "Sertifikatlangan va xavfsiz o'ralgan", icon: "📦" }
    ],
    beauty: [
      { title: "Tarkib", desc: "Paraben va sulfatlarsiz muloyim formula", icon: "🧴" },
      { title: "Natija", desc: "Namlikni ushlab turadi va jiloni tiklaydi", icon: "✨" }
    ]
  };

  return presets[key] || [
    { title: "Kategoriya", desc: `${category} uchun asosiy afzalliklar to'plangan.`, icon: "📌" }
  ];
}
