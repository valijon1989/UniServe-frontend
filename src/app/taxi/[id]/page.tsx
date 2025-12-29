"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createTaxiOrder, getTaxiListing, type TaxiListing } from "@/api/taxi";
import { useAuthStore } from "@/store/auth";

type RideTimeMode = "now" | "schedule";

export default function TaxiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = String(params?.id || "");
  const [listing, setListing] = useState<TaxiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [rideTime, setRideTime] = useState<RideTimeMode>("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const [note, setNote] = useState("");
  const { isAuthenticated, token, isHydrated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!listingId) return;
    let alive = true;
    setLoading(true);
    getTaxiListing(listingId)
      .then((data) => {
        if (alive) setListing(data);
      })
      .catch(() => {
        if (alive) setError("E'lonni yuklab bo'lmadi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [listingId]);

  const handleOrderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setSubmitError(null);

    if (!isHydrated || !isAuthenticated) {
      setNotice("Buyurtma berish uchun login/signup qiling.");
      setTimeout(() => router.push("/login"), 400);
      return;
    }
    if (!token) {
      setSubmitError("Login token topilmadi.");
      return;
    }
    if (!listingId) {
      setSubmitError("E'lon topilmadi.");
      return;
    }

    setSubmitState("loading");
    try {
      const rideTimeValue = rideTime === "schedule" ? scheduleTime : "now";
      await createTaxiOrder(
        {
          listingId,
          pickupAddress,
          dropoffAddress,
          rideTime: rideTimeValue,
          note: note || undefined
        },
        token
      );
      setSubmitState("success");
      setNotice("Buyurtma yuborildi (pending).");
      setTimeout(() => router.push("/my-orders/taxi"), 700);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Buyurtma yuborishda xatolik.");
    } finally {
      setSubmitState("idle");
    }
  };

  const infoRows = useMemo(() => {
    if (!listing) return [];
    return [
      { label: "Shahar", value: listing.city || "Ko'rsatilmagan" },
      { label: "Avto turi", value: listing.carType || "Ko'rsatilmagan" },
      { label: "Yo'lovchi", value: listing.passengersMax ?? "Noma'lum" },
      { label: "Tillar", value: Array.isArray(listing.languages) ? listing.languages.join(", ") : listing.languages || "Ko'rsatilmagan" },
      { label: "Vaqt", value: listing.availableHours || "Kelishiladi" },
      { label: "Xizmat hududi", value: listing.serviceArea || "Ko'rsatilmagan" }
    ];
  }, [listing]);

  if (loading) {
    return (
      <div className="taxi-detail mx-auto w-full max-w-5xl px-4 py-10">
        <div className="taxi-detail-panel">
          <p className="text-sm taxi-detail-secondary">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="taxi-detail mx-auto w-full max-w-5xl px-4 py-10">
        <div className="taxi-detail-panel">
          <p className="text-sm text-red-600">{error || "E'lon topilmadi."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="taxi-detail mx-auto w-full max-w-5xl px-4 py-10">
      <div className="taxi-detail-panel">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold taxi-detail-heading">{listing.title}</h1>
          <p className="text-sm taxi-detail-secondary">
            {listing.city || "Shahar ko'rsatilmagan"} · {listing.priceNote || "Kelishuv asosida"}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="taxi-detail-card p-5">
            <div className="grid gap-3">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-none last:pb-0"
                >
                  <span className="taxi-detail-label">{row.label}</span>
                  <span className="taxi-detail-value text-right">{row.value}</span>
                </div>
              ))}
            </div>
          {listing.description && (
            <div className="mt-4 text-sm taxi-detail-secondary">
              <p className="text-xs uppercase tracking-wide taxi-detail-muted">Tavsif</p>
              <p className="mt-2 leading-relaxed">{listing.description}</p>
            </div>
          )}
          {listing.agent?.name && (
            <div className="taxi-detail-subcard mt-5 flex items-center gap-3 p-3">
              {listing.agent.avatarUrl ? (
                <img
                  src={listing.agent.avatarUrl}
                  alt={listing.agent.name || "Agent"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
                  {listing.agent.name?.slice(0, 1) || "A"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold taxi-detail-heading">{listing.agent.name}</p>
                <p className="text-xs taxi-detail-muted">E'lon egasi</p>
              </div>
            </div>
          )}
          </section>

          <aside className="taxi-detail-card p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold taxi-detail-heading">Taxi chaqirish</h2>
            <p className="text-xs taxi-detail-muted">Narx kelishuv asosida</p>
          </div>

          {notice && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {notice}
            </p>
          )}

          {!isAuthenticated ? (
            <button
              className="mt-4 w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-600"
              onClick={() => {
                setNotice("Buyurtma berish uchun login/signup qiling.");
                setTimeout(() => router.push("/login"), 400);
              }}
            >
              Taxi chaqirish / Buyurtma berish
            </button>
          ) : (
            <form onSubmit={handleOrderSubmit} className="mt-4 space-y-3 text-sm">
              <div>
                <label className="mb-1 block taxi-detail-label">Olib ketish manzili</label>
                <input
                  className="taxi-detail-input w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  value={pickupAddress}
                  onChange={(event) => setPickupAddress(event.target.value)}
                  placeholder="Qayerdan olib ketilsin?"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block taxi-detail-label">Tashlab ketish manzili</label>
                <input
                  className="taxi-detail-input w-full rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  value={dropoffAddress}
                  onChange={(event) => setDropoffAddress(event.target.value)}
                  placeholder="Qayerga olib borilsin?"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block taxi-detail-label">Vaqt</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRideTime("now")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs ${
                      rideTime === "now"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 text-slate-700"
                    }`}
                  >
                    Hozir
                  </button>
                  <button
                    type="button"
                    onClick={() => setRideTime("schedule")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs ${
                      rideTime === "schedule"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 text-slate-700"
                    }`}
                  >
                    Rejalashtirish
                  </button>
                </div>
              </div>
              {rideTime === "schedule" && (
                <div>
                  <label className="mb-1 block taxi-detail-label">Rejalashtirilgan vaqt</label>
                  <input
                    type="datetime-local"
                    className="taxi-detail-input w-full rounded-lg px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block taxi-detail-label">Izoh (ixtiyoriy)</label>
                <textarea
                  className="taxi-detail-input min-h-[80px] w-full rounded-lg px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Qo'shimcha izoh"
                />
              </div>
              {submitError && <p className="text-xs text-red-600">{submitError}</p>}
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
              </button>
            </form>
          )}
          </aside>
        </div>
      </div>
    </div>
  );
}
