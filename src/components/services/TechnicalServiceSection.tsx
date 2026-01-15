"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";

type AgentListing = {
  title: string;
  description: string;
  price: string;
  unit: string;
};

type AgentCard = {
  id: string;
  name: string;
  role: string;
  rating: string;
  jobs: string;
  price: string;
  image: string;
  tags: string[];
  createdAt: string;
  sectionId: string;
  sectionTitle: string;
  subCategoryId: string;
  subCategoryTitle: string;
  listings: AgentListing[];
  details: {
    experience: string;
    responseTime: string;
    warranty: string;
    verified: string[];
  };
};

type SubCategory = {
  id: string;
  title: string;
  description: string;
  agents: AgentCard[];
};

type Section = {
  id: string;
  title: string;
  description: string;
  subCategories: SubCategory[];
};

let imageCursor = 1;
const nextImage = () => `/services/technical/${String(imageCursor++).padStart(2, "0")}.jpg`;

const makeListings = (items: Array<{ title: string; description: string; unit: string }>, basePrice: number) =>
  items.map((item, idx) => ({
    title: item.title,
    description: item.description,
    unit: item.unit,
    price: `${basePrice + idx * 20000} so'm`
  }));

const makeAgents = (options: {
  sectionId: string;
  sectionTitle: string;
  subCategoryId: string;
  subCategoryTitle: string;
  names: string[];
  role: string;
  basePrice: number;
  tags: string[];
  listings: Array<{ title: string; description: string; unit: string }>;
}): AgentCard[] =>
  options.names.map((name, idx) => ({
    id: `${options.subCategoryId}-${idx + 1}`,
    name,
    role: options.role,
    rating: (4.6 + idx * 0.2).toFixed(1),
    jobs: (320 + idx * 85).toLocaleString("en-US"),
    price: `${options.basePrice + idx * 15000} so'm`,
    image: nextImage(),
    tags: options.tags,
    createdAt: `2024-0${(idx % 3) + 9}-1${idx + 1}`,
    sectionId: options.sectionId,
    sectionTitle: options.sectionTitle,
    subCategoryId: options.subCategoryId,
    subCategoryTitle: options.subCategoryTitle,
    listings: makeListings(options.listings, options.basePrice + idx * 10000),
    details: {
      experience: `${5 + idx * 2} yil`,
      responseTime: idx === 0 ? "1 soat ichida" : idx === 1 ? "2-3 soat" : "4-6 soat",
      warranty: idx === 0 ? "6 oy kafolat" : idx === 1 ? "3 oy kafolat" : "1 yil kafolat",
      verified: ["Face ID", "Usta guvohnomasi", "Shartnoma"]
    }
  }));

