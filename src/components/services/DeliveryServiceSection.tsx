"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

type AgentCard = {
  name: string;
  role: string;
  route: string;
  rating: string;
  jobs: string;
  price: string;
  image: string;
  tags: string[];
  kind: "local" | "international";
  createdAt: string;
  details: {
    transport: string;
    capacity: string;
    deliveryType: string;
    verified: string[];
  };
};

const localAgents: AgentCard[] = [
  {
    name: "Aziza Karimova",
    role: "Mahalliy express kuryer",
    route: "Toshkent -> Andijon",
    rating: "4.9",
    jobs: "1,248",
    price: "18 000 so'm",
    image: "/services/delivery/07.jpg",
    tags: ["Face ID", "Avto: 10A123BC", "24/7 rejim"],
    kind: "local",
    createdAt: "2024-12-10",
    details: {
      transport: "Yengil avtomobil",
      capacity: "0-50 kg",
      deliveryType: "Eshikdan eshikgacha",
      verified: ["Face ID", "SMS kod", "Avto raqam"]
    }
  },
  {
    name: "Dilshod Murodov",
    role: "Mahalliy eko kuryer",
    route: "Samarqand <-> Buxoro",
    rating: "4.7",
    jobs: "782",
    price: "12 000 so'm",
    image: "/services/delivery/15.jpg",
    tags: ["Velokuryer", "Tezkor", "Face ID"],
    kind: "local",
    createdAt: "2024-11-22",
    details: {
      transport: "Velokuryer",
      capacity: "0-15 kg",
      deliveryType: "Shahar ichida",
      verified: ["Face ID", "Telefon tasdiq"]
    }
  },
  {
    name: "Malika Sobirova",
    role: "Mahalliy shaharlararo agent",
    route: "Farg'ona -> Namangan",
    rating: "4.8",
    jobs: "954",
    price: "15 000 so'm",
    image: "/services/delivery/19.jpg",
    tags: ["Avto: 40B778AA", "SMS kod", "Tezkor"],
    kind: "local",
    createdAt: "2025-01-08",
    details: {
      transport: "Yengil avtomobil",
      capacity: "0-80 kg",
      deliveryType: "Viloyatlar orasida",
      verified: ["SMS kod", "Avto raqam", "Hujjat"]
    }
  },
  {
    name: "Umidjon Raximov",
    role: "Mahalliy yuk tashish agenti",
    route: "Nukus -> Urganch",
    rating: "4.6",
    jobs: "611",
    price: "25 000 so'm",
    image: "/services/delivery/22.jpg",
    tags: ["Yuk tashish", "SMS kod", "Avto: 95K330AA"],
    kind: "local",
    createdAt: "2024-10-18",
    details: {
      transport: "Yuk furgoni",
      capacity: "30-200 kg",
      deliveryType: "Viloyatlar orasida",
      verified: ["SMS kod", "Hujjat"]
    }
  },
  {
    name: "Nilufar Tursunova",
    role: "Mahalliy tezkor kuryer",
    route: "Toshkent -> Jizzax",
    rating: "4.9",
    jobs: "1,102",
    price: "20 000 so'm",
    image: "/services/delivery/26.jpg",
    tags: ["Tezkor", "Face ID", "Avto: 01M555NA"],
    kind: "local",
    createdAt: "2025-02-03",
    details: {
      transport: "Yengil avtomobil",
      capacity: "0-60 kg",
      deliveryType: "Eshikdan eshikgacha",
      verified: ["Face ID", "Avto raqam"]
    }
  }
];

