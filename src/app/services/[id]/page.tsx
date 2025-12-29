"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  serviceCatalog,
  type ServiceAgent,
  type ServiceCategory,
  type ServiceItem
} from "@/data/serviceCatalog";
import { useAuthStore } from "@/store/auth";

type ServiceRecord = {
  service: ServiceItem;
  agent: ServiceAgent;
  category: ServiceCategory;
  groupTitle: string;
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const vehicleClassLabel = (value?: ServiceAgent["vehicleClass"]) => {
  if (!value) return "";
  if (value === "comfort") return "Comfort";
  if (value === "business") return "Business";
  return "Limuzin";
};

const renderStars = (rating: number) => {
  const filled = Math.min(5, Math.max(1, Math.round(rating)));
  return Array.from({ length: 5 }, (_, idx) => (idx < filled ? "★" : "☆")).join("");
};

const findServiceById = (rawId: string): ServiceRecord | null => {
  if (!rawId) return null;
  const baseId = rawId.includes("-v") ? rawId.split("-v")[0] : rawId;
  for (const group of serviceCatalog) {
    for (const category of group.categories) {
      for (const agent of category.agents) {
        const service = agent.services.find((item) => item.id === baseId);
        if (service) {
          return { service, agent, category, groupTitle: group.title };
        }
      }
    }
  }
  return null;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [showContacts, setShowContacts] = useState(false);
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const record = useMemo(() => findServiceById(String(params?.id || "")), [params]);

  if (!record) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-red-400/70">Xizmat topilmadi.</p>
      </div>
    );
  }

  const { service, agent, category, groupTitle } = record;
  const exteriorImages = service.images.slice(0, 2);
  const interiorImages = service.images.slice(2);

  const handleOrder = () => {
    if (!isAuthenticated) {
      setNotice("Iltimos, oldin login buling.");
      setTimeout(() => router.push("/"), 600);
      return;
    }
    setNotice(null);
    setSubmitState("loading");
    setTimeout(() => {
      setSubmitState("success");
      setShowContacts(true);
      setNotice("Buyurtma qabul qilindi.");
    }, 700);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
        <p className="text-sm text-slate-700">{category.title}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Narx</span>
              <span className="font-semibold text-slate-900">
                {formatCount(service.price)} {service.currency} / {service.unit}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Transport turi</span>
              <span className="font-semibold text-slate-900">
                {vehicleClassLabel(agent.vehicleClass) || "Ko'rsatilmagan"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Model.</span>
              <span className="font-semibold text-slate-900">{agent.vehicleModel || "Ko'rsatilmagan"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">O'rinlar</span>
              <span className="font-semibold text-slate-900">{agent.seatCount ?? "Noma'lum"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Davlat raqami</span>
              <span className="font-semibold text-slate-900">{agent.vehiclePlate || "Ko'rsatilmagan"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Foydalanganlar</span>
              <span className="font-semibold text-slate-900">{formatCount(service.usedCount)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-800">Baho</span>
              <span className="font-semibold text-slate-900">{formatCount(service.reviewCount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="sr-only">Baho</span>
              <span className="text-lg text-amber-700">{renderStars(service.rating)}</span>
            </div>
          </div>

          {agent.vehicleOptions && agent.vehicleOptions.length > 0 && (
            <div className="mt-4 text-sm text-slate-800">
              <p className="text-xs uppercase tracking-wide text-sky-900">Qisqacha opsionlar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {agent.vehicleOptions.map((item) => (
                  <span key={`${service.id}-${item}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-slate-800">
            <p className="text-xs uppercase tracking-wide text-sky-900">Tavsif</p>
            <p className="mt-2 leading-relaxed">{service.description}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-700">
            {service.certificates.map((cert) => (
              <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                {cert}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {exteriorImages.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-900">Tashqi ko'rinish</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exteriorImages.map((image, idx) => (
                    <img
                      key={`${service.id}-ext-${idx}`}
                      src={image.src}
                      alt={image.alt}
                      className="h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
            {interiorImages.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-900">Ichki salon</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {interiorImages.map((image, idx) => (
                    <img
                      key={`${service.id}-int-${idx}`}
                      src={image.src}
                      alt={image.alt}
                      className="h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="card p-5">
          <div className="flex items-center gap-3">
            <img
              src={agent.avatar.src}
              alt={agent.avatar.alt}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
              <p className="text-xs text-slate-700">@{agent.nickname}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-700">
            <p>{agent.specialty}</p>
            <p>Manzil: {agent.location}</p>
            {(agent.region || agent.distanceKm) && (
              <p>
                Hudud: {agent.region || "—"} · {agent.distanceKm ?? "—"} km
              </p>
            )}
            <p>Tajriba: {agent.experienceYears} yil</p>
            {agent.gender && <p>Jinsi: {agent.gender}</p>}
            {showContacts ? (
              <>
                {agent.contactPhone && <p>Tel: {agent.contactPhone}</p>}
                {agent.contactTelegram && <p>Telegram: {agent.contactTelegram}</p>}
              </>
            ) : (
              (agent.contactPhone || agent.contactTelegram) && (
                <p className="text-slate-600">Kontaktlar buyurtmadan keyin ko'rinadi.</p>
              )
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-800">
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Yulduz: {agent.rating.toFixed(1)}/5
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Nice ({formatCount(agent.niceCount)})
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Ulashish ({formatCount(agent.shareCount)})
            </span>
          </div>

          {notice && (
            <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/70">
              {notice}
            </p>
          )}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
            <p className="font-semibold text-slate-900">Foydalanganlar uchun</p>
            <p className="mt-1 text-[11px] text-slate-700">
              Faqat ushbu agent xizmatidan foydalanganlar minnatdorchilik yoki shikoyat qila oladi.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!service.canRate}
                className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-900 disabled:opacity-50"
              >
                Minnatdorchilik bildirish
              </button>
              <button
                type="button"
                disabled={!service.canRate}
                className="rounded-full bg-rose-100 px-3 py-1 text-[11px] text-rose-900 disabled:opacity-50"
              >
                Shikoyat qilish
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrder}
            disabled={submitState === "loading"}
            className="mt-4 w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950/70 shadow hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </aside>
      </div>
    </div>
  );
}
