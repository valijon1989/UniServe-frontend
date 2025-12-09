"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addProductView, getProductDetail, likeProduct, purchaseProduct, type Product } from "@/api/products";
import { Spinner } from "@/components/shared/Spinner";
import { useAuthStore } from "@/store/auth";

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
    let active = true;
    setLoading(true);
    void addProductView(id);
    getProductDetail(id)
      .then((res) => {
        if (active) setData(res);
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
  const price = data.price ? data.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—";
  const oldPrice = data.oldPrice ? data.oldPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : null;

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
            <RatingBadge rating={data.rating?.avg ?? 0} count={data.rating?.count ?? 0} />
          </div>

          <p className="text-sm text-slate-600">
            {data.description || "Mahsulot haqidagi batafsil ma'lumot hali qo'shilmagan."}
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Narx</p>
              <p className="text-4xl font-extrabold text-slate-900">${price}</p>
              {oldPrice && <p className="text-sm text-slate-400 line-through">${oldPrice}</p>}
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

          <StatsRow stats={stats} />

          <Description text={data.description} />

          <VendorBox vendor={data.vendor} />
        </div>
      </section>

      <Specifications data={data.specifications} />
    </div>
  );
}

function ImageSlider({ images, alt }: { images?: string[]; alt?: string }) {
  const safeImages = images && images.length > 0 ? images : ["/placeholder.png"];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg">
      <div className="overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={safeImages[active]}
          alt={alt || "Product image"}
          className="h-[420px] w-full object-cover"
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

function RatingBadge({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm">
      ⭐ {rating.toFixed(1)} ({count})
    </div>
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

function Description({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      {text}
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