const internationalAgents: AgentCard[] = [
  {
    name: "Park Ji-hoon",
    role: "Xalqaro eshikdan eshikgacha",
    route: "Seul -> Toshkent",
    rating: "4.8",
    jobs: "436",
    price: "kg uchun $6",
    image: "/services/delivery/24.jpg",
    tags: ["Aeroport", "3-20 kg", "Elektronika"],
    kind: "international",
    createdAt: "2025-01-16",
    details: {
      transport: "Aviayuk",
      capacity: "3-20 kg",
      deliveryType: "Eshikdan eshikgacha",
      verified: ["Pasport", "Face ID", "Bojxona"]
    }
  },
  {
    name: "Aigerim Kenzhe",
    role: "Xalqaro aeroportgacha",
    route: "Almata -> Toshkent",
    rating: "4.6",
    jobs: "289",
    price: "kg uchun $4",
    image: "/services/delivery/28.jpg",
    tags: ["Aeroport", "1-15 kg", "Hujjatlar"],
    kind: "international",
    createdAt: "2024-09-05",
    details: {
      transport: "Aviayuk",
      capacity: "1-15 kg",
      deliveryType: "Aeroportgacha",
      verified: ["Pasport", "Hujjat"]
    }
  },
  {
    name: "Said Aliyev",
    role: "Xalqaro eshikdan eshikgacha",
    route: "Istanbul -> Samarqand",
    rating: "4.9",
    jobs: "512",
    price: "kg uchun $7",
    image: "/services/delivery/33.jpg",
    tags: ["Eshikdan eshikgacha", "2-25 kg", "Maishiy texnika"],
    kind: "international",
    createdAt: "2025-02-01",
    details: {
      transport: "Aviayuk + kur'er",
      capacity: "2-25 kg",
      deliveryType: "Eshikdan eshikgacha",
      verified: ["Pasport", "Face ID", "Bojxona"]
    }
  },
  {
    name: "Yuna Choi",
    role: "Xalqaro tezkor agent",
    route: "Busan -> Toshkent",
    rating: "4.7",
    jobs: "378",
    price: "kg uchun $5",
    image: "/services/delivery/31.jpg",
    tags: ["Tezkor", "Aeroport", "3-18 kg"],
    kind: "international",
    createdAt: "2024-12-02",
    details: {
      transport: "Aviayuk",
      capacity: "3-18 kg",
      deliveryType: "Aeroportgacha",
      verified: ["Pasport", "Bojxona"]
    }
  },
  {
    name: "Bunyod Ergashev",
    role: "Xalqaro posilka",
    route: "Dubay -> Toshkent",
    rating: "4.5",
    jobs: "264",
    price: "kg uchun $6",
    image: "/services/delivery/35.jpg",
    tags: ["Eshikdan eshikgacha", "5-30 kg", "Brend mahsulot"],
    kind: "international",
    createdAt: "2024-08-14",
    details: {
      transport: "Aviayuk",
      capacity: "5-30 kg",
      deliveryType: "Eshikdan eshikgacha",
      verified: ["Pasport", "Hujjat"]
    }
  }
];

const verificationSteps = [
  {
    title: "Agentlikka o'tish so'rovi",
    desc: "Telefon, @mail, shaxsiy rasm, uy manzili va Face ID yuboriladi."
  },
  {
    title: "Admin tekshiruvi",
    desc: "Hujjatlar va yuz tasdig'i mos bo'lsa 1 daqiqada tasdiqlanadi."
  },
  {
    title: "1-2 daqiqalik monitoring",
    desc: "Maqom o'zgarmasa, foydalanuvchiga admin bilan bog'lanish xabari yuboriladi."
  },
  {
    title: "Agent turlari",
    desc: "Har bir tur uchun maxsus talablar (mahalliy/xalqaro) qo'llanadi."
  }
];

const controlItems = [
  {
    title: "Statuslar va boshqaruv",
    desc: "Admin agentni active, block, deleted holatlariga o'tkazadi va turini o'zgartiradi."
  },
  {
    title: "Muloqot oynasi",
    desc: "Agent tasdiqlansa, Kerrot kabi chat ochiladi va xavfsizlik ogohlantirishi ko'rinadi."
  },
  {
    title: "Ishonchli to'lov",
    desc: "To'lov loyihaning hisobida saqlanadi, xizmat bajarilgach agentga o'tkaziladi."
  }
];

const filters = [
  { id: "top", label: "Eng yuqori baho" },
  { id: "fast", label: "Tezkor yetkazish" },
  { id: "local", label: "Mahalliy" },
  { id: "international", label: "Xalqaro" },
  { id: "weight-3-20", label: "3-20 kg" },
  { id: "door", label: "Eshikdan eshikgacha" },
  { id: "airport", label: "Aeroportgacha" }
];

