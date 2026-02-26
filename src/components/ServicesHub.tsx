"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getCategoryImagePool,
  serviceCatalog,
  type ServiceAgent,
  type ServiceCatalogGroup
} from "@/data/serviceCatalog";
import {
  taxiClassOptions,
  taxiSeatOptions,
  type TaxiSeatCount,
  type TaxiVehicleClass
} from "@/data/taxiOptions";
import { useRideSocket } from "@/hooks/useRideSocket";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";
import { DeliveryServiceSection } from "@/components/services/DeliveryServiceSection";
import { TechnicalServiceSection } from "@/components/services/TechnicalServiceSection";
import { EmploymentServiceSection } from "@/components/services/EmploymentServiceSection";
import { EducationServiceSection } from "@/components/services/EducationServiceSection";
import { Avatar } from "@/components/ui/Avatar";

type ServiceFormState = {
  type: "material" | "spiritual";
  categoryId: string;
  title: string;
  price: string;
  currency: "UZS" | "USD";
  certificates: string;
  description: string;
  images: File[];
  agree: boolean;
};

type DisplayService = {
  displayId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  certificates: string[];
  images: { src: string; alt: string }[];
  rating: number;
  reviewCount: number;
  usedCount: number;
  niceCount: number;
  shareCount: number;
  canRate: boolean;
  createdAt: string;
  agent: ServiceAgent;
  subCategory?: string;
  legalArea?: string;
  legalServiceType?: string;
  legalJurisdiction?: "UZ" | "KR" | "INT";
  legalFormat?: Array<"chat" | "audio" | "video" | "offline">;
  legalResponseTime?: string;
  legalDisclaimer?: string;
  legalIncluded?: string[];
  legalExcluded?: string[];
  sportType?: string;
  sportLevel?: "Boshlovchi" | "O'rta" | "Professional";
  sportAudience?: string[];
  sportServiceType?: string;
  sportFormat?: Array<"online" | "offline" | "video">;
  sportLocation?: string;
  sportGym?: string;
  sportPlan?: string[];
  sportResult?: string;
  sportDuration?: string;
  sportWeeklySessions?: number;
  sportTracking?: boolean;
  sportDiet?: boolean;
  sportCourseModules?: string[];
  sportCourseLength?: string;
  sportMaxParticipants?: number;
  translationMode?: "oral" | "written";
  translationSpeed?: string;
  translationFormat?: string;
  translationSla?: string;
  sourceLang?: string;
  targetLang?: string;
  notarization?: boolean;
};

const emptyForm: ServiceFormState = {
  type: "material",
  categoryId: "taxi",
  title: "",
  price: "",
  currency: "UZS",
  certificates: "",
  description: "",
  images: [],
  agree: false
};

const toWordsCount = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const formatCount = (value: number) => value.toLocaleString("en-US");
const normalize = (value: string) => value.toLowerCase().trim();
const hashValue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};
const getConsultingAvailability = (agent: ServiceAgent) => {
  const options: Array<"today" | "48h" | "soon"> = ["today", "48h", "soon"];
  const seed = hashValue(agent.id || agent.name);
  return options[seed % options.length];
};
const getConsultingTrustScore = (service: DisplayService) => {
  const scoreParts = [
    service.agent.verified ? 22 : 0,
    Math.min(20, Math.round(service.rating * 4)),
    Math.min(18, Math.floor((service.reviewCount || 0) / 5)),
    Math.min(15, Math.floor((service.agent.completedOrders ?? service.usedCount) / 8)),
    Math.min(10, service.certificates.length * 5),
    Math.min(15, service.agent.experienceYears * 2)
  ];
  return Math.min(100, scoreParts.reduce((acc, val) => acc + val, 0));
};
const getMonthsOnPlatform = (createdAt: string) => {
  const created = new Date(createdAt);
  const diff = Math.max(0, Date.now() - created.getTime());
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)));
};
const convertCurrency = (price: number, currency: string, target: "UZS" | "KRW") => {
  if (currency === target) return { amount: price, label: currency };
  const uzsPerKrw = 9.5;
  if (currency === "UZS" && target === "KRW") {
    return { amount: Math.max(1, Math.round(price / uzsPerKrw)), label: target };
  }
  if (currency === "KRW" && target === "UZS") {
    return { amount: Math.round(price * uzsPerKrw), label: target };
  }
  return { amount: price, label: currency };
};
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
const getTranslationSla = (service: DisplayService) => {
  if (service.translationSpeed === "shoshilinch") return "2-6 soat";
  const seed = hashValue(service.displayId);
  if (seed % 3 === 0) return "24 soat";
  return "2-3 ish kuni";
};
const getTranslationOfficialTags = (service: DisplayService) => {
  const tags: string[] = [];
  if (service.notarization) tags.push("Notarial");
  if (service.translationFormat === "Original") tags.push("Muhrli");
  const hasLicense = service.certificates.some((cert) =>
    cert.toLowerCase().includes("guvohnoma")
  );
  if (hasLicense) tags.push("Guvohnoma");
  if (tags.length === 0) tags.push("Oddiy");
  return tags;
};
const getTranslationCategoryLabel = (subCategory?: string) => {
  const map: Record<string, string> = {
    "translation-official": "Rasmiy hujjatlar",
    "translation-education": "Ta'lim hujjatlari",
    "translation-visa": "Visa / migratsiya",
    "translation-business": "Biznes",
    "translation-medical": "Tibbiy",
    "translation-technical": "Texnik",
    "translation-oral": "Og'zaki",
    "translation-personal": "Shaxsiy"
  };
  return map[subCategory || ""] || "Tarjimonlik";
};