const technicalSections: Section[] = [
  {
    id: "auto",
    title: "Mashinalarni ta'mirlash",
    description: "Dvigatel, uzatmalar va kuzov ishlari bo'yicha servis.",
    subCategories: [
      {
        id: "auto-mech",
        title: "Ichki mexanizmlar",
        description: "Dvigatel, transmissiya va elektronika.",
        agents: makeAgents({
          sectionId: "auto",
          sectionTitle: "Mashinalarni ta'mirlash",
          subCategoryId: "auto-mech",
          subCategoryTitle: "Ichki mexanizmlar",
          names: ["Jasur Yoqubov", "Xusan Qodirov", "Sherzod Mahmudov"],
          role: "Dvigatel va mexanika ustasi",
          basePrice: 180000,
          tags: ["Dvigatel", "Diagnostika", "Kafolat 6 oy"],
          listings: [
            { title: "Dvigatel diagnostikasi", description: "Kompyuter diagnostika va sinov.", unit: "xizmat" },
            { title: "Transmissiya ta'miri", description: "Avtomat va mexanika uzatmalar.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "auto-body",
        title: "Kuzov va tashqi qism",
        description: "Kuzov, bo'yoq, polirovka.",
        agents: makeAgents({
          sectionId: "auto",
          sectionTitle: "Mashinalarni ta'mirlash",
          subCategoryId: "auto-body",
          subCategoryTitle: "Kuzov va tashqi qism",
          names: ["Diyorbek Safarov", "Otabek Esonov", "Nodir Fozilov"],
          role: "Kuzov va bo'yoq ustasi",
          basePrice: 160000,
          tags: ["Bo'yoq", "Kuzov", "Polirovka"],
          listings: [
            { title: "Kuzov tekislash", description: "Buzilgan detallarni tekislash.", unit: "xizmat" },
            { title: "Bo'yoq va lak", description: "Rangni moslab bo'yash.", unit: "xizmat" }
          ]
        })
      }
    ]
  },
  {
    id: "devices",
    title: "Telefon va kompyuterlar",
    description: "Smartfon va noutbuklarni tezkor ta'mirlash.",
    subCategories: [
      {
        id: "phone-repair",
        title: "Telefon ta'miri",
        description: "Ekran, batareya, platani tiklash.",
        agents: makeAgents({
          sectionId: "devices",
          sectionTitle: "Telefon va kompyuterlar",
          subCategoryId: "phone-repair",
          subCategoryTitle: "Telefon ta'miri",
          names: ["Malika Karimova", "Dilnoza Aliyeva", "Nigora Xasanova"],
          role: "Smartfon servis ustasi",
          basePrice: 120000,
          tags: ["Ekran", "Batareya", "Tezkor"],
          listings: [
            { title: "Ekran almashtirish", description: "Original ekran bilan almashtirish.", unit: "xizmat" },
            { title: "Batareya yangilash", description: "Sig'im test va kalibrovka.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "computer-repair",
        title: "Kompyuter ta'miri",
        description: "OS, SSD, texnik tozalash.",
        agents: makeAgents({
          sectionId: "devices",
          sectionTitle: "Telefon va kompyuterlar",
          subCategoryId: "computer-repair",
          subCategoryTitle: "Kompyuter ta'miri",
          names: ["Azizbek Oripov", "Iskandar Sobirov", "Sardor Jo'rayev"],
          role: "Kompyuter va noutbuk ustasi",
          basePrice: 140000,
          tags: ["SSD", "OS o'rnatish", "Diagnostika"],
          listings: [
            { title: "OS va drayverlar", description: "Windows/Mac sozlash.", unit: "xizmat" },
            { title: "SSD va RAM", description: "Tezlikni oshirish.", unit: "xizmat" }
          ]
        })
      }
    ]
  },
  {
    id: "home",
    title: "Maishiy vositalar",
    description: "Uy jihozlarini ta'mirlash va profilaktika.",
    subCategories: [
      {
        id: "home-tv",
        title: "Televizor ta'miri",
        description: "LED, panel va plata ishlari.",
        agents: makeAgents({
          sectionId: "home",
          sectionTitle: "Maishiy vositalar",
          subCategoryId: "home-tv",
          subCategoryTitle: "Televizor ta'miri",
          names: ["Umar Saidov", "Asilbek Holmatov", "Rustam Toirov"],
          role: "TV va audio ustasi",
          basePrice: 110000,
          tags: ["LED", "Panel", "Pult sozlash"],
          listings: [
            { title: "Panel diagnostikasi", description: "LED va LCD test.", unit: "xizmat" },
            { title: "Plata ta'miri", description: "Elektron blokni tiklash.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "home-wash",
        title: "Kir yuvish mashinasi",
        description: "Nasos, drenaj va podshipniklar.",
        agents: makeAgents({
          sectionId: "home",
          sectionTitle: "Maishiy vositalar",
          subCategoryId: "home-wash",
          subCategoryTitle: "Kir yuvish mashinasi",
          names: ["Gulbahor Tursunova", "Saida Yuldasheva", "Shahzoda Karimova"],
          role: "Kir yuvish mashinasi ustasi",
          basePrice: 130000,
          tags: ["Nasos", "Germetik", "Original ehtiyot qism"],
          listings: [
            { title: "Nasos almashtirish", description: "Suv chiqarish tizimi.", unit: "xizmat" },
            { title: "Podshipnik ta'miri", description: "Shovqinni kamaytirish.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "home-ac",
        title: "Konditsioner servisi",
        description: "Tozalash, freon, kompressor.",
        agents: makeAgents({
          sectionId: "home",
          sectionTitle: "Maishiy vositalar",
          subCategoryId: "home-ac",
          subCategoryTitle: "Konditsioner servisi",
          names: ["Bunyod Raximov", "Kamron G'ofurov", "Jamshid Ergashev"],
          role: "Sovitish tizimi ustasi",
          basePrice: 150000,
          tags: ["Freon", "Tozalash", "Kafolat"],
          listings: [
            { title: "Freon to'ldirish", description: "Bosim va oqim tekshirish.", unit: "xizmat" },
            { title: "Chuqur tozalash", description: "Filtr va drenajni yuvish.", unit: "xizmat" }
          ]
        })
      }
    ]
  },
  {
    id: "industrial",
    title: "Sanoat uskunalari",
    description: "Sanoat stanoklari va ishlab chiqarish liniyalari.",
    subCategories: [
      {
        id: "industrial-machines",
        title: "Stanok va liniyalar",
        description: "Uskunalarni sozlash va ta'mirlash.",
        agents: makeAgents({
          sectionId: "industrial",
          sectionTitle: "Sanoat uskunalari",
          subCategoryId: "industrial-machines",
          subCategoryTitle: "Stanok va liniyalar",
          names: ["Akmal Ismailov", "Bobur Shokirov", "Komil Zayniddinov"],
          role: "Sanoat texnikasi ustasi",
          basePrice: 280000,
          tags: ["24/7 servis", "Texnika xavfsizligi", "Katta quvvat"],
          listings: [
            { title: "Stanok diagnostikasi", description: "Sensor va motor tekshirish.", unit: "xizmat" },
            { title: "Liniya profilaktikasi", description: "Ishlab chiqarish to'xtamasligi.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "industrial-energy",
        title: "Generator va kompressor",
        description: "Energiya va bosim tizimlari.",
        agents: makeAgents({
          sectionId: "industrial",
          sectionTitle: "Sanoat uskunalari",
          subCategoryId: "industrial-energy",
          subCategoryTitle: "Generator va kompressor",
          names: ["Mansur Turdiyev", "Ulug'bek Valiev", "Zafar Qosimov"],
          role: "Generator va kompressor ustasi",
          basePrice: 260000,
          tags: ["Generator", "Bosim", "Profilaktika"],
          listings: [
            { title: "Kompressor servis", description: "Bosim kalibrovkasi.", unit: "xizmat" },
            { title: "Generator ta'miri", description: "Stator va rotor ishlari.", unit: "xizmat" }
          ]
        })
      }
    ]
  },
  {
    id: "it",
    title: "Dasturiy ta'minot va IT",
    description: "Server, tarmoq va dasturiy xizmatlar.",
    subCategories: [
      {
        id: "it-software",
        title: "Dastur sozlash",
        description: "Soft, litsenziya va texnik yordam.",
        agents: makeAgents({
          sectionId: "it",
          sectionTitle: "Dasturiy ta'minot va IT",
          subCategoryId: "it-software",
          subCategoryTitle: "Dastur sozlash",
          names: ["Muhammad Aliyev", "Shavkat Razzakov", "Farhod Tohirov"],
          role: "Dasturiy ta'minot mutaxassisi",
          basePrice: 170000,
          tags: ["Litsenziya", "Onlayn yordam", "Masofaviy"],
          listings: [
            { title: "Dastur o'rnatish", description: "Litsenziyalash va sozlash.", unit: "xizmat" },
            { title: "Texnik yordam", description: "Onlayn nazorat va audit.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "it-network",
        title: "Tarmoq va server",
        description: "Server monitoring va tarmoq xavfsizligi.",
        agents: makeAgents({
          sectionId: "it",
          sectionTitle: "Dasturiy ta'minot va IT",
          subCategoryId: "it-network",
          subCategoryTitle: "Tarmoq va server",
          names: ["Sanjar Yuldashev", "Behruz Mirzayev", "Sirojiddin Namozov"],
          role: "Tarmoq va server mutaxassisi",
          basePrice: 210000,
          tags: ["Server", "Firewall", "Monitoring"],
          listings: [
            { title: "Server sozlash", description: "Zaxira va monitoring.", unit: "xizmat" },
            { title: "Tarmoq audit", description: "Xavfsizlik tekshiruvi.", unit: "xizmat" }
          ]
        })
      },
      {
        id: "it-recovery",
        title: "Ma'lumot tiklash",
        description: "Disk va ma'lumotlar xavfsizligi.",
        agents: makeAgents({
          sectionId: "it",
          sectionTitle: "Dasturiy ta'minot va IT",
          subCategoryId: "it-recovery",
          subCategoryTitle: "Ma'lumot tiklash",
          names: ["Lola Fozilova", "Madina Abdullayeva", "Munisa Ermatova"],
          role: "Data recovery mutaxassisi",
          basePrice: 190000,
          tags: ["Data recovery", "Zaxira", "Maxfiy"],
          listings: [
            { title: "Disk tiklash", description: "SSD/HDD ma'lumot tiklash.", unit: "xizmat" },
            { title: "Zaxira strategiya", description: "Arxiv va backup rejasi.", unit: "xizmat" }
          ]
        })
      }
    ]
  }
];

export function TechnicalServiceSection() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<AgentCard | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const activeSectionData = useMemo(
    () => technicalSections.find((section) => section.id === activeSection) || null,
    [activeSection]
  );

  const sectionAgents = useMemo(() => {
    if (!activeSectionData) return [];
    return activeSectionData.subCategories.flatMap((sub) => sub.agents);
  }, [activeSectionData]);

  const filteredAgents = useMemo(() => {
    if (!activeSectionData) return [];
    const query = search.trim().toLowerCase();
    return sectionAgents.filter((agent) => {
      if (activeSubCategory !== "all" && agent.subCategoryId !== activeSubCategory) return false;
      if (!query) return true;
      const haystack = [
        agent.name,
        agent.role,
        agent.subCategoryTitle,
        ...agent.tags,
        ...agent.listings.map((item) => item.title)
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeSectionData, activeSubCategory, search, sectionAgents]);

  useEffect(() => {
    setPage(1);
  }, [activeSection, activeSubCategory, search]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedAgents = filteredAgents.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleOpenAgent = (agent: AgentCard) => {
    setSelectedAgent(agent);
    setShowChat(false);
    setNotice(null);
    setMessageDraft("");
  };

  const handleCloseAgent = () => {
    setSelectedAgent(null);
    setShowChat(false);
    setNotice(null);
  };

  const handleUseService = () => {
    if (!isAuthenticated) {
      setNotice("Xizmatdan foydalanish uchun ro'yxatdan o'ting yoki login qiling.");
      return;
    }
    setNotice("So'rov yuborildi. Agent tez orada javob beradi.");
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice("Xabarlashish uchun ro'yxatdan o'ting yoki login qiling.");
      return;
    }
    setShowChat(true);
    setNotice(null);
  };

  const chatTemplates = [
    "Narx va kafolatni aniqlashtirib bering.",
    "Xizmat qancha vaqtda bajariladi?",
    "Ehtiyot qismlar originalmi?",
    "Joyida servis bormi?"
  ];

  return (
    <div className="flex w-full flex-col gap-10">
      <header className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-950 via-slate-900/80 to-sky-950/40 p-8 shadow-2xl shadow-black/30">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Texnik xizmat ko'rsatish</p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-100 sm:text-4xl">
              Avto, qurilma va IT xizmatlari uchun yagona texnik bo'lim.
            </h1>
            <p className="text-sm text-slate-300">
              Agentlar tasdig'i, xizmat e'lonlari va xavfsiz chat orqali texnik xizmatlarni tez toping.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {["Tasdiqlangan agentlar", "Kafolatli servis", "Xavfsiz chat"].map((tag) => (
                <span key={tag} className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex h-full items-end">
            <div className="w-full rounded-2xl border border-sky-400/20 bg-slate-950/70 p-5">
              <label className="text-xs uppercase tracking-[0.3em] text-sky-200">Qidiruv</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Agent, xizmat yoki kalit so'z..."
                className="mt-3 w-full rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
              <p className="mt-3 text-[11px] text-slate-400">
                Tezkor qidiruv: bo'lim, xizmat turi va agent ismi bo'yicha.
              </p>
            </div>
          </div>
        </div>
      </header>

      {!activeSectionData ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {technicalSections.map((section) => {
            const previewAgents = section.subCategories.flatMap((sub) => sub.agents).slice(0, 4);
            return (
              <div key={section.id} className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{section.title}</h3>
                    <p className="mt-2 text-xs text-slate-400">{section.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200"
                  >
                    Bo'limni tanlash
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  {section.subCategories.map((sub) => (
                    <span key={sub.id} className="rounded-full border border-slate-700/70 px-3 py-1">
                      {sub.title}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {previewAgents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleOpenAgent(agent)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3 text-left transition hover:border-sky-400/60"
                    >
                      <img src={agent.image} alt={agent.name} className="h-12 w-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-slate-100">{agent.name}</p>
                        <p className="text-[11px] text-slate-400">{agent.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Yangi xizmatlar</h3>
                <p className="mt-2 text-xs text-slate-400">Tez orada texnik xizmatlar bo'limi kengaytiriladi.</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src="/services/technical/36.jpg"
                  alt="Yangi xizmatlar"
                  className="h-44 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-5 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200"
              >
                Orqaga
              </button>
              <h3 className="mt-3 text-xl font-semibold text-slate-100">{activeSectionData.title}</h3>
              <p className="mt-2 text-xs text-slate-400">{activeSectionData.description}</p>
            </div>
            <div className="w-full max-w-xs">
              <label className="text-[11px] text-slate-400">Qidirish</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Agent, xizmat yoki kalit so'z..."
                className="mt-2 w-full rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubCategory("all")}
              className={`rounded-full px-4 py-2 ${
                activeSubCategory === "all"
                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                  : "bg-slate-900/60 text-slate-400"
              }`}
            >
              Barchasi
            </button>
            {activeSectionData.subCategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubCategory(sub.id)}
                className={`rounded-full px-4 py-2 ${
                  activeSubCategory === sub.id
                    ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                    : "bg-slate-900/60 text-slate-400"
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>

          {pagedAgents.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-sm text-slate-400">
              Tanlangan filterlar bo'yicha agent topilmadi.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pagedAgents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleOpenAgent(agent)}
                  className="group rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-left transition hover:border-sky-400/60"
                >
                  <div className="overflow-hidden rounded-2xl border border-slate-800">
                    <img src={agent.image} alt={agent.name} className="h-36 w-full object-cover transition group-hover:scale-[1.02]" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">{agent.role}</p>
                    <p className="text-[11px] text-slate-500">{agent.subCategoryTitle}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-900 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>* {agent.rating}</span>
                    <span>{agent.jobs} xizmat</span>
                    <span className="text-sky-200">{agent.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Sahifa {safePage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200"
              >
                Oldingi
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200"
              >
                Keyingi
              </button>
            </div>
          </div>
        </section>
      )}

      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{selectedAgent.subCategoryTitle}</p>
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
                  <img src={selectedAgent.image} alt={selectedAgent.name} className="h-48 w-full object-cover" />
                </div>
                <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Narx</span>
                    <span className="text-sky-200">{selectedAgent.price}</span>
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
                    <span key={tag} className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] text-sky-200">
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
                      <span>Tajriba</span>
                      <span className="text-slate-100">{selectedAgent.details.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Javob vaqti</span>
                      <span className="text-slate-100">{selectedAgent.details.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Kafolat</span>
                      <span className="text-slate-100">{selectedAgent.details.warranty}</span>
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

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Agent e'lonlari</p>
                  <div className="mt-3 space-y-2">
                    {selectedAgent.listings.map((item) => (
                      <div key={item.title} className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-3">
                        <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{item.description}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.unit}</span>
                          <span className="text-sky-200">{item.price}</span>
                        </div>
                      </div>
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
                    className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200"
                  >
                    Xizmatdan foydalanish
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                  >
                    Xabarlashish
                  </button>
                </div>

                {showChat && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p className="text-sm font-semibold text-slate-100">Ilova ichidagi chat</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Xizmat tafsilotlarini aniqlashtirish uchun agentga yozing.
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
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      placeholder="Xabaringiz..."
                      className="mt-3 h-20 w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="mt-3 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200"
                    >
                      Xabar yuborish
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