export function DeliveryServiceSection() {
  const [activeTab, setActiveTab] = useState<"all" | "local" | "international">("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<"rating" | "new">("rating");
  const [localPage, setLocalPage] = useState(1);
  const [internationalPage, setInternationalPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<AgentCard | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const handleOpenAgent = (agent: AgentCard) => {
    setSelectedAgent(agent);
    setShowChat(false);
    setShowDispute(false);
    setMessageDraft("");
    setNotice(null);
  };

  const handleCloseAgent = () => {
    setSelectedAgent(null);
    setShowChat(false);
    setShowDispute(false);
    setNotice(null);
  };

  const handleUseService = () => {
    if (!isAuthenticated) {
      setNotice("Xizmatdan foydalanish uchun ro'yxatdan o'ting yoki login qiling.");
      return;
    }
    setNotice("So'rov yuborildi. To'lov xizmat yakunlangach tasdiqlanadi.");
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice("Xabarlashish uchun ro'yxatdan o'ting yoki login qiling.");
      return;
    }
    setShowChat(true);
    setShowDispute(false);
    setNotice(null);
  };

  const handleOpenDispute = () => {
    if (!isAuthenticated) {
      setNotice("Nizo ochish uchun ro'yxatdan o'ting yoki login qiling.");
      return;
    }
    setShowDispute(true);
    setShowChat(false);
    setNotice(null);
  };

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  useEffect(() => {
    setLocalPage(1);
    setInternationalPage(1);
  }, [activeFilters, activeTab, sortMode]);

  const parseRange = (value: string) => {
    const match = value.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return null;
    return { min: Number(match[1]), max: Number(match[2]) };
  };

  const matchesFilters = (agent: AgentCard) => {
    if (activeFilters.length === 0) return true;

    const hasLocal = activeFilters.includes("local");
    const hasInternational = activeFilters.includes("international");
    if (hasLocal && !hasInternational && agent.kind !== "local") return false;
    if (hasInternational && !hasLocal && agent.kind !== "international") return false;

    if (activeFilters.includes("top") && Number(agent.rating) < 4.8) return false;

    if (activeFilters.includes("fast")) {
      const fast = agent.tags.some((tag) => tag.toLowerCase().includes("tezkor")) || agent.role.toLowerCase().includes("express");
      if (!fast) return false;
    }

    if (activeFilters.includes("weight-3-20")) {
      const range = parseRange(agent.details.capacity);
      if (!range || range.min > 20 || range.max < 3) return false;
    }

    if (activeFilters.includes("door") && !agent.details.deliveryType.toLowerCase().includes("eshik")) {
      return false;
    }

    if (activeFilters.includes("airport") && !agent.details.deliveryType.toLowerCase().includes("aeroport")) {
      return false;
    }

    return true;
  };

  const sortAgents = (agents: AgentCard[]) => {
    return [...agents].sort((a, b) => {
      if (sortMode === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const ratingDiff = Number(b.rating) - Number(a.rating);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b.jobs.replace(/,/g, "")) - Number(a.jobs.replace(/,/g, ""));
    });
  };

  const filteredLocalAgents = sortAgents(localAgents.filter(matchesFilters));
  const filteredInternationalAgents = sortAgents(internationalAgents.filter(matchesFilters));

  const pageSize = 3;
  const localTotalPages = Math.max(1, Math.ceil(filteredLocalAgents.length / pageSize));
  const internationalTotalPages = Math.max(1, Math.ceil(filteredInternationalAgents.length / pageSize));
  const safeLocalPage = Math.min(localPage, localTotalPages);
  const safeInternationalPage = Math.min(internationalPage, internationalTotalPages);
  const pagedLocalAgents = filteredLocalAgents.slice((safeLocalPage - 1) * pageSize, safeLocalPage * pageSize);
  const pagedInternationalAgents = filteredInternationalAgents.slice(
    (safeInternationalPage - 1) * pageSize,
    safeInternationalPage * pageSize
  );
  const chatTemplates = [
    "Narxni aniqlashtirib bering.",
    "Yetkazish muddati nechchi kun?",
    "Eshikdan eshikgacha xizmat bormi?",
    "Qabul qilinmaydigan yuk turlari bormi?"
  ];

  return (
    <div className="flex w-full flex-col gap-10">
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/50 via-slate-950/70 to-amber-900/30 p-8 shadow-2xl shadow-black/30">
        <div className="absolute inset-0 opacity-30" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Yetkazib berish xizmati</p>
            <h1 className="text-3xl font-semibold leading-tight text-emerald-50 sm:text-4xl">
              Mahalliy va xalqaro pochta xizmatlarini bir platformada boshqarish.
            </h1>
            <p className="text-sm text-emerald-100/80">
              Agentlar tasdig'i, Face ID, xavfsiz to'lov va shaffof baholash orqali foydalanuvchi ishonchini
              mustahkamlaydigan yetkazib berish tizimi.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {["1 daqiqada tasdiq", "Admin monitoring", "Kafolatli to'lov"].map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Xizmat bo'limlari</p>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <h2 className="text-base font-semibold text-emerald-50">Mahalliy</h2>
              <p className="mt-2 text-xs text-emerald-100/80">
                Bir davlat ichida hududdan hududga yetkazish. Avto, velokuryer va ekspress agentlar bilan.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <h2 className="text-base font-semibold text-amber-50">Xalqaro</h2>
              <p className="mt-2 text-xs text-amber-100/80">
                Davlatdan davlatga, aeroportgacha yoki eshikdan eshikgacha xizmat ko'rsatish.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-emerald-50">Agentlikka o'tish jarayoni</h2>
          <div className="mt-4 space-y-4">
            {verificationSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-100">
                  0{index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-emerald-50">Nazorat va ishonch</h2>
          <div className="mt-4 grid gap-4">
            {controlItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="mt-2 text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900/70 to-emerald-950/70 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold text-amber-50">Mahalliy yetkazib berish talablari</h2>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="text-amber-300">-</span>
                Telefon raqam, shaxsni tasdiqlovchi hujjat, Face ID va uy manzili.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-300">-</span>
                Mashina raqami va SMS orqali 5 raqamli kod bilan tasdiqlash.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-300">-</span>
                Agentning narxi, xizmatlari soni va bahosi foydalanuvchiga ko'rinadi.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-300">-</span>
                Telefon/Telegram faqat muammo bo'lganda alohida so'rov bilan beriladi.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-50">Xalqaro yetkazib berish talablari</h2>
            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="text-emerald-300">-</span>
                Qaysi davlatdan qaysi davlatga va qachon ketishi ko'rsatiladi.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-300">-</span>
                Necha kg va qanday turdagi mahsulotlarni qabul qilishi belgilanadi.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-300">-</span>
                Eshikdan eshikgacha yoki aeroportgacha yetkazish varianti.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-300">-</span>
                Hamkorlik shartlari tasdiqlangach agentlar safar bo'yicha e'lon qiladi.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <h2 className="text-lg font-semibold text-emerald-50">Ishonch paneli</h2>
          <p className="mt-2 text-xs text-emerald-100/80">
            To'lovlar loyihaning hisobida saqlanadi va xizmat tasdiqlangach agentga o'tkaziladi.
          </p>
          <div className="mt-4 grid gap-3 text-xs text-emerald-100/80">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              1 daqiqada tasdiqlash + admin monitoring
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              Face ID va hujjat tasdiqlari ko'rinadi
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              Nizo bo'lsa admin tekshiradi va qaror beradi
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">Agentlar uchun qulayliklar</h2>
          <div className="mt-3 space-y-2 text-xs text-slate-400">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              Buyurtma holatlari va to'lovlar tarixi
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              Tezkor e'lon yaratish shablonlari
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              Reyting va ishonch indikatorlari
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Agentlar ro'yxati</h2>
            <p className="mt-1 text-xs text-slate-400">
              Mahalliy va xalqaro bo'limlar alohida ko'rsatiladi. Har biri baho va faoliyatiga ko'ra saralanadi.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Saralash:</span>
            {[
              { id: "rating", label: "Baho" },
              { id: "new", label: "Yangi" }
            ].map((item) => {
              const isActive = sortMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSortMode(item.id as "rating" | "new")}
                  className={`rounded-full border px-3 py-1 transition ${
                    isActive
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                      : "border-slate-700/70 bg-slate-900/70 text-slate-300 hover:border-emerald-400/40"
                  }`}
                  aria-pressed={isActive}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => toggleFilter(filter.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isActive
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                    : "border-slate-700/70 bg-slate-900/70 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-100"
                }`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {[
            { key: "all", label: "Barchasi" },
            { key: "local", label: "Mahalliy" },
            { key: "international", label: "Xalqaro" }
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as "all" | "local" | "international")}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                    : "border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-100"
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6">
          {activeTab !== "international" && filteredLocalAgents.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-950/70 to-slate-950 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Mahalliy pochta xizmati</p>
                  <p className="text-sm text-emerald-100/70">Shaharlar va viloyatlar orasidagi yetkazish.</p>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  {filteredLocalAgents.length} agent
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {pagedLocalAgents.map((agent) => (
                  <article
                    key={agent.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenAgent(agent)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenAgent(agent);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 transition hover:-translate-y-1 hover:border-emerald-500/40"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-emerald-200">{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        <span>{agent.route}</span>
                        <span>* {agent.rating}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                        <span>{agent.price}</span>
                        <span>{agent.jobs} xizmat</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAgent(agent);
                          }}
                          className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/40"
                        >
                          Batafsil
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAgent(agent);
                            handleUseService();
                          }}
                          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                        >
                          Xizmatdan foydalanish
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {filteredLocalAgents.length > pageSize && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100/80">
                  <span>
                    Sahifa {safeLocalPage} / {localTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1"
                      disabled={safeLocalPage === 1}
                    >
                      Oldingi
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalPage((prev) => Math.min(localTotalPages, prev + 1))}
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1"
                      disabled={safeLocalPage === localTotalPages}
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "all" && (
            <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60">
              <img
                src="/services/delivery/36.jpg"
                alt="Mahalliy va xalqaro pochta xizmati"
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {activeTab !== "local" && filteredInternationalAgents.length > 0 && (
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 via-slate-950/70 to-slate-950 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Xalqaro pochta xizmati</p>
                  <p className="text-sm text-amber-100/70">Davlatlar orasidagi yuk va posilka yetkazish.</p>
                </div>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                  {filteredInternationalAgents.length} agent
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {pagedInternationalAgents.map((agent) => (
                  <article
                    key={agent.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenAgent(agent)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenAgent(agent);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 transition hover:-translate-y-1 hover:border-amber-400/40"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-amber-200">{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        <span>{agent.route}</span>
                        <span>* {agent.rating}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                        <span>{agent.price}</span>
                        <span>{agent.jobs} xizmat</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAgent(agent);
                          }}
                          className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-400/40"
                        >
                          Batafsil
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAgent(agent);
                            handleUseService();
                          }}
                          className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
                        >
                          Xizmatdan foydalanish
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {filteredInternationalAgents.length > pageSize && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100/80">
                  <span>
                    Sahifa {safeInternationalPage} / {internationalTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInternationalPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1"
                      disabled={safeInternationalPage === 1}
                    >
                      Oldingi
                    </button>
                    <button
                      type="button"
                      onClick={() => setInternationalPage((prev) => Math.min(internationalTotalPages, prev + 1))}
                      className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1"
                      disabled={safeInternationalPage === internationalTotalPages}
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "all" && filteredLocalAgents.length === 0 && filteredInternationalAgents.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
              Tanlangan filterlar bo'yicha agent topilmadi.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Tez ommalashuv</p>
            <h2 className="mt-2 text-lg font-semibold text-amber-50">Yangi agentlar va foydalanuvchilar uchun bonus</h2>
            <p className="mt-2 text-xs text-amber-100/80">
              Birinchi buyurtmaga komissiya 0% va tavsiya orqali bonuslar.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-100"
          >
            Taklif yuborish
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">Muammolar va nizolar</h2>
          <p className="mt-3 text-xs text-slate-400">
            Agar agent xizmatni bajargan bo'lsa, ammo foydalanuvchi tasdiqlamasa, agent dalillar bilan adminlarga
            murojaat qiladi. Admin tekshiruvdan so'ng mablag'ni agent yoki foydalanuvchiga qayta taqsimlaydi.
          </p>
          <div className="mt-4 grid gap-3 text-xs text-slate-300">
            {[
              "Pul foydalanuvchi tomonidan xizmatni bosganda bloklanadi.",
              "Xizmat bajarilgach foydalanuvchi tasdiqlaydi va to'lov agentga o'tadi.",
              "Telefon raqami almashinsa, chat ostida loyiha javobgarlikni olmaydi xabari chiqadi."
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <h2 className="text-lg font-semibold text-emerald-50">Agentlar uchun profil</h2>
          <p className="mt-3 text-xs text-emerald-100/80">
            Agentlar ro'yxatdan o'tishda shaxsiy hisob raqamini kiritadi. To'lovlar faqat shu hisobga tushadi va
            hujjatlar aynan agent nomiga tegishli bo'lishi shart.
          </p>
          <div className="mt-4 space-y-3 text-xs text-emerald-100/80">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              Tasdiqlash vaqti: 1-5 daqiqa
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              Avtomatik tasdiq bo'lmasa, admin bilan 1/1 chat ochiladi
            </div>
          </div>
        </div>
      </section>

      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {selectedAgent.kind === "local" ? "Mahalliy agent" : "Xalqaro agent"}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{selectedAgent.name}</h3>
                <p className="text-sm text-slate-400">{selectedAgent.role}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseAgent}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
              >
                Yopish
              </button>
            </div>
            <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-800">
                  <img
                    src={selectedAgent.image}
                    alt={selectedAgent.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Yo'nalish</span>
                    <span className="text-slate-100">{selectedAgent.route}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Narx</span>
                    <span className="text-emerald-200">{selectedAgent.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baho</span>
                    <span className="text-slate-100">{selectedAgent.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Xizmatlar</span>
                    <span className="text-slate-100">{selectedAgent.jobs}</span>
                  </div>
                </div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                    {tag}
                  </span>
                ))}
              </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Agent tafsilotlari</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Transport</span>
                      <span className="text-slate-100">{selectedAgent.details.transport}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sig'im</span>
                      <span className="text-slate-100">{selectedAgent.details.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Yetkazish turi</span>
                      <span className="text-slate-100">{selectedAgent.details.deliveryType}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAgent.details.verified.map((item) => (
                      <span key={item} className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {notice && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                    {notice}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUseService}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    Xizmatdan foydalanish
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/40"
                  >
                    Xabarlashish
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenDispute}
                    className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Nizo ochish
                  </button>
                </div>

                {showChat && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p className="text-sm font-semibold text-slate-100">Ilova ichidagi chat</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Narx yoki xizmat tafsilotlarini aniqlashtirish uchun agentga yozing.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chatTemplates.map((template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() => setMessageDraft(template)}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="mt-3 min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                      placeholder="Savolingizni yozing..."
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                    />
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-emerald-400/90 py-2 text-xs font-semibold text-slate-950"
                    >
                      Xabar yuborish
                    </button>
                  </div>
                )}

                {showDispute && (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-100">
                    <p className="text-sm font-semibold text-rose-100">Nizo ochish</p>
                    <p className="mt-2 text-xs text-rose-100/80">
                      Admin tekshiruviga yuborish uchun muammoni qisqacha yozing.
                    </p>
                    <textarea
                      className="mt-3 min-h-[90px] w-full rounded-xl border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100"
                      placeholder="Muammo tafsilotlarini kiriting..."
                    />
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-rose-500/80 py-2 text-xs font-semibold text-rose-50"
                    >
                      Nizoni yuborish
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-800 px-6 py-4 text-[11px] text-slate-400">
              Eslatma: Telefon raqami yoki telegram faqat muammo bo'lganda alohida so'rov bilan beriladi.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