export function ServicesHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t: translate } = useI18n();
  const replaceTimerRef = useRef<number | null>(null);
  const taxiSeatStorageKey = "uniserve_taxi_seat";
  const taxiClassStorageKey = "uniserve_taxi_class";
  const [activeGroup, setActiveGroup] = useState<ServiceCatalogGroup["id"]>("material");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("taxi");
  const [sortMode, setSortMode] = useState<"top" | "new">("top");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [agentKind, setAgentKind] = useState<"SERVICE" | "SELLER" | null>(null);
  const [agentGroup, setAgentGroup] = useState<"material" | "spiritual" | null>(null);
  const [agentCategory, setAgentCategory] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<"all" | TaxiSeatCount>("all");
  const [selectedClass, setSelectedClass] = useState<"all" | TaxiVehicleClass>("all");
  const [constructionSection, setConstructionSection] = useState("construction-exterior");
  const [constructionSubCategory, setConstructionSubCategory] = useState("all");
  const [nannyAgeMin, setNannyAgeMin] = useState("");
  const [nannyAgeMax, setNannyAgeMax] = useState("");
  const [nannyTimeStart, setNannyTimeStart] = useState("");
  const [nannyTimeEnd, setNannyTimeEnd] = useState("");
  const [nannyType, setNannyType] = useState("all");
  const [consultingTab, setConsultingTab] = useState("all");
  const [consultingAudience, setConsultingAudience] = useState("all");
  const [consultingExperience, setConsultingExperience] = useState("all");
  const [consultingLanguage, setConsultingLanguage] = useState("all");
  const [consultingRating, setConsultingRating] = useState("all");
  const [consultingPrice, setConsultingPrice] = useState("all");
  const [consultingQuery, setConsultingQuery] = useState("");
  const [consultingLocation, setConsultingLocation] = useState("all");
  const [consultingCity, setConsultingCity] = useState("");
  const [consultingFormat, setConsultingFormat] = useState("all");
  const [consultingAvailability, setConsultingAvailability] = useState("all");
  const [consultingSort, setConsultingSort] = useState("match");
  const [consultingCurrency, setConsultingCurrency] = useState<"UZS" | "KRW">("UZS");
  const [translationTab, setTranslationTab] = useState("all");
  const [translationFrom, setTranslationFrom] = useState("");
  const [translationTo, setTranslationTo] = useState("");
  const [translationNotarization, setTranslationNotarization] = useState("all");
  const [translationSpeed, setTranslationSpeed] = useState("all");
  const [translationFormat, setTranslationFormat] = useState("all");
  const [translationMode, setTranslationMode] = useState("all");
  const [translationOfficial, setTranslationOfficial] = useState("all");
  const [translationSla, setTranslationSla] = useState("all");
  const [psychologyIssue, setPsychologyIssue] = useState("all");
  const [psychologyAudience, setPsychologyAudience] = useState("all");
  const [psychologyFormat, setPsychologyFormat] = useState("all");
  const [psychologyLanguage, setPsychologyLanguage] = useState("all");
  const [psychologyExperience, setPsychologyExperience] = useState("all");
  const [sportType, setSportType] = useState("all");
  const [sportServiceType, setSportServiceType] = useState("all");
  const [sportLevel, setSportLevel] = useState("all");
  const [sportAudience, setSportAudience] = useState("all");
  const [sportFormat, setSportFormat] = useState("all");
  const [sportCity, setSportCity] = useState("");
  const [sportGym, setSportGym] = useState("");
  const [legalArea, setLegalArea] = useState("all");
  const [legalServiceType, setLegalServiceType] = useState("all");
  const [legalJurisdiction, setLegalJurisdiction] = useState("all");
  const [legalLanguage, setLegalLanguage] = useState("all");
  const [legalFormat, setLegalFormat] = useState("all");
  const [legalTrust, setLegalTrust] = useState("all");
  const { role, isAuthenticated, hydrateFromStorage, token } = useAuthStore();
  const { status: rideSocketStatus, latestRide, sendRideEvent } = useRideSocket({
    token,
    enabled: activeCategoryId === "taxi"
  });

  const getParam = (params: URLSearchParams, key: string) => params.get(key) || "";
  const toQueryId = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  const fromQueryId = (value: string, options: string[]) => {
    const normalized = toQueryId(value || "");
    return options.find((item) => toQueryId(item) === normalized) || "all";
  };

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKind = window.localStorage.getItem("uniserve_agent_kind");
    if (storedKind === "SERVICE" || storedKind === "SELLER") {
      setAgentKind(storedKind);
    } else {
      setAgentKind(null);
    }
    const storedGroup = window.localStorage.getItem("uniserve_agent_group");
    const storedCategory = window.localStorage.getItem("uniserve_agent_category");
    if (storedGroup === "material" || storedGroup === "spiritual") {
      setAgentGroup(storedGroup);
    } else {
      setAgentGroup(null);
    }
    if (storedCategory) {
      setAgentCategory(storedCategory);
    } else {
      setAgentCategory(null);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (timeZone.includes("Seoul")) {
      setConsultingCurrency("KRW");
    }
  }, []);

  const formGroup = useMemo(
    () => serviceCatalog.find((item) => item.id === form.type) ?? serviceCatalog[0],
    [form.type]
  );

  const group = useMemo(
    () => serviceCatalog.find((item) => item.id === activeGroup) ?? serviceCatalog[0],
    [activeGroup]
  );

  const categories = useMemo(() => group.categories, [group]);

  const activeCategory = useMemo(
    () => group.categories.find((cat) => cat.id === activeCategoryId) ?? group.categories[0],
    [activeCategoryId, group.categories]
  );
  const isDeliveryCategory = activeCategory?.id === "delivery";
  const isTechnicalCategory = activeCategory?.id === "technical";
  const isEmploymentCategory = activeCategory?.id === "employment";
  const isEducationCategory = activeCategory?.id === "education";
  const isConstructionCategory = activeCategory?.id === "construction";
  const isNannyCategory = activeCategory?.id === "nanny";
  const isMarketingCategory = activeCategory?.id === "marketing";
  const isConsultingCategory = activeCategory?.id === "consulting";
  const isTranslationCategory = activeCategory?.id === "translation";
  const isPsychologyCategory = activeCategory?.id === "psychology";
  const isLegalCategory = activeCategory?.id === "legal";
  const isSportCategory = activeCategory?.id === "sport";

  const nannyTypes = useMemo(
    () => [
      { id: "all", title: "Barcha enagalar" },
      { id: "nanny-child", title: "Bolalar enagasi" },
      { id: "nanny-elderly", title: "Qariyalar parvarishi" },
      { id: "nanny-hospital", title: "Shifoxona bemorlari" },
      { id: "nanny-homecare", title: "Uy sharoitidagi kasallar" },
      { id: "nanny-pet", title: "Uy hayvonlari enagasi" }
    ],
    []
  );

  const consultingTabs = useMemo(
    () => [
      { id: "all", title: "Barchasi" },
      { id: "consult-education", title: "Ta'lim" },
      { id: "consult-career", title: "Ish & Karyera" },
      { id: "consult-visa", title: "Viza" },
      { id: "consult-language", title: "Til & Moslashuv" },
      { id: "consult-business", title: "Biznes" },
      { id: "consult-legal", title: "Huquqiy" },
      { id: "consult-health", title: "Sog'liq" }
    ],
    []
  );

  const consultingAudiences = useMemo(
    () => ["Talaba", "Ishchi", "Tadbirkor", "Ota-ona", "Yangi kelganlar"],
    []
  );
  const psychologyIssues = useMemo(
    () => [
      { id: "all", title: "Barchasi" },
      { id: "psy-stress", title: "Stress va bezovtalik" },
      { id: "psy-depression", title: "Depressiya" },
      { id: "psy-family", title: "Oilaviy munosabatlar" },
      { id: "psy-children", title: "Bolalar psixologiyasi" },
      { id: "psy-adaptation", title: "Moslashuv (Koreya)" },
      { id: "psy-trauma", title: "Travma" },
      { id: "psy-confidence", title: "O'ziga ishonch" },
      { id: "psy-burnout", title: "Kasbiy burnout" }
    ],
    []
  );
  const psychologyAudiences = useMemo(
    () => ["Kattalar", "Bolalar", "O'smirlar", "Juftliklar"],
    []
  );
  const psychologyFormats = useMemo(
    () => [
      { id: "chat", label: "Chat" },
      { id: "audio", label: "Audio" },
      { id: "video", label: "Video" },
      { id: "offline", label: "Oflayn" }
    ],
    []
  );
  const sportTypes = useMemo(
    () => [
      "Fitness",
      "Bodybuilding",
      "Yoga",
      "Crossfit",
      "Futbol",
      "Kurash",
      "Taekwondo",
      "Tennis",
      "Suzish",
      "Ayollar uchun fitness"
    ],
    []
  );
  const sportServiceTypes = useMemo(
    () => [
      "Individual mashg‘ulot",
      "Guruh mashg‘uloti",
      "Online coaching",
      "Offline coaching",
      "Video kurs",
      "Jonli kurs"
    ],
    []
  );
  const sportLevels = useMemo(() => ["Boshlovchi", "O'rta", "Professional"], []);
  const sportAudiences = useMemo(
    () => ["Erkaklar", "Ayollar", "Bolalar", "O'smirlar", "Kattalar"],
    []
  );
  const sportFormats = useMemo(
    () => [
      { id: "online", label: "🏠 Online" },
      { id: "offline", label: "🏋️ Offline" },
      { id: "video", label: "🎥 Video dars" }
    ],
    []
  );
  const legalAreas = useMemo(
    () => [
      "Migratsiya va visa",
      "Mehnat huquqi",
      "Fuqarolik huquqi",
      "Oilaviy huquq",
      "Biznes va shartnomalar",
      "Sud hujjatlari",
      "Soliq",
      "Jinoiy ishlar (faqat konsultatsiya)"
    ],
    []
  );
  const legalServiceTypes = useMemo(
    () => [
      "Og'zaki maslahat",
      "Yozma huquqiy xulosa",
      "Hujjat tayyorlash",
      "Hujjat tekshirish",
      "Vakillik"
    ],
    []
  );
  const legalJurisdictions = useMemo(
    () => [
      { id: "UZ", label: "🇺🇿 O‘zbekiston" },
      { id: "KR", label: "🇰🇷 Koreya" },
      { id: "INT", label: "Xalqaro" }
    ],
    []
  );
  const legalLanguages = useMemo(() => ["O'zbek", "Koreys", "Rus", "Ingliz"], []);
  const legalFormats = useMemo(
    () => [
      { id: "chat", label: "💬 Chat" },
      { id: "audio", label: "📞 Audio" },
      { id: "video", label: "🎥 Video" },
      { id: "offline", label: "🏢 Oflayn" }
    ],
    []
  );
  const consultingKeywords = useMemo(
    () => ["visa", "CV", "Koreyada ish", "biznes", "moslashuv", "tarjima"],
    []
  );
  const consultingFormats = useMemo(
    () => [
      { id: "chat", label: "Chat" },
      { id: "call", label: "Qo'ng'iroq" },
      { id: "video", label: "Video" },
      { id: "offline", label: "Oflayn" }
    ],
    []
  );

  const translationTabs = useMemo(
    () => [
      { id: "all", title: "Barchasi" },
      { id: "translation-official", title: "Rasmiy hujjatlar" },
      { id: "translation-education", title: "Ta'lim" },
      { id: "translation-medical", title: "Tibbiy" },
      { id: "translation-business", title: "Biznes" },
      { id: "translation-visa", title: "Visa / Migratsiya" },
      { id: "translation-oral", title: "Og'zaki" },
      { id: "translation-personal", title: "Shaxsiy" }
    ],
    []
  );

  const translationLanguages = useMemo(
    () => ["UZ", "KR", "RU", "EN", "JP", "CN", "TR", "DE", "FR"],
    []
  );

  useEffect(() => {
    if (activeCategoryId !== "consulting") return;
    setConsultingTab("all");
    setConsultingAudience("all");
    setConsultingExperience("all");
    setConsultingLanguage("all");
    setConsultingRating("all");
    setConsultingPrice("all");
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeCategoryId !== "translation") return;
    setTranslationTab("all");
    setTranslationFrom("");
    setTranslationTo("");
    setTranslationNotarization("all");
    setTranslationSpeed("all");
    setTranslationFormat("all");
    setTranslationMode("all");
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeCategoryId !== "legal") return;
    setLegalArea("all");
    setLegalServiceType("all");
    setLegalJurisdiction("all");
    setLegalLanguage("all");
    setLegalFormat("all");
    setLegalTrust("all");
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeCategoryId !== "sport") return;
    setSportType("all");
    setSportServiceType("all");
    setSportLevel("all");
    setSportAudience("all");
    setSportFormat("all");
    setSportCity("");
    setSportGym("");
  }, [activeCategoryId]);

  useEffect(() => {
    if (!searchParams) return;
    if (activeCategoryId !== "legal") return;
    const rawArea = getParam(searchParams, "legalArea");
    if (!rawArea) return;
    const next = fromQueryId(rawArea, legalAreas);
    if (next !== "all") {
      setLegalArea(next);
    }
  }, [activeCategoryId, legalAreas, searchParams]);

  const constructionSections = useMemo(
    () => [
      {
        id: "construction-exterior",
        title: "Tashqi qurilish ishlari",
        subCategories: [
          { id: "exterior-facade", title: "Fasad ishlari" },
          { id: "exterior-concrete", title: "Beton ishlari" },
          { id: "exterior-brick", title: "G'isht terish" },
          { id: "exterior-roofing", title: "Tom yopish" },
          { id: "exterior-roof-repair", title: "Tom ta'mirlash" }
        ]
      },
      {
        id: "construction-interior",
        title: "Ichki qurilish ishlari",
        subCategories: [
          { id: "interior-paint", title: "Bo'yoqchilik" },
          { id: "interior-wallpaper", title: "Gul qog'oz" },
          { id: "interior-design", title: "Dizayner xizmati" },
          { id: "interior-doors-windows", title: "Eshik/deraza romlari" },
          { id: "interior-ceiling", title: "Shift ta'mirlash" }
        ]
      }
    ],
    []
  );

  const wordCount = useMemo(() => toWordsCount(form.description), [form.description]);


  const getCategoryLabel = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      taxi: translate("services.category.taxi"),
      delivery: translate("services.category.delivery"),
      technical: translate("services.category.technical"),
      construction: translate("services.category.construction"),
      moving: translate("services.category.moving"),
      cleaning: translate("services.category.cleaning"),
      nanny: translate("services.category.nanny"),
      marketing: translate("services.category.marketing"),
      employment: translate("services.category.employment"),
      education: translate("services.category.education"),
      consulting: translate("services.category.consulting"),
      translation: translate("services.category.translation"),
      psychology: translate("services.category.psychology"),
      legal: translate("services.category.legal"),
      sport: translate("services.category.sport")
    };
    return map[id] || fallback;
  };

  const getCategoryDescription = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      taxi: translate("services.category.taxi.desc"),
      delivery: translate("services.category.delivery.desc"),
      technical: translate("services.category.technical.desc"),
      construction: translate("services.category.construction.desc"),
      moving: translate("services.category.moving.desc"),
      cleaning: translate("services.category.cleaning.desc"),
      nanny: translate("services.category.nanny.desc"),
      marketing: translate("services.category.marketing.desc"),
      employment: translate("services.category.employment.desc"),
      education: translate("services.category.education.desc"),
      consulting: translate("services.category.consulting.desc"),
      translation: translate("services.category.translation.desc"),
      psychology: translate("services.category.psychology.desc"),
      legal: translate("services.category.legal.desc"),
      sport: translate("services.category.sport.desc")
    };
    return map[id] || fallback;
  };

  const handleFormChange = <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  useEffect(() => {
    if (!formGroup.categories.find((cat) => cat.id === form.categoryId)) {
      setForm((prev) => ({ ...prev, categoryId: formGroup.categories[0]?.id || "" }));
    }
  }, [form.categoryId, formGroup.categories]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const errors: string[] = [];
    if (!form.title.trim()) errors.push(translate("services.add.errors.name"));
    if (!form.categoryId) errors.push(translate("services.add.errors.category"));
    if (!form.price || Number(form.price) <= 0) errors.push(translate("services.add.errors.price"));
    if (wordCount === 0 || wordCount > 500) errors.push(translate("services.add.errors.description"));
    if (!form.certificates.trim()) errors.push(translate("services.add.errors.cert"));
    if (form.images.length < 3 || form.images.length > 20) {
      errors.push(translate("services.add.errors.images"));
    }
    if (!form.agree) errors.push(translate("services.add.errors.agree"));

    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }

    setFormSuccess(translate("services.add.success"));
    setForm({
      ...emptyForm,
      type: form.type,
      categoryId: formGroup.categories[0]?.id || ""
    });
  };

  useEffect(() => {
    const groupParam = getParam(searchParams, "group");
    const categoryParam = getParam(searchParams, "category");
    if (!groupParam && !categoryParam) return;

    const nextGroup: ServiceCatalogGroup["id"] =
      groupParam === "material" || groupParam === "spiritual" ? groupParam : activeGroup;
    const groupData = serviceCatalog.find((item) => item.id === nextGroup) ?? serviceCatalog[0];

    if (nextGroup !== activeGroup) {
      setActiveGroup(nextGroup);
    }

    if (categoryParam && groupData.categories.some((cat) => cat.id === categoryParam)) {
      if (activeCategoryId !== categoryParam) {
        setActiveCategoryId(categoryParam);
      }
    } else if (!groupData.categories.some((cat) => cat.id === activeCategoryId)) {
      setActiveCategoryId(groupData.categories[0]?.id || "");
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGroup, activeCategoryId, constructionSection, constructionSubCategory, sortMode, selectedClass, selectedSeat]);

  useEffect(() => {
    if (!isNannyCategory) {
      setNannyAgeMin("");
      setNannyAgeMax("");
      setNannyTimeStart("");
      setNannyTimeEnd("");
      setNannyType("all");
    }
  }, [isNannyCategory]);

  useEffect(() => {
    if (activeCategoryId !== "construction") return;
    setConstructionSubCategory("all");
  }, [constructionSection, activeCategoryId]);

  useEffect(() => {
    if (activeCategoryId !== "construction") {
      setConstructionSection("construction-exterior");
      setConstructionSubCategory("all");
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (!agentGroup || !agentCategory) return;
    setForm((prev) => ({
      ...prev,
      type: agentGroup,
      categoryId: agentCategory
    }));
  }, [agentCategory, agentGroup]);

  useEffect(() => {
    if (activeCategoryId !== "taxi") {
      if (selectedSeat !== "all") setSelectedSeat("all");
      if (selectedClass !== "all") setSelectedClass("all");
      return;
    }

    const seatParam = getParam(searchParams, "seat");
    const classParam = getParam(searchParams, "class");
    let nextSeat: "all" | TaxiSeatCount = "all";
    let nextClass: "all" | TaxiVehicleClass = "all";

    if (seatParam || classParam) {
      nextSeat = taxiSeatOptions.includes(Number(seatParam) as TaxiSeatCount)
        ? (Number(seatParam) as TaxiSeatCount)
        : "all";
      nextClass = taxiClassOptions.some((option) => option.value === classParam)
        ? (classParam as TaxiVehicleClass)
        : "all";
    } else if (typeof window !== "undefined") {
      const storedSeat = window.localStorage.getItem(taxiSeatStorageKey) || "";
      const storedClass = window.localStorage.getItem(taxiClassStorageKey) || "";
      nextSeat = taxiSeatOptions.includes(Number(storedSeat) as TaxiSeatCount)
        ? (Number(storedSeat) as TaxiSeatCount)
        : "all";
      nextClass = taxiClassOptions.some((option) => option.value === storedClass)
        ? (storedClass as TaxiVehicleClass)
        : "all";
    }

    if (nextSeat !== selectedSeat) setSelectedSeat(nextSeat);
    if (nextClass !== selectedClass) setSelectedClass(nextClass);
  }, [activeCategoryId, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const nextSeat = activeCategoryId === "taxi" && selectedSeat !== "all" ? String(selectedSeat) : "";
    const nextClass = activeCategoryId === "taxi" && selectedClass !== "all" ? selectedClass : "";

    if (params.get("group") !== activeGroup) {
      params.set("group", activeGroup);
    }
    if (activeCategoryId) {
      if (params.get("category") !== activeCategoryId) {
        params.set("category", activeCategoryId);
      }
    } else {
      params.delete("category");
    }

    if (nextSeat) {
      if (params.get("seat") !== nextSeat) params.set("seat", nextSeat);
    } else {
      params.delete("seat");
    }

    if (nextClass) {
      if (params.get("class") !== nextClass) params.set("class", nextClass);
    } else {
      params.delete("class");
    }

    if (activeCategoryId === "legal") {
      if (legalArea !== "all") {
        params.set("legalArea", toQueryId(legalArea));
      } else {
        params.delete("legalArea");
      }
    } else {
      params.delete("legalArea");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) return;
    if (replaceTimerRef.current) {
      window.clearTimeout(replaceTimerRef.current);
    }
    replaceTimerRef.current = window.setTimeout(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, 120);
    return () => {
      if (replaceTimerRef.current) {
        window.clearTimeout(replaceTimerRef.current);
      }
    };
  }, [activeCategoryId, legalArea, pathname, router, searchParams, selectedClass, selectedSeat]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeCategoryId !== "taxi") return;
    if (selectedSeat === "all") {
      window.localStorage.removeItem(taxiSeatStorageKey);
    } else {
      window.localStorage.setItem(taxiSeatStorageKey, String(selectedSeat));
    }
    if (selectedClass === "all") {
      window.localStorage.removeItem(taxiClassStorageKey);
    } else {
      window.localStorage.setItem(taxiClassStorageKey, selectedClass);
    }
  }, [activeCategoryId, selectedClass, selectedSeat, taxiClassStorageKey, taxiSeatStorageKey]);

  const taxiAgents = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory.id !== "taxi") return activeCategory.agents;

    return activeCategory.agents.filter((agent) => {
      if (selectedSeat !== "all" && agent.seatCount !== selectedSeat) return false;
      if (selectedClass !== "all" && agent.vehicleClass !== selectedClass) return false;
      return true;
    });
  }, [activeCategory, selectedClass, selectedSeat]);

  const displayServices = useMemo<DisplayService[]>(() => {
    if (!activeCategory) return [];
    const baseServices: DisplayService[] = taxiAgents.flatMap((agent) =>
      agent.services.map((service) => ({
        displayId: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        currency: service.currency,
        unit: service.unit,
        certificates: service.certificates,
        images: service.images,
        rating: service.rating,
        reviewCount: service.reviewCount,
        usedCount: service.usedCount,
        niceCount: service.niceCount,
        shareCount: service.shareCount,
        canRate: service.canRate,
        createdAt: service.createdAt,
        agent,
        subCategory: service.subCategory,
        legalArea: service.legalArea,
        legalServiceType: service.legalServiceType,
        legalJurisdiction: service.legalJurisdiction,
        legalFormat: service.legalFormat,
        legalResponseTime: service.legalResponseTime,
        legalDisclaimer: service.legalDisclaimer,
        legalIncluded: service.legalIncluded,
        legalExcluded: service.legalExcluded,
        sportType: service.sportType,
        sportLevel: service.sportLevel,
        sportAudience: service.sportAudience,
        sportServiceType: service.sportServiceType,
        sportFormat: service.sportFormat,
        sportLocation: service.sportLocation,
        sportGym: service.sportGym,
        sportPlan: service.sportPlan,
        sportResult: service.sportResult,
        sportDuration: service.sportDuration,
        sportWeeklySessions: service.sportWeeklySessions,
        sportTracking: service.sportTracking,
        sportDiet: service.sportDiet,
        sportCourseModules: service.sportCourseModules,
        sportCourseLength: service.sportCourseLength,
        sportMaxParticipants: service.sportMaxParticipants
      }))
    );

    if (isConstructionCategory) {
      const section =
        constructionSections.find((item) => item.id === constructionSection) || constructionSections[0];
      const allowed = new Set(section.subCategories.map((item) => item.id));
      const filtered = baseServices.filter((service) => {
        const sub = service.subCategory;
        if (!sub || !allowed.has(sub)) return false;
        if (constructionSubCategory !== "all" && sub !== constructionSubCategory) return false;
        return true;
      });

      const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

      return sorted;
    }

    if (isNannyCategory) {
      const minAge = Number(nannyAgeMin || 0);
      const maxAge = Number(nannyAgeMax || 0);
      const timeStart = nannyTimeStart;
      const timeEnd = nannyTimeEnd;

      const toMinutes = (value: string) => {
        const [h, m] = value.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
      };

      const overlaps = (reqStart: number, reqEnd: number, slotStart: number, slotEnd: number) => {
        const reqCross = reqEnd < reqStart;
        const slotCross = slotEnd < slotStart;
        const normalize = (start: number, end: number) =>
          start <= end ? [[start, end]] : [[start, 1440], [0, end]];
        const reqRanges = reqCross ? normalize(reqStart, reqEnd) : [[reqStart, reqEnd]];
        const slotRanges = slotCross ? normalize(slotStart, slotEnd) : [[slotStart, slotEnd]];
        return reqRanges.some((req) =>
          slotRanges.some((slot) => req[0] <= slot[1] && slot[0] <= req[1])
        );
      };

      const filtered = baseServices.filter((service) => {
        const age = service.agent.age ?? 0;
        if (minAge && age < minAge) return false;
        if (maxAge && age > maxAge) return false;

        if (!timeStart || !timeEnd) return true;
        const reqStart = toMinutes(timeStart);
        const reqEnd = toMinutes(timeEnd);
        if (reqStart === null || reqEnd === null) return true;
        const availability = service.agent.availability || [];
        if (availability.includes("24/7")) return true;
        return availability.some((slot) => {
          if (!slot.includes("-")) return false;
          const [startStr, endStr] = slot.split("-");
          const slotStart = toMinutes(startStr.trim());
          const slotEnd = toMinutes(endStr.trim());
          if (slotStart === null || slotEnd === null) return false;
          return overlaps(reqStart, reqEnd, slotStart, slotEnd);
        });
      });

      const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

      if (nannyType === "all") {
        const grouped: Record<string, DisplayService[]> = {};
        for (const service of sorted) {
          const typeId = service.subCategory || "nanny-child";
          if (!grouped[typeId]) grouped[typeId] = [];
          if (grouped[typeId].length < 2) {
            grouped[typeId].push(service);
          }
        }
        return nannyTypes.flatMap((type) => grouped[type.id] ?? []);
      }

      return sorted.filter((service) => (service.subCategory || "nanny-child") === nannyType);
    }

    if (isConsultingCategory) {
      let filtered = baseServices;
      const query = normalize(consultingQuery);
      if (query) {
        filtered = filtered.filter((service) => {
          const hay = [
            service.title,
            service.description,
            service.agent.name,
            service.agent.specialty,
            service.agent.bio || "",
            (service.agent.audiences || []).join(" "),
            (service.agent.languages || []).join(" "),
            (service.certificates || []).join(" ")
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(query);
        });
      }
      if (consultingTab !== "all") {
        filtered = filtered.filter((service) => service.subCategory === consultingTab);
      }
      if (consultingAudience !== "all") {
        filtered = filtered.filter((service) =>
          service.agent.audiences?.includes(consultingAudience)
        );
      }
      if (consultingExperience !== "all") {
        filtered = filtered.filter((service) => {
          const years = service.agent.experienceYears;
          if (consultingExperience === "1-3") return years >= 1 && years <= 3;
          if (consultingExperience === "4-6") return years >= 4 && years <= 6;
          if (consultingExperience === "7+") return years >= 7;
          return true;
        });
      }
      if (consultingLanguage !== "all") {
        filtered = filtered.filter((service) =>
          service.agent.languages?.includes(consultingLanguage)
        );
      }
      if (consultingLocation !== "all") {
        filtered = filtered.filter((service) => {
          const region = normalize(service.agent.region || "");
          const location = normalize(service.agent.location || "");
          const isKorea = region.includes("koreya") || location.includes("korea");
          if (consultingLocation === "korea") return isKorea;
          if (consultingLocation === "uzbekistan") return !isKorea;
          return true;
        });
      }
      if (consultingCity.trim()) {
        const city = normalize(consultingCity);
        filtered = filtered.filter((service) => {
          const cityHay = `${service.agent.location || ""} ${service.agent.region || ""} ${
            service.agent.regionDetail || ""
          }`.toLowerCase();
          return cityHay.includes(city);
        });
      }
      if (consultingFormat !== "all") {
        filtered = filtered.filter((service) => {
          const formats = service.agent.consultationFormats || [];
          const normalized = formats.map((item) => normalize(item));
          if (consultingFormat === "offline") {
            return normalized.some((item) => item.includes("offline"));
          }
          if (["chat", "call", "video"].includes(consultingFormat)) {
            return normalized.some((item) => item.includes("online"));
          }
          return normalized.some((item) => item.includes(consultingFormat));
        });
      }
      if (consultingAvailability !== "all") {
        filtered = filtered.filter(
          (service) => getConsultingAvailability(service.agent) === consultingAvailability
        );
      }
      if (consultingRating !== "all") {
        filtered = filtered.filter((service) => {
          if (consultingRating === "4.7") return service.rating >= 4.7;
          if (consultingRating === "4.5") return service.rating >= 4.5;
          if (consultingRating === "4.3") return service.rating >= 4.3;
          return true;
        });
      }
      if (consultingPrice !== "all") {
        filtered = filtered.filter((service) => {
          if (consultingPrice === "0-700") return service.price <= 700000;
          if (consultingPrice === "700-1500") return service.price > 700000 && service.price <= 1500000;
          if (consultingPrice === "1500+") return service.price > 1500000;
          return true;
        });
      }

      const scoreMatch = (service: DisplayService) => {
        const queryScore = query
          ? [service.title, service.description, service.agent.specialty]
              .join(" ")
              .toLowerCase()
              .split(query)
              .length - 1
          : 0;
        return (
          queryScore * 6 +
          service.rating * 3 +
          Math.min(10, (service.agent.completedOrders ?? service.usedCount) / 10) +
          service.agent.experienceYears * 1.5
        );
      };
      const sorted = [...filtered].sort((a, b) => {
        if (consultingSort === "match") return scoreMatch(b) - scoreMatch(a);
        if (consultingSort === "rating") return b.rating - a.rating;
        if (consultingSort === "fast") {
          return hashValue(a.agent.id) % 10 - (hashValue(b.agent.id) % 10);
        }
        if (consultingSort === "cheap") return a.price - b.price;
        if (consultingSort === "popular") {
          return (b.agent.completedOrders ?? b.usedCount) - (a.agent.completedOrders ?? a.usedCount);
        }
        if (sortMode === "new" || consultingSort === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

      return sorted;
    }

    if (isTranslationCategory) {
      let filtered = baseServices;
      if (translationTab !== "all") {
        filtered = filtered.filter((service) => service.subCategory === translationTab);
      }
      if (translationOfficial !== "all") {
        filtered = filtered.filter((service) =>
          getTranslationOfficialTags(service).some(
            (tag) => tag.toLowerCase() === translationOfficial.toLowerCase()
          )
        );
      }
      if (translationMode !== "all") {
        filtered = filtered.filter((service) => service.translationMode === translationMode);
      }
      if (translationSpeed !== "all") {
        filtered = filtered.filter((service) => service.translationSpeed === translationSpeed);
      }
      if (translationSla !== "all") {
        filtered = filtered.filter((service) => getTranslationSla(service) === translationSla);
      }
      if (translationFormat !== "all") {
        filtered = filtered.filter((service) => service.translationFormat === translationFormat);
      }
      if (translationNotarization !== "all") {
        filtered = filtered.filter((service) =>
          translationNotarization === "yes" ? service.notarization : !service.notarization
        );
      }
      if (translationFrom) {
        filtered = filtered.filter((service) => service.sourceLang === translationFrom);
      }
      if (translationTo) {
        filtered = filtered.filter((service) => service.targetLang === translationTo);
      }

      const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

      return sorted;
    }

    if (isPsychologyCategory) {
      let filtered = baseServices;
      if (psychologyIssue !== "all") {
        filtered = filtered.filter((service) => service.subCategory === psychologyIssue);
      }
      if (psychologyAudience !== "all") {
        filtered = filtered.filter((service) =>
          service.agent.audiences?.includes(psychologyAudience)
        );
      }
      if (psychologyFormat !== "all") {
        filtered = filtered.filter((service) => {
          const formats = service.agent.consultationFormats || [];
          const normalized = formats.map((item) => item.toLowerCase());
          if (psychologyFormat === "offline") {
            return normalized.some((item) => item.includes("offline") || item.includes("oflayn"));
          }
          return normalized.some((item) => item.includes(psychologyFormat));
        });
      }
      if (psychologyLanguage !== "all") {
        filtered = filtered.filter((service) =>
          service.agent.languages?.includes(psychologyLanguage)
        );
      }
      if (psychologyExperience !== "all") {
        filtered = filtered.filter((service) => {
          const years = service.agent.experienceYears;
          if (psychologyExperience === "3+") return years >= 3;
          if (psychologyExperience === "5+") return years >= 5;
          if (psychologyExperience === "certified") {
            return service.certificates.some((cert) => cert.toLowerCase().includes("sertifikat"));
          }
          return true;
        });
      }

      const sorted = [...filtered].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
      return sorted;
    }

    if (isLegalCategory) {
      let filtered = baseServices;
      if (legalArea !== "all") {
        filtered = filtered.filter((service) => service.legalArea === legalArea);
      }
      if (legalServiceType !== "all") {
        filtered = filtered.filter((service) => service.legalServiceType === legalServiceType);
      }
      if (legalJurisdiction !== "all") {
        filtered = filtered.filter((service) => service.legalJurisdiction === legalJurisdiction);
      }
      if (legalLanguage !== "all") {
        filtered = filtered.filter((service) =>
          service.agent.languages?.includes(legalLanguage)
        );
      }
      if (legalFormat !== "all") {
        filtered = filtered.filter((service) => service.legalFormat?.includes(legalFormat as any));
      }
      if (legalTrust !== "all") {
        filtered = filtered.filter((service) => {
          if (legalTrust === "license") return !!service.agent.legalLicenseMasked;
          if (legalTrust === "5y") return service.agent.experienceYears >= 5;
          if (legalTrust === "rating") return service.rating >= 4.6;
          return true;
        });
      }

      const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
      return sorted;
    }

    if (isSportCategory) {
      let filtered = baseServices;
      if (sportType !== "all") {
        filtered = filtered.filter((service) => service.sportType === sportType);
      }
      if (sportServiceType !== "all") {
        filtered = filtered.filter((service) => service.sportServiceType === sportServiceType);
      }
      if (sportLevel !== "all") {
        filtered = filtered.filter((service) => service.sportLevel === sportLevel);
      }
      if (sportAudience !== "all") {
        filtered = filtered.filter((service) =>
          (service.sportAudience || service.agent.audiences || []).includes(sportAudience)
        );
      }
      if (sportFormat !== "all") {
        filtered = filtered.filter((service) => service.sportFormat?.includes(sportFormat as any));
      }
      if (sportCity.trim()) {
        const city = normalize(sportCity);
        filtered = filtered.filter((service) =>
          `${service.sportLocation || ""} ${service.agent.location || ""}`.toLowerCase().includes(city)
        );
      }
      if (sportGym.trim()) {
        const gym = normalize(sportGym);
        filtered = filtered.filter((service) =>
          (service.sportGym || "").toLowerCase().includes(gym)
        );
      }

      const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "new") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
      return sorted;
    }

    if (baseServices.length === 0) return [];

    const targetCount = Math.max(12, baseServices.length);
    const pool = getCategoryImagePool(activeCategory.id);
    const expanded: DisplayService[] = [];

    for (let i = 0; i < targetCount; i += 1) {
      const base = baseServices[i % baseServices.length];
      const variantIndex = i - baseServices.length + 1;
      const isVariant = i >= baseServices.length;
      const baseDate = new Date(base.createdAt);
      const createdAt = new Date(baseDate.getTime() + i * 86400000).toISOString();
      const baseHash = Math.abs(hashValue(base.displayId || base.title));
      const imageStart = baseHash % pool.length;
      expanded.push({
        ...base,
        displayId: `${base.displayId}-v${i + 1}`,
        title: isVariant
          ? `${base.title} · ${translate("services.service.variant")} ${variantIndex}`
          : base.title,
        images: [
          pool[imageStart],
          pool[(imageStart + 1) % pool.length],
          pool[(imageStart + 2) % pool.length]
        ],
        niceCount: isMarketingCategory ? base.niceCount + i * 3 : base.niceCount,
        createdAt
      });
    }

    const sorted = [...expanded].sort((a, b) => {
      if (sortMode === "new") {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (diff !== 0) return diff;
        if (isMarketingCategory) return b.niceCount - a.niceCount;
        return 0;
      }
      if (isMarketingCategory) {
        if (b.niceCount !== a.niceCount) return b.niceCount - a.niceCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });

    return sorted;
  }, [
    activeCategory,
    constructionSection,
    constructionSections,
    constructionSubCategory,
    isConstructionCategory,
    isConsultingCategory,
    isLegalCategory,
    isSportCategory,
    isPsychologyCategory,
    isTranslationCategory,
    isMarketingCategory,
    isNannyCategory,
    consultingAudience,
    consultingAvailability,
    consultingCity,
    consultingExperience,
    consultingFormat,
    consultingLanguage,
    consultingLocation,
    consultingPrice,
    consultingQuery,
    consultingRating,
    consultingSort,
    consultingTab,
    psychologyAudience,
    psychologyExperience,
    psychologyFormat,
    psychologyIssue,
    psychologyLanguage,
    legalArea,
    legalFormat,
    legalJurisdiction,
    legalLanguage,
    legalServiceType,
    legalTrust,
    sportAudience,
    sportCity,
    sportFormat,
    sportGym,
    sportLevel,
    sportServiceType,
    sportType,
    translationFormat,
    translationFrom,
    translationMode,
    translationNotarization,
    translationOfficial,
    translationSla,
    translationSpeed,
    translationTab,
    translationTo,
    nannyAgeMin,
    nannyAgeMax,
    nannyTimeStart,
    nannyTimeEnd,
    nannyType,
    nannyTypes,
    sortMode,
    translate,
    taxiAgents
  ]);

  const translationSorted = useMemo(() => {
    if (!isTranslationCategory) return [];
    return [...displayServices].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [displayServices, isTranslationCategory]);

  const translationFeatured = isTranslationCategory ? translationSorted.slice(0, 10) : [];
  const translationRest = isTranslationCategory ? translationSorted.slice(10) : [];

  const pageSize = isNannyCategory
    ? Math.max(1, nannyType === "all" ? displayServices.length : 2)
    : 8;
  const totalPages = Math.min(
    100,
    Math.max(1, Math.ceil((isTranslationCategory ? translationRest.length : displayServices.length) / pageSize))
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedServices = (isTranslationCategory ? translationRest : displayServices).slice(
    startIndex,
    startIndex + pageSize
  );

  const pageButtons = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safePage - half);
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }
    return Array.from({ length: maxButtons }, (_, idx) => start + idx);
  }, [safePage, totalPages]);

  const canShowAddService = isAuthenticated && role === "AGENT" && agentKind === "SERVICE";
  const isSellerAgent = isAuthenticated && role === "AGENT" && agentKind === "SELLER";
  const isServiceAgentLocked = Boolean(canShowAddService && agentGroup && agentCategory);

  const renderRating = (rating: number) => `${translate("services.agent.rating")}: ${rating.toFixed(1)}/5`;

  const renderAgentStats = (agent: ServiceAgent) => [
    `${translate("services.agent.clients")}: ${formatCount(agent.totalClients)}`,
    `${translate("services.agent.followers")}: ${formatCount(agent.followers)}`,
    `${translate("services.agent.nice")}: ${formatCount(agent.niceCount)}`,
    `${translate("services.agent.shares")}: ${formatCount(agent.shareCount)}`,
    `${translate("services.agent.reviews")}: ${formatCount(agent.reviewCount)}`
  ];

  const getNannyTypeLabel = (value?: string) =>
    nannyTypes.find((type) => type.id === (value || "nanny-child"))?.title || "Bolalar enagasi";

  const handleServiceCardClick = (event: React.MouseEvent<HTMLDivElement>, serviceId: string) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    router.push(`/services/${serviceId}`);
  };

  const handleServiceCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, serviceId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(`/services/${serviceId}`);
    }
  };

  const formatTaxiClassLabel = (value: TaxiVehicleClass) =>
    taxiClassOptions.find((option) => option.value === value)?.label ?? value;

  const constructionFallbacks = useMemo(
    () =>
      Array.from(
        { length: 36 },
        (_, idx) => `/services/construction/${String(idx + 1).padStart(2, "0")}.jpg`
      ),
    []
  );

  const nannyFallbacks = useMemo(() => getCategoryImagePool("nanny"), []);

  const getConstructionFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 31 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % constructionFallbacks.length;
    return constructionFallbacks[(start + idx) % constructionFallbacks.length];
  };

  const getNannyFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 41 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % nannyFallbacks.length;
    return nannyFallbacks[(start + idx) % nannyFallbacks.length]?.src;
  };

  const formatRideStatus = (status: string) => {
    const map: Record<string, string> = {
      requested: translate({
        en: "Request sent",
        uz: "So'rov yuborildi",
        ru: "Запрос отправлен",
        ko: "요청 전송됨"
      }),
      assigned: translate({
        en: "Driver assigned",
        uz: "Haydovchi biriktirildi",
        ru: "Водитель назначен",
        ko: "기사 배정됨"
      }),
      taken: translate({
        en: "Driver accepted",
        uz: "Haydovchi qabul qildi",
        ru: "Водитель принял",
        ko: "기사 수락"
      }),
      confirmed: translate({
        en: "Client confirmed",
        uz: "Mijoz tasdiqladi",
        ru: "Клиент подтвердил",
        ko: "고객 확인"
      }),
      completed: translate({
        en: "Trip completed",
        uz: "Safar yakunlandi",
        ru: "Поездка завершена",
        ko: "여행 완료"
      })
    };
    return map[status] || status;
  };

  const formatSocketStatus = (status: string) => {
    const map: Record<string, string> = {
      idle: translate({ en: "Idle", uz: "To'xtatilgan", ru: "Остановлено", ko: "대기" }),
      connecting: translate({ en: "Connecting", uz: "Ulanmoqda", ru: "Подключение", ko: "연결 중" }),
      open: translate({ en: "Online", uz: "Onlayn", ru: "Онлайн", ko: "온라인" }),
      closed: translate({ en: "Disconnected", uz: "Ulanish uzildi", ru: "Соединение разорвано", ko: "연결 끊김" }),
      error: translate({ en: "Error", uz: "Xatolik", ru: "Ошибка", ko: "오류" })
    };
    return map[status] || status;
  };

  const getTranslationCategoryLabelLocalized = (subCategory?: string) => {
    switch (subCategory) {
      case "translation-official":
        return translate({
          en: "Official documents",
          uz: "Rasmiy hujjatlar",
          ru: "Официальные документы",
          ko: "공식 문서"
        });
      case "translation-education":
        return translate({
          en: "Education documents",
          uz: "Ta'lim hujjatlari",
          ru: "Образовательные документы",
          ko: "교육 문서"
        });
      case "translation-visa":
        return translate({
          en: "Visa / migration",
          uz: "Visa / migratsiya",
          ru: "Виза / миграция",
          ko: "비자 / 이민"
        });
      case "translation-business":
        return translate({
          en: "Business",
          uz: "Biznes",
          ru: "Бизнес",
          ko: "비즈니스"
        });
      case "translation-medical":
        return translate({
          en: "Medical",
          uz: "Tibbiy",
          ru: "Медицинские",
          ko: "의료"
        });
      case "translation-technical":
        return translate({
          en: "Technical",
          uz: "Texnik",
          ru: "Технические",
          ko: "기술"
        });
      case "translation-oral":
        return translate({
          en: "Oral",
          uz: "Og'zaki",
          ru: "Устный",
          ko: "구두"
        });
      case "translation-personal":
        return translate({
          en: "Personal",
          uz: "Shaxsiy",
          ru: "Личные",
          ko: "개인"
        });
      default:
        return translate({
          en: "Translation",
          uz: "Tarjimonlik",
          ru: "Перевод",
          ko: "번역"
        });
    }
  };

  const getTranslationSlaLabel = (service: DisplayService) => {
    const raw = getTranslationSla(service);
    if (raw === "2-6 soat") {
      return translate({ en: "2–6 hours", uz: "2-6 soat", ru: "2–6 часов", ko: "2–6시간" });
    }
    if (raw === "24 soat") {
      return translate({ en: "24 hours", uz: "24 soat", ru: "24 часа", ko: "24시간" });
    }
    if (raw === "2-3 ish kuni") {
      return translate({ en: "2–3 business days", uz: "2-3 ish kuni", ru: "2–3 рабочих дня", ko: "2–3영업일" });
    }
    return raw;
  };

  const translateOfficialTag = (tag: string) => {
    if (tag === "Notarial") {
      return translate({ en: "Notarized", uz: "Notarial", ru: "Нотариально", ko: "공증" });
    }
    if (tag === "Muhrli") {
      return translate({ en: "Stamped", uz: "Muhrli", ru: "С печатью", ko: "도장" });
    }
    if (tag === "Guvohnoma") {
      return translate({ en: "Certificate", uz: "Guvohnoma", ru: "Свидетельство", ko: "증명서" });
    }
    if (tag === "Oddiy") {
      return translate({ en: "Standard", uz: "Oddiy", ru: "Стандарт", ko: "일반" });
    }
    return tag;
  };

  const renderServiceCard = (service: DisplayService, keyPrefix = "") => {
    const translationLabel = getTranslationCategoryLabelLocalized(service.subCategory);
    const translationPair = `${service.sourceLang || "—"} → ${service.targetLang || "—"}`;
    const translationSlaLabel = getTranslationSlaLabel(service);
    const translationOfficialTags = getTranslationOfficialTags(service).map(translateOfficialTag);
    const translationTopTags = translationOfficialTags.slice(0, 2);
    const translationExtraTags = Math.max(0, translationOfficialTags.length - translationTopTags.length);
    const legalJurisdictionLabel =
      service.legalJurisdiction === "KR"
        ? "KR"
        : service.legalJurisdiction === "INT"
          ? translate({ en: "International", uz: "Xalqaro", ru: "Международная", ko: "국제" })
          : "UZ";
    const legalTitle = isLegalCategory
      ? `${service.legalArea || translate({ en: "Legal", uz: "Huquqiy", ru: "Юридическое", ko: "법률" })} · ${
          service.title
        }`
      : service.title;
    const certs = service.certificates.slice(0, 2);
    const certsExtra = Math.max(0, service.certificates.length - certs.length);
    const formats = service.agent.consultationFormats || ["Online"];
    const formatTop = formats.slice(0, 2);
    const formatExtra = Math.max(0, formats.length - formatTop.length);
    const audiences = service.agent.audiences || [];
    const audienceTop = audiences.slice(0, 2);
    const audienceExtra = Math.max(0, audiences.length - audienceTop.length);
    return (
      <div
        key={`${keyPrefix}${service.displayId}`}
        role="button"
        tabIndex={0}
        onClick={(event) => handleServiceCardClick(event, service.displayId)}
        onKeyDown={(event) => handleServiceCardKeyDown(event, service.displayId)}
        className="flex h-[440px] cursor-pointer flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-0.5 hover:border-sky-500/60"
      >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link href={`/agents/${service.agent.id}`} className="flex items-center gap-3">
          <Avatar
            src={isPsychologyCategory ? "" : service.agent.avatar.src}
            alt={service.agent.avatar.alt}
            fallbackText={service.agent.name || getInitials(service.agent.name)}
            size={40}
            className="border border-slate-700/70"
          />
          <div>
            <p className="text-sm font-semibold text-slate-100">{service.agent.name}</p>
            <p className="text-[11px] text-slate-400">@{service.agent.nickname}</p>
            {(service.agent.region || service.agent.distanceKm) && (
              <p className="text-[11px] text-slate-500">
                📍 {service.agent.region || translate({ en: "Region", uz: "Hudud", ru: "Регион", ko: "지역" })} ·{" "}
                {service.agent.distanceKm ?? "—"} km
              </p>
            )}
            {isConsultingCategory && service.agent.languages && service.agent.languages.length > 0 && (
              <p className="truncate text-[11px] text-slate-500">
                🌐 {service.agent.languages.slice(0, 2).join(" · ")}
              </p>
            )}
            {isPsychologyCategory && (
              <p className="text-[11px] text-slate-500">
                🔒 {translate({ en: "Private", uz: "Maxfiy", ru: "Конфиденциально", ko: "비공개 상담" })}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2 text-[11px] text-slate-200">
          <span title="Verified" className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-200">
            ✔
          </span>
          {isConsultingCategory && service.certificates.length > 0 && (
            <span title="Certificates checked" className="rounded-full bg-slate-800 px-2 py-0.5">
              📜
            </span>
          )}
          {isLegalCategory && service.agent.legalLicenseMasked && (
            <span title="Licensed" className="rounded-full bg-slate-800 px-2 py-0.5">
              ⚖️
            </span>
          )}
          {isSportCategory && service.agent.sportCertificates && (
            <span title="Certified" className="rounded-full bg-slate-800 px-2 py-0.5">
              🏅
            </span>
          )}
        </div>
      </div>

      {activeCategory.id === "taxi" && (service.agent.vehicleClass || service.agent.seatCount) && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
          {service.agent.vehicleClass && (
            <span className="rounded-full bg-slate-900 px-2 py-1">
              {formatTaxiClassLabel(service.agent.vehicleClass)}
            </span>
          )}
          {service.agent.seatCount && (
            <span className="rounded-full bg-slate-900 px-2 py-1">
              {service.agent.seatCount} kishi
            </span>
          )}
          {service.agent.vehicleModel && (
            <span className="rounded-full bg-slate-900 px-2 py-1">
              {service.agent.vehicleModel}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="line-clamp-1 text-sm font-semibold text-slate-100">{legalTitle}</p>
          <p className="line-clamp-2 text-xs text-slate-400">{service.description}</p>
          {isNannyCategory && (
            <p className="mt-1 text-[11px] text-emerald-200">
              👶 {getNannyTypeLabel(service.subCategory)}
            </p>
          )}
          {isConsultingCategory && (
            <>
              <p className="mt-1 text-[11px] text-emerald-200">
                🧭 {service.agent.specialty || "Konsalting yo'nalishi"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  📍 {service.agent.region || service.agent.location || "Hudud"}
                </span>
                {formatTop.map((item) => (
                  <span key={`${service.displayId}-format-${item}`} className="rounded-full bg-slate-900 px-2 py-1">
                    💬 {item}
                  </span>
                ))}
                {formatExtra > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-1">+{formatExtra}</span>
                )}
              </div>
            </>
          )}
          {isPsychologyCategory && (
            <>
              <p className="mt-1 text-[11px] text-emerald-200">
                🧠 {service.agent.specialty || "Psixolog"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  👥 {(audienceTop.length ? audienceTop.join(" · ") : "Kattalar")}
                </span>
                {audienceExtra > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-1">+{audienceExtra}</span>
                )}
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  💬 {(service.agent.consultationFormats || ["Chat", "Video"]).slice(0, 2).join(" · ")}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  ⏱ {(service.agent.consultationDurations || ["50 daqiqa"]).slice(0, 1).join(" · ")}
                </span>
              </div>
            </>
          )}
          {isLegalCategory && (
            <>
              <p className="mt-1 text-[11px] text-emerald-200">
                ⚖️ {service.legalServiceType || "Maslahat"} · {legalJurisdictionLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  💬 {service.legalServiceType || "Maslahat"}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  {service.legalJurisdiction === "KR"
                    ? "🇰🇷 Koreya"
                    : service.legalJurisdiction === "INT"
                      ? "🌍 Xalqaro"
                      : "🇺🇿 O‘zbekiston"}
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  {service.legalFormat?.slice(0, 2).join(" · ") || "Chat"}
                </span>
              </div>
            </>
          )}
          {isSportCategory && (
            <>
              <p className="mt-1 text-[11px] text-emerald-200">
                🏅 {service.sportType || "Sport"} · {service.sportServiceType || "Mashg‘ulot"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  ⏳ {service.agent.experienceYears} yil
                </span>
                <span className="rounded-full bg-slate-900 px-2 py-1">
                  🎯 {service.sportFormat?.slice(0, 2).join(" · ") || "online/offline"}
                </span>
                {service.sportLevel && (
                  <span className="rounded-full bg-slate-900 px-2 py-1">
                    🧩 {service.sportLevel}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="text-right">
          {isConsultingCategory ? (
            <>
              <p className="text-sm font-semibold text-emerald-200">
                {formatCount(convertCurrency(service.price, service.currency, consultingCurrency).amount)}{" "}
                {convertCurrency(service.price, service.currency, consultingCurrency).label}
              </p>
              {service.currency !== consultingCurrency && (
                <p className="text-[10px] text-slate-500">
                  Asl: {formatCount(service.price)} {service.currency}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold text-emerald-200">
              {formatCount(service.price)} {service.currency}
            </p>
          )}
          <p className="text-[11px] text-slate-500">/{service.unit}</p>
        </div>
      </div>

      {isTranslationCategory && (
        <div className="mt-2 space-y-2 text-[11px] text-slate-400">
          <p className="text-xs text-slate-300">
            🌐 {translationLabel} ({translationPair})
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
              ⏱ {translationSlaLabel}
            </span>
            {translationTopTags.map((tag) => (
              <span key={`${service.displayId}-official-${tag}`} className="rounded-full bg-slate-900 px-2 py-1">
                {tag}
              </span>
            ))}
            {translationExtraTags > 0 && (
              <span className="rounded-full bg-slate-900 px-2 py-1">+{translationExtraTags}</span>
            )}
            {service.translationMode && (
              <span className="rounded-full bg-slate-900 px-2 py-1">
                {service.translationMode === "oral"
                  ? `🗣 ${translate({ en: "Oral", uz: "Og'zaki", ru: "Устный", ko: "구두" })}`
                  : `✍️ ${translate({ en: "Written", uz: "Yozma", ru: "Письменный", ko: "문서" })}`}
              </span>
            )}
            {service.translationFormat && (
              <span className="rounded-full bg-slate-900 px-2 py-1">
                📎{" "}
                {service.translationFormat === "Scan"
                  ? translate({ en: "Image → text", uz: "Rasm → matn", ru: "Изображение → текст", ko: "이미지 → 텍스트" })
                  : service.translationFormat === "Original"
                    ? translate({ en: "Original (stamped)", uz: "Original (muhrli)", ru: "Оригинал (с печатью)", ko: "원본 (도장)" })
                    : service.translationFormat}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
        {certs.map((cert) => (
          <span key={`${service.displayId}-${cert}`} className="rounded-full bg-slate-900 px-2 py-1">
            📜 {cert}
          </span>
        ))}
        {certsExtra > 0 && (
          <span className="rounded-full bg-slate-900 px-2 py-1">+{certsExtra}</span>
        )}
        {isConsultingCategory && (
          <>
            <span className="rounded-full bg-slate-900 px-2 py-1">
              🗓 {getMonthsOnPlatform(service.createdAt)} {translate({ en: "mo", uz: "oy", ru: "мес.", ko: "개월" })}
            </span>
            <span className="rounded-full bg-slate-900 px-2 py-1">
              🛡 {getConsultingTrustScore(service)}/100
            </span>
          </>
        )}
        {isTranslationCategory && (
          <>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
              ✅ {translate({ en: "Verified", uz: "Tasdiqlangan", ru: "Проверено", ko: "검증됨" })}
            </span>
            {service.notarization && (
              <span className="rounded-full bg-slate-900 px-2 py-1">
                🧾 {translate({ en: "Immigration", uz: "Immigratsiya", ru: "Иммиграция", ko: "이민" })}
              </span>
            )}
          </>
        )}
        {isPsychologyCategory && (
          <>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
              ✅ {translate({ en: "Verified", uz: "Tasdiqlangan", ru: "Проверено", ko: "검증됨" })}
            </span>
            <span className="rounded-full bg-slate-900 px-2 py-1">
              🗓 {getMonthsOnPlatform(service.createdAt)} {translate({ en: "mo", uz: "oy", ru: "мес.", ko: "개월" })}
            </span>
          </>
        )}
        {isLegalCategory && (
          <>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
              ⚖️ {translate({ en: "Verified", uz: "Tekshirildi", ru: "Проверено", ko: "검증됨" })}
            </span>
            <span className="rounded-full bg-slate-900 px-2 py-1">
              ⏱ {service.legalResponseTime || translate({ en: "~24 hours", uz: "~24 soat", ru: "~24 часа", ko: "~24시간" })}
            </span>
          </>
        )}
        {isSportCategory && (
          <>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
              🏅 {translate({ en: "Certified", uz: "Sertifikat", ru: "Сертификат", ko: "자격" })}
            </span>
            <span className="rounded-full bg-slate-900 px-2 py-1">
              👥 {formatCount(service.agent.sportStudentsCount ?? 0)}
            </span>
          </>
        )}
      </div>

      <div
        className={`mt-2 grid ${
          service.images.length <= 2 ? "grid-cols-2" : "grid-cols-3"
        } gap-2`}
      >
        {(isMarketingCategory
          ? [
              { src: service.agent.avatar.src, alt: service.agent.avatar.alt },
              ...service.images.slice(0, 2)
            ]
          : service.images
        ).map((image, idx) => {
          const fallback = isConstructionCategory
            ? getConstructionFallback(service.displayId, idx)
            : isNannyCategory
              ? getNannyFallback(service.displayId, idx)
              : undefined;
          const src =
            isConstructionCategory || (isNannyCategory && fallback) ? fallback : image.src;
          return (
            <img
              key={`${service.displayId}-${idx}`}
              src={src}
              alt={image.alt}
              className="h-16 w-full rounded-lg object-cover"
              loading="lazy"
              onError={(event) => {
                if (fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-900 px-2 py-1">⭐ {service.rating.toFixed(1)}</span>
          <span className="rounded-full bg-slate-900 px-2 py-1">✅ {formatCount(service.agent.completedOrders ?? service.usedCount)}</span>
          <span className="rounded-full bg-slate-900 px-2 py-1">💬 {formatCount(service.reviewCount)}</span>
          {isConsultingCategory && (
            <span className="rounded-full bg-slate-900 px-2 py-1">
              ⏱ ~{(hashValue(service.agent.id) % 8) + 1} {translate({ en: "hours", uz: "soat", ru: "часов", ko: "시간" })}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${
            service.canRate
              ? "bg-emerald-400/20 text-emerald-200"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {service.canRate ? "⭐" : "☆"}
        </button>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-3 text-xs">
        {isConsultingCategory ? (
          <>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-emerald-500/80 px-3 py-1 text-slate-950"
            >
              💬
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              ❓
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              ★
            </button>
          </>
        ) : isLegalCategory ? (
          <>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-sky-500/90 px-3 py-1 text-white"
            >
              ⚖️
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              ❓
            </button>
          </>
        ) : isSportCategory ? (
          <>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-sky-500/90 px-3 py-1 text-white"
            >
              🏃
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              ❓
            </button>
          </>
        ) : isTranslationCategory ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/services/${service.displayId}?upload=1`);
              }}
              className="rounded-full bg-sky-500/90 px-3 py-1 text-white"
            >
              📎
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              ❓
            </button>
          </>
        ) : isPsychologyCategory ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/services/${service.displayId}?secure=1`);
              }}
              className="rounded-full bg-sky-500/90 px-3 py-1 text-white"
            >
              🔒
            </button>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
            >
              Profilni ko'rish
            </button>
          </>
        ) : (
          <>
            <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {translate("services.actions.nice")} ({formatCount(service.niceCount)})
            </button>
            <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {translate("services.actions.followAgent")}
            </button>
            <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {translate("services.actions.share")} ({formatCount(service.shareCount)})
            </button>
          </>
        )}
      </div>
    </div>
    );
  };

  const handleConfirmRide = () => {
    if (!latestRide) return;
    sendRideEvent("ride_confirmed", { rideId: latestRide.rideId });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{translate("services.hub.label")}</p>
            <h1 className="text-2xl font-semibold text-slate-50">
              {isLegalCategory
                ? "Huquqiy maslahat va xizmatlar"
                : isSportCategory
                  ? "Professional sport murabbiylari va treninglar"
                : isPsychologyCategory
                  ? "Psixologik yordam va maslahatlar"
                  : translate("services.hub.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {isLegalCategory
                ? "Sertifikatlangan huquqshunoslardan rasmiy va ishonchli maslahatlar. Onlayn va oflayn formatda."
                : isSportCategory
                  ? "Individual mashg‘ulotlar, onlayn va oflayn treninglar, hamda professional kurslar."
                : isPsychologyCategory
                  ? "Sertifikatlangan mutaxassislar bilan maxfiy va ishonchli muloqot. Onlayn va oflayn formatda."
                  : translate("services.hub.description")}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-100">
            <p className="font-semibold">
              {isLegalCategory
                ? "⚖️ Huquqshunoslarning malakasi platforma tomonidan tekshiriladi"
                : isSportCategory
                  ? "🔵 Murabbiy bo‘lish / Kurs joylash"
                : isPsychologyCategory
                  ? "🔒 Barcha yozishmalar maxfiy"
                  : translate("services.hub.noteTitle")}
            </p>
            <p className="mt-1 text-amber-200/90">
              {isLegalCategory
                ? "🔒 Yozishmalar maxfiy, hujjatlar xavfsiz saqlanadi."
                : isSportCategory
                  ? "Murabbiy sifatida ro‘yxatdan o‘tib trening yoki kursingizni joylashtiring."
                : isPsychologyCategory
                  ? "Sizning yozishmalaringiz faqat siz va mutaxassisga ko'rinadi."
                  : translate("services.hub.noteBody")}
            </p>
            {isSportCategory && (
              <Link
                href="/agent/listings/new"
                className="mt-3 inline-flex items-center justify-center rounded-full bg-sky-500/90 px-3 py-1 text-[11px] font-semibold text-white"
              >
                Murabbiy bo‘lish / Kurs joylash
              </Link>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {serviceCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveGroup(item.id)}
              className={`rounded-full px-4 py-2 transition ${
                activeGroup === item.id
                  ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/60"
                  : "bg-slate-900/70 text-slate-300 ring-1 ring-slate-700/70 hover:text-slate-100"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{translate("services.list.title")}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{translate("services.sort.label")}:</span>
              <select
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as "top" | "new")}
              >
                <option value="top">{translate("services.sort.top")}</option>
                <option value="new">{translate("services.sort.new")}</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`rounded-full px-3 py-1 transition ${
                  activeCategoryId === cat.id
                    ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/60"
                    : "bg-slate-900/60 text-slate-300 ring-1 ring-slate-700/70 hover:text-slate-100"
                }`}
              >
                {getCategoryLabel(cat.id, cat.title)}
              </button>
            ))}
          </div>
          {isConstructionCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                  {translate({
                    en: "Construction services",
                    uz: "Qurilish va quruvchilar xizmati",
                    ru: "Строительные услуги",
                    ko: "건설 서비스"
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {translate({
                    en: "Renovation, craftsmanship, and improvement.",
                    uz: "Remont, ustalik va obodonlashtirish.",
                    ru: "Ремонт, мастерство и благоустройство.",
                    ko: "리모델링, 장인 작업, 환경 개선."
                  })}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {constructionSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setConstructionSection(section.id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                      constructionSection === section.id
                        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    <span>{section.title}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
                      {translate({ en: "Open section", uz: "Bo'limga o'tish", ru: "Открыть раздел", ko: "섹션 열기" })}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setConstructionSubCategory("all")}
                  className={`rounded-full px-3 py-1 ${
                    constructionSubCategory === "all"
                      ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                      : "bg-slate-900/70 text-slate-300"
                  }`}
                >
                  {translate({ en: "All sections", uz: "Barcha bo'limlar", ru: "Все разделы", ko: "모든 섹션" })}
                </button>
                {(constructionSections.find((item) => item.id === constructionSection)?.subCategories ||
                  constructionSections[0].subCategories
                ).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setConstructionSubCategory(sub.id)}
                    className={`rounded-full px-3 py-1 ${
                      constructionSubCategory === sub.id
                        ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isConsultingCategory && (
            <div className="mt-4 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                    {translate({ en: "Consulting service", uz: "Konsolting xizmati", ru: "Консалтинг", ko: "컨설팅 서비스" })}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {translate({
                      en: "Korea ↔ Uzbekistan focus: visa, jobs, education, business, adaptation.",
                      uz: "Korea ↔ Uzbekistan bo'yicha aniq yo'nalish: viza, ish, ta'lim, biznes, moslashuv.",
                      ru: "Фокус Корея ↔ Узбекистан: виза, работа, обучение, бизнес, адаптация.",
                      ko: "한국 ↔ 우즈베키스탄: 비자, 취업, 교육, 비즈니스, 적응"
                    })}
                  </p>
                  <a
                    href="#consulting-how"
                    className="mt-2 inline-flex items-center gap-2 text-xs text-sky-200 underline"
                  >
                    {translate({ en: "How it works?", uz: "Qanday ishlaydi?", ru: "Как это работает?", ko: "어떻게 работает?" })}
                  </a>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
                  <p className="font-semibold">
                    {translate({ en: "Trust Score", uz: "Trust Score", ru: "Trust Score", ko: "신뢰 점수" })}
                  </p>
                  <p className="mt-1 text-emerald-200/90">
                    {translate({
                      en: "Based on ID/certificates, rating, completed jobs, and response speed.",
                      uz: "ID/sertifikat, reyting, tugallangan ishlar va javob tezligi asosida.",
                      ru: "На основе ID/сертификатов, рейтинга, завершенных работ и скорости ответа.",
                      ko: "ID/자격증, 평점, 완료 건수, 응답 속도 기반."
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Search", uz: "Qidiruv", ru: "Поиск", ko: "검색" })}
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      value={consultingQuery}
                      onChange={(event) => setConsultingQuery(event.target.value)}
                      placeholder={translate({
                        en: "Visa, CV, jobs in Korea, business, adaptation, translation",
                        uz: "Visa, CV, Koreyada ish, biznes, moslashuv, tarjima",
                        ru: "Виза, CV, работа в Корее, бизнес, адаптация, перевод",
                        ko: "비자, CV, 한국 취업, 비즈니스, 적응, 번역"
                      })}
                      className="min-w-[220px] flex-1 rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setConsultingQuery("")}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
                    >
                      {translate({ en: "Clear", uz: "Tozalash", ru: "Очистить", ko: "지우기" })}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {consultingKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => setConsultingQuery(keyword)}
                        className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({
                      en: "Currency & time zone",
                      uz: "Valyuta & vaqt zonasi",
                      ru: "Валюта и часовой пояс",
                      ko: "통화 및 시간대"
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultingCurrency("UZS")}
                      className={`rounded-full px-3 py-1 ${
                        consultingCurrency === "UZS"
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      UZS
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultingCurrency("KRW")}
                      className={`rounded-full px-3 py-1 ${
                        consultingCurrency === "KRW"
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      KRW
                    </button>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
                      {translate({ en: "Agent time: KST", uz: "Agent vaqti: KST", ru: "Время агента: KST", ko: "에이전트 시간: KST" })}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {translate({
                      en: "Currency conversion is shown approximately.",
                      uz: "Valyuta konvertatsiya taxminiy ko'rsatiladi.",
                      ru: "Конвертация валюты показана приблизительно.",
                    ko: "환전 금액은 приблиз적으로 표시됩니다."
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                {consultingTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setConsultingTab(tab.id)}
                    className={`rounded-full px-3 py-1 ${
                      consultingTab === tab.id
                        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                  {translate({ en: "For who?", uz: "Kim uchun?", ru: "Для кого?", ko: "대상?" })}
                </span>
                <button
                  type="button"
                  onClick={() => setConsultingAudience("all")}
                  className={`rounded-full px-3 py-1 ${
                    consultingAudience === "all"
                      ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                      : "bg-slate-900/70 text-slate-300"
                  }`}
                >
                  {translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}
                </button>
                {consultingAudiences.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setConsultingAudience(item)}
                    className={`rounded-full px-3 py-1 ${
                      consultingAudience === item
                        ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-2 grid gap-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Location", uz: "Joylashuv", ru: "Локация", ko: "위치" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingLocation}
                    onChange={(e) => setConsultingLocation(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="korea">{translate({ en: "Korea", uz: "Koreya", ru: "Корея", ko: "한국" })}</option>
                    <option value="uzbekistan">
                      {translate({ en: "Uzbekistan", uz: "O'zbekiston", ru: "Узбекистан", ko: "우즈베키스탄" })}
                    </option>
                  </select>
                  <input
                    value={consultingCity}
                    onChange={(event) => setConsultingCity(event.target.value)}
                    placeholder={translate({
                      en: "City (optional)",
                      uz: "Shahar (ixtiyoriy)",
                      ru: "Город (необязательно)",
                      ko: "도시 (선택)"
                    })}
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Language", uz: "Til", ru: "Язык", ko: "언어" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingLanguage}
                    onChange={(e) => setConsultingLanguage(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="UZ">UZ</option>
                    <option value="KR">KR</option>
                    <option value="RU">RU</option>
                    <option value="EN">EN</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Format", uz: "Format", ru: "Формат", ko: "형식" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingFormat}
                    onChange={(e) => setConsultingFormat(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {consultingFormats.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Price", uz: "Narx", ru: "Цена", ko: "가격" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingPrice}
                    onChange={(e) => setConsultingPrice(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="0-700">{translate({ en: "0 - 700k", uz: "0 - 700k", ru: "0 - 700k", ko: "0 - 700k" })}</option>
                    <option value="700-1500">{translate({ en: "700k - 1.5m", uz: "700k - 1.5m", ru: "700k - 1.5m", ko: "700k - 1.5m" })}</option>
                    <option value="1500+">{translate({ en: "1.5m+", uz: "1.5m+", ru: "1.5m+", ko: "1.5m+" })}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Experience", uz: "Tajriba", ru: "Опыт", ko: "경력" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingExperience}
                    onChange={(e) => setConsultingExperience(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="1-3">{translate({ en: "1-3 years", uz: "1-3 yil", ru: "1-3 года", ko: "1-3년" })}</option>
                    <option value="4-6">{translate({ en: "4-6 years", uz: "4-6 yil", ru: "4-6 лет", ko: "4-6년" })}</option>
                    <option value="7+">{translate({ en: "7+ years", uz: "7+ yil", ru: "7+ лет", ko: "7+년" })}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Rating", uz: "Reyting", ru: "Рейтинг", ko: "평점" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingRating}
                    onChange={(e) => setConsultingRating(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="4.7">4.7+</option>
                    <option value="4.5">4.5+</option>
                    <option value="4.3">4.3+</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Availability", uz: "Mavjudlik", ru: "Доступность", ko: "가능 시간" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingAvailability}
                    onChange={(e) => setConsultingAvailability(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="today">{translate({ en: "Free today", uz: "Bugun bo'sh", ru: "Свободен сегодня", ko: "오늘 가능" })}</option>
                    <option value="48h">{translate({ en: "Within 48 hours", uz: "48 soat ichida", ru: "В течение 48 часов", ko: "48시간 내" })}</option>
                    <option value="soon">{translate({ en: "Soon", uz: "Tez orada", ru: "Скоро", ko: "곧" })}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Sort", uz: "Saralash", ru: "Сортировка", ko: "정렬" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={consultingSort}
                    onChange={(e) => setConsultingSort(e.target.value)}
                  >
                    <option value="match">{translate({ en: "Best match", uz: "Eng mos", ru: "Лучшее совпадение", ko: "최적 매칭" })}</option>
                    <option value="rating">{translate({ en: "Top rating", uz: "Eng yuqori reyting", ru: "Высокий рейтинг", ko: "높은 평점" })}</option>
                    <option value="fast">{translate({ en: "Fast response", uz: "Eng tez javob", ru: "Быстрый ответ", ko: "빠른 응답" })}</option>
                    <option value="cheap">{translate({ en: "Cheaper", uz: "Arzonroq", ru: "Дешевле", ko: "저렴한" })}</option>
                    <option value="popular">{translate({ en: "Most orders", uz: "Ko'p buyurtma", ru: "Много заказов", ko: "주문 많음" })}</option>
                    <option value="new">{translate({ en: "Newest", uz: "Yangi", ru: "Новые", ko: "신규" })}</option>
                  </select>
                </div>
              </div>

              <div
                id="consulting-how"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300"
              >
                <p className="font-semibold text-slate-100">
                  {translate({ en: "How it works?", uz: "Qanday ishlaydi?", ru: "Как это работает?", ko: "어떻게 работает?" })}
                </p>
                <div className="mt-2 grid gap-2 text-[11px] text-slate-400 sm:grid-cols-3">
                  <span>{translate({ en: "1. You send a request", uz: "1. So'rov yuborasiz", ru: "1. Отправляете запрос", ko: "1. 요청 전송" })}</span>
                  <span>{translate({ en: "2. Agent confirms fit", uz: "2. Agent moslikni tasdiqlaydi", ru: "2. Агент подтверждает", ko: "2. 에이전트 확인" })}</span>
                  <span>{translate({ en: "3. Plan + results", uz: "3. Ish reja + natija", ru: "3. План + результат", ko: "3. 계획 + 결과" })}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {translate({
                    en: "Legal/visa services are not official representation and do not affect government decisions.",
                    uz: "Huquqiy/visa xizmatlari rasmiy vakillik emas. Rasmiy organ qaroriga ta'sir qilmaydi.",
                    ru: "Юр./визовые услуги не являются официальным представительством и не влияют на решения органов.",
                    ko: "법률/비자 서비스는 공식 대리인이 아니며 정부 결정에 영향을 주지 않습니다."
                  })}
                </p>
              </div>
            </div>
          )}
          {isPsychologyCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                  {translate({
                    en: "Psychological support and counseling",
                    uz: "Psixologik yordam va maslahatlar",
                    ru: "Психологическая помощь и консультации",
                    ko: "심리 상담과 도움"
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {translate({
                    en: "Confidential and reliable sessions with certified specialists. Online and offline.",
                    uz: "Sertifikatlangan mutaxassislar bilan maxfiy va ishonchli muloqot. Onlayn va oflayn formatda.",
                    ru: "Конфиденциальные и надежные сессии с сертифицированными специалистами. Онлайн и офлайн.",
                    ko: "공인 전문가와 비공개 상담. 온라인/오프라인."
                  })}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {translate({ en: "🔒 All messages are private", uz: "🔒 Barcha yozishmalar maxfiy", ru: "🔒 Все сообщения конфиденциальны", ko: "🔒 모든 메시지는 비공개" })}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {translate({ en: "Issue focus", uz: "Muammo yo'nalishi", ru: "Направление проблемы", ko: "문제 분야" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {psychologyIssues.map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setPsychologyIssue(issue.id)}
                      className={`rounded-full px-3 py-1 ${
                        psychologyIssue === issue.id
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-900/70 text-slate-300"
                      }`}
                    >
                      {issue.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "For who", uz: "Kimlar uchun", ru: "Для кого", ko: "대상" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={psychologyAudience}
                    onChange={(e) => setPsychologyAudience(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {psychologyAudiences.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Format", uz: "Format", ru: "Формат", ko: "형식" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={psychologyFormat}
                    onChange={(e) => setPsychologyFormat(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {psychologyFormats.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Language", uz: "Til", ru: "Язык", ko: "언어" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={psychologyLanguage}
                    onChange={(e) => setPsychologyLanguage(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="UZ">{translate({ en: "Uzbek", uz: "O'zbek", ru: "Узбекский", ko: "우즈베크어" })}</option>
                    <option value="KR">{translate({ en: "Korean", uz: "Koreys", ru: "Корейский", ko: "한국어" })}</option>
                    <option value="RU">{translate({ en: "Russian", uz: "Rus", ru: "Русский", ko: "러시아어" })}</option>
                    <option value="EN">{translate({ en: "English", uz: "Ingliz", ru: "Английский", ko: "영어" })}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Experience", uz: "Tajriba", ru: "Опыт", ko: "경력" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={psychologyExperience}
                    onChange={(e) => setPsychologyExperience(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="certified">
                      {translate({ en: "Certificate verified", uz: "Sertifikat tasdiqlangan", ru: "Сертификат подтвержден", ko: "자격증 확인됨" })}
                    </option>
                    <option value="3+">{translate({ en: "3+ years", uz: "3+ yil", ru: "3+ года", ko: "3+년" })}</option>
                    <option value="5+">{translate({ en: "5+ years", uz: "5+ yil", ru: "5+ лет", ko: "5+년" })}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {isLegalCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                  {translate({
                    en: "Legal advice and services",
                    uz: "Huquqiy maslahat va xizmatlar",
                    ru: "Юридические консультации и услуги",
                    ko: "법률 상담 및 서비스"
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {translate({
                    en: "Official and reliable advice from certified lawyers.",
                    uz: "Sertifikatlangan huquqshunoslardan rasmiy va ishonchli maslahatlar.",
                    ru: "Официальные и надежные консультации от сертифицированных юристов.",
                    ko: "공인 법률 전문가의 신뢰할 수 있는 상담."
                  })}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {translate({
                    en: "⚖️ Credentials verified · 🔒 Confidential",
                    uz: "⚖️ Malaka tekshiriladi · 🔒 Maxfiylik",
                    ru: "⚖️ Проверка квалификации · 🔒 Конфиденциально",
                    ko: "⚖️ 자격 검증 · 🔒 비공개"
                  })}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {translate({ en: "1. Legal area", uz: "1. Huquq sohasi", ru: "1. Область права", ko: "1. 법률 분야" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {legalAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setLegalArea(area)}
                      className={`rounded-full px-3 py-1 ${
                        legalArea === area
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-900/70 text-slate-300"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                {legalArea === "all" && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    {translate({
                      en: "All shown. Select a specific area to filter.",
                      uz: "Hammasi ko‘rinmoqda. Tanlasangiz faqat o‘sha yo‘nalish chiqadi.",
                      ru: "Показаны все. Выберите область для фильтрации.",
                      ko: "모두 표시 중입니다. 선택하면 해당 영역만 표시됩니다."
                    })}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "2. Service type", uz: "2. Xizmat turi", ru: "2. Тип услуги", ko: "2. 서비스 유형" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={legalServiceType}
                    onChange={(e) => setLegalServiceType(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {legalServiceTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "3. Jurisdiction", uz: "3. Yurisdiksiya", ru: "3. Юрисдикция", ko: "3. 관할" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={legalJurisdiction}
                    onChange={(e) => setLegalJurisdiction(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {legalJurisdictions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "4. Language", uz: "4. Til", ru: "4. Язык", ko: "4. 언어" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={legalLanguage}
                    onChange={(e) => setLegalLanguage(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {legalLanguages.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "5. Format", uz: "5. Format", ru: "5. Формат", ko: "5. 형식" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={legalFormat}
                    onChange={(e) => setLegalFormat(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {legalFormats.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "6. Trust", uz: "6. Ishonchlilik", ru: "6. Доверие", ko: "6. 신뢰" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={legalTrust}
                    onChange={(e) => setLegalTrust(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="license">
                      {translate({ en: "✅ License verified", uz: "✅ Litsenziya tasdiqlangan", ru: "✅ Лицензия подтверждена", ko: "✅ лицензия 확인" })}
                    </option>
                    <option value="5y">{translate({ en: "5+ years experience", uz: "5+ yil tajriba", ru: "5+ лет опыта", ko: "5+년 경력" })}</option>
                    <option value="rating">{translate({ en: "High rating", uz: "Yuqori reyting", ru: "Высокий рейтинг", ko: "높은 평점" })}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {isSportCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                  {translate({
                    en: "Professional sports coaches and training",
                    uz: "Professional sport murabbiylari va treninglar",
                    ru: "Профессиональные тренеры и тренировки",
                    ko: "전문 스포츠 코치 및 트레이닝"
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {translate({
                    en: "Individual sessions, online/offline training, and professional courses.",
                    uz: "Individual mashg‘ulotlar, onlayn va oflayn treninglar, hamda professional kurslar.",
                    ru: "Индивидуальные занятия, онлайн/офлайн тренировки и профессиональные курсы.",
                    ko: "개별 수업, 온라인/오프라인 트레이닝 및 전문 코스."
                  })}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {translate({
                    en: "There are also listings for group partners.",
                    uz: "Birga shug‘ullanishni xohlovchilar uchun ham e’lonlar mavjud.",
                    ru: "Есть объявления и для тех, кто хочет заниматься вместе.",
                    ko: "함께 운동할 파트너를 찾는 게시물도 있습니다."
                  })}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {translate({ en: "1. Sport type", uz: "1. Sport turi", ru: "1. Вид спорта", ko: "1. 스포츠 유형" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSportType("all")}
                    className={`rounded-full px-3 py-1 ${
                      sportType === "all"
                        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    {translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}
                  </button>
                  {sportTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSportType(item)}
                      className={`rounded-full px-3 py-1 ${
                        sportType === item
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-900/70 text-slate-300"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "2. Service type", uz: "2. Xizmat turi", ru: "2. Тип услуги", ko: "2. 서비스 유형" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={sportServiceType}
                    onChange={(e) => setSportServiceType(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {sportServiceTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "3. Level", uz: "3. Daraja", ru: "3. Уровень", ko: "3. 수준" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={sportLevel}
                    onChange={(e) => setSportLevel(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {sportLevels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "4. For who", uz: "4. Kimlar uchun", ru: "4. Для кого", ko: "4. 대상" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={sportAudience}
                    onChange={(e) => setSportAudience(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {sportAudiences.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "5. Format", uz: "5. Format", ru: "5. Формат", ko: "5. 형식" })}
                  </label>
                  <select
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={sportFormat}
                    onChange={(e) => setSportFormat(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    {sportFormats.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "6. City / district", uz: "6. Shahar / tuman", ru: "6. Город / район", ko: "6. 도시 / 구" })}
                  </label>
                  <input
                    value={sportCity}
                    onChange={(event) => setSportCity(event.target.value)}
                    placeholder={translate({
                      en: "Tashkent, Samarkand...",
                      uz: "Toshkent, Samarqand...",
                      ru: "Ташкент, Самарканд...",
                      ko: "타슈кент, 사마르칸트..."
                    })}
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Gym name", uz: "Sport zali nomi", ru: "Название зала", ko: "체육관 이름" })}
                  </label>
                  <input
                    value={sportGym}
                    onChange={(event) => setSportGym(event.target.value)}
                    placeholder={translate({
                      en: "FitZone Gym...",
                      uz: "FitZone Gym...",
                      ru: "FitZone Gym...",
                      ko: "FitZone Gym..."
                    })}
                    className="mt-2 w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
          {isTranslationCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                  Uniserv Translation
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {translate({
                    en: "Speed and formality first. Choose a document type and find the right translator.",
                    uz: "Tezlik va rasmiylik birinchi o'rinda. Hujjat turini tanlang va mos tarjimonni toping.",
                    ru: "Скорость и официальность важнее всего. Выберите тип документа и найдите переводчика.",
                    ko: "속도와 공신력이 우선입니다. 문서 유형을 선택하고 적합한 번역사를 찾으세요."
                  })}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {translate({ en: "1. Document type", uz: "1. Hujjat turi", ru: "1. Тип документа", ko: "1. 문서 유형" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {translationTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTranslationTab(tab.id)}
                      className={`rounded-full px-3 py-1 ${
                        translationTab === tab.id
                          ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                          : "bg-slate-900/70 text-slate-300"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "2. Language (from)", uz: "2. Til (qaysidan)", ru: "2. Язык (с какого)", ko: "2. 언어 (출발)" })}
                  </label>
                  <input
                    list="translation-from-list"
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationFrom}
                    onChange={(e) => setTranslationFrom(e.target.value.toUpperCase())}
                    placeholder="KR"
                  />
                  <datalist id="translation-from-list">
                    {translationLanguages.map((lang) => (
                      <option key={`from-${lang}`} value={lang} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "3. Language (to)", uz: "3. Til (qaysiga)", ru: "3. Язык (на какой)", ko: "3. 언어 (도착)" })}
                  </label>
                  <input
                    list="translation-to-list"
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationTo}
                    onChange={(e) => setTranslationTo(e.target.value.toUpperCase())}
                    placeholder="UZ"
                  />
                  <datalist id="translation-to-list">
                    {translationLanguages.map((lang) => (
                      <option key={`to-${lang}`} value={lang} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "4. Formality", uz: "4. Rasmiylik", ru: "4. Официальность", ko: "4. 공식성" })}
                  </label>
                  <select
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationOfficial}
                    onChange={(e) => setTranslationOfficial(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="Oddiy">{translate({ en: "Standard translation", uz: "Oddiy tarjima", ru: "Обычный перевод", ko: "일반 번역" })}</option>
                    <option value="Notarial">{translate({ en: "Notarized", uz: "Notarial tasdiq", ru: "Нотариальное заверение", ko: "공증" })}</option>
                    <option value="Muhrli">{translate({ en: "Stamped translation", uz: "Muhrli tarjima", ru: "Перевод с печатью", ko: "도장 번역" })}</option>
                    <option value="Guvohnoma">{translate({ en: "With certificate", uz: "Guvohnoma bilan", ru: "Со свидетельством", ko: "증명서 포함" })}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "5. Speed (SLA)", uz: "5. Tezlik (SLA)", ru: "5. Скорость (SLA)", ko: "5. 속도 (SLA)" })}
                  </label>
                  <select
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationSla}
                    onChange={(e) => setTranslationSla(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="2-6 soat">{translate({ en: "2–6 hours", uz: "2-6 soat", ru: "2–6 часов", ko: "2–6시간" })}</option>
                    <option value="24 soat">{translate({ en: "24 hours", uz: "24 soat", ru: "24 часа", ko: "24시간" })}</option>
                    <option value="2-3 ish kuni">{translate({ en: "2–3 business days", uz: "2-3 ish kuni", ru: "2–3 рабочих дня", ko: "2–3영업일" })}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Format", uz: "Format", ru: "Формат", ko: "형식" })}
                  </label>
                  <select
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationFormat}
                    onChange={(e) => setTranslationFormat(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="PDF">PDF / DOCX</option>
                    <option value="Scan">{translate({ en: "Image → text", uz: "Rasm → matn", ru: "Изображение → текст", ko: "이미지 → 텍스트" })}</option>
                    <option value="Original">{translate({ en: "Original (stamped)", uz: "Original (muhrli)", ru: "Оригинал (с печатью)", ko: "원본 (도장)" })}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Oral", uz: "Og'zaki", ru: "Устный", ko: "구두" })}
                  </label>
                  <select
                    className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationMode}
                    onChange={(e) => setTranslationMode(e.target.value)}
                  >
                    <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                    <option value="written">{translate({ en: "Written", uz: "Yozma", ru: "Письменный", ko: "문서" })}</option>
                    <option value="oral">{translate({ en: "Oral", uz: "Og'zaki", ru: "Устный", ko: "구두" })}</option>
                  </select>
                </div>
              </div>

              {translationTab === "translation-official" && (
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-300">
                    {translate({
                      en: "Official selected → notarization options appear",
                      uz: "Rasmiy tanlandi → notarial opsiyalar ko'rinadi",
                      ru: "Выбрано официально → видны опции нотариуса",
                      ko: "공식 선택됨 → 공증 옵션 표시"
                    })}
                  </span>
                  <select
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={translationNotarization}
                    onChange={(e) => setTranslationNotarization(e.target.value)}
                  >
                    <option value="all">
                      {translate({ en: "Notarized: all", uz: "Notarial: barchasi", ru: "Нотариус: все", ko: "공증: 전체" })}
                    </option>
                    <option value="yes">{translate({ en: "Notarized", uz: "Notarial bor", ru: "Есть нотариус", ko: "공증 있음" })}</option>
                    <option value="no">{translate({ en: "Notarized: no", uz: "Notarial yo'q", ru: "Без нотариуса", ko: "공증 없음" })}</option>
                  </select>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setTranslationTab("all");
                    setTranslationFrom("");
                    setTranslationTo("");
                    setTranslationNotarization("all");
                    setTranslationSpeed("all");
                    setTranslationFormat("all");
                    setTranslationMode("all");
                    setTranslationOfficial("all");
                    setTranslationSla("all");
                  }}
                  className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300"
                >
                  {translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}
                </button>
                <span className="text-slate-500">
                  {translate({ en: "Clear filters", uz: "Filtrlarni tozalash", ru: "Очистить фильтры", ko: "필터 초기화" })}
                </span>
              </div>
            </div>
          )}
          {isNannyCategory && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                {nannyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNannyType(type.id)}
                    className={`rounded-full px-3 py-1 ${
                      nannyType === type.id
                        ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/70 text-slate-300"
                    }`}
                  >
                    {type.title}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-3 text-xs text-slate-300">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Age (min)", uz: "Yosh (min)", ru: "Возраст (мин)", ko: "나이 (최소)" })}
                  </label>
                  <input
                    type="number"
                    min={18}
                    className="w-24 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={nannyAgeMin}
                    onChange={(e) => setNannyAgeMin(e.target.value)}
                    placeholder="18"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Age (max)", uz: "Yosh (max)", ru: "Возраст (макс)", ko: "나이 (최대)" })}
                  </label>
                  <input
                    type="number"
                    min={18}
                    className="w-24 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={nannyAgeMax}
                    onChange={(e) => setNannyAgeMax(e.target.value)}
                    placeholder="45"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "Start", uz: "Boshlanish", ru: "Начало", ko: "시작" })}
                  </label>
                  <input
                    type="time"
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={nannyTimeStart}
                    onChange={(e) => setNannyTimeStart(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {translate({ en: "End", uz: "Tugash", ru: "Окончание", ko: "종료" })}
                  </label>
                  <input
                    type="time"
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                    value={nannyTimeEnd}
                    onChange={(e) => setNannyTimeEnd(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setNannyTimeStart("08:00");
                      setNannyTimeEnd("18:00");
                    }}
                    className="rounded-full bg-slate-900/60 px-3 py-1 text-slate-300 ring-1 ring-slate-700"
                  >
                    08:00-18:00
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNannyTimeStart("18:00");
                      setNannyTimeEnd("08:00");
                    }}
                    className="rounded-full bg-slate-900/60 px-3 py-1 text-slate-300 ring-1 ring-slate-700"
                  >
                    18:00-08:00
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNannyTimeStart("00:00");
                      setNannyTimeEnd("23:59");
                    }}
                    className="rounded-full bg-slate-900/60 px-3 py-1 text-slate-300 ring-1 ring-slate-700"
                  >
                    24/7
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNannyAgeMin("");
                      setNannyAgeMax("");
                      setNannyTimeStart("");
                      setNannyTimeEnd("");
                      setNannyType("all");
                    }}
                    className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-200 ring-1 ring-rose-500/40"
                  >
                    {translate({ en: "Clear", uz: "Tozalash", ru: "Очистить", ko: "지우기" })}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {canShowAddService && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200">{translate("services.add.badge")}</p>
              <h2 className="text-xl font-semibold text-slate-50">{translate("services.add.title")}</h2>
              <p className="mt-1 text-sm text-slate-400">{translate("services.add.description")}</p>
            </div>
            <div className="text-xs text-slate-400">
              {translate("services.hub.wordLabel")}:{" "}
              <span className={wordCount > 500 ? "text-red-400" : "text-slate-200"}>{wordCount}</span>/500
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 text-sm md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">{translate("services.add.typeLabel")}</label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                    value={form.type}
                    onChange={(e) =>
                      handleFormChange("type", e.target.value as ServiceFormState["type"])
                    }
                    disabled={isServiceAgentLocked}
                  >
                    <option value="material">{translate("services.add.type.material")}</option>
                    <option value="spiritual">{translate("services.add.type.spiritual")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-300">{translate("services.add.categoryLabel")}</label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                    value={form.categoryId}
                    onChange={(e) => handleFormChange("categoryId", e.target.value)}
                    disabled={isServiceAgentLocked}
                  >
                    {(isServiceAgentLocked
                      ? formGroup.categories.filter((cat) => cat.id === agentCategory)
                      : formGroup.categories
                    ).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryLabel(cat.id, cat.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">{translate("services.add.nameLabel")}</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder={translate("services.add.namePlaceholder")}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-300">{translate("services.add.priceLabel")}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                      value={form.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      placeholder="150000"
                    />
                    <select
                      className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100"
                      value={form.currency}
                      onChange={(e) =>
                        handleFormChange("currency", e.target.value as ServiceFormState["currency"])
                      }
                    >
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">{translate("services.add.certLabel")}</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  value={form.certificates}
                  onChange={(e) => handleFormChange("certificates", e.target.value)}
                  placeholder={translate("services.add.certPlaceholder")}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">{translate("services.add.descLabel")}</label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder={translate("services.add.descPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold text-slate-200">{translate("services.add.imagesTitle")}</p>
                <p className="mt-1 text-xs text-slate-400">{translate("services.add.imagesDesc")}</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-3 block w-full text-xs text-slate-300"
                  onChange={(e) => handleFormChange("images", Array.from(e.target.files || []))}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {translate("services.add.imagesSelected")}: {form.images.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <label className="flex items-start gap-3 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={(e) => handleFormChange("agree", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400"
                  />
                  <span>{translate("services.add.agree")}</span>
                </label>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}
              {formSuccess && <p className="text-xs text-emerald-300">{formSuccess}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-400/90 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300"
              >
                {translate("services.add.submit")}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-6">
        {activeCategory && isDeliveryCategory ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <DeliveryServiceSection />
          </div>
        ) : activeCategory && isEmploymentCategory ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <EmploymentServiceSection />
          </div>
        ) : activeCategory && isEducationCategory ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <EducationServiceSection />
          </div>
        ) : activeCategory && isTechnicalCategory ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <TechnicalServiceSection />
          </div>
        ) : activeCategory ? (
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                {getCategoryLabel(activeCategory.id, activeCategory.title)}
              </h3>
              <p className="text-sm text-slate-400">
                {getCategoryDescription(activeCategory.id, activeCategory.description)}
              </p>
            </div>

            {(!isTranslationCategory || translationRest.length > 0) && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-200">{translate("services.list.title")}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                    >
                      {translate("services.pagination.prev")}
                    </button>
                    <div className="flex items-center gap-1">
                      {pageButtons.map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-7 w-7 rounded-full text-xs ${
                            page === safePage
                              ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/60"
                              : "bg-slate-900 text-slate-300"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                    >
                      {translate("services.pagination.next")}
                    </button>
                    <span className="text-xs text-slate-500">
                      {translate("services.pagination.page")} {safePage} {translate("services.pagination.of")} {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeCategory.id === "taxi" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{translate({ en: "Seats:", uz: "O'rinlar:", ru: "Места:", ko: "좌석:" })}</span>
                    <select
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                      value={selectedSeat}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedSeat(value === "all" ? "all" : Number(value) as TaxiSeatCount);
                      }}
                    >
                      <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                      {taxiSeatOptions.map((seat) => (
                        <option key={seat} value={seat}>
                          {seat} {translate({ en: "seats", uz: "kishi", ru: "мест", ko: "명" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{translate({ en: "Type:", uz: "Tur:", ru: "Тип:", ko: "유형:" })}</span>
                    <select
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value as "all" | TaxiVehicleClass)}
                    >
                      <option value="all">{translate({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
                      {taxiClassOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                    {translate({
                      en: `${taxiAgents.length} agents found`,
                      uz: `${taxiAgents.length} ta agent topildi`,
                      ru: `Найдено ${taxiAgents.length} агент(ов)`,
                      ko: `${taxiAgents.length}명의 에이전트를 찾았습니다`
                    })}
                  </span>
                </div>
              </div>
            )}

            {activeCategory.id === "taxi" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-200">
                    {translate({ en: "Real-time order status", uz: "Real-time buyurtma holati", ru: "Статус заказа в реальном времени", ko: "실시간 주문 상태" })}
                  </p>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                    {formatSocketStatus(rideSocketStatus)}
                  </span>
                </div>
                {latestRide ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {translate({ en: "Ride ID", uz: "Ride ID", ru: "ID поездки", ko: "라이드 ID" })}
                      </p>
                      <p className="text-sm text-slate-100">{latestRide.rideId}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        {translate({ en: "Status", uz: "Holat", ru: "Статус", ko: "상태" })}
                      </p>
                      <p className="text-sm text-emerald-200">{formatRideStatus(latestRide.status)}</p>
                    </div>
                    {latestRide.pickupLocation && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {translate({ en: "From", uz: "Qayerdan", ru: "Откуда", ko: "출발지" })}
                        </p>
                        <p className="text-sm text-slate-200">{latestRide.pickupLocation}</p>
                      </div>
                    )}
                    {latestRide.dropoffLocation && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {translate({ en: "To", uz: "Qayerga", ru: "Куда", ko: "도착지" })}
                        </p>
                        <p className="text-sm text-slate-200">{latestRide.dropoffLocation}</p>
                      </div>
                    )}
                    {(latestRide.seatCount || latestRide.taxiClass) && (
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {latestRide.seatCount && (
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                            {latestRide.seatCount} {translate({ en: "seats", uz: "kishi", ru: "мест", ko: "명" })}
                          </span>
                        )}
                        {latestRide.taxiClass && (
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                            {formatTaxiClassLabel(latestRide.taxiClass as TaxiVehicleClass)}
                          </span>
                        )}
                      </div>
                    )}
                    {(latestRide.offeredFare || latestRide.estimatedFare || latestRide.finalFare) && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {translate({ en: "Price", uz: "Narx", ru: "Цена", ko: "가격" })}
                        </p>
                        <p className="text-sm text-slate-100">
                          {latestRide.finalFare
                            ? `${formatCount(latestRide.finalFare)} ${latestRide.currency || "UZS"}`
                            : latestRide.offeredFare
                            ? `${formatCount(latestRide.offeredFare)} ${latestRide.currency || "UZS"}`
                            : latestRide.estimatedFare
                            ? `${formatCount(latestRide.estimatedFare)} ${latestRide.currency || "UZS"}`
                            : "—"}
                        </p>
                      </div>
                    )}
                    {["assigned", "taken"].includes(latestRide.status) && (
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleConfirmRide}
                          className="rounded-full bg-emerald-400/20 px-4 py-1 text-xs text-emerald-200"
                          disabled={rideSocketStatus !== "open"}
                        >
                          {translate({ en: "Confirm ride", uz: "Safarni tasdiqlash", ru: "Подтвердить поездку", ko: "탑승 확정" })}
                        </button>
                        {rideSocketStatus !== "open" && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {translate({
                              en: "Real-time connection is required to confirm.",
                              uz: "Tasdiqlash uchun real-time ulanish kerak.",
                              ru: "Для подтверждения нужен real-time канал.",
                              ko: "확인하려면 실시간 연결이 필요합니다."
                            })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    {translate({
                      en: "No real-time orders yet.",
                      uz: "Hozircha real-time buyurtma yo'q.",
                      ru: "Пока нет заказов в реальном времени.",
                      ko: "현재 실시간 주문이 없습니다."
                    })}
                  </p>
                )}
              </div>
            )}

            {isTranslationCategory && translationFeatured.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-100">
                    {translate({
                      en: "Top-rated translators",
                      uz: "Eng yuqori baholangan tarjimonlar",
                      ru: "Переводчики с высоким рейтингом",
                      ko: "최고 평점 번역사"
                    })}
                  </p>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-200">
                    TOP 10
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {translationFeatured.map((service) => renderServiceCard(service, "top-"))}
                </div>
              </div>
            )}

            {(!isTranslationCategory || pagedServices.length > 0) && (
              <div className="grid gap-4 lg:grid-cols-2">
                {pagedServices.map((service) => renderServiceCard(service))}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
