"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dayjs from "@/lib/dayjs";
import {
  getCategoryImagePool,
  serviceCatalog,
  type ServiceAgent,
  type ServiceCategory,
  type ServiceItem
} from "@/data/serviceCatalog";
import { useAuthStore } from "@/store/auth";
import { isDetailSaved, reportDetailTarget, toggleDetailSaved } from "@/api/detailInteractions";
import { getLatestServices, getServiceById, type TrendService } from "@/api/services";
import {
  createServiceOrder,
  getServiceReactionSummary,
  sendServiceChatMessage,
  startServiceChat,
  toggleServiceReaction,
  type ChatMessage,
  type ChatThread,
  type ServiceReactionKind
} from "@/api/serviceInteractions";
import { DetailActionSidebar, DetailSidebarCard } from "@/components/detail/DetailActionSidebar";
import { DetailPrimaryActions } from "@/components/detail/DetailPrimaryActions";
import { FeedbackWidget } from "@/components/detail/FeedbackWidget";
import { InquiryComposer } from "@/components/detail/InquiryComposer";
import { RequestFormPanel } from "@/components/detail/RequestFormPanel";
import { SellerAgentCard } from "@/components/detail/SellerAgentCard";
import { AvailabilityBlock } from "@/components/service-detail/caregiver/AvailabilityBlock";
import { BookingActions } from "@/components/service-detail/caregiver/BookingActions";
import { CaregiverHero } from "@/components/service-detail/caregiver/CaregiverHero";
import { CaregiverProcess } from "@/components/service-detail/caregiver/CaregiverProcess";
import { CaregiverProfileCard } from "@/components/service-detail/caregiver/CaregiverProfileCard";
import { CaregiverReviews } from "@/components/service-detail/caregiver/CaregiverReviews";
import { RelatedCaregivers } from "@/components/service-detail/caregiver/RelatedCaregivers";
import { ServicePrice } from "@/components/service-detail/caregiver/ServicePrice";
import { TrustBadges } from "@/components/service-detail/caregiver/TrustBadges";
import type {
  CaregiverAvailabilityDay,
  CaregiverProcessStep,
  CaregiverTrustBadgeItem
} from "@/components/service-detail/caregiver/types";
import { CreativeServiceHero } from "@/components/service-detail/creative/CreativeServiceHero";
import { CreatorSidebarCard } from "@/components/service-detail/creative/CreatorSidebarCard";
import { DeliverablesSection } from "@/components/service-detail/creative/DeliverablesSection";
import { PortfolioItemPreviewModal } from "@/components/service-detail/creative/PortfolioItemPreviewModal";
import { PortfolioShowcaseGrid } from "@/components/service-detail/creative/PortfolioShowcaseGrid";
import { ServicePackageSummary } from "@/components/service-detail/creative/ServicePackageSummary";
import { ServicePrimaryActions } from "@/components/service-detail/creative/ServicePrimaryActions";
import { ServiceProcessSection } from "@/components/service-detail/creative/ServiceProcessSection";
import type {
  CreativeDeliverable,
  CreativePortfolioItem,
  CreativeProcessStep,
  CreativeStat
} from "@/components/service-detail/creative/types";
import { ServiceActions } from "@/components/service-detail/ServiceActions";
import { ServiceAgentCard } from "@/components/service-detail/ServiceAgentCard";
import { ServiceGallery } from "@/components/service-detail/ServiceGallery";
import { ServiceHeader } from "@/components/service-detail/ServiceHeader";
import { ServiceRelated } from "@/components/service-detail/ServiceRelated";
import { ServiceReviews } from "@/components/service-detail/ServiceReviews";
import { ConfidentialityBanner } from "@/components/service-detail/ConfidentialityBanner";
import { IncludedExcludedBlock } from "@/components/service-detail/IncludedExcludedBlock";
import { PriceValueCard } from "@/components/service-detail/PriceValueCard";
import { ProviderMiniCard } from "@/components/service-detail/ProviderMiniCard";
import { SessionPlanBlock } from "@/components/service-detail/SessionPlanBlock";
import { TrustSidebar } from "@/components/service-detail/TrustSidebar";
import { UploadFirstCTA } from "@/components/service-detail/UploadFirstCTA";
import { VerticalDetailShell } from "@/components/service-detail/VerticalDetailShell";
import { VerticalProcessBlock } from "@/components/service-detail/VerticalProcessBlock";
import { AgentSummaryCard } from "@/components/service-detail/system/AgentSummaryCard";
import { PrimaryActionPanel } from "@/components/service-detail/system/PrimaryActionPanel";
import { QuickInquiryPanel } from "@/components/service-detail/system/QuickInquiryPanel";
import { RelatedServicesSection } from "@/components/service-detail/system/RelatedServicesSection";
import { ServiceDescriptionBlock } from "@/components/service-detail/system/ServiceDescriptionBlock";
import { ServiceDetailShell } from "@/components/service-detail/system/ServiceDetailShell";
import { ServiceHeroGallery } from "@/components/service-detail/system/ServiceHeroGallery";
import { ServiceProcessGallery } from "@/components/service-detail/system/ServiceProcessGallery";
import { ServiceSpecTable } from "@/components/service-detail/system/ServiceSpecTable";
import { ServiceTrustPanel } from "@/components/service-detail/system/ServiceTrustPanel";
import { normalizeImageUrl } from "@/lib/imageUrl";
import { Avatar } from "@/components/ui/Avatar";
import type { DetailContactMethod, DetailReview, DetailTrustIndicator, RelatedDetailItem } from "@/components/service-detail/types";

type ServiceRecord = {
  service: ServiceItem;
  agent: ServiceAgent;
  category: ServiceCategory;
  groupTitle: string;
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const ServiceImageGrid = ({ images }: { images: { src: string; alt: string }[] }) => (
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {images.map((image) => (
      <img
        key={`service-img-${image.src}`}
        src={image.src}
        alt={image.alt}
        className="h-40 w-full rounded-xl object-cover"
        loading="lazy"
      />
    ))}
  </div>
);
const hashValue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};

const formatMarketplacePrice = (amount?: number | null, currency?: string) => {
  if (!Number.isFinite(amount)) return "Kelishiladi";
  return `${formatCount(Number(amount))} ${currency || "USD"}`;
};

const resolveMarketplacePeriod = (service: TrendService) => {
  const kind = String(service.kind || "").toLowerCase();
  if (kind.includes("week")) return "haftasiga";
  if (kind.includes("day")) return "kuniga";
  if (service.hourlyRate) return "soatiga";
  return "xizmat uchun";
};

const buildRemoteServiceGallery = (service: TrendService) => {
  const seen = new Set<string>();
  const candidates = [
    service.coverImageUrl,
    service.image,
    service.thumbnail,
    service.coverImage,
    service.imageUrl,
    ...(service.images || [])
  ];

  const gallery = candidates.reduce<Array<{ src: string; alt: string }>>((acc, candidate, index) => {
    const normalized = normalizeImageUrl(candidate);
    if (!normalized || seen.has(normalized)) return acc;
    seen.add(normalized);
    acc.push({
      src: normalized,
      alt: index === 0 ? service.title : `${service.title} ${acc.length + 1}`
    });
    return acc;
  }, []);

  return gallery;
};

const resolveCreativeOfferShape = (service: ServiceItem) => {
  const title = service.title.toLowerCase();

  if (title.includes("video")) {
    return {
      subtitle: "Ssenariy, suratga olish va montajni bir flow ichida boshqarib, brendga mos video creative tayyorlanadi.",
      deliveryTime: "2-4 kun",
      revisions: "2 ta revisiya",
      unitLabel: "1 kampaniya creative paketi",
      included: ["1 asosiy video creative", "3 hook varianti", "CTA caption", "9:16 MP4 export"],
      deliverables: [
        { label: "Video copy", value: "1 asosiy script", hint: "Hook, benefit, CTA strukturasida yoziladi." },
        { label: "Captionlar", value: "3 variant", hint: "Ads, post yoki reel matni sifatida ishlatish mumkin." },
        { label: "Creative angles", value: "3 g'oya", hint: "Turli audience segmentlari uchun taklif qilinadi." },
        { label: "Final files", value: "MP4 + caption doc", hint: "Publish-ready formatda topshiriladi." }
      ] satisfies CreativeDeliverable[]
    };
  }

  if (title.includes("story")) {
    return {
      subtitle: "Story flow, CTA va joylashtirish ketma-ketligi oldindan o'ylangan, tez ishga tushadigan reklama paketi.",
      deliveryTime: "24-48 soat",
      revisions: "2 ta revisiya",
      unitLabel: "3 ta story creative to'plami",
      included: ["3 story frame", "Swipe CTA copy", "Link placement note", "Story-ready caption"],
      deliverables: [
        { label: "Story frame", value: "3 dona", hint: "Opening, offer va CTA frame formatida." },
        { label: "Swipe-up copy", value: "2 variant", hint: "Click-through uchun qisqa va aniq yozuvlar." },
        { label: "Content idea", value: "1 mini-flow", hint: "Ketma-ket joylash tartibi bilan beriladi." },
        { label: "Final files", value: "PNG/JPG + text", hint: "Story upload uchun tayyor." }
      ] satisfies CreativeDeliverable[]
    };
  }

  if (title.includes("sharh") || title.includes("review")) {
    return {
      subtitle: "Mahsulotni ishonchli ko'rsatadigan review kontent, cover copy va komment triggerlar bilan beriladi.",
      deliveryTime: "2-3 kun",
      revisions: "1 ta revisiya",
      unitLabel: "Review post paketi",
      included: ["1 review post", "Benefit copy", "Comment trigger", "Content notes"],
      deliverables: [
        { label: "Review text", value: "1 asosiy sharh", hint: "Mahsulot benefit va UX nuqtalari yoritiladi." },
        { label: "Captionlar", value: "2 variant", hint: "Soft-sell va CTA yo'nalishlarida." },
        { label: "Angles", value: "5 talking points", hint: "Komment va follow-up uchun foydalaniladi." },
        { label: "Final files", value: "Text + posting notes", hint: "Platformaga moslashtirilgan holatda." }
      ] satisfies CreativeDeliverable[]
    };
  }

  return {
    subtitle: "Copy, caption va kontent strukturasini brend ovoziga moslab tayyorlaydigan portfolio-backed creative xizmat.",
    deliveryTime: "1-2 kun",
    revisions: "2 ta revisiya",
    unitLabel: "Copy / content deliverable paketi",
    included: ["3 ad copy varianti", "5 caption g'oyasi", "2 CTA line", "Final text file"],
    deliverables: [
      { label: "Text copies", value: "3 variant", hint: "A/B test uchun turli uslublarda yoziladi." },
      { label: "Captionlar", value: "5 dona", hint: "Reel, post va story uchun moslashtiriladi." },
      { label: "Campaign text", value: "1 asosiy message", hint: "Offer positioning va brand tone birlashtiriladi." },
      { label: "Final files", value: "DOC / social-ready text", hint: "Jamoa yoki mijozga topshirish uchun tayyor." }
    ] satisfies CreativeDeliverable[]
  };
};

const buildCreativePortfolioItems = (
  service: ServiceItem,
  agent: ServiceAgent,
  posts: { src: string; alt: string }[],
  stats: Array<{ likes: number; dislikes: number; comments: number; shares: number }>
): CreativePortfolioItem[] => {
  const title = service.title.toLowerCase();
  const contentTypes = title.includes("video")
    ? ["Video", "Campaign", "Hook", "Edit", "Cutdown", "CTA"]
    : title.includes("story")
      ? ["Story", "CTA", "Post", "Banner", "Campaign", "UGC"]
      : title.includes("sharh")
        ? ["Review", "Post", "Copy", "Social", "Campaign", "Comment"]
        : ["Copy", "Post", "Banner", "Campaign", "Caption", "Angle"];

  return posts.map((post, index) => {
    const stat = stats[index];
    const views = Math.max(1200, (stat?.likes ?? 0) * 24 + (stat?.shares ?? 0) * 11 + index * 130);
    const saves = Math.max(40, (stat?.comments ?? 0) * 3 + index * 7);
    const badge = contentTypes[index % contentTypes.length];
    const mediaKind = badge === "Video" || badge === "Edit" || badge === "Cutdown" || badge === "UGC" ? "video" : "image";

    return {
      id: `${service.id}-portfolio-${index + 1}`,
      title: `${service.title} showcase ${index + 1}`,
      summary:
        `${agent.name} uslubidagi ${badge.toLowerCase()} namunasi. Brend tone, CTA va audience fit shu preview orqali ko'rsatiladi.`,
      mediaSrc: post.src,
      mediaAlt: post.alt,
      mediaKind,
      badge,
      projectType: title.includes("video") ? "Launch creative" : title.includes("story") ? "Story funnel" : "Performance content",
      clientLabel: index % 2 === 0 ? "Commercial sample" : "Portfolio proof",
      metrics: [
        { label: "Views", value: formatCount(views) },
        { label: "Saves", value: formatCount(saves) },
        { label: "Engagement", value: `${Math.max(3.8, (4.1 + index * 0.2)).toFixed(1)}%` },
        { label: "Format", value: badge }
      ]
    };
  });
};

const buildCreativeReviews = (service: ServiceItem, agent: ServiceAgent): DetailReview[] => [
  {
    id: `${service.id}-creative-review-1`,
    author: "Malohat B.",
    role: "Brand manager",
    rating: service.rating,
    text: `${agent.name} brend uchun tone va CTAni tez ushladi. Copy va creative previewlar ichidan tanlash oson bo'ldi, revisiya jarayoni ham juda aniq edi.`,
    dateLabel: "2 hafta oldin"
  },
  {
    id: `${service.id}-creative-review-2`,
    author: "Daeho K.",
    role: "Startup founder",
    rating: Math.max(4, Number((service.rating - 0.1).toFixed(1))),
    text: "Portfolio ichidagi misollar sabab expectation boshidan aniq bo'ldi. Yakuniy topshiriq reklama uchun bevosita ishlatishga tayyor holatda topshirildi.",
    dateLabel: "1 oy oldin"
  },
  {
    id: `${service.id}-creative-review-3`,
    author: "Nodira S.",
    role: "E-commerce lead",
    rating: Math.max(4, Number((service.rating - 0.2).toFixed(1))),
    text: "Briefdan keyin kontent g'oyalari tez chiqdi, caption va CTA variantlari conversion maqsadiga mos yozilgan.",
    dateLabel: "6 hafta oldin"
  }
];

const buildCreativeProcess = (deliveryTime: string): CreativeProcessStep[] => [
  {
    step: "Brief",
    title: "Mijoz brief yuboradi",
    description: "Maqsad, auditoriya, platforma va offer tafsilotlari yig'iladi.",
    eta: "Boshlanish"
  },
  {
    step: "Creative prep",
    title: "Creator kontentni tayyorlaydi",
    description: "Script, angle, caption va portfolio-style preview tayyorlanadi.",
    eta: deliveryTime
  },
  {
    step: "Review",
    title: "Revisions va approval",
    description: "Tanlangan yo'nalish bo'yicha tuzatishlar kiritiladi va final versiya tasdiqlanadi.",
    eta: "Revisiya"
  },
  {
    step: "Delivery",
    title: "Final topshiriladi",
    description: "Publish-ready file, text yoki media format mijozga platforma orqali beriladi.",
    eta: "Final"
  }
];

const UZ_WEEKDAYS = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Yak"];

const buildCaregiverAvailableDays = (slots: string[]) => {
  if (slots.some((item) => item.includes("24/7"))) return UZ_WEEKDAYS;
  if (slots.length > 1) return ["Du", "Se", "Cho", "Pa", "Ju", "Sha"];
  return ["Du", "Se", "Cho", "Pa", "Ju"];
};

const buildCaregiverCalendar = (availableDays: string[]): CaregiverAvailabilityDay[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + index);
    const dayLabel = UZ_WEEKDAYS[(nextDate.getDay() + 6) % 7];
    return {
      key: `${dayLabel}-${index}`,
      label: dayLabel,
      dateLabel: `${nextDate.getDate()}.${String(nextDate.getMonth() + 1).padStart(2, "0")}`,
      available: availableDays.includes(dayLabel)
    };
  });
};

const resolveCaregiverPricingModel = (unit: string) => {
  const normalized = unit.toLowerCase();
  if (normalized.includes("tun")) return "Tungi navbatchilik / tunlik tarif";
  if (normalized.includes("kun")) return "Kunlik parvarish modeli";
  if (normalized.includes("hafta")) return "Haftalik parvarish modeli";
  if (normalized.includes("soat")) return "Soatbay bron qilish";
  return `${unit} bo'yicha kelishiladi`;
};

const buildCaregiverHourOptions = (unit: string) => {
  const normalized = unit.toLowerCase();
  if (normalized.includes("tun")) return ["12 soat", "24 soat", "48 soat"];
  if (normalized.includes("kun")) return ["4 soat", "8 soat", "12 soat", "24 soat"];
  if (normalized.includes("hafta")) return ["1 hafta", "2 hafta", "4 hafta"];
  return ["2 soat", "4 soat", "6 soat", "8 soat"];
};

const buildCaregiverReviews = (service: ServiceItem, agent: ServiceAgent, careFocus: string[]): DetailReview[] => [
  {
    id: `${service.id}-caregiver-review-1`,
    author: "Nilufar R.",
    role: "Ona",
    rating: service.rating,
    text: `${agent.name} bolaga tez moslashdi, kunlik hisobot va xavfsizlik masalalarida aniq ishladi. ${careFocus[0] || "Parvarish"} bo'yicha tajribasi sezildi.`,
    dateLabel: "2 hafta oldin"
  },
  {
    id: `${service.id}-caregiver-review-2`,
    author: "Kim Soo-yeon",
    role: "Parent",
    rating: Math.max(4, Number((service.rating - 0.1).toFixed(1))),
    text: "Working hours va kelishuvlar oldindan aniq belgilandi. First aid va daily routine bo'yicha ishonch berdi.",
    dateLabel: "1 oy oldin"
  },
  {
    id: `${service.id}-caregiver-review-3`,
    author: "Dilnoza T.",
    role: "Ota-ona",
    rating: Math.max(4, Number((service.rating - 0.2).toFixed(1))),
    text: "Bron qilish jarayoni tez bo'ldi, chat orqali savollarimizga javob oldik. Uyqu, ovqatlanish va o'yin rejasi yaxshi yuritildi.",
    dateLabel: "6 hafta oldin"
  }
];

const buildCaregiverProcess = (): CaregiverProcessStep[] => [
  {
    step: "Brief",
    title: "Oilaviy ehtiyoj yuboriladi",
    description: "Bolaning yoshi, kun tartibi, sana va parvarish lokatsiyasi ko'rsatiladi."
  },
  {
    step: "Match",
    title: "Enaga mosligi tasdiqlanadi",
    description: "Availability, tajriba va xavfsizlik mezonlari bo'yicha moslik tekshiriladi."
  },
  {
    step: "Booking",
    title: "Bron so'rovi yuboriladi",
    description: "Rasmiy booking request chatdan alohida yuboriladi va kontaktlar ochiladi."
  },
  {
    step: "Care",
    title: "Parvarish boshlanadi",
    description: "Tasdiqlangan jadval bo'yicha enaga ishni boshlaydi va ota-onaga update beradi."
  }
];
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
const getAvailabilityLabel = (agent: ServiceAgent) => {
  const options = [
    { id: "today", label: "Bugun bo'sh" },
    { id: "48h", label: "48 soat ichida" },
    { id: "soon", label: "Tez orada" }
  ];
  const seed = hashValue(agent.id || agent.name);
  return options[seed % options.length];
};

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

const operationalCategoryIds = new Set(["taxi", "delivery", "technical", "construction", "moving", "cleaning"]);

const resolveOperationalPricingModel = (categoryId: string, unit: string) => {
  const normalized = unit.toLowerCase();
  if (categoryId === "taxi") {
    if (normalized.includes("soat")) return "soatlik tarif";
    if (normalized.includes("trip") || normalized.includes("reys")) return "reys uchun";
    return "safar / transfer uchun";
  }
  if (categoryId === "delivery") {
    if (normalized.includes("kg")) return "kg bo'yicha";
    return "yetkazish turi bo'yicha";
  }
  if (categoryId === "moving") return "ko'chirish paketi bo'yicha";
  if (normalized.includes("soat")) return "soatiga";
  if (normalized.includes("kun")) return "kuniga";
  if (normalized.includes("hafta")) return "haftasiga";
  if (normalized.includes("oy")) return "oyiga";
  return `${unit} uchun`;
};

const resolveResponseSpeedLabel = (agent: ServiceAgent) => {
  if (agent.experienceYears >= 8) return "~20 daqiqa";
  if (agent.experienceYears >= 5) return "~45 daqiqa";
  if (agent.experienceYears >= 3) return "~1 soat";
  return "~2 soat";
};

const buildOperationalSubtitle = (categoryId: string, service: ServiceItem, agent: ServiceAgent) => {
  switch (categoryId) {
    case "taxi":
      return `${vehicleClassLabel(agent.vehicleClass) || "Transport"} xizmati, hudud qamrovi va ichki chat bilan tez bron qilinadigan transfer taklifi.`;
    case "delivery":
      return "Yo'nalish, sig'im va xavfsiz aloqa oqimi bir joyda ko'rsatilgan yetkazib berish xizmati.";
    case "moving":
      return "Ko'chirish brigadasi, yuk sig'imi va jihozlar aniq ko'rsatilgan conversion-focused moving detail sahifasi.";
    case "cleaning":
      return "Tozalash scope, ishlatiladigan jihozlar va xizmat standarti aniq tushuntirilgan premium service sahifasi.";
    case "construction":
      return "Usta profili, sertifikatlar va ish jarayoni ko'rinadigan trust-first qurilish va ta'mirlash detail layout.";
    case "technical":
      return "Diagnostika, asbob-uskunalar va xizmat kafolati bilan category-aware texnik servis taqdimoti.";
    default:
      return `${service.title} uchun narx, process, trust va rasmiy so'rov oqimini birlashtirgan marketplace detail page.`;
  }
};

const buildOperationalHighlights = (categoryId: string, service: ServiceItem, agent: ServiceAgent) => {
  const base = [
    `${formatCount(service.price)} ${service.currency} boshlang'ich narx`,
    `${agent.experienceYears} yil tajriba`,
    `${resolveResponseSpeedLabel(agent)} javob tezligi`
  ];

  switch (categoryId) {
    case "taxi":
      return [
        `${vehicleClassLabel(agent.vehicleClass) || "Transport"} klassi`,
        `${agent.seatCount || "Moslashuvchan"} o'rin`,
        `${agent.region || agent.location} bo'ylab xizmat`,
        ...base
      ];
    case "delivery":
      return [
        `${agent.region || agent.location} qamrovi`,
        `${agent.completedOrders ?? service.usedCount} ta bajarilgan buyurtma`,
        "Ichki chat + rasmiy so'rov alohida",
        ...base
      ];
    case "moving":
      return [
        `${agent.movingTruckType || "Yuk transporti"} bilan ishlaydi`,
        `${agent.movingCapacityTons ? `${agent.movingCapacityTons} tonnagacha` : "Sig'im aniqlashtiriladi"}`,
        "Yuklash va tushirish flow bilan",
        ...base
      ];
    case "cleaning":
      return [
        `${agent.specialty || "Professional cleaning"} specialization`,
        `${(agent.equipment || []).length || 1} ta asosiy jihoz / vosita`,
        "Uy va ofis scope uchun mos",
        ...base
      ];
    case "construction":
      return [
        `${agent.specialty || "Qurilish xizmati"} specialization`,
        `${(agent.equipment || []).length || 1} ta texnika / jihoz`,
        `${service.certificates.length || 1} ta sertifikat`,
        ...base
      ];
    case "technical":
      return [
        `${agent.specialty || "Texnik servis"} yo'nalishi`,
        `${(agent.equipment || []).length || 1} ta asbob-uskunalar`,
        "Diagnostika va follow-up qo'llab-quvvatlash",
        ...base
      ];
    default:
      return base;
  }
};

const buildOperationalSpecs = (categoryId: string, service: ServiceItem, agent: ServiceAgent) => {
  const rows = [
    {
      label: "Narx modeli",
      value: `${formatCount(service.price)} ${service.currency} / ${service.unit}`,
      hint: resolveOperationalPricingModel(categoryId, service.unit),
      tone: "emerald" as const
    },
    {
      label: "Bajarilgan ishlar",
      value: formatCount(agent.completedOrders ?? service.usedCount),
      hint: "Platformadagi tarixiy use / order ko'rsatkichi.",
      tone: "sky" as const
    },
    {
      label: "Reyting",
      value: `${service.rating.toFixed(1)} / 5`,
      hint: `${formatCount(service.reviewCount)} ta baho`,
      tone: "amber" as const
    },
    {
      label: "Javob tezligi",
      value: resolveResponseSpeedLabel(agent),
      hint: "Quick inquiry chat orqali tezkor aloqa.",
      tone: "sky" as const
    },
    {
      label: "Qamrov hududi",
      value: agent.region || agent.location,
      hint: agent.regionDetail || "Hudud va lokatsiya bo'yicha ishlaydi.",
      tone: "slate" as const
    }
  ];

  switch (categoryId) {
    case "taxi":
      return [
        rows[0],
        {
          label: "Transport",
          value: vehicleClassLabel(agent.vehicleClass) || "Ko'rsatilmagan",
          hint: agent.vehicleModel || "Model aniqlashtiriladi.",
          tone: "sky" as const
        },
        {
          label: "Salon sig'imi",
          value: agent.seatCount ? `${agent.seatCount} o'rin` : "Moslashuvchan",
          hint: agent.vehicleOptions?.slice(0, 3).join(", ") || "Qo'shimcha qulayliklar so'rovda aniqlanadi.",
          tone: "slate" as const
        },
        rows[2],
        rows[3],
        rows[4]
      ];
    case "delivery":
      return [
        rows[0],
        {
          label: "Yetkazish kanali",
          value: agent.vehicleModel || agent.specialty,
          hint: agent.vehicleOptions?.slice(0, 3).join(", ") || "Transport detali so'rovda tasdiqlanadi.",
          tone: "sky" as const
        },
        {
          label: "Kontakt readiness",
          value: agent.contactTelegram ? "Telegram + chat" : "Internal chat",
          hint: "Rasmiy so'rov bilan kontaktlar unlock bo'ladi.",
          tone: "slate" as const
        },
        rows[1],
        rows[3],
        rows[4]
      ];
    case "moving":
      return [
        rows[0],
        {
          label: "Truck type",
          value: agent.movingTruckType || "Yuk transporti",
          hint: "Ko'chirish scopega mos transport turi.",
          tone: "sky" as const
        },
        {
          label: "Yuk sig'imi",
          value: agent.movingCapacityTons ? `${agent.movingCapacityTons} tonna` : "Aniqlashtiriladi",
          hint: "Og'ir yuklar uchun capacity alohida tekshiriladi.",
          tone: "amber" as const
        },
        rows[1],
        rows[3],
        rows[4]
      ];
    case "cleaning":
      return [
        rows[0],
        {
          label: "Specialization",
          value: agent.specialty,
          hint: "Tozalash turi va service scope ko'rsatiladi.",
          tone: "sky" as const
        },
        {
          label: "Tools / equipment",
          value: agent.equipment?.slice(0, 3).join(", ") || "Professional cleaning kit",
          hint: "Kimyo va jihozlar request oldidan kelishiladi.",
          tone: "slate" as const
        },
        rows[2],
        rows[3],
        rows[4]
      ];
    case "construction":
      return [
        rows[0],
        {
          label: "Mutaxassislik",
          value: agent.specialty,
          hint: "Qurilish, tom, fasad yoki repair yo'nalishi.",
          tone: "sky" as const
        },
        {
          label: "Sertifikatlar",
          value: service.certificates.slice(0, 2).join(", ") || "Mavjud",
          hint: service.certificates.slice(2).join(", ") || "Qo'shimcha malaka so'rovda beriladi.",
          tone: "amber" as const
        },
        rows[1],
        rows[3],
        rows[4]
      ];
    case "technical":
      return [
        rows[0],
        {
          label: "Service scope",
          value: agent.specialty,
          hint: "Diagnostika, ta'mir va servis yo'nalishi.",
          tone: "sky" as const
        },
        {
          label: "Asbob-uskunalar",
          value: agent.equipment?.slice(0, 3).join(", ") || "Diagnostika vositalari",
          hint: "Zarur apparatlar va ehtiyot qismlar bilan ishlaydi.",
          tone: "slate" as const
        },
        rows[1],
        rows[3],
        rows[4]
      ];
    default:
      return rows;
  }
};

const buildOperationalTrustIndicators = (categoryId: string, service: ServiceItem, agent: ServiceAgent): DetailTrustIndicator[] => {
  const common: DetailTrustIndicator[] = [
    {
      label: "Tasdiq",
      value: agent.verified ? "Tekshirilgan agent" : "Tasdiq kutilmoqda",
      tone: agent.verified ? "emerald" : "amber"
    },
    {
      label: "Tajriba",
      value: `${agent.experienceYears} yil · ${agent.specialty}`,
      tone: "sky"
    },
    {
      label: "Aloqa",
      value: "UniServe secure chat + structured request",
      tone: "sky"
    }
  ];

  if (categoryId === "taxi") {
    common.push({
      label: "Transport",
      value: `${vehicleClassLabel(agent.vehicleClass) || "Transfer"} · ${agent.seatCount || "moslashuvchan"} o'rin`,
      tone: "amber"
    });
    return common;
  }

  if (categoryId === "moving") {
    common.push({
      label: "Sig'im",
      value: agent.movingCapacityTons ? `${agent.movingCapacityTons} tonnagacha` : "Scope asosida hisoblanadi",
      tone: "amber"
    });
    return common;
  }

  if (categoryId === "cleaning" || categoryId === "technical" || categoryId === "construction") {
    common.push({
      label: "Jihozlar",
      value: agent.equipment?.slice(0, 3).join(", ") || service.certificates.slice(0, 2).join(", ") || "Professional toolkit",
      tone: "amber"
    });
    return common;
  }

  common.push({
    label: "Coverage",
    value: agent.region || agent.location,
    tone: "amber"
  });
  return common;
};

const buildOperationalGallerySections = (
  categoryId: string,
  serviceTitle: string,
  images: { src: string; alt: string }[],
  exterior: { src: string; alt: string }[],
  interior: { src: string; alt: string }[]
) => {
  const toItems = (items: { src: string; alt: string }[], prefix: string) =>
    items.map((item, index) => ({
      src: item.src,
      alt: item.alt,
      caption: `${prefix} ${index + 1} · ${serviceTitle}`
    }));

  if (categoryId === "taxi") {
    return [
      { title: "Tashqi ko'rinish", description: "Transport, kuzov va umumiy holat preview.", items: toItems(exterior, "Exterior") },
      { title: "Salon va qulaylik", description: "Ichki salon, o'rinlar va komfort elementlari.", items: toItems(interior, "Interior") }
    ].filter((section) => section.items.length > 0);
  }

  if (categoryId === "delivery") {
    return [
      {
        title: "Transport va route preview",
        description: "Yetkazish formati va ishlash flowini ko'rsatadigan media.",
        items: toItems(images.slice(0, 3), "Delivery")
      }
    ].filter((section) => section.items.length > 0);
  }

  if (categoryId === "moving") {
    return [
      {
        title: "Ko'chirish jarayoni",
        description: "Yuklash, joylashtirish va yetkazish bosqichlari.",
        items: toItems(images, "Moving")
      }
    ].filter((section) => section.items.length > 0);
  }

  if (categoryId === "cleaning") {
    return [
      {
        title: "Work examples",
        description: "Tozalash jarayoni va natija previewlari.",
        items: toItems(images, "Cleaning")
      }
    ].filter((section) => section.items.length > 0);
  }

  if (categoryId === "construction" || categoryId === "technical") {
    return [
      {
        title: "Jarayon va ish media",
        description: "Before/after, process va ishlatilgan jihozlar previewi.",
        items: toItems(images, "Process")
      }
    ].filter((section) => section.items.length > 0);
  }

  return [];
};

const buildOperationalReviews = (categoryId: string, service: ServiceItem, agent: ServiceAgent): DetailReview[] => {
  const templates = {
    taxi: [
      "Transfer vaqtida kelishilgan vaqtga qat'iy amal qilindi, salon toza va aloqa aniq edi.",
      "Bron oqimi tushunarli bo'ldi, ichki chat orqali barcha detallar tez kelishildi.",
      "Narx modeli oldindan aniq edi, haydovchi xizmat sifati barqaror."
    ],
    delivery: [
      "Route va topshirish tafsilotlari oldindan aniq ko'rsatildi, buyurtma xotirjam yopildi.",
      "Ichki chat va rasmiy request alohida bo'lgani uchun jarayon tartibli o'tdi.",
      "Xavfsizlik va javob tezligi jihatidan ishonchli delivery flow."
    ],
    moving: [
      "Ko'chirish kuni brigada vaqtida yetib keldi, yuklash va tushirish tartibli bo'ldi.",
      "Sig'im va transport oldindan to'g'ri baholandi, qo'shimcha surprise xarajat bo'lmadi.",
      "Yuk bilan ishlashda ehtiyotkorlik va communication kuchli bo'ldi."
    ],
    cleaning: [
      "Tozalash scope oldindan aniq kelishildi va natija kutilganidan yaxshiroq bo'ldi.",
      "Jihozlar professional, ish yakunida quality check qilingan.",
      "Xizmat tavsifi bilan real bajarilgan ish mos tushdi."
    ],
    construction: [
      "Ish jarayoni bosqichma-bosqich tushuntirildi, material va vaqt bo'yicha aniq hisob berildi.",
      "Sertifikat va oldingi ish media'lari qaror qilishga yordam berdi.",
      "Qurilish detail sahifasi bo'yicha barcha ishonch signallari joyida edi."
    ],
    technical: [
      "Diagnostika aniq bo'ldi, masala va yechim tushunarli qilib aytildi.",
      "Usta jihozlari va response speed conversion uchun ishonch berdi.",
      "Qayta murojaat uchun ham kontakt flow qulay va tartibli."
    ]
  } as Record<string, string[]>;

  const items = templates[categoryId] || templates.technical;
  return items.map((text, index) => ({
    id: `${service.id}-review-${index + 1}`,
    author: ["Mijoz", "Buyurtmachi", "Takroriy klient"][index] || "Mijoz",
    role: `${agent.specialty} bo'yicha mijoz`,
    rating: Math.max(4, Math.round(service.rating)),
    text,
    dateLabel: dayjs(service.createdAt).subtract(index + 1, "week").fromNow()
  }));
};

const buildOperationalRelatedItems = (category: ServiceCategory, service: ServiceItem, currentAgent: ServiceAgent): RelatedDetailItem[] =>
  category.agents
    .flatMap((categoryAgent) =>
      categoryAgent.services.map((item) => ({
        item,
        categoryAgent
      }))
    )
    .filter(({ item }) => item.id !== service.id)
    .slice(0, 3)
    .map(({ item, categoryAgent }) => ({
      id: item.id,
      href: `/services/${item.id}`,
      image: item.images[0]?.src || categoryAgent.avatar.src,
      title: item.title,
      subtitle: categoryAgent.name,
      priceLabel: `${formatCount(item.price)} ${item.currency} / ${item.unit}`,
      rating: item.rating,
      meta: `${categoryAgent.region || categoryAgent.location} · ${dayjs(item.createdAt).fromNow()}`,
      tag: currentAgent.specialty.split(" ")[0] || category.title
    }));

const buildKnowledgeReviews = (categoryId: string, service: ServiceItem, agent: ServiceAgent): DetailReview[] => {
  const templates: Record<string, string[]> = {
    consulting: [
      "Muammo quickly strukturalanib berildi, keyingi qadamlar aniq bo'ldi.",
      "Format va availability oldindan tushunarli ko'rsatilgani qaror qilishni osonlashtirdi.",
      "Chat va rasmiy request flow alohida bo'lgani jarayonni professional qildi."
    ],
    translation: [
      "Tarjima workflow'i deadline va format bo'yicha aniq tushuntirildi.",
      "Til juftligi va topshirish formati oldindan ko'rinib turishi ishonch berdi.",
      "Natija secure delivery blok bilan topshirilgani qulay bo'ldi."
    ],
    legal: [
      "Scope, included va excluded bo'limlari sabab expectation juda aniq bo'ldi.",
      "Confidentiality signallari va lawyer trust profile qarorni tezlashtirdi.",
      "Response flow va formal request jarayoni professional ko'rindi."
    ],
    psychology: [
      "Sahifa tinch, maxfiy va xavfsiz muhit hissini yaxshi berdi.",
      "Therapist haqida metod va sessiya flow bloklari ishonchni oshirdi.",
      "Chat va formal booking alohida bo'lgani chalkashlikni kamaytirdi."
    ],
    sport: [
      "Coach profili, session plan va expected outcome bir joyda ko'rinib turdi.",
      "Format, joy va progression support bloklari yozilish qarorini osonlashtirdi.",
      "Trial/package signallari conversion nuqtasini kuchaytirdi."
    ]
  };

  const items = templates[categoryId] || templates.consulting;
  return items.map((text, index) => ({
    id: `${service.id}-knowledge-review-${index + 1}`,
    author: ["Mijoz", "Buyurtmachi", "Takroriy klient"][index] || "Mijoz",
    role: `${agent.specialty} bo'yicha mijoz`,
    rating: Math.max(4, Math.round(service.rating)),
    text,
    dateLabel: dayjs(service.createdAt).subtract(index + 1, "week").fromNow()
  }));
};

const buildKnowledgeRelatedItems = (
  category: ServiceCategory,
  service: ServiceItem,
  currentAgent: ServiceAgent
): RelatedDetailItem[] =>
  category.agents
    .flatMap((categoryAgent) =>
      categoryAgent.services.map((item, index) => ({
        item,
        categoryAgent,
        index
      }))
    )
    .filter(({ item }) => item.id !== service.id)
    .slice(0, 3)
    .map(({ item, categoryAgent, index }) => ({
      id: item.id,
      href: `/services/${item.id}`,
      image: item.images[0]?.src || categoryAgent.avatar.src,
      title: item.title,
      subtitle: categoryAgent.name,
      priceLabel: `${formatCount(item.price)} ${item.currency} / ${item.unit}`,
      rating: item.rating,
      meta: `${categoryAgent.region || categoryAgent.location} · ${dayjs(item.createdAt).fromNow()}`,
      tag: currentAgent.specialty.split(" ")[0] || category.title || String(index + 1)
    }));

const FALLBACK_CATEGORY_BY_SERVICE_ID: Record<string, string> = {
  "build-brick-1": "construction",
  "build-brick-2": "construction",
  "build-brick-3": "construction"
};

const normalizeCatalogImageSrc = (
  src: string | undefined,
  serviceId: string,
  imageIndex: number,
  fallbackCategory: string
) => {
  const raw = (src || "").trim();
  if (!raw) {
    const pool = getCategoryImagePool(fallbackCategory);
    return pool[imageIndex % pool.length]?.src || "/placeholder.png";
  }
  if (!raw.startsWith("/images/remote/remote-")) return raw;

  const match = raw.match(/remote-(\d{4})\.jpg$/i);
  if (!match) return "/placeholder.png";
  const pool = getCategoryImagePool(fallbackCategory);
  const remoteNumber = Number(match[1]);
  const safeIndex = Number.isFinite(remoteNumber) ? remoteNumber % pool.length : imageIndex % pool.length;
  return pool[safeIndex]?.src || "/placeholder.png";
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
  const searchParams = useSearchParams();
  const routeId = useMemo(() => String(params?.id || ""), [params]);
  const [apiService, setApiService] = useState<TrendService | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [relatedRemoteServices, setRelatedRemoteServices] = useState<TrendService[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [showChat, setShowChat] = useState(false);
  const [serviceChatOpen, setServiceChatOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showServiceOrderForm, setShowServiceOrderForm] = useState(false);
  const [serviceOrderDraft, setServiceOrderDraft] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    destinationAddress: "",
    note: ""
  });
  const [serviceReaction, setServiceReaction] = useState<{
    likes: number;
    dislikes: number;
    reaction: ServiceReactionKind | null;
  }>({
    likes: 0,
    dislikes: 0,
    reaction: null
  });
  const [serviceReactionLoading, setServiceReactionLoading] = useState(false);
  const [serviceChatThread, setServiceChatThread] = useState<ChatThread | null>(null);
  const [serviceChatMessages, setServiceChatMessages] = useState<ChatMessage[]>([]);
  const [serviceChatDraft, setServiceChatDraft] = useState("");
  const [serviceChatLoading, setServiceChatLoading] = useState(false);
  const [serviceChatSending, setServiceChatSending] = useState(false);
  const serviceChatThreadRequestRef = useRef<Promise<ChatThread> | null>(null);
  const [activePortfolioItem, setActivePortfolioItem] = useState<CreativePortfolioItem | null>(null);
  const [caregiverBookingDate, setCaregiverBookingDate] = useState("");
  const [caregiverBookingHours, setCaregiverBookingHours] = useState("");
  const [saved, setSaved] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchTopic, setMatchTopic] = useState("");
  const [matchDescription, setMatchDescription] = useState("");
  const [matchLanguage, setMatchLanguage] = useState("UZ");
  const [matchDeadline, setMatchDeadline] = useState("");
  const [matchFormat, setMatchFormat] = useState("chat");
  const [matchConsent, setMatchConsent] = useState(false);
  const [matchStatus, setMatchStatus] = useState<"idle" | "sent" | "accepted" | "declined" | "need">("idle");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [consultingCurrency, setConsultingCurrency] = useState<"UZS" | "KRW">("UZS");
  const [translationUploadOpen, setTranslationUploadOpen] = useState(false);
  const [translationStep, setTranslationStep] = useState(1);
  const [translationFiles, setTranslationFiles] = useState<Array<{ file: File; note: string }>>([]);
  const [translationOfficialChoice, setTranslationOfficialChoice] = useState("oddiy");
  const [translationSpeedChoice, setTranslationSpeedChoice] = useState("normal");
  const [translationExtraNote, setTranslationExtraNote] = useState("");
  const [translationConsent, setTranslationConsent] = useState(false);
  const [psychologyModalOpen, setPsychologyModalOpen] = useState(false);
  const [psychologyConcern, setPsychologyConcern] = useState("");
  const [psychologyFormat, setPsychologyFormat] = useState("chat");
  const [psychologyFiles, setPsychologyFiles] = useState<File[]>([]);
  const [sportFiles, setSportFiles] = useState<File[]>([]);
  const [legalRequestOpen, setLegalRequestOpen] = useState(false);
  const [legalBrief, setLegalBrief] = useState("");
  const [legalJurisdiction, setLegalJurisdiction] = useState("UZ");
  const [legalServiceType, setLegalServiceType] = useState("Og'zaki maslahat");
  const [legalDeadline, setLegalDeadline] = useState("");
  const [legalFiles, setLegalFiles] = useState<File[]>([]);
  const [legalStatus, setLegalStatus] = useState<"sent" | "accepted" | "review" | "answered" | "closed">("sent");
  const { isAuthenticated, token, userId, profile, isHydrated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (timeZone.includes("Seoul")) {
      setConsultingCurrency("KRW");
    }
  }, []);

  useEffect(() => {
    if (!routeId) return;
    setSaved(isDetailSaved("service", routeId));
  }, [routeId]);

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("upload") === "1") {
      setTranslationUploadOpen(true);
      setTranslationStep(1);
    }
    if (searchParams.get("secure") === "1") {
      setPsychologyModalOpen(true);
    }
  }, [searchParams]);

  const record = useMemo(() => findServiceById(routeId), [routeId]);

  const service = record?.service;
  const agent = record?.agent;
  const category = record?.category;
  const groupTitle = record?.groupTitle ?? "";
  const isConstruction = category?.id === "construction";
  const isMoving = category?.id === "moving";
  const isCleaning = category?.id === "cleaning";
  const isNanny = category?.id === "nanny";
  const isMarketing = category?.id === "marketing";
  const isOperationalService = operationalCategoryIds.has(category?.id || "");
  const isConsulting = category?.id === "consulting";
  const isTranslation = category?.id === "translation";
  const isPsychology = category?.id === "psychology";
  const isLegal = category?.id === "legal";
  const isSport = category?.id === "sport";
  const isKnowledgeVertical = isConsulting || isTranslation || isPsychology || isLegal || isSport;
  const canUseRemoteService = !record && Boolean(routeId);
  const normalizedServiceRouteId = useMemo(() => routeId.replace(/-v\d+$/i, ""), [routeId]);
  const serviceDisplayTitle = apiService?.title || service?.title || "Xizmat";
  const serviceInteractionIdentifier = canUseRemoteService
    ? String(apiService?.id || apiService?._id || normalizedServiceRouteId || routeId)
    : routeId;
  const localServiceChatThread = useMemo<ChatThread | null>(() => {
    if (!routeId) return null;
    return {
      id: `local-service-thread:${routeId}`,
      agentId: String(agent?.id || apiService?.createdBy?._id || "agent"),
      agentName: agent?.name || apiService?.createdBy?.name || "Agent",
      customerId: String(userId || "me"),
      customerName: profile?.name || undefined,
      serviceId: null,
      serviceIdentifier: routeId,
      serviceTitle: serviceDisplayTitle,
      lastMessageText: null,
      lastMessageAt: null
    };
  }, [agent?.id, agent?.name, apiService?.createdBy?._id, apiService?.createdBy?.name, profile?.name, routeId, serviceDisplayTitle, userId]);
  const fallbackCategoryId = category?.id || FALLBACK_CATEGORY_BY_SERVICE_ID[service?.id || ""] || "construction";
  const serviceImages = useMemo(
    () =>
      (service?.images || []).map((image, idx) => ({
        ...image,
        src: normalizeCatalogImageSrc(image?.src, service?.id || routeId, idx, fallbackCategoryId)
      })),
    [fallbackCategoryId, routeId, service?.id, service?.images]
  );
  const constructionFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/construction/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const movingFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/moving/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const cleaningFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/cleaning/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const nannyFallbacks = getCategoryImagePool("nanny");
  const getConstructionFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 31 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % constructionFallbacks.length;
    return constructionFallbacks[(start + idx) % constructionFallbacks.length];
  };
  const getMovingFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 33 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % movingFallbacks.length;
    return movingFallbacks[(start + idx) % movingFallbacks.length];
  };
  const getCleaningFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 37 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % cleaningFallbacks.length;
    return cleaningFallbacks[(start + idx) % cleaningFallbacks.length];
  };
  const getNannyFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 41 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % nannyFallbacks.length;
    return nannyFallbacks[(start + idx) % nannyFallbacks.length]?.src;
  };

  const marketingPool = getCategoryImagePool("marketing");
  const marketingPosts = useMemo(() => {
    if (!isMarketing) return [];
    const images = serviceImages ?? [];
    const base = images.length > 0 ? images : marketingPool;
    const posts = [...base];
    let hash = 0;
    const seed = service?.id ?? "";
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 53 + seed.charCodeAt(i)) % 2147483647;
    }
    const start = hash % marketingPool.length;
    for (let i = 0; posts.length < 9; i += 1) {
      posts.push(marketingPool[(start + i) % marketingPool.length]);
    }
    return posts.slice(0, 9);
  }, [isMarketing, marketingPool, service?.id, serviceImages]);

  const [postStats, setPostStats] = useState(() =>
    marketingPosts.map((_, idx) => ({
      likes: Math.max(12, Math.round((service?.niceCount ?? 0) / 3) + idx * 3),
      dislikes: Math.max(1, Math.round((service?.niceCount ?? 0) / 18) + idx),
      comments: Math.max(2, Math.round((service?.reviewCount ?? 0) / 3) + idx),
      shares: Math.max(1, Math.round((service?.shareCount ?? 0) / 4) + idx),
      liked: false,
      disliked: false
    }))
  );
  const [activeComment, setActiveComment] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isMarketing) return;
    setPostStats(
      marketingPosts.map((_, idx) => ({
        likes: Math.max(12, Math.round((service?.niceCount ?? 0) / 3) + idx * 3),
        dislikes: Math.max(1, Math.round((service?.niceCount ?? 0) / 18) + idx),
        comments: Math.max(2, Math.round((service?.reviewCount ?? 0) / 3) + idx),
        shares: Math.max(1, Math.round((service?.shareCount ?? 0) / 4) + idx),
        liked: false,
        disliked: false
      }))
    );
    setActiveComment(null);
    setCommentDrafts({});
  }, [isMarketing, marketingPosts, service?.niceCount, service?.reviewCount, service?.shareCount]);

  useEffect(() => {
    if (!routeId) return;
    if (!canUseRemoteService) {
      setApiLoading(false);
      setApiError(null);
      setApiService(null);
      return;
    }
    let active = true;
    setApiLoading(true);
    setApiError(null);
    getServiceById(routeId)
      .then((data) => {
        if (!active) return;
        setApiService(data);
      })
      .catch(() => {
        if (!active) return;
        setApiService(null);
        setApiError("Xizmat topilmadi.");
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canUseRemoteService, routeId]);

  useEffect(() => {
    if (!canUseRemoteService) {
      setRelatedRemoteServices([]);
      return;
    }

    let active = true;
    getLatestServices()
      .then((items) => {
        if (!active) return;
        setRelatedRemoteServices(items);
      })
      .catch(() => {
        if (!active) return;
        setRelatedRemoteServices([]);
      });

    return () => {
      active = false;
    };
  }, [canUseRemoteService, routeId]);

  useEffect(() => {
    setServiceReaction({
      likes: Math.max(apiService?.likes ?? service?.niceCount ?? 0, 0),
      dislikes: 0,
      reaction: null
    });
  }, [apiService?.likes, service?.niceCount, routeId]);

  useEffect(() => {
    if (!routeId || !canUseRemoteService) return;
    let active = true;
    getServiceReactionSummary(serviceInteractionIdentifier, token)
      .then((summary) => {
        if (!active) return;
        setServiceReaction(summary);
      })
      .catch(() => {
        // Keep catalog fallback counts when the service has no backend reaction record yet.
      });
    return () => {
      active = false;
    };
  }, [canUseRemoteService, routeId, serviceInteractionIdentifier, token]);

  useEffect(() => {
    if (!profile?.name) return;
    setServiceOrderDraft((prev) => (prev.customerName ? prev : { ...prev, customerName: profile.name || "" }));
  }, [profile?.name]);

  useEffect(() => {
    serviceChatThreadRequestRef.current = null;
    setServiceChatThread(null);
    setServiceChatMessages([]);
    setServiceChatDraft("");
    setServiceChatOpen(false);
    setActivePortfolioItem(null);
    setCaregiverBookingDate("");
    setCaregiverBookingHours("");
  }, [routeId]);

  if (apiLoading && !apiService && !record) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!record || !service || !agent || !category) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-red-400/70">{apiError || "Xizmat topilmadi."}</p>
      </div>
    );
  }

  const exteriorImages = serviceImages.slice(0, 2);
  const interiorImages = serviceImages.slice(2);
  const nannyTypeLabels: Record<string, string> = {
    "nanny-child": "Bolalar enagasi",
    "nanny-elderly": "Qariyalar parvarishi",
    "nanny-hospital": "Shifoxona bemorlari",
    "nanny-homecare": "Uy sharoitidagi kasallar",
    "nanny-pet": "Uy hayvonlari enagasi"
  };
  const nannyTypeLabel = nannyTypeLabels[service.subCategory || "nanny-child"] || "Enaga";

  const getCertificateImage = (serviceId: string, cert: string, idx: number) => {
    let hash = 0;
    const token = `${serviceId}-${cert}-${idx}`;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 47 + token.charCodeAt(i)) % 2147483647;
    }
    const seed = (hash % 900) + 1;
    return `/placeholder.png`;
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      setNotice("Iltimos, oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setSubmitState("loading");
    setTimeout(() => {
      setSubmitState("success");
      setShowContacts(true);
      setShowChat(true);
      setNotice("Buyurtma qabul qilindi.");
    }, 700);
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice("Chat uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setShowChat(true);
  };

  const handleServiceReactionToggle = async (reaction: ServiceReactionKind) => {
    const feedbackAllowed = service?.canRate !== false;
    if (!feedbackAllowed) {
      setNotice("Bu xizmat uchun feedback faqat foydalangan mijozlarga ochiq.");
      return;
    }
    if (!isAuthenticated || (canUseRemoteService && !token)) {
      setNotice("Feedback qoldirish uchun oldin login bo'ling.");
      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
      return;
    }

    if (!canUseRemoteService) {
      setServiceReaction((prev) => {
        const next = { ...prev };
        if (prev.reaction === "like") next.likes = Math.max(0, next.likes - 1);
        if (prev.reaction === "dislike") next.dislikes = Math.max(0, next.dislikes - 1);

        if (prev.reaction === reaction) {
          next.reaction = null;
          return next;
        }

        if (reaction === "like") next.likes += 1;
        if (reaction === "dislike") next.dislikes += 1;
        next.reaction = reaction;
        return next;
      });
      setNotice(reaction === "like" ? "Foydali deb belgilandi." : "Mos emas deb belgilandi.");
      return;
    }

    setServiceReactionLoading(true);
    try {
      const authToken = token;
      if (!authToken) {
        throw new Error("Login token topilmadi.");
      }
      const summary = await toggleServiceReaction(serviceInteractionIdentifier, reaction, authToken);
      setServiceReaction(summary);
      setNotice(reaction === "like" ? "Foydali deb belgilandi." : "Mos emas deb belgilandi.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Feedback yuborib bo'lmadi.");
    } finally {
      setServiceReactionLoading(false);
    }
  };

  const handleToggleSavedState = () => {
    const next = toggleDetailSaved("service", routeId);
    setSaved(next);
    setNotice(next ? "Xizmat saqlandi." : "Saqlash olib tashlandi.");
  };

  const handleSubmitServiceReport = async () => {
    if (!reportReason.trim()) return;
    if (!isAuthenticated || !token) {
      setNotice("Shikoyat yuborish uchun oldin login bo'ling.");
      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
      return;
    }

    setReportSubmitting(true);
    try {
      await reportDetailTarget(
        "service",
        serviceInteractionIdentifier,
        { reason: reportReason.trim(), targetTitle: serviceDisplayTitle },
        token
      );
      setReportReason("");
      setNotice("Shikoyat yuborildi.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Shikoyat yuborilmadi.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShareService = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    const shareTitle = serviceDisplayTitle;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} bo'yicha e'lon havolasi`,
          url: shareUrl
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setNotice("Havola ulashish uchun tayyor.");
    } catch {
      setNotice("Ulashish amalga oshmadi.");
    }
  };

  const ensureServiceChatThread = async () => {
    if (!canUseRemoteService) {
      if (!localServiceChatThread) {
        throw new Error("Chat konteksti topilmadi.");
      }
      setServiceChatThread(localServiceChatThread);
      return localServiceChatThread;
    }

    if (!token) {
      throw new Error("Login token topilmadi.");
    }
    if (serviceChatThread) {
      return serviceChatThread;
    }
    if (serviceChatThreadRequestRef.current) {
      return serviceChatThreadRequestRef.current;
    }

    const request = startServiceChat(
      {
        agentId: apiService?.createdBy?._id,
        serviceContext: {
          serviceId: apiService?.id,
          serviceIdentifier: serviceInteractionIdentifier,
          serviceTitle: serviceDisplayTitle
        }
      },
      token
    ).then((result) => {
      setServiceChatThread(result.thread);
      setServiceChatMessages(result.messages);
      return result.thread;
    });

    serviceChatThreadRequestRef.current = request;

    try {
      return await request;
    } finally {
      if (serviceChatThreadRequestRef.current === request) {
        serviceChatThreadRequestRef.current = null;
      }
    }
  };

  const handleOpenServiceChat = async () => {
    if (!isAuthenticated || (canUseRemoteService && !token) || !isHydrated) {
      setNotice("Chat uchun oldin login bo'ling.");
      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
      return;
    }

    setNotice(null);
    setServiceChatOpen(true);
    setServiceChatLoading(true);
    try {
      await ensureServiceChatThread();
    } catch (error: any) {
      setNotice(error?.response?.data?.message || error?.message || "Chatni ochib bo'lmadi.");
    } finally {
      setServiceChatLoading(false);
    }
  };

  const handleSendServiceMessage = async () => {
    const text = serviceChatDraft.trim();
    if (!text) return;
    if (!isAuthenticated || (canUseRemoteService && !token)) {
      setNotice("Xabar yuborish uchun oldin login bo'ling.");
      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
      return;
    }

    setServiceChatSending(true);
    try {
      const thread = await ensureServiceChatThread();
      if (!canUseRemoteService) {
        const createdAt = new Date().toISOString();
        const message: ChatMessage = {
          id: `local-service-message:${Date.now()}`,
          threadId: thread.id,
          senderId: String(userId || "me"),
          senderName: profile?.name || "Siz",
          recipientId: thread.agentId,
          text,
          createdAt
        };
        setServiceChatMessages((prev) => [...prev, message]);
        setServiceChatThread((prev) =>
          prev
            ? {
                ...prev,
                lastMessageText: text,
                lastMessageAt: createdAt
              }
            : prev
        );
        setServiceChatDraft("");
        setNotice("Xabar lokal suhbat oynasiga qo'shildi.");
        return;
      }
      const authToken = token;
      if (!authToken) {
        throw new Error("Login token topilmadi.");
      }
      const message = await sendServiceChatMessage(thread.id, text, authToken);
      setServiceChatMessages((prev) => [...prev, message]);
      setServiceChatDraft("");
      setNotice("Xabar e'lon egasiga yuborildi.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message || error?.message || "Xabar yuborib bo'lmadi.");
    } finally {
      setServiceChatSending(false);
    }
  };

  const handleServiceOrderSubmit = async (
    overrides?: Partial<typeof serviceOrderDraft>
  ) => {
    const draft = { ...serviceOrderDraft, ...overrides };

    if (!isAuthenticated || (canUseRemoteService && !token) || !isHydrated) {
      setNotice("Buyurtma berish uchun oldin login bo'ling.");
      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
      return;
    }

    if (
      !draft.customerName.trim()
      || !draft.customerPhone.trim()
      || !draft.customerAddress.trim()
    ) {
      setNotice("Ism, telefon va manzilni to'ldiring.");
      return;
    }

    setSubmitState("loading");
    setNotice(null);
    try {
      if (canUseRemoteService) {
        const authToken = token;
        if (!authToken) {
          throw new Error("Login token topilmadi.");
        }
        await createServiceOrder(
          serviceInteractionIdentifier,
          {
            customerName: draft.customerName.trim(),
            customerPhone: draft.customerPhone.trim(),
            customerAddress: draft.customerAddress.trim(),
            destinationAddress: draft.destinationAddress.trim() || undefined,
            note: draft.note.trim() || undefined
          },
          authToken
        );
      } else {
        const thread = await ensureServiceChatThread();
        const createdAt = new Date().toISOString();
        setServiceChatMessages((prev) => [
          ...prev,
          {
            id: `local-service-order:${Date.now()}`,
            threadId: thread.id,
            senderId: thread.agentId,
            senderName: thread.agentName,
            recipientId: String(userId || "me"),
            text: `${serviceDisplayTitle} bo'yicha buyurtma so'rovi qabul qilindi. Tez orada siz bilan bog'lanamiz.`,
            createdAt
          }
        ]);
      }
      setSubmitState("success");
      setShowContacts(true);
      setServiceChatOpen(true);
      setShowServiceOrderForm(false);
      setNotice("Buyurtma e'lon egasiga manzil va kontaktlar bilan yuborildi.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Buyurtma yuborib bo'lmadi.");
      setSubmitState("idle");
    } finally {
      setSubmitState("idle");
    }
  };

  const handleCaregiverBookingSubmit = async () => {
    if (!caregiverBookingDate || !caregiverBookingHours) {
      setNotice("Sana va soatlarni tanlang.");
      return;
    }

    const bookingDetails = [
      `Parvarish sanasi: ${caregiverBookingDate}`,
      `Bron davomiyligi: ${caregiverBookingHours}`,
      serviceOrderDraft.note.trim()
    ]
      .filter(Boolean)
      .join("\n");

    await handleServiceOrderSubmit({
      note: bookingDetails
    });
  };

  if (apiService && !record) {
    const remoteAgentName = apiService.createdBy?.name || apiService.agent?.name || "UniServe Agent";
    const remoteAgentId = apiService.createdBy?._id || apiService.agent?.id;
    const remoteHandle = apiService.createdBy?.username?.replace(/^@/, "") || null;
    const remoteRating = Number(apiService.ratingAvg ?? apiService.agent?.rating ?? 0);
    const remoteReviewCount = Number(apiService.ratingCount ?? 0);
    const remotePriceValue = apiService.salePrice ?? apiService.price ?? apiService.hourlyRate ?? null;
    const remotePriceLabel = formatMarketplacePrice(remotePriceValue, apiService.currency);
    const remoteCompletedJobs = Number(apiService.orders ?? apiService.stats?.orders ?? apiService.stats?.purchases ?? 0);
    const remoteViews = Number(apiService.views ?? apiService.stats?.views ?? 0);
    const remoteLikes = Number(apiService.likes ?? apiService.stats?.likes ?? 0);
    const remoteResponseTime = remoteCompletedJobs > 5 ? "30 daqiqa" : "2 soat";
    const remoteGalleryItems = buildRemoteServiceGallery(apiService);
    const remoteContactRows = [
      {
        label: "Telefon",
        value: showContacts ? "Buyurtma tasdiqlangach beriladi" : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi"
      },
      {
        label: "Telegram",
        value: showContacts ? (remoteHandle ? `@${remoteHandle}` : "So'rovdan keyin beriladi") : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi"
      },
      {
        label: "In-platform chat",
        value: isAuthenticated ? "Platforma ichida mavjud" : "Login orqali ochiladi"
      }
    ];
    const remoteContacts: DetailContactMethod[] = [
      {
        key: "phone",
        label: "Telefon",
        value: showContacts ? "Buyurtma tasdiqlangach beriladi" : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi",
        locked: true
      },
      {
        key: "telegram",
        label: "Telegram",
        value: showContacts ? (remoteHandle ? `@${remoteHandle}` : "So'rovdan keyin beriladi") : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi",
        href: showContacts && remoteHandle ? `https://t.me/${remoteHandle}` : undefined,
        locked: !showContacts || !remoteHandle
      },
      {
        key: "chat",
        label: "In-platform chat",
        value: isAuthenticated ? "Agentga yozish" : "Login orqali ochiladi",
        href: isAuthenticated ? "#service-chat-panel" : undefined,
        locked: !isAuthenticated
      }
    ];
    const remoteTrustIndicators: DetailTrustIndicator[] = [
      { label: "Verified agent", value: remoteAgentId ? "Tekshirilgan" : "Marketplace", tone: "emerald" },
      { label: "UniServe secure transaction", value: "Protected", tone: "sky" },
      { label: "Response time", value: remoteResponseTime, tone: "amber" }
    ];
    const remoteReviews: DetailReview[] = [];
    const remoteFeatureTags = [
      apiService.category ? `Kategoriya: ${apiService.category}` : "Professional service",
      apiService.kind ? `Format: ${apiService.kind}` : "Format: flexible",
      remoteReviewCount > 0 ? `${remoteReviewCount} ta baho` : "Yangi xizmat",
      apiService.currency ? `Valyuta: ${apiService.currency}` : null,
      apiService.isOnSale ? `Chegirma: ${apiService.discountPercent || 0}%` : null
    ].filter(Boolean) as string[];
    const prioritizedRemoteServices = [
      ...relatedRemoteServices.filter(
        (item) =>
          item.id !== apiService.id
          && item._id !== apiService._id
          && item.category
          && item.category === apiService.category
      ),
      ...relatedRemoteServices.filter(
        (item) =>
          item.id !== apiService.id
          && item._id !== apiService._id
          && item.category !== apiService.category
      )
    ];
    const remoteRelatedItems: RelatedDetailItem[] = prioritizedRemoteServices.slice(0, 3).map((item) => ({
      id: item.id || item._id || item.title,
      href: `/services/${item.id || item._id}`,
      image:
        normalizeImageUrl(item.coverImageUrl)
        || normalizeImageUrl(item.image)
        || normalizeImageUrl(item.images?.[0])
        || "/images/fallback-service.png",
      title: item.title,
      subtitle: item.createdBy?.name || item.agent?.name || item.category || "UniServe service",
      priceLabel: formatMarketplacePrice(item.salePrice ?? item.price ?? item.hourlyRate, item.currency),
      rating: Number(item.ratingAvg ?? item.agent?.rating ?? 0) || undefined,
      meta: [item.location, item.createdAt ? dayjs(item.createdAt).fromNow() : null].filter(Boolean).join(" · "),
      tag: item.category || "Service"
    }));

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/services"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Xizmatlar ro'yxatiga qaytish
          </Link>
          {notice ? (
            <p className="rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
              {notice}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div className="space-y-6">
            <ServiceGallery
              items={remoteGalleryItems}
              fallbackSrc={normalizeImageUrl(apiService.coverImageUrl) || "/images/fallback-service.png"}
            />

            <ServiceHeader
              eyebrow={apiService.category || "Marketplace service"}
              title={apiService.title}
              subtitle={`${remoteAgentName} tomonidan joylangan xizmat`}
              rating={remoteRating}
              reviewCount={remoteReviewCount}
              location={apiService.location}
              postedDate={apiService.createdAt ? dayjs(apiService.createdAt).format("MMM D, YYYY") : undefined}
            />

            <section className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.92),rgba(56,189,248,0.10))] p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Price</p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{remotePriceLabel}</p>
                  <p className="mt-2 text-sm text-slate-600">{resolveMarketplacePeriod(apiService)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Buyurtmalar</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{remoteCompletedJobs}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Ko'rishlar</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{remoteViews}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Service Details</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Xizmat tavsifi va tafsilotlar</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  Likes: {remoteLikes}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Kategoriya", value: apiService.category || "Ko'rsatilmagan" },
                  { label: "Lokatsiya", value: apiService.location || "Moslashuvchan" },
                  { label: "Narx modeli", value: resolveMarketplacePeriod(apiService) },
                  { label: "Joylangan", value: apiService.createdAt ? dayjs(apiService.createdAt).fromNow() : "Yaqinda" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Tavsif</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {apiService.description?.trim() || "Xizmat haqida batafsil tavsif kiritilmagan. Buyurtma yoki chat orqali qo'shimcha ma'lumot so'rashingiz mumkin."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Tags / features</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {remoteFeatureTags.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <ServiceReviews rating={remoteRating} reviewCount={remoteReviewCount} reviews={remoteReviews} />
            <ServiceRelated title="O'xshash xizmatlar" items={remoteRelatedItems} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ServiceAgentCard
              avatarSrc={apiService.createdBy?.avatarUrl || apiService.agent?.avatarUrl || null}
              fallbackText={remoteAgentName}
              name={remoteAgentName}
              handle={remoteHandle}
              roleLabel={apiService.category || "UniServe agent"}
              rating={remoteRating}
              verified={Boolean(remoteAgentId)}
              completedJobs={remoteCompletedJobs}
              contacts={remoteContacts}
              trustIndicators={remoteTrustIndicators}
            />

            <ServiceActions
              actions={[
                {
                  key: "order",
                  label: showServiceOrderForm ? "Formani yopish" : "Buyurtma berish",
                  tone: "primary",
                  onClick: () => {
                    if (!isAuthenticated || !token || !isHydrated) {
                      setNotice("Buyurtma berish uchun oldin login bo'ling.");
                      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                      return;
                    }
                    setNotice(null);
                    setShowServiceOrderForm((prev) => !prev);
                  }
                },
                {
                  key: "message",
                  label: "Agentga yozish",
                  tone: "secondary",
                  onClick: () => void handleOpenServiceChat()
                },
                {
                  key: "save",
                  label: saved ? "Saqlangan" : "Saqlash",
                  tone: "ghost",
                  onClick: handleToggleSavedState
                }
              ]}
            />

            {showServiceOrderForm ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <RequestFormPanel
                  title="Buyurtma ma'lumotlari"
                  description="Agent buyurtmani qabul qilishi uchun asosiy kontakt va manzilni qoldiring."
                  submitLabel="Buyurtmani yuborish"
                  onSubmit={() => void handleServiceOrderSubmit()}
                  submitting={submitState === "loading"}
                >
                  <input
                    value={serviceOrderDraft.customerName}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerName: event.target.value }))
                    }
                    placeholder="Ismingiz"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={serviceOrderDraft.customerPhone}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerPhone: event.target.value }))
                    }
                    placeholder="Telefon raqamingiz"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={serviceOrderDraft.customerAddress}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerAddress: event.target.value }))
                    }
                    placeholder="Qayerdan xizmat kerak"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={serviceOrderDraft.destinationAddress}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, destinationAddress: event.target.value }))
                    }
                    placeholder="Qo'shimcha manzil yoki destination"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                  <textarea
                    value={serviceOrderDraft.note}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, note: event.target.value }))
                    }
                    placeholder="Izoh"
                    className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                </RequestFormPanel>
              </div>
            ) : null}

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/88 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact block</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {remoteContactRows.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span>{item.label}</span>
                    <span className="text-right font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
              {!isAuthenticated ? (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Login qilib davom etish
                </Link>
              ) : null}
            </div>

            {serviceChatOpen ? (
              <div id="service-chat-panel" className="rounded-[1.75rem] border border-slate-200 bg-white/88 p-5 shadow-sm">
                <InquiryComposer
                  title="Agent bilan chat"
                  description="Loyiha yoki xizmat tafsilotlarini shu yerda aniqlashtiring."
                  messages={serviceChatMessages}
                  draft={serviceChatDraft}
                  onDraftChange={setServiceChatDraft}
                  onSend={() => void handleSendServiceMessage()}
                  loading={serviceChatLoading}
                  sending={serviceChatSending}
                  currentUserId={userId ? String(userId) : null}
                  existingThreadHint={serviceChatThread ? `Suhbat: ${serviceChatThread.id}` : null}
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    );
  }

  const handleLegalRequestOpen = () => {
    if (!isAuthenticated) {
      setNotice("Maslahat so'rash uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setLegalRequestOpen(true);
  };

  const handleLegalRequestSubmit = () => {
    if (!isAuthenticated) {
      setNotice("Maslahat so'rash uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    if (!legalBrief.trim()) {
      setNotice("Muammo qisqacha tavsifini kiriting.");
      return;
    }
    setNotice("So'rov yuborildi. Huquqshunos javobini kuting.");
    setLegalStatus("sent");
    setShowChat(true);
  };

  const handlePostLike = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextLiked = !item.liked;
        return {
          ...item,
          liked: nextLiked,
          disliked: nextLiked ? false : item.disliked,
          likes: item.likes + (nextLiked ? 1 : -1),
          dislikes: nextLiked && item.disliked ? Math.max(0, item.dislikes - 1) : item.dislikes
        };
      })
    );
  };

  const handlePostDislike = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextDisliked = !item.disliked;
        return {
          ...item,
          disliked: nextDisliked,
          liked: nextDisliked ? false : item.liked,
          dislikes: item.dislikes + (nextDisliked ? 1 : -1),
          likes: nextDisliked && item.liked ? Math.max(0, item.likes - 1) : item.likes
        };
      })
    );
  };

  const handlePostShare = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, shares: item.shares + 1 } : item))
    );
  };

  const handleCommentToggle = (index: number) => {
    setActiveComment((prev) => (prev === index ? null : index));
  };

  const handleCommentSubmit = (index: number) => {
    const message = (commentDrafts[index] || "").trim();
    if (!message) return;
    setPostStats((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, comments: item.comments + 1 } : item))
    );
    setCommentDrafts((prev) => ({ ...prev, [index]: "" }));
    setActiveComment(null);
  };

  if (isOperationalService) {
    const categoryId = category.id;
    const operationalSubtitle = buildOperationalSubtitle(categoryId, service, agent);
    const operationalHighlights = buildOperationalHighlights(categoryId, service, agent).slice(0, 6);
    const operationalSpecs = buildOperationalSpecs(categoryId, service, agent);
    const operationalProcessSections = buildOperationalGallerySections(
      categoryId,
      service.title,
      serviceImages,
      exteriorImages,
      interiorImages
    );
    const operationalTrustIndicators = buildOperationalTrustIndicators(categoryId, service, agent);
    const operationalReviews = buildOperationalReviews(categoryId, service, agent);
    const operationalRelatedItems = buildOperationalRelatedItems(category, service, agent);
    const operationalTags = Array.from(
      new Set(
        [
          ...service.certificates,
          ...(agent.equipment || []),
          ...(agent.vehicleOptions || []),
          agent.specialty,
          getAvailabilityLabel(agent).label
        ].filter(Boolean)
      )
    ).slice(0, 8);
    const operationalContacts: DetailContactMethod[] = [
      {
        key: "phone",
        label: "Telefon",
        value:
          showContacts && agent.contactPhone
            ? agent.contactPhone
            : isAuthenticated
              ? "Buyurtmadan keyin"
              : "Login talab qilinadi",
        href: showContacts && agent.contactPhone ? `tel:${agent.contactPhone}` : undefined,
        locked: !showContacts || !agent.contactPhone
      },
      {
        key: "telegram",
        label: "Telegram",
        value:
          showContacts && agent.contactTelegram
            ? agent.contactTelegram
            : isAuthenticated
              ? "Buyurtmadan keyin"
              : "Login talab qilinadi",
        href:
          showContacts && agent.contactTelegram
            ? `https://t.me/${agent.contactTelegram.replace("@", "")}`
            : undefined,
        locked: !showContacts || !agent.contactTelegram
      },
      {
        key: "chat",
        label: "In-platform chat",
        value: isAuthenticated ? "Chatni ochish" : "Login orqali ochiladi",
        href: isAuthenticated ? "#service-chat-panel" : undefined,
        locked: !isAuthenticated
      }
    ];
    const actionStatus = showContacts
      ? "Rasmiy so'rov yuborildi, kontaktlar ochildi."
      : serviceChatThread
        ? "Avvalgi suhbatni davom ettirishingiz mumkin."
        : null;
    const requestDescription =
      categoryId === "moving" || categoryId === "delivery"
        ? "Pickup, destination va route tafsilotlarini structured ko'rinishda yuboring."
        : categoryId === "taxi"
          ? "Transfer va pickup detail'larini agentga rasmiy request sifatida jo'nating."
          : "Kontakt, manzil va service requirement'larni aniq ko'rsatib request yuboring.";
    const pricingModel = resolveOperationalPricingModel(categoryId, service.unit);
    const heroStats = [
      { label: "Narx modeli", value: pricingModel },
      { label: "Buyurtmalar", value: formatCount(agent.completedOrders ?? service.usedCount) },
      { label: "Hudud", value: agent.region || agent.location }
    ];

    return (
      <ServiceDetailShell
        categoryLabel={category.title}
        title={service.title}
        subtitle={operationalSubtitle}
        highlightChips={operationalHighlights}
        hero={
          <ServiceHeroGallery
            items={serviceImages}
            fallbackSrc={serviceImages[0]?.src || "/images/fallback-service.png"}
            priceLabel={`${formatCount(service.price)} ${service.currency}`}
            pricingModel={pricingModel}
            stats={heroStats}
          />
        }
        sidebar={
          <>
            <AgentSummaryCard
              avatarSrc={agent.avatar.src}
              avatarAlt={agent.avatar.alt}
              fallbackText={agent.name}
              name={agent.name}
              username={agent.nickname}
              specialty={agent.specialty}
              badge={agent.verified ? "Verified agent" : null}
              trustLine={`${resolveResponseSpeedLabel(agent)} javob tezligi`}
              metaRows={[
                { label: "Hudud", value: agent.region || agent.location },
                { label: "Mavjudlik", value: getAvailabilityLabel(agent).label },
                { label: "Tajriba", value: `${agent.experienceYears} yil` }
              ]}
              metrics={[
                { label: "Reyting", value: `${agent.rating.toFixed(1)} / 5` },
                { label: "Mijoz", value: formatCount(agent.totalClients) },
                { label: "Buyurtma", value: formatCount(agent.completedOrders ?? service.usedCount) }
              ]}
              contacts={operationalContacts}
            />

            <PrimaryActionPanel
              title="Primary actions"
              subtitle="Formal request va quick inquiry alohida yuritiladi."
              status={actionStatus}
              actions={[
                {
                  key: "order",
                  label: showServiceOrderForm ? "Formani yopish" : "Buyurtma berish",
                  tone: "primary",
                  busy: submitState === "loading",
                  onClick: () => {
                    if (!isAuthenticated) {
                      setNotice("Buyurtma berish uchun oldin login bo'ling.");
                      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                      return;
                    }
                    setNotice(null);
                    setShowServiceOrderForm((prev) => !prev);
                  }
                },
                {
                  key: "message",
                  label: serviceChatOpen ? "Chat ochiq" : "Xabar yozish",
                  tone: "secondary",
                  onClick: () => void handleOpenServiceChat()
                }
              ]}
              utilityActions={[
                {
                  key: "save",
                  label: saved ? "Saqlangan" : "Saqlash",
                  onClick: handleToggleSavedState,
                  active: saved
                },
                {
                  key: "share",
                  label: "Ulashish",
                  onClick: () => void handleShareService()
                }
              ]}
            />

            <ServiceTrustPanel
              subtitle="Category-aware trust elementlar conversion va qaror qabul qilishni tezlashtiradi."
              indicators={operationalTrustIndicators}
            />

            <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
              {showServiceOrderForm ? (
                <RequestFormPanel
                  title="Rasmiy so'rov / buyurtma"
                  description={requestDescription}
                  submitLabel="Buyurtmani yuborish"
                  onSubmit={() => void handleServiceOrderSubmit()}
                  submitting={submitState === "loading"}
                >
                  <input
                    value={serviceOrderDraft.customerName}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerName: event.target.value }))
                    }
                    placeholder="Ismingiz"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={serviceOrderDraft.customerPhone}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerPhone: event.target.value }))
                    }
                    placeholder="Telefon raqamingiz"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                  />
                  <textarea
                    value={serviceOrderDraft.customerAddress}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, customerAddress: event.target.value }))
                    }
                    placeholder={categoryId === "taxi" ? "Pickup manzili" : "Asosiy manzil"}
                    className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                  />
                  <input
                    value={serviceOrderDraft.destinationAddress}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, destinationAddress: event.target.value }))
                    }
                    placeholder="Destination / qo'shimcha manzil"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                  />
                  <textarea
                    value={serviceOrderDraft.note}
                    onChange={(event) =>
                      setServiceOrderDraft((prev) => ({ ...prev, note: event.target.value }))
                    }
                    placeholder="Qo'shimcha izoh"
                    className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                  />
                </RequestFormPanel>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Rasmiy so'rov / buyurtma</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{requestDescription}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setNotice("Buyurtma berish uchun oldin login bo'ling.");
                        setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                        return;
                      }
                      setNotice(null);
                      setShowServiceOrderForm(true);
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                  >
                    Formani ochish
                  </button>
                </div>
              )}
            </section>

            <QuickInquiryPanel
              title="Quick inquiry"
              description="Savol, narx yoki vaqt bo'yicha tezkor yozishmalar shu blokda, formal order esa yuqoridagi forma orqali yuradi."
              isOpen={serviceChatOpen || Boolean(serviceChatThread) || serviceChatMessages.length > 0}
              closedCtaLabel="Chatni ochish"
              onOpen={() => void handleOpenServiceChat()}
            >
              <div id="service-chat-panel">
                <InquiryComposer
                  title="Tezkor xabarlashish"
                  description="Narx, timing, coverage area yoki scope bo'yicha agentga to'g'ridan-to'g'ri yozing."
                  messages={serviceChatMessages.map((message) => ({
                    id: message.id,
                    threadId: message.threadId,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    recipientId: message.recipientId,
                    text: message.text,
                    createdAt: message.createdAt
                  }))}
                  draft={serviceChatDraft}
                  onDraftChange={setServiceChatDraft}
                  onSend={() => void handleSendServiceMessage()}
                  loading={serviceChatLoading}
                  sending={serviceChatSending}
                  currentUserId={userId ? String(userId) : null}
                  existingThreadHint={serviceChatThread ? "Oldingi suhbatni davom ettiryapsiz." : null}
                />
              </div>
            </QuickInquiryPanel>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
              <FeedbackWidget
                title="Xizmat foydalimi?"
                description="Trust, pricing va umumiy usability nuqtalaridan feedback qoldiring."
                actions={[
                  { label: "Foydali", value: "helpful", count: serviceReaction.likes },
                  { label: "Mos emas", value: "unhelpful", count: serviceReaction.dislikes }
                ]}
                activeValue={
                  serviceReaction.reaction === "like"
                    ? "helpful"
                    : serviceReaction.reaction === "dislike"
                      ? "unhelpful"
                      : null
                }
                disabled={service.canRate === false}
                loading={serviceReactionLoading}
                onSelect={(value) => void handleServiceReactionToggle(value === "helpful" ? "like" : "dislike")}
                saved={saved}
                onToggleSaved={handleToggleSavedState}
                onShare={() => void handleShareService()}
                reportReason={reportReason}
                onReportReasonChange={setReportReason}
                onSubmitReport={() => void handleSubmitServiceReport()}
                reportSubmitting={reportSubmitting}
              />
            </section>

            {notice ? (
              <p className="rounded-[1.5rem] border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                {notice}
              </p>
            ) : null}
          </>
        }
      >
        <ServiceSpecTable
          eyebrow="Service overview"
          title="Narx, scope va category-aware tafsilotlar"
          subtitle="Har kategoriya uchun foydalanuvchi eng tez ko'radigan conversion-critical ma'lumotlar shu blokda birlashtirildi."
          rows={operationalSpecs}
        />

        <ServiceDescriptionBlock
          eyebrow="Value proposition"
          title="Xizmat tavsifi"
          description={service.description}
          secondaryDescription={agent.bio}
          tags={operationalTags}
          highlightTitle="Nega shu xizmat?"
          highlights={operationalHighlights}
        />

        <ServiceProcessGallery
          eyebrow="Process / media"
          title="Jarayon va ish previewlari"
          subtitle="Media bloklar xizmatning qanday bajarilishi va natijasi haqida tez tasavvur beradi."
          sections={operationalProcessSections}
        />

        <ServiceReviews
          rating={service.rating}
          reviewCount={service.reviewCount}
          reviews={operationalReviews}
        />

        <RelatedServicesSection title="O'xshash xizmatlar" items={operationalRelatedItems} />
      </ServiceDetailShell>
    );
  }

  if (isConstruction) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={serviceImages[0]?.src || getConstructionFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getConstructionFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-work-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getConstructionFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Usta haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar
                    src={agent.avatar.src}
                    alt={agent.avatar.alt}
                    fallbackText={agent.name}
                    size={48}
                    className="border border-slate-700/60"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Mutaxassislik</span>
                    <span className="text-slate-100">{agent.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
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
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Usta bilan tafsilotlarni kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isMoving) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={serviceImages[0]?.src || getMovingFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getMovingFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ko'chirish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-move-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getMovingFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Ko'chiruvchi haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar
                    src={agent.avatar.src}
                    alt={agent.avatar.alt}
                    fallbackText={agent.name}
                    size={48}
                    className="border border-slate-700/60"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Transport turi</span>
                    <span className="text-slate-100">{agent.movingTruckType || "Ko'rsatilmagan"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Yuk sig'imi</span>
                    <span className="text-slate-100">
                      {agent.movingCapacityTons ? `${agent.movingCapacityTons} tonna` : "Ko'rsatilmagan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
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
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Ko'chirish tafsilotlarini kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isCleaning) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={serviceImages[0]?.src || getCleaningFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getCleaningFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Tozalash jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-clean-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getCleaningFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Tozalovchi haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar
                    src={agent.avatar.src}
                    alt={agent.avatar.alt}
                    fallbackText={agent.name}
                    size={48}
                    className="border border-slate-700/60"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Mutaxassislik</span>
                    <span className="text-slate-100">{agent.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
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
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Tozalash tafsilotlarini kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isNanny) {
    const careFocus = agent.careFocus?.length ? agent.careFocus : [nannyTypeLabel];
    const workingHours = agent.availability?.length ? agent.availability : ["08:00-18:00"];
    const availableDays = buildCaregiverAvailableDays(workingHours);
    const calendarDays = buildCaregiverCalendar(availableDays);
    const bookingHourOptions = buildCaregiverHourOptions(service.unit);
    const hasFirstAid =
      service.certificates.some((item) => /(tibbiy|birinchi yordam|first aid)/i.test(item))
      || (agent.equipment || []).some((item) => /birinchi yordam/i.test(item));
    const trustBadges: CaregiverTrustBadgeItem[] = [
      {
        label: "Verified identity",
        value: agent.identityImage || agent.verified ? "Tasdiqlangan" : "Tekshiruv kutilmoqda",
        tone: "emerald"
      },
      {
        label: "Background checked",
        value: agent.hasCriminalRecord ? "Qo'shimcha tekshiruv kerak" : "Sudlanmagan / checked",
        tone: agent.hasCriminalRecord ? "rose" : "sky"
      },
      {
        label: "First aid certified",
        value: hasFirstAid ? "Mavjud" : "Ko'rsatilmagan",
        tone: hasFirstAid ? "amber" : "rose"
      },
      {
        label: "Years of experience",
        value: `${agent.experienceYears} yil`,
        tone: "emerald"
      }
    ];
    const caregiverReviews = buildCaregiverReviews(service, agent, careFocus);
    const caregiverProcess = buildCaregiverProcess();
    const caregiverSubtitle = `${nannyTypeLabel} xizmati uchun ishonch, xavfsizlik va tez bron qilish markazida bo'lgan caregiving taklif. ${careFocus[0]} bo'yicha tajribaga ega.`;
    const caregiverHighlights = [
      nannyTypeLabel,
      `${agent.experienceYears} yil tajriba`,
      careFocus[0],
      agent.regionDetail || agent.region || agent.location
    ];
    const relatedCaregivers: RelatedDetailItem[] = category.agents
      .flatMap((categoryAgent) =>
        categoryAgent.services.map((item) => ({
          item,
          categoryAgent
        }))
      )
      .filter(({ item }) => item.id !== service.id)
      .slice(0, 3)
      .map(({ item, categoryAgent }) => ({
        id: item.id,
        href: `/services/${item.id}`,
        image: item.images[0]?.src || categoryAgent.avatar.src,
        title: item.title,
        subtitle: categoryAgent.name,
        priceLabel: `${formatCount(item.price)} ${item.currency} / ${item.unit}`,
        rating: item.rating,
        meta: `${categoryAgent.region || categoryAgent.location} · ${dayjs(item.createdAt).fromNow()}`,
        tag: "Caregiver"
      }));
    const mediaCards = serviceImages.slice(0, 3).map((image, index) => ({
      image,
      title: ["Uy muhiti", "Parvarish rutini", "Faoliyat va e'tibor"][index] || `Media ${index + 1}`,
      description: [
        "Ish joyi va muhit ko'rinishi.",
        "Kun tartibi, uyqu va ovqatlanish rejasi.",
        "O'yin, kuzatuv va xavfsizlik yondashuvi."
      ][index] || "Parvarish xizmatidan media preview."
    }));
    const bookingStatus = showContacts
      ? "Booking request yuborildi. Kontaktlar ochildi."
      : serviceChatThread
        ? "Chat mavjud, savollarni davom ettirishingiz mumkin."
        : null;
    const minBookingDate = new Date().toISOString().slice(0, 10);

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
        <CaregiverHero
          categoryLabel={category.title}
          title={service.title}
          subtitle={caregiverSubtitle}
          rating={service.rating}
          reviewCount={service.reviewCount}
          highlights={caregiverHighlights}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24 lg:self-start">
            <CaregiverProfileCard
              avatarSrc={agent.avatar.src}
              avatarAlt={agent.avatar.alt}
              fallbackText={agent.name}
              name={agent.name}
              username={agent.nickname}
              ratingLabel={`${agent.rating.toFixed(1)} / 5 reyting`}
              experienceLabel={`${agent.experienceYears} yil`}
              location={agent.regionDetail || agent.region || agent.location}
              bio={agent.bio}
            />

            <TrustBadges items={trustBadges} />

            <AvailabilityBlock
              workingHours={workingHours}
              availableDays={availableDays}
              calendarDays={calendarDays}
            />

            <BookingActions
              isOpen={showServiceOrderForm}
              minDate={minBookingDate}
              bookingDate={caregiverBookingDate}
              bookingHours={caregiverBookingHours}
              customerName={serviceOrderDraft.customerName}
              customerPhone={serviceOrderDraft.customerPhone}
              customerAddress={serviceOrderDraft.customerAddress}
              note={serviceOrderDraft.note}
              hourOptions={bookingHourOptions}
              submitting={submitState === "loading"}
              status={bookingStatus}
              onToggleBooking={() => {
                if (!isAuthenticated) {
                  setNotice("Bron qilish uchun oldin login bo'ling.");
                  setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                  return;
                }
                setNotice(null);
                setShowServiceOrderForm((prev) => !prev);
              }}
              onOpenChat={() => void handleOpenServiceChat()}
              onBookingDateChange={setCaregiverBookingDate}
              onBookingHoursChange={setCaregiverBookingHours}
              onCustomerNameChange={(value) =>
                setServiceOrderDraft((prev) => ({ ...prev, customerName: value }))
              }
              onCustomerPhoneChange={(value) =>
                setServiceOrderDraft((prev) => ({ ...prev, customerPhone: value }))
              }
              onCustomerAddressChange={(value) =>
                setServiceOrderDraft((prev) => ({ ...prev, customerAddress: value }))
              }
              onNoteChange={(value) =>
                setServiceOrderDraft((prev) => ({ ...prev, note: value }))
              }
              onSubmit={() => void handleCaregiverBookingSubmit()}
            />

            <section className="rounded-[1.85rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contact options</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {[
                  {
                    label: "In-platform chat",
                    value: isAuthenticated ? "Platforma ichida ochiladi" : "Login orqali ochiladi",
                    action: () => void handleOpenServiceChat(),
                    button: true
                  },
                  {
                    label: "Telefon",
                    value:
                      showContacts && agent.contactPhone
                        ? agent.contactPhone
                        : isAuthenticated
                          ? "Bookingdan keyin ochiladi"
                          : "Login talab qilinadi",
                    href: showContacts && agent.contactPhone ? `tel:${agent.contactPhone}` : undefined
                  },
                  {
                    label: "Telegram",
                    value:
                      showContacts && agent.contactTelegram
                        ? agent.contactTelegram
                        : isAuthenticated
                          ? "Bookingdan keyin ochiladi"
                          : "Login talab qilinadi",
                    href:
                      showContacts && agent.contactTelegram
                        ? `https://t.me/${agent.contactTelegram.replace("@", "")}`
                        : undefined
                  }
                ].map((item) =>
                  item.button ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-950">{item.value}</span>
                    </button>
                  ) : item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-950">{item.value}</span>
                    </a>
                  ) : (
                    <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                      <span>{item.label}</span>
                      <span className="text-right font-semibold text-slate-950">{item.value}</span>
                    </div>
                  )
                )}
              </div>
            </section>

            <QuickInquiryPanel
              title="Quick inquiry chat"
              description="Savollar, jadval aniqligi yoki caregiver bilan tanishish uchun yozing. Booking request bu blokdan alohida."
              isOpen={serviceChatOpen || Boolean(serviceChatThread) || serviceChatMessages.length > 0}
              closedCtaLabel="Chatni ochish"
              onOpen={() => void handleOpenServiceChat()}
            >
              <InquiryComposer
                title="Quick inquiry chat"
                description="Savollar, jadval aniqligi yoki caregiver bilan tanishish uchun yozing. Booking request bu blokdan alohida."
                messages={serviceChatMessages.map((message) => ({
                  id: message.id,
                  threadId: message.threadId,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  recipientId: message.recipientId,
                  text: message.text,
                  createdAt: message.createdAt
                }))}
                draft={serviceChatDraft}
                onDraftChange={setServiceChatDraft}
                onSend={() => void handleSendServiceMessage()}
                loading={serviceChatLoading}
                sending={serviceChatSending}
                currentUserId={userId}
                existingThreadHint={serviceChatThread ? "Oldingi suhbatni davom ettiryapsiz." : null}
              />
            </QuickInquiryPanel>

            {notice ? (
              <p className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                {notice}
              </p>
            ) : null}
          </aside>

          <div className="order-2 space-y-6 lg:order-1">
            <ServiceGallery
              items={serviceImages}
              fallbackSrc={getNannyFallback(service.id, 0) || "/images/fallback-service.png"}
            />

            <ServicePrice
              priceLabel={`${formatCount(service.price)} ${service.currency}`}
              pricingModel={resolveCaregiverPricingModel(service.unit)}
              supportingStats={[
                { label: "Buyurtmalar", value: formatCount(agent.completedOrders ?? service.usedCount) },
                { label: "Reviewlar", value: formatCount(service.reviewCount) },
                { label: "Care focus", value: careFocus[0] }
              ]}
            />

            <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Service highlights</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Ishonch va xavfsizlik tafsilotlari</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {nannyTypeLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "First aid training",
                    value: hasFirstAid ? "Mavjud" : "Ko'rsatilmagan",
                    hint: "Birinchi yordam yoki tibbiy tayyorgarlik."
                  },
                  {
                    label: "Childcare certifications",
                    value: service.certificates[0] || "Sertifikat yo'q",
                    hint: service.certificates.slice(1).join(", ") || "Qo'shimcha ma'lumot so'rang."
                  },
                  {
                    label: "Experience with children",
                    value: careFocus.join(", "),
                    hint: "Yosh guruhi va parvarish yo'nalishi."
                  },
                  {
                    label: "Safety status",
                    value: agent.healthStatus || "Sog'liq holati ko'rsatilmagan",
                    hint: agent.hasCriminalRecord ? "Qo'shimcha background tekshiruvi tavsiya etiladi." : "Background checked / sudlanmagan."
                  }
                ].map((item) => (
                  <article key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{item.value}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.hint}</p>
                  </article>
                ))}
              </div>

              {agent.identityImage ? (
                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                  <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                    <img
                      src={agent.identityImage.src}
                      alt={agent.identityImage.alt}
                      className="h-full min-h-52 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = agent.avatar.src;
                      }}
                    />
                    <div className="p-5">
                      <p className="text-sm font-semibold text-slate-950">Verified identity preview</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Platforma uchun identity verification mavjud. Ota-onalar uchun trust va xavfsizlikni oshirish maqsadida caregiver tekshirilgan ma'lumot bilan ko'rsatiladi.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Service description</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Parvarish xizmati tavsifi</h2>
              <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
                <div>
                  <p className="text-sm leading-7 text-slate-600">{service.description}</p>
                  {agent.bio ? <p className="mt-4 text-sm leading-7 text-slate-600">{agent.bio}</p> : null}
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Caregiver type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{nannyTypeLabel}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Family fit</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {agent.maritalStatus || "Oilaviy holat ko'rsatilmagan"} · {agent.age ?? "—"} yosh
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Equipment</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {(agent.equipment || ["Asosiy parvarish jihozlari"]).slice(0, 3).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <CaregiverProcess steps={caregiverProcess} />

            <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Work examples / media</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Parvarishdan media previewlar</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Muhit, kundalik rutina va caregiver ishlash uslubi haqida umumiy tasavvur beruvchi media blok.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mediaCards.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50 shadow-sm">
                    <img
                      src={item.image.src}
                      alt={item.image.alt}
                      className="aspect-[4/3] w-full object-cover"
                      onError={(event) => {
                        const fallback = getNannyFallback(service.id, index + 1);
                        if (fallback) {
                          event.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <CaregiverReviews
              rating={service.rating}
              reviewCount={service.reviewCount}
              reviews={caregiverReviews}
            />

            <RelatedCaregivers items={relatedCaregivers} />
          </div>
        </div>
      </div>
    );
  }

  if (isMarketing) {
    const creativeOffer = resolveCreativeOfferShape(service);
    const responseHours = (hashValue(agent.id) % 3) + 1;
    const responseSpeed = responseHours === 1 ? "~1 soat ichida" : `~${responseHours} soat ichida`;
    const creativeSubtitle = `${creativeOffer.subtitle} ${service.description}`;
    const creativePortfolioItems = buildCreativePortfolioItems(service, agent, marketingPosts, postStats);
    const heroItems = creativePortfolioItems.slice(0, 4);
    const creativeReviews = buildCreativeReviews(service, agent);
    const creativeProcess = buildCreativeProcess(creativeOffer.deliveryTime);
    const heroStats: CreativeStat[] = [
      { label: "Reyting", value: `${service.rating.toFixed(1)} / 5` },
      { label: "Projects", value: formatCount(agent.completedOrders ?? service.usedCount) },
      { label: "Response", value: responseSpeed },
      { label: "Format", value: service.unit }
    ];
    const quickContacts = [
      {
        label: "Telefon",
        value:
          showContacts && agent.contactPhone
            ? agent.contactPhone
            : isAuthenticated
              ? "Buyurtmadan keyin ochiladi"
              : "Login talab qilinadi",
        href: showContacts && agent.contactPhone ? `tel:${agent.contactPhone}` : undefined
      },
      {
        label: "Telegram",
        value:
          showContacts && agent.contactTelegram
            ? agent.contactTelegram
            : isAuthenticated
              ? "Buyurtmadan keyin ochiladi"
              : "Login talab qilinadi",
        href:
          showContacts && agent.contactTelegram
            ? `https://t.me/${agent.contactTelegram.replace("@", "")}`
            : undefined
      },
      {
        label: "In-platform chat",
        value: serviceChatThread ? "Suhbat davom etmoqda" : "Platforma ichida ochiladi",
        href: undefined
      }
    ];
    const similarCreativeServices: RelatedDetailItem[] = category.agents
      .flatMap((categoryAgent) =>
        categoryAgent.services.map((item) => ({
          item,
          categoryAgent
        }))
      )
      .filter(({ item }) => item.id !== service.id)
      .slice(0, 3)
      .map(({ item, categoryAgent }) => ({
        id: item.id,
        href: `/services/${item.id}`,
        image: item.images[0]?.src || categoryAgent.avatar.src,
        title: item.title,
        subtitle: categoryAgent.name,
        priceLabel: `${formatCount(item.price)} ${item.currency} / ${item.unit}`,
        rating: item.rating,
        meta: `${categoryAgent.region || categoryAgent.location} · ${dayjs(item.createdAt).fromNow()}`,
        tag: "Creative"
      }));
    const actionStatus = showContacts
      ? "Rasmiy buyurtma yuborildi. Kontaktlar va keyingi qadamlar ochildi."
      : serviceChatThread
        ? "Oldingi suhbatni davom ettirishingiz mumkin."
        : null;

    return (
      <>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
          <CreativeServiceHero
            breadcrumb={[groupTitle, category.title, agent.specialty]}
            categoryLabel={category.title}
            title={service.title}
            subtitle={creativeSubtitle}
            items={heroItems}
            stats={heroStats}
            onPreview={setActivePortfolioItem}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <DeliverablesSection
                title="Buyer receives"
                subtitle="Buyurtma qilingandan keyin aniq deliverable formatlari va topshirish ko'rinishi shu scope asosida yuradi."
                items={creativeOffer.deliverables}
              />

              <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Service description</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Creative value proposition</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {service.unit} formatida topshiriladi
                  </span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                  <div>
                    <p className="text-sm leading-7 text-slate-600">{service.description}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {agent.bio || `${agent.name} brend tili, audience intent va conversion maqsadini birlashtirib ijodiy xizmat beradi.`}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ideal use case</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">Launch, promo, UGC-style ads, product storytelling</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Certificates / proof</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {service.certificates.map((certificate) => (
                          <span key={certificate} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                            {certificate}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <PortfolioShowcaseGrid
                title="Portfolio showcase"
                subtitle="Bu kartalar oddiy media emas. Har biri portfolio proof sifatida creative output, format va engagement signalini ko'rsatadi."
                items={creativePortfolioItems}
                onPreview={setActivePortfolioItem}
              />

              <ServiceProcessSection
                title="How it works"
                subtitle="Chat va formal order bir-biridan ajratilgan. Brief aniqlash, creative tayyorlash va final topshirish shu oqimda yuradi."
                steps={creativeProcess}
              />

              <ServiceReviews
                rating={service.rating}
                reviewCount={service.reviewCount}
                reviews={creativeReviews}
              />

              <ServiceRelated title="O'xshash creative xizmatlar" items={similarCreativeServices} />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <CreatorSidebarCard
                avatarSrc={agent.avatar.src}
                avatarAlt={agent.avatar.alt}
                fallbackText={agent.name}
                fullName={agent.name}
                username={agent.nickname}
                verified={agent.verified}
                specialty={agent.specialty}
                experienceLabel={`${agent.experienceYears} yil`}
                location={agent.region || agent.location}
                ratingLabel={`${agent.rating.toFixed(1)} / 5`}
                completedProjectsLabel={formatCount(agent.completedOrders ?? service.usedCount)}
                responseSpeed={responseSpeed}
                bio={agent.bio}
              />

              <ServicePackageSummary
                priceLabel={`${formatCount(service.price)} ${service.currency}`}
                unitLabel={creativeOffer.unitLabel}
                deliveryTime={creativeOffer.deliveryTime}
                revisions={creativeOffer.revisions}
                included={creativeOffer.included}
              />

              <ServicePrimaryActions
                status={actionStatus}
                actions={[
                  {
                    key: "order",
                    label: showServiceOrderForm ? "Buyurtma formasini yopish" : "Buyurtma berish",
                    tone: "primary",
                    busy: submitState === "loading",
                    onClick: () => {
                      if (!isAuthenticated) {
                        setNotice("Buyurtma berish uchun oldin login bo'ling.");
                        setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                        return;
                      }
                      setNotice(null);
                      setShowServiceOrderForm((prev) => !prev);
                    }
                  },
                  {
                    key: "message",
                    label: serviceChatOpen ? "Chat ochiq" : "Xabar yozish",
                    tone: "secondary",
                    onClick: () => void handleOpenServiceChat()
                  },
                  {
                    key: "save",
                    label: saved ? "Saqlangan" : "Saqlash",
                    tone: "ghost",
                    onClick: handleToggleSavedState
                  }
                ]}
                supportActions={[
                  {
                    key: "share",
                    label: "Ulashish",
                    onClick: () => void handleShareService()
                  },
                  {
                    key: "report",
                    label: "Shikoyat",
                    onClick: () => {
                      document.getElementById("creative-feedback")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }
                ]}
              />

              <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Quick contact</p>
                    <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">Bog'lanish yo'llari</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleOpenServiceChat()}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    Chat
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {quickContacts.map((item) =>
                    item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <span>{item.label}</span>
                        <span className="font-semibold text-slate-950">{item.value}</span>
                      </a>
                    ) : (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{item.label}</span>
                        <span className="text-right font-semibold text-slate-950">{item.value}</span>
                      </div>
                    )
                  )}
                </div>
              </section>

              <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Trust indicators</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: "Verified creator", value: agent.verified ? "Tasdiqlangan" : "Tekshiruv kutilmoqda" },
                    { label: "UniServe secure workflow", value: "Chat + formal order ajratilgan" },
                    { label: "Revision policy", value: creativeOffer.revisions },
                    { label: "Delivery timeline", value: creativeOffer.deliveryTime },
                    { label: "Completed projects", value: formatCount(agent.completedOrders ?? service.usedCount) }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
                {showServiceOrderForm ? (
                  <RequestFormPanel
                    title="Formal order / request"
                    description="Brief, kontakt va topshirish kontekstini structured ko'rinishda yuboring. Bu chatdan alohida yuradi."
                    submitLabel="Buyurtmani yuborish"
                    onSubmit={() => void handleServiceOrderSubmit()}
                    submitting={submitState === "loading"}
                  >
                    <input
                      value={serviceOrderDraft.customerName}
                      onChange={(event) =>
                        setServiceOrderDraft((prev) => ({ ...prev, customerName: event.target.value }))
                      }
                      placeholder="Ismingiz"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                    />
                    <input
                      value={serviceOrderDraft.customerPhone}
                      onChange={(event) =>
                        setServiceOrderDraft((prev) => ({ ...prev, customerPhone: event.target.value }))
                      }
                      placeholder="Telefon raqamingiz"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                    />
                    <textarea
                      value={serviceOrderDraft.customerAddress}
                      onChange={(event) =>
                        setServiceOrderDraft((prev) => ({ ...prev, customerAddress: event.target.value }))
                      }
                      placeholder="Qisqacha brief, mahsulot yoki kampaniya vazifasi"
                      className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                    />
                    <input
                      value={serviceOrderDraft.destinationAddress}
                      onChange={(event) =>
                        setServiceOrderDraft((prev) => ({ ...prev, destinationAddress: event.target.value }))
                      }
                      placeholder="Platforma / kanal (Instagram, TikTok, blog va h.k.)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                    />
                    <textarea
                      value={serviceOrderDraft.note}
                      onChange={(event) =>
                        setServiceOrderDraft((prev) => ({ ...prev, note: event.target.value }))
                      }
                      placeholder="Deadline, brand tone yoki qo'shimcha izoh"
                      className="min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                    />
                  </RequestFormPanel>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Formal order / request</p>
                    <p className="text-xs leading-6 text-slate-500">
                      Chat savol-javob uchun. Rasmiy buyurtma esa brief va kontaktlar bilan alohida yuboriladi.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setNotice("Buyurtma berish uchun oldin login bo'ling.");
                          setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                          return;
                        }
                        setNotice(null);
                        setShowServiceOrderForm(true);
                      }}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Formani ochish
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
                {serviceChatOpen || serviceChatThread || serviceChatMessages.length > 0 ? (
                  <InquiryComposer
                    title="Quick inquiry chat"
                    description="Narx, brief aniqligi yoki portfolio yuzasidan savollarni shu yerda yuboring. Bu formal order emas."
                    messages={serviceChatMessages.map((message) => ({
                      id: message.id,
                      threadId: message.threadId,
                      senderId: message.senderId,
                      senderName: message.senderName,
                      recipientId: message.recipientId,
                      text: message.text,
                      createdAt: message.createdAt
                    }))}
                    draft={serviceChatDraft}
                    onDraftChange={setServiceChatDraft}
                    onSend={() => void handleSendServiceMessage()}
                    loading={serviceChatLoading}
                    sending={serviceChatSending}
                    currentUserId={userId}
                    existingThreadHint={serviceChatThread ? "Oldingi suhbatni davom ettiryapsiz." : null}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Quick inquiry chat</p>
                    <p className="text-xs leading-6 text-slate-500">
                      Portfolio, deliverable yoki timeline haqida aniqlik kiritish uchun creator bilan to'g'ridan-to'g'ri yozing.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleOpenServiceChat()}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                    >
                      Chatni ochish
                    </button>
                  </div>
                )}
              </section>

              <div id="creative-feedback" className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
                <FeedbackWidget
                  title="Portfolio foydalimi?"
                  description="Portfolio sizga xizmat sifati va output uslubini yetarli darajada ko'rsatyaptimi, shu blokda baholang."
                  actions={[
                    { label: "Foydali", value: "helpful", count: serviceReaction.likes },
                    { label: "Mos emas", value: "unhelpful", count: serviceReaction.dislikes }
                  ]}
                  activeValue={
                    serviceReaction.reaction === "like"
                      ? "helpful"
                      : serviceReaction.reaction === "dislike"
                        ? "unhelpful"
                        : null
                  }
                  disabled={service.canRate === false}
                  loading={serviceReactionLoading}
                  onSelect={(value) => void handleServiceReactionToggle(value === "helpful" ? "like" : "dislike")}
                  saved={saved}
                  onToggleSaved={handleToggleSavedState}
                  onShare={() => void handleShareService()}
                  reportReason={reportReason}
                  onReportReasonChange={setReportReason}
                  onSubmitReport={() => void handleSubmitServiceReport()}
                  reportSubmitting={reportSubmitting}
                  showUtilityActions={false}
                />
              </div>

              {notice ? (
                <p className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  {notice}
                </p>
              ) : null}
            </aside>
          </div>
        </div>

        <PortfolioItemPreviewModal
          item={activePortfolioItem}
          onClose={() => setActivePortfolioItem(null)}
        />
      </>
    );
  }

  if (isKnowledgeVertical) {
    const consultingFormat = agent.consultationFormats?.length
      ? agent.consultationFormats
      : ["Online", "Offline"];
    const consultingDurations = agent.consultationDurations?.length
      ? agent.consultationDurations
      : ["30 min", "60 min"];
    const consultingLanguages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const consultingPackages = agent.consultationPackages?.length
      ? agent.consultationPackages
      : ["1 martalik", "Paket"];
    const psychologyFormats = agent.consultationFormats?.length ? agent.consultationFormats : ["Chat", "Video"];
    const psychologyDurations = agent.consultationDurations?.length ? agent.consultationDurations : ["50 daqiqa"];
    const psychologyLanguages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const psychologyAudiences = agent.audiences?.length ? agent.audiences : ["Kattalar"];
    const psychologyMethods = ["CBT", "Gestalt", "Mindfulness"];
    const translationCategoryLabels: Record<string, string> = {
      "translation-official": "Rasmiy hujjatlar",
      "translation-education": "Ta'lim hujjatlari",
      "translation-visa": "Visa / Migratsiya",
      "translation-business": "Biznes",
      "translation-medical": "Tibbiy",
      "translation-technical": "Texnik",
      "translation-oral": "Og'zaki",
      "translation-personal": "Shaxsiy"
    };
    const translationCategory = translationCategoryLabels[service.subCategory || ""] || "Tarjimonlik xizmati";
    const translationPair = `${service.sourceLang || "—"} → ${service.targetLang || "—"}`;
    const translationSlaLabel =
      service.translationSpeed === "shoshilinch"
        ? "2-6 soat"
        : hashValue(service.id) % 3 === 0
          ? "24 soat"
          : "2-3 ish kuni";
    const translationOfficialTags = [
      service.notarization ? "Notarial" : "Oddiy",
      service.translationFormat === "Original" ? "Muhrli" : "Oddiy"
    ].filter((value, idx, arr) => arr.indexOf(value) === idx);
    const legalJurisdictionLabel =
      service.legalJurisdiction === "KR"
        ? "Koreya"
        : service.legalJurisdiction === "INT"
          ? "Xalqaro"
          : "O‘zbekiston";
    const legalFormats = service.legalFormat?.length ? service.legalFormat : ["chat"];
    const sportFormats = service.sportFormat?.length ? service.sportFormat : ["online", "offline"];
    const sportAudience = service.sportAudience?.length ? service.sportAudience : agent.audiences?.length ? agent.audiences : ["Kattalar"];
    const sportPlan = service.sportPlan?.length ? service.sportPlan : ["Maqsadni aniqlash", "Haftalik reja", "Tekshiruv va moslashtirish"];
    const sportResult = service.sportResult || "Natija haftalik progress review orqali kuzatiladi.";
    const responseHours = (hashValue(agent.id) % 8) + 1;
    const availability = getAvailabilityLabel(agent);
    const knowledgeReviews = buildKnowledgeReviews(category.id, service, agent);
    const knowledgeRelatedItems = buildKnowledgeRelatedItems(category, service, agent);
    const commonContacts: DetailContactMethod[] = [
      ...(agent.contactPhone
        ? [{ key: "phone", label: "Telefon", value: agent.contactPhone, href: `tel:${agent.contactPhone}` }]
        : []),
      ...(agent.contactTelegram
        ? [
            {
              key: "telegram",
              label: "Telegram",
              value: agent.contactTelegram,
              href: `https://t.me/${agent.contactTelegram.replace("@", "")}`
            }
          ]
        : []),
      {
        key: "chat",
        label: "Chat",
        value: serviceChatThread ? "Suhbat davom etmoqda" : "Platforma ichida ochiladi",
        locked: !isAuthenticated
      }
    ];
    const sidebarTrustItems = isConsulting
      ? [
          { label: "Trust score", value: `${Math.min(100, 55 + Math.round(service.rating * 6) + agent.experienceYears)}/100` },
          { label: "Availability", value: availability.label },
          { label: "Response", value: `~${responseHours} soat` },
          { label: "Packages", value: consultingPackages.join(" • ") }
        ]
      : isTranslation
        ? [
            { label: "Language pair", value: translationPair },
            { label: "SLA", value: translationSlaLabel },
            { label: "Formality", value: translationOfficialTags.join(" • ") },
            { label: "Delivery", value: "Secure result handoff" }
          ]
        : isLegal
          ? [
              { label: "Jurisdiction", value: legalJurisdictionLabel },
              { label: "Response", value: service.legalResponseTime || "~24 soat" },
              { label: "License", value: agent.legalLicenseMasked || "Tekshirilgan profil" },
              { label: "Confidentiality", value: "Platforma ichida himoyalangan" }
            ]
          : isPsychology
            ? [
                { label: "Format", value: psychologyFormats.join(" • ") },
                { label: "Session", value: psychologyDurations.join(" • ") },
                { label: "Audience", value: psychologyAudiences.join(" • ") },
                { label: "Privacy", value: "Only user + therapist" }
              ]
            : [
                { label: "Sport", value: service.sportType || "Sport training" },
                { label: "Format", value: sportFormats.join(" • ") },
                { label: "Audience", value: sportAudience.join(" • ") },
                { label: "Students", value: `${formatCount(agent.sportStudentsCount ?? 0)}` }
              ];
    const knowledgeSubtitle = isConsulting
      ? `Outcome-driven consulting with ${consultingFormat.join(", ")} formatlar, ${consultingLanguages.join(", ")} tillar va ~${responseHours} soat response cadence.`
      : isTranslation
        ? `${translationCategory} • ${translationPair} • ${translationSlaLabel} • upload-first workflow.`
        : isLegal
          ? `${service.legalArea || "Huquqiy yo'nalish"} • ${service.legalServiceType || "Maslahat"} • ${legalJurisdictionLabel} • maxfiy request flow.`
          : isPsychology
            ? `Calm, private, and therapist-led support with ${psychologyFormats.join(", ")} formatlar hamda ${psychologyDurations.join(", ")} sessionlar.`
            : `${service.sportType || "Sport coaching"} • ${service.sportLevel || "Daraja"} • ${sportFormats.join(", ")} • progress-oriented coaching flow.`;
    const knowledgeMeta = isConsulting
      ? [
          { label: `${consultingFormat.join(" • ")}`, tone: "emerald" as const },
          { label: `${consultingLanguages.join(" • ")}`, tone: "sky" as const },
          { label: `${consultingDurations.join(" • ")}`, tone: "amber" as const },
          { label: `⭐ ${service.rating.toFixed(1)}`, tone: "slate" as const }
        ]
      : isTranslation
        ? [
            { label: translationPair, tone: "sky" as const },
            { label: translationSlaLabel, tone: "emerald" as const },
            { label: translationOfficialTags.join(" • "), tone: "amber" as const },
            { label: `⭐ ${service.rating.toFixed(1)}`, tone: "slate" as const }
          ]
        : isLegal
          ? [
              { label: service.legalArea || "Huquqiy xizmat", tone: "emerald" as const },
              { label: legalJurisdictionLabel, tone: "sky" as const },
              { label: service.legalResponseTime || "~24 soat", tone: "amber" as const },
              { label: `⭐ ${service.rating.toFixed(1)}`, tone: "slate" as const }
            ]
          : isPsychology
            ? [
                { label: psychologyFormats.join(" • "), tone: "emerald" as const },
                { label: psychologyDurations.join(" • "), tone: "sky" as const },
                { label: psychologyLanguages.join(" • "), tone: "amber" as const },
                { label: "Private", tone: "slate" as const }
              ]
            : [
                { label: service.sportType || "Sport", tone: "emerald" as const },
                { label: service.sportLevel || "Daraja", tone: "sky" as const },
                { label: sportFormats.join(" • "), tone: "amber" as const },
                { label: `⭐ ${service.rating.toFixed(1)}`, tone: "slate" as const }
              ];
    const descriptionTags = isConsulting
      ? [...consultingPackages, ...consultingLanguages]
      : isTranslation
        ? [...translationOfficialTags, service.translationMode === "oral" ? "Og'zaki" : "Yozma", service.translationFormat || "PDF"]
        : isLegal
          ? [service.legalArea || "Huquqiy xizmat", service.legalServiceType || "Maslahat", legalJurisdictionLabel, ...legalFormats]
          : isPsychology
            ? [...psychologyFormats, ...psychologyLanguages.slice(0, 2), ...psychologyMethods.slice(0, 2)]
            : [service.sportType || "Sport", ...(service.sportLevel ? [service.sportLevel] : []), ...sportFormats];
    const descriptionHighlights = isConsulting
      ? [
          "Outcome-first consultation summary",
          "Timezone/currency aware coordination",
          "Formal request and quick chat ajratilgan"
        ]
      : isTranslation
        ? [
            "Document-first intake",
            "Deadline and delivery format upfront",
            "Secure result handoff"
          ]
        : isLegal
          ? [
              "Scope summary before request",
              "Included / excluded items ko'rinadi",
              "Confidentiality signal doim visible"
            ]
          : isPsychology
            ? [
                "Calm and private layout",
                "Method + session flow upfront",
                "Chat va formal request ajratilgan"
              ]
            : [
                "Training plan va expected outcome ko'rinadi",
                "Format / location / audience upfront",
                "Coach trust summary sticky sidebar'da"
              ];
    const processSteps = isConsulting
      ? [
          { title: "Brief yuboriladi", description: "Muammo, maqsad va deadline structured request bilan yuboriladi." },
          { title: "Expert review", description: "Consultant so'rovni ko'rib chiqib, mos format va availabilityni tasdiqlaydi." },
          { title: "Session / chat", description: "Chat, call yoki video formatda ishlash boshlanadi." },
          { title: "Action plan", description: "Yakunida keyingi qadamlar va outcome summary beriladi." }
        ]
      : isTranslation
        ? [
            { title: "Hujjat yuklanadi", description: "Document turi, format va deadline ko'rsatiladi." },
            { title: "Tarjimon ish boshlaydi", description: "Til juftligi va SLA bo'yicha tarjima bajariladi." },
            { title: "Review / approval", description: "Kerak bo'lsa format va rasmiylik bo'yicha tekshiruv qilinadi." },
            { title: "Secure delivery", description: "Yakuniy natija platforma orqali xavfsiz topshiriladi." }
          ]
        : isLegal
          ? [
              { title: "Scope aniqlanadi", description: "Yurisdiksiya, issue va service type oldindan belgilab olinadi." },
              { title: "Lawyer review", description: "Mutaxassis hujjat yoki savolni ko'rib chiqadi." },
              { title: "Response flow", description: "Yozma tavsiya, hujjat review yoki maslahat shaklida javob beriladi." },
              { title: "Next steps", description: "Nima kiritilgan va keyingi qadamlar aniq ko'rsatiladi." }
            ]
        : isPsychology
          ? [
              { title: "Safe intro", description: "Issue va session format xavfsiz tarzda tanlanadi." },
              { title: "Session planning", description: "Duration, format va terapevtik yondashuv moslanadi." },
              { title: "Therapy session", description: "Chat/audio/video yoki offline seans o'tkaziladi." },
              { title: "Follow-up", description: "Resources, assignments yoki next-step tavsiyalar beriladi." }
            ]
        : [
            { title: "Goal setting", description: "Coach bilan maqsad, daraja va format aniqlanadi." },
            { title: "Training plan", description: "Weekly plan va expected outcome shakllantiriladi." },
            { title: "Sessions", description: "Online/offline mashg'ulotlar va progress tracking yuradi." },
            { title: "Review", description: "Natija bo'yicha feedback va plan adjustment beriladi." }
          ];
    const sessionPlan = isConsulting
      ? [
          `${consultingDurations.join(" • ")} sessionlar`,
          `${consultingPackages.join(" • ")} package modeli`,
          `${consultingLanguages.join(" • ")} tillar`,
          `${availability.label} availability`
        ]
      : isPsychology
        ? [
            `${psychologyFormats.join(" • ")} formatlar`,
            `${psychologyDurations.join(" • ")} duration`,
            `${psychologyAudiences.join(" • ")} audience`,
            `${psychologyMethods.join(" • ")} yondashuv`
          ]
        : isSport
          ? [
              ...sportPlan,
              `Natija: ${sportResult}`
            ]
          : [];
    const knowledgeTone = isConsulting
      ? "business"
      : isTranslation
        ? "default"
        : isLegal
          ? "structured"
          : isPsychology
            ? "calm"
            : "active";
    const heroProviderHighlights = isConsulting
      ? [consultingFormat[0], consultingLanguages[0], consultingPackages[0]]
      : isTranslation
        ? [translationPair, translationSlaLabel, translationOfficialTags[0] || "Oddiy"]
        : isLegal
          ? [legalJurisdictionLabel, legalFormats[0] || "Chat", service.legalResponseTime || "~24 soat"]
          : isPsychology
            ? [psychologyFormats[0], psychologyDurations[0], "Private"]
            : [service.sportType || "Sport", service.sportLevel || "Daraja", sportFormats[0] || "Online"];
    const heroValueBullets = isConsulting
      ? [
          `Format: ${consultingFormat.join(" • ")}`,
          `Duration: ${consultingDurations.join(" • ")}`,
          `Response: ~${responseHours} soat`
        ]
      : isTranslation
        ? [
            `Language pair: ${translationPair}`,
            `Deadline: ${translationSlaLabel}`,
            `Delivery: secure handoff`
          ]
        : isLegal
          ? [
              `Jurisdiction: ${legalJurisdictionLabel}`,
              `Scope: ${service.legalServiceType || "Maslahat"}`,
              `Response: ${service.legalResponseTime || "~24 soat"}`
            ]
          : isPsychology
            ? [
                `Format: ${psychologyFormats.join(" • ")}`,
                `Session: ${psychologyDurations.join(" • ")}`,
                "Private booking flow"
              ]
            : [
                `Plan: ${sportPlan[0]}`,
                `Format: ${sportFormats.join(" • ")}`,
                `Audience: ${sportAudience.join(" • ")}`
              ];
    const heroValueDescription = isConsulting
      ? "Deliverables, timeline va request consultation flow hero darajasida ko'rinadi."
      : isTranslation
        ? "Upload-first, deadline-first va translator trust signal'lari birinchi ekranda."
        : isLegal
          ? "Structured scope, confidentiality va consultation request oqimi upfront."
          : isPsychology
            ? "Confidentiality, therapist method va session expectation birinchi o'rinda."
            : "Training plan, level va progress logic birinchi qarashda ko'rinadi.";

    return (
      <VerticalDetailShell
        eyebrow={`${groupTitle} / ${category.title}`}
        title={service.title}
        subtitle={knowledgeSubtitle}
        meta={knowledgeMeta}
        tone={knowledgeTone}
        hero={
          <ServiceHeroGallery
            items={serviceImages.map((image) => ({ src: image.src, alt: image.alt }))}
            fallbackSrc={agent.avatar.src}
            stats={[
              { label: "Reyting", value: `${service.rating.toFixed(1)} / 5` },
              { label: "Sharhlar", value: `${formatCount(service.reviewCount)}` },
              { label: "Tugallangan", value: `${formatCount(agent.completedOrders ?? service.usedCount)}` }
            ]}
          />
        }
        heroAside={
          <>
            <ProviderMiniCard
              avatarSrc={agent.avatar.src}
              name={agent.name}
              username={agent.nickname}
              specialty={agent.specialty}
              badge={agent.verified ? "Verified profile" : null}
              trustLine={`${agent.region || agent.location} • ${agent.experienceYears} yil tajriba`}
              highlights={heroProviderHighlights}
            />
            <PriceValueCard
              eyebrow={isPsychology ? "Private session value" : isLegal ? "Consultation value" : isTranslation ? "Delivery value" : isConsulting ? "Engagement value" : "Coaching value"}
              price={formatMarketplacePrice(service.price, service.currency)}
              period={`/${service.unit}`}
              description={heroValueDescription}
              bullets={heroValueBullets}
              accent={isLegal ? "sky" : isPsychology ? "sky" : isSport ? "amber" : "emerald"}
            />
          </>
        }
        left={
          <>
            <ServiceDescriptionBlock
              eyebrow="Service summary"
              title={service.title}
              description={service.description}
              secondaryDescription={`Agent specialty: ${agent.specialty}. ${agent.bio || "Bu sahifa trust, conversion va category-specific workflow signal'larini bir joyga jamlaydi."}`}
              tags={descriptionTags}
              highlightTitle="Why this page converts"
              highlights={descriptionHighlights}
            />

            {isTranslation ? (
              <>
                <UploadFirstCTA
                  title="Upload-first translation flow"
                  description="Hujjat turini, deadline va formatni aniqlab, keyin translator bilan secure request oqimiga o'ting."
                  badges={[translationCategory, translationPair, translationSlaLabel]}
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setTranslationUploadOpen((prev) => !prev);
                        setTranslationStep(1);
                      }}
                      className="rounded-full bg-sky-400/90 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                    >
                      {translationUploadOpen ? "Upload blockni yopish" : "Hujjatni tayyorlash"}
                    </button>
                  }
                  helper="Formal order chatdan alohida yuradi. Hujjat preview va note shu blokda, request esa sidebar orqali yuboriladi."
                />

                {translationUploadOpen ? (
                  <section className="rounded-[1.7rem] border border-slate-800 bg-slate-950/72 p-5 shadow-lg shadow-black/20">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Files</label>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="mt-3 block w-full text-sm text-slate-300"
                          onChange={(event) =>
                            setTranslationFiles(
                              Array.from(event.target.files || []).map((file) => ({
                                file,
                                note: ""
                              }))
                            )
                          }
                        />
                        {translationFiles.length ? (
                          <div className="mt-4 grid gap-2 text-sm text-slate-300">
                            {translationFiles.map((item) => (
                              <p key={item.file.name}>• {item.file.name}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Speed</label>
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-slate-200"
                            value={translationSpeedChoice}
                            onChange={(event) => setTranslationSpeedChoice(event.target.value)}
                          >
                            <option value="normal">Oddiy</option>
                            <option value="fast">Shoshilinch</option>
                          </select>
                        </div>
                        <p className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                          {translationSpeedChoice === "fast"
                            ? "Tezkor ishlash uchun translator availability va qo'shimcha note zarur bo'lishi mumkin."
                            : "Oddiy oqim 2-3 ish kuni ichida secure delivery bilan yakunlanadi."}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}

            {isLegal ? (
              <>
                <ConfidentialityBanner
                  title="Confidential legal workflow"
                  description="Huquqiy so'rovlar, hujjatlar va chatlar faqat platforma ichida boshqariladi."
                  points={[
                    "Credentials verified before listing",
                    "Formal request va quick inquiry alohida",
                    "Scope va response flow upfront"
                  ]}
                />
                <IncludedExcludedBlock
                  title="Included vs excluded scope"
                  included={service.legalIncluded || ["Maslahat", "Yozma tavsiya", "Keyingi qadamlar"]}
                  excluded={service.legalExcluded || agent.legalExcludedMatters || ["Sudda vakillik", "Noqonuniy masalalar"]}
                />
              </>
            ) : null}

            {isPsychology ? (
              <>
                <ConfidentialityBanner
                  title="Calm, private, therapist-led space"
                  description="Bu detail page xavfsiz va maxfiy muhitni birinchi o'ringa qo'yadi. Chat va formal request alohida ishlaydi."
                  points={[
                    "Only user + therapist can access the conversation",
                    "Format va duration upfront",
                    "Emergency help emas, professional support flow"
                  ]}
                />
                <SessionPlanBlock
                  title="Session flow"
                  items={sessionPlan}
                  note="Therapy approach, audience, format va follow-up expectation oldindan ko'rinadi."
                />
              </>
            ) : null}

            {isConsulting ? (
              <SessionPlanBlock
                title="Package and availability summary"
                items={sessionPlan}
                note="One-time va package formatlari, tillar va availability shu blokda jamlangan."
              />
            ) : null}

            {isSport ? (
              <SessionPlanBlock
                title="Training plan and expected outcome"
                items={sessionPlan}
                note="Coach bilan progress support, outcome review va session cadence shu blokda ko'rinadi."
              />
            ) : null}

            <VerticalProcessBlock
              title="How this service works"
              description="Category-aware workflow foydalanuvchi keyingi qadamni tez tushunishi uchun soddalashtirilgan."
              steps={processSteps}
            />

            <ServiceReviews
              rating={service.rating}
              reviewCount={service.reviewCount}
              reviews={knowledgeReviews}
            />

            <RelatedServicesSection
              title={isSport ? "O'xshash coaching xizmatlar" : "O'xshash xizmatlar"}
              items={knowledgeRelatedItems}
            />
          </>
        }
        right={
          <>
            <AgentSummaryCard
              avatarSrc={agent.avatar.src}
              avatarAlt={agent.avatar.alt}
              fallbackText={agent.name}
              name={agent.name}
              username={agent.nickname}
              specialty={agent.specialty}
              badge={agent.verified ? "Verified profile" : undefined}
              trustLine={`${agent.region || agent.location} • ${agent.experienceYears} yil tajriba`}
              metaRows={[
                { label: "Location", value: agent.region || agent.location },
                { label: "Experience", value: `${agent.experienceYears} yil` },
                { label: "Response", value: `~${responseHours} soat` }
              ]}
              metrics={[
                { label: "Reyting", value: agent.rating.toFixed(1) },
                { label: "Reviews", value: formatCount(agent.reviewCount) },
                { label: "Jobs", value: formatCount(agent.completedOrders ?? service.usedCount) }
              ]}
              contacts={commonContacts}
            />

            <TrustSidebar
              title="Trust, delivery, and fit"
              description="Conversion va ishonch signal'lari sticky sidebar ichida jamlandi."
              items={sidebarTrustItems}
            />

            <PrimaryActionPanel
              title="Primary actions"
              subtitle="Formal request va chat alohida yuradi. Shu hierarchiya conversionni aniq qiladi."
              status={notice}
              actions={[
                {
                  key: "order",
                  label: showServiceOrderForm ? "Formani yopish" : "Buyurtma berish",
                  tone: "primary",
                  onClick: () => {
                    if (!isAuthenticated) {
                      setNotice("Buyurtma berish uchun oldin login bo'ling.");
                      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                      return;
                    }
                    setNotice(null);
                    setShowServiceOrderForm((prev) => !prev);
                  },
                  busy: submitState === "loading"
                },
                {
                  key: "chat",
                  label: serviceChatOpen || Boolean(serviceChatThread) ? "Chat ochiq" : "Xabar yozish",
                  tone: "secondary",
                  onClick: () => void handleOpenServiceChat()
                }
              ]}
              utilityActions={[
                {
                  key: "save",
                  label: saved ? "Saqlangan" : "Saqlash",
                  onClick: handleToggleSavedState,
                  active: saved
                },
                {
                  key: "share",
                  label: "Ulashish",
                  onClick: () => void handleShareService()
                }
              ]}
            />

            {showServiceOrderForm ? (
              <RequestFormPanel
                title="Formal order / request"
                description="Brief, contact va topshirish konteksti structured request ko'rinishida yuboriladi."
                submitLabel="Requestni yuborish"
                onSubmit={() =>
                  void handleServiceOrderSubmit(
                    isTranslation && translationFiles.length > 0
                      ? {
                          note: `${serviceOrderDraft.note}\nFiles: ${translationFiles.map((item) => item.file.name).join(", ")}`
                        }
                      : undefined
                  )
                }
                submitting={submitState === "loading"}
              >
                <input
                  value={serviceOrderDraft.customerName}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerName: event.target.value }))
                  }
                  placeholder="Ismingiz"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <input
                  value={serviceOrderDraft.customerPhone}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerPhone: event.target.value }))
                  }
                  placeholder="Telefon"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <input
                  value={serviceOrderDraft.customerAddress}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerAddress: event.target.value }))
                  }
                  placeholder={
                    isTranslation
                      ? "Document type / source context"
                      : isLegal
                        ? "Issue / scope summary"
                        : isPsychology
                          ? "Concern summary"
                          : isSport
                            ? "Goal / level summary"
                            : "Brief / current problem"
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <input
                  value={serviceOrderDraft.destinationAddress}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, destinationAddress: event.target.value }))
                  }
                  placeholder={
                    isTranslation
                      ? "Delivery format / deadline"
                      : isSport
                        ? "Preferred format / location"
                        : "Preferred format / channel"
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <textarea
                  value={serviceOrderDraft.note}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, note: event.target.value }))
                  }
                  placeholder="Qo'shimcha izoh"
                  className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
              </RequestFormPanel>
            ) : null}

            <QuickInquiryPanel
              title="Quick inquiry chat"
              description="Savollar, aniqliklar yoki moslik tekshiruvi uchun quick inquiry ishlatiladi."
              isOpen={serviceChatOpen || Boolean(serviceChatThread) || serviceChatMessages.length > 0}
              closedCtaLabel="Chatni ochish"
              onOpen={() => void handleOpenServiceChat()}
            >
              <InquiryComposer
                title="Quick inquiry chat"
                description="Bu formal order emas. Savol va aniqliklar uchun."
                messages={serviceChatMessages.map((message) => ({
                  id: message.id,
                  threadId: message.threadId,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  recipientId: message.recipientId,
                  text: message.text,
                  createdAt: message.createdAt
                }))}
                draft={serviceChatDraft}
                onDraftChange={setServiceChatDraft}
                onSend={() => void handleSendServiceMessage()}
                loading={serviceChatLoading}
                sending={serviceChatSending}
                currentUserId={userId}
                existingThreadHint={serviceChatThread ? "Oldingi suhbatni davom ettiryapsiz." : null}
              />
            </QuickInquiryPanel>

            <FeedbackWidget
              title="Bu sahifa foydalimi?"
              description="Trust, scope va workflow bloklari qaror qilishga yordam berdimi, shu yerda belgilang."
              actions={[
                { label: "Foydali", value: "helpful", count: serviceReaction.likes },
                { label: "Mos emas", value: "unhelpful", count: serviceReaction.dislikes }
              ]}
              activeValue={
                serviceReaction.reaction === "like"
                  ? "helpful"
                  : serviceReaction.reaction === "dislike"
                    ? "unhelpful"
                    : null
              }
              disabled={service.canRate === false}
              loading={serviceReactionLoading}
              onSelect={(value) => void handleServiceReactionToggle(value === "helpful" ? "like" : "dislike")}
              saved={saved}
              onToggleSaved={handleToggleSavedState}
              onShare={() => void handleShareService()}
              reportReason={reportReason}
              onReportReasonChange={setReportReason}
              onSubmitReport={() => void handleSubmitServiceReport()}
              reportSubmitting={reportSubmitting}
              showUtilityActions={false}
            />
          </>
        }
      />
    );
  }

  if (isConsulting) {
    const consultingFormat = agent.consultationFormats?.length
      ? agent.consultationFormats
      : ["Online", "Offline"];
    const consultingDurations = agent.consultationDurations?.length
      ? agent.consultationDurations
      : ["30 min", "60 min"];
    const consultingLanguages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const consultingPackages = agent.consultationPackages?.length
      ? agent.consultationPackages
      : ["1 martalik", "Paket"];
    const consultingTopics = [
      "Ta'lim",
      "Ish & kar'yera",
      "Viza",
      "Til & moslashuv",
      "Biznes",
      "Huquqiy",
      "Sog'liq"
    ];
    const availability = getAvailabilityLabel(agent);
    const responseHours = (hashValue(agent.id) % 8) + 1;
    const trustScore = Math.min(
      100,
      (agent.verified ? 20 : 0) +
        Math.round(service.rating * 4) +
        Math.min(20, Math.floor(service.reviewCount / 5)) +
        Math.min(20, Math.floor((agent.completedOrders ?? service.usedCount) / 6)) +
        Math.min(15, consultingLanguages.length * 3)
    );
    const monthsOnPlatform = Math.max(
      1,
      Math.floor((Date.now() - new Date(service.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    const converted = convertCurrency(service.price, service.currency, consultingCurrency);

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{category.title} · KST</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Service summary</p>
              <p className="text-lg font-semibold text-slate-900">{service.title}</p>
              <p className="text-sm text-slate-600">{service.description}</p>
              <div className="mt-2 grid gap-2 text-sm text-slate-700">
                <span>• Natija: aniq yo'l xarita va tekshiruv ro'yxati</span>
                <span>• Yo'nalish: {category.title}</span>
                <span>• Format: {consultingFormat.join(", ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {consultingLanguages.map((item) => (
                  <span key={`lang-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
                {consultingDurations.map((item) => (
                  <span key={`duration-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
                {consultingPackages.map((item) => (
                  <span key={`pack-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Konsultant haqida</p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={agent.avatar.src}
                  alt={agent.avatar.alt}
                  fallbackText={agent.name}
                  size={48}
                  className="border border-slate-300/70"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-600">{agent.specialty}</p>
                  <p className="text-[11px] text-slate-500">{agent.region || agent.location}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Tasdiqlangan ID</span>
                {service.certificates.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1">Sertifikat tekshirildi</span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1">Platformada: {monthsOnPlatform} oy</span>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>⭐ Reyting: {agent.rating.toFixed(1)}</span>
                <span>Sharhlar: {formatCount(agent.reviewCount)}</span>
                <span>Tugallangan ish: {formatCount(agent.completedOrders ?? service.usedCount)}</span>
                <span>Javob vaqti: ~{responseHours} soat</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  Trust Score: {trustScore}/100
                </span>
                <Link href={`/agents/${agent.id}`} className="text-sky-600 underline">
                  Profilni ko'rish
                </Link>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Moslik tekshiruvi</p>
                <button
                  type="button"
                  onClick={() => setMatchOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {matchOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {matchOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">So'rov mavzusi</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchTopic}
                        onChange={(event) => setMatchTopic(event.target.value)}
                      >
                        <option value="">Tanlang</option>
                        {consultingTopics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
                      <input
                        type="date"
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchDeadline}
                        onChange={(event) => setMatchDeadline(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Til</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchLanguage}
                        onChange={(event) => setMatchLanguage(event.target.value)}
                      >
                        {consultingLanguages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Format</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchFormat}
                        onChange={(event) => setMatchFormat(event.target.value)}
                      >
                        <option value="chat">Chat</option>
                        <option value="call">Qo'ng'iroq</option>
                        <option value="video">Video</option>
                        <option value="offline">Oflayn</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Qisqa tavsif</label>
                    <textarea
                      value={matchDescription}
                      onChange={(event) => setMatchDescription(event.target.value)}
                      className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                      placeholder="Muammo yoki maqsadni qisqacha yozing..."
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-500">
                    <input
                      type="checkbox"
                      checked={matchConsent}
                      onChange={(event) => setMatchConsent(event.target.checked)}
                    />
                    Maxfiylikga roziman
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setMatchStatus("sent")}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                    >
                      So'rov yuborish
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("accepted")}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700"
                    >
                      ✅ Qabul qilaman
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("declined")}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700"
                    >
                      ❌ Qabul qila olmayman
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("need")}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700"
                    >
                      🔄 Qo'shimcha ma'lumot kerak
                    </button>
                  </div>
                  {matchStatus !== "idle" && (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                      Status:{" "}
                      {matchStatus === "sent"
                        ? "So'rov yuborildi"
                        : matchStatus === "accepted"
                          ? "Agent qabul qildi"
                          : matchStatus === "declined"
                            ? "Agent mos emas deb topdi"
                            : "Agent qo'shimcha ma'lumot so'radi"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Narx & mavjudlik</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(converted.amount)} {converted.label}
              </p>
              {service.currency !== consultingCurrency && (
                <p className="text-xs text-slate-500">
                  Asl: {formatCount(service.price)} {service.currency} / {service.unit}
                </p>
              )}
              <p className="text-xs text-slate-600">Mavjudlik: {availability.label}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "So'rov yuborish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Qo'ng'iroqni bron qilish
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <button
                  type="button"
                  onClick={() => setConsultingCurrency("UZS")}
                  className={`rounded-full px-3 py-1 ${
                    consultingCurrency === "UZS"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  UZS
                </button>
                <button
                  type="button"
                  onClick={() => setConsultingCurrency("KRW")}
                  className={`rounded-full px-3 py-1 ${
                    consultingCurrency === "KRW"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  KRW
                </button>
                <span className="rounded-full bg-slate-100 px-3 py-1">KST</span>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Chat & hujjatlar</p>
              <p className="text-xs text-slate-600">
                So'rov yaratilgach, chat va fayl almashinuvi xavfsiz saqlanadi.
              </p>
              <textarea
                placeholder="Xabaringiz..."
                className="h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs"
              />
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(event) => setUploadedFiles(Array.from(event.target.files || []))}
                className="w-full text-xs text-slate-600"
              />
              {uploadedFiles.length > 0 && (
                <div className="grid gap-2 text-[11px] text-slate-500">
                  {uploadedFiles.map((file) => (
                    <span key={file.name}>📎 {file.name}</span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Xabar yuborish
              </button>
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Platforma qoidalari</p>
              <p>• Off-platform to'lov taqiqlanadi.</p>
              <p>• Disput/refund siyosati aniq va yozma.</p>
              <p>• Telefon/email yashirish ixtiyoriy, lekin tavsiya etiladi.</p>
              <p className="text-[11px] text-slate-500">
                Visa/huquqiy bo'limda: bu huquqiy vakillik emas.
              </p>
            </div>

            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isLegal) {
    const jurisdictionLabel =
      service.legalJurisdiction === "KR"
        ? "🇰🇷 Koreya"
        : service.legalJurisdiction === "INT"
          ? "Xalqaro"
          : "🇺🇿 O‘zbekiston";
    const formats = service.legalFormat?.length ? service.legalFormat : ["chat"];
    const included = service.legalIncluded?.length ? service.legalIncluded : ["Maslahat va yo'naltirish"];
    const excluded = service.legalExcluded?.length
      ? service.legalExcluded
      : ["Noqonuniy masalalar", "Sudda vakillik"];
    const education = agent.legalEducation?.length ? agent.legalEducation : ["Yurisprudensiya"];
    const specialties = agent.legalSpecialties?.length ? agent.legalSpecialties : [service.legalArea || "Huquqiy"];
    const excludedMatters = agent.legalExcludedMatters?.length
      ? agent.legalExcludedMatters
      : ["Noqonuniy masalalar"];
    const responseTime = service.legalResponseTime || "24 soat ichida";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">Huquqiy maslahat va xizmatlar</h1>
          <p className="text-sm text-slate-700">
            Sertifikatlangan huquqshunoslardan rasmiy va ishonchli maslahatlar.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">{service.title}</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Masala: {service.legalArea || "Huquqiy masala"}</span>
                <span>Yurisdiksiya: {jurisdictionLabel}</span>
                <span>Xizmat turi: {service.legalServiceType || "Maslahat"}</span>
                <span>Format: {formats.join(", ")}</span>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Bu xizmat nimani o'z ichiga oladi</p>
                <div className="mt-2 grid gap-1">
                  {included.map((item) => (
                    <span key={`inc-${item}`}>• {item}</span>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-slate-800">Bu xizmat nimani olmaydi</p>
                <div className="mt-2 grid gap-1">
                  {excluded.map((item) => (
                    <span key={`exc-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Huquqshunos profili</p>
              <div className="text-sm text-slate-700">
                <p>Ism: {agent.name}</p>
                <p>Litsenziya raqami: {agent.legalLicenseMasked || "Tekshirilgan"}</p>
                <p>Litsenziya bergan organ: {agent.legalLicenseAuthority || "—"}</p>
                <p>Tajriba: {agent.experienceYears} yil</p>
              </div>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Ta'lim: {education.join(", ")}</span>
                <span>Ixtisosliklar: {specialties.join(", ")}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi ishlarni qabul qilmaydi:
                <div className="mt-2 grid gap-1">
                  {excludedMatters.map((item) => (
                    <span key={`exm-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
              <p className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                🔒 Platforma tomonidan tekshirilgan
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Maslahat so'rash</p>
                <button
                  type="button"
                  onClick={() => setLegalRequestOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {legalRequestOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {legalRequestOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Muammo qisqacha tavsifi
                    </label>
                    <textarea
                      value={legalBrief}
                      onChange={(event) => setLegalBrief(event.target.value)}
                      className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      placeholder="Masalangizni qisqacha yozing..."
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Yurisdiksiya
                      </label>
                      <select
                        className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                        value={legalJurisdiction}
                        onChange={(event) => setLegalJurisdiction(event.target.value)}
                      >
                        <option value="UZ">🇺🇿 O‘zbekiston</option>
                        <option value="KR">🇰🇷 Koreya</option>
                        <option value="INT">Xalqaro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Xizmat turi
                      </label>
                      <select
                        className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                        value={legalServiceType}
                        onChange={(event) => setLegalServiceType(event.target.value)}
                      >
                        <option value="Og'zaki maslahat">Og'zaki maslahat</option>
                        <option value="Yozma huquqiy xulosa">Yozma huquqiy xulosa</option>
                        <option value="Hujjat tayyorlash">Hujjat tayyorlash</option>
                        <option value="Hujjat tekshirish">Hujjat tekshirish</option>
                        <option value="Vakillik">Vakillik</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
                    <input
                      type="date"
                      value={legalDeadline}
                      onChange={(event) => setLegalDeadline(event.target.value)}
                      className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Fayl biriktirish</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => setLegalFiles(Array.from(event.target.files || []))}
                      className="mt-2 w-full text-xs"
                    />
                    {legalFiles.length > 0 && (
                      <div className="mt-2 grid gap-1 text-[11px] text-slate-500">
                        {legalFiles.map((file) => (
                          <span key={file.name}>📎 {file.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    Bu umumiy maslahat bo'lib, sudda vakillikni anglatmaydi.
                  </p>
                  <button
                    type="button"
                    onClick={handleLegalRequestSubmit}
                    className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    So'rov yuborish
                  </button>
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Statuslar</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "sent", label: "So'rov yuborildi" },
                  { id: "accepted", label: "Qabul qilindi" },
                  { id: "review", label: "Ko'rib chiqilmoqda" },
                  { id: "answered", label: "Javob berildi" },
                  { id: "closed", label: "Yakunlandi" }
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setLegalStatus(step.id as typeof legalStatus)}
                    className={`rounded-full px-3 py-1 text-[11px] ${
                      legalStatus === step.id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Chat va hujjatlar faqat siz va huquqshunosga ko'rinadi.
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Narx</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency}
                </p>
              </div>
              <p className="text-xs text-slate-500">/{service.unit}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Javob: {responseTime}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Format: {formats.join(", ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLegalRequestOpen}
                  className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Maslahat so'rash
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                To'lov escrow'da. Disput bo'lsa hujjatlar dalil bo'ladi.
              </p>
            </div>
            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isSport) {
    const sportType = service.sportType || "Sport";
    const sportAudience = service.sportAudience?.length
      ? service.sportAudience
      : agent.audiences?.length
        ? agent.audiences
        : ["Kattalar"];
    const sportFormat = service.sportFormat?.length ? service.sportFormat : ["online"];
    const plan = service.sportPlan?.length ? service.sportPlan : ["Reja", "Progress tracking"];
    const achievements = agent.sportAchievements?.length ? agent.sportAchievements : ["—"];
    const certificates = agent.sportCertificates?.length ? agent.sportCertificates : ["—"];
    const excludedCases = agent.sportExcludedCases?.length ? agent.sportExcludedCases : ["Tibbiy cheklovlar"];
    const duration = service.sportDuration || "60 daqiqa";
    const weekly = service.sportWeeklySessions ? `${service.sportWeeklySessions} marta` : "—";
    const result = service.sportResult || "Individuallik va barqaror natija";
    const location = service.sportLocation || agent.location;
    const gym = service.sportGym || "—";
    const courseModules = service.sportCourseModules || [];
    const courseLength = service.sportCourseLength || "—";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">
            {sportType} · {service.sportLevel || "Daraja"} · {sportFormat.join(", ")}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {serviceImages.map((image) => (
                  <img
                    key={`sport-img-${image.src}`}
                    src={image.src}
                    alt={image.alt}
                    className="h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Sport turi: {sportType}</span>
                <span>Kimlar uchun: {sportAudience.join(", ")}</span>
                <span>Daraja: {service.sportLevel || "Boshlovchi"}</span>
                <span>Format: {sportFormat.join(", ")}</span>
                <span>Trening davomiyligi: {duration}</span>
                <span>Haftasiga: {weekly}</span>
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Trening rejasi</p>
                <div className="mt-2 grid gap-1">
                  {plan.map((item) => (
                    <span key={`sport-plan-${item}`}>• {item}</span>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-slate-800">Kutiladigan natija</p>
                <p className="mt-1">{result}</p>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Murabbiy profili</p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={agent.avatar.src}
                  alt={agent.avatar.alt}
                  fallbackText={agent.name}
                  size={48}
                  className="border border-slate-300/70"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-600">{agent.specialty}</p>
                </div>
              </div>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>O‘quvchilar: {agent.sportStudentsCount ?? 0}</span>
                <span>Sertifikatlar: {certificates.join(", ")}</span>
                <span>Yutuqlar: {achievements.join(", ")}</span>
              </div>
              <p className="text-xs text-slate-600">
                Murabbiylik falsafasi: {agent.sportPhilosophy || "Natija — intizom natijasi."}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi holatlarda qabul qilmaydi:
                <div className="mt-2 grid gap-1">
                  {excludedCases.map((item) => (
                    <span key={`sport-ex-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat tafsilotlari</p>
              {service.sportServiceType?.includes("kurs") || service.sportServiceType?.includes("Kurs") ? (
                <div className="grid gap-2 text-sm text-slate-700">
                  <span>Kurs davomiyligi: {courseLength}</span>
                  <span>Kimlar uchun: {sportAudience.join(", ")}</span>
                  <span>Nima o‘rganiladi:</span>
                  <div className="grid gap-1 text-[11px] text-slate-600">
                    {(courseModules.length ? courseModules : ["Modullar mavjud emas"]).map((item) => (
                      <span key={`sport-module-${item}`}>• {item}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 text-sm text-slate-700">
                  <span>Haftasiga: {weekly}</span>
                  <span>Reja: {plan.join(", ")}</span>
                  <span>Kuzatuv: {service.sportTracking ? "Progress tracking" : "Yo‘q"}</span>
                  <span>Diet tavsiyalari: {service.sportDiet ? "Bor" : "Yo‘q"}</span>
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Online / Offline</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Online: Video platforma + chat savollar</span>
                <span>Offline: {location} · {gym}</span>
                <span>Jadval: Kelishilgan</span>
              </div>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Chat + fayl almashish</p>
              <textarea
                placeholder="Savolingiz..."
                className="h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              />
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                onChange={(event) => setSportFiles(Array.from(event.target.files || []))}
                className="w-full text-xs text-slate-600"
              />
              {sportFiles.length > 0 && (
                <div className="grid gap-2 text-[11px] text-slate-500">
                  {sportFiles.map((file) => (
                    <span key={file.name}>📎 {file.name}</span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Xabar yuborish
              </button>
              <p className="text-[11px] text-slate-500">
                Progress uchun rasm/video yuklash mumkin.
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Narx</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency}
                </p>
              </div>
              <p className="text-xs text-slate-500">/{service.unit}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Davomiylik: {duration}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Joy: {location}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Yozilish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Kurs tugagach sertifikat va video yozuvlar taqdim etiladi (agar mavjud bo‘lsa).
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (isPsychology) {
    const issueLabels: Record<string, string> = {
      "psy-stress": "Stress va bezovtalik",
      "psy-depression": "Depressiya",
      "psy-family": "Oilaviy munosabatlar",
      "psy-children": "Bolalar psixologiyasi",
      "psy-adaptation": "Moslashuv (Koreya)",
      "psy-trauma": "Travma",
      "psy-confidence": "O'ziga ishonch",
      "psy-burnout": "Kasbiy burnout"
    };
    const formats = agent.consultationFormats?.length ? agent.consultationFormats : ["Chat", "Video"];
    const durations = agent.consultationDurations?.length ? agent.consultationDurations : ["50 daqiqa"];
    const languages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const audiences = agent.audiences?.length ? agent.audiences : ["Kattalar"];
    const methods = ["CBT", "Gestalt", "Mindfulness"];
    const boundaries = [
      "Favqulodda holatlarda ishlamaydi",
      "Rasmiy tibbiy tashxis qo'ymaydi",
      "Noqonuniy so'rovlarni qabul qilmaydi"
    ];

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">🔒 Maxfiy va xavfsiz muloqot</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-sm text-slate-700">{service.description}</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>
                  Muammolar: {issueLabels[service.subCategory || ""] || "Stress, munosabatlar, moslashuv"}
                </span>
                <span>Kimlar uchun: {audiences.join(", ")}</span>
                <span>Formatlar: {formats.join(", ")}</span>
                <span>Sessiya davomiyligi: {durations.join(", ")}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {languages.map((lang) => (
                  <span key={`psy-lang-${lang}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {lang}
                  </span>
                ))}
              </div>
              <p className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                🔒 Maxfiylik kafolatlangan
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Psixolog profili</p>
              <p className="text-sm text-slate-600">
                Mutaxassis haqida: {agent.bio || "Yumshoq va professional yondashuv, xavfsiz muloqot muhiti."}
              </p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>✅ Sertifikat tasdiqlangan</span>
                <span>Metodlar: {methods.join(", ")}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi holatlarda ishlamaydi:
                <div className="mt-2 grid gap-1">
                  {boundaries.map((item) => (
                    <span key={`bound-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Xavfsiz yozish</p>
                <button
                  type="button"
                  onClick={() => setPsychologyModalOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {psychologyModalOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {psychologyModalOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <textarea
                    value={psychologyConcern}
                    onChange={(event) => setPsychologyConcern(event.target.value)}
                    className="h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    placeholder="Sizni nima bezovta qilmoqda? (ixtiyoriy)"
                  />
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    value={psychologyFormat}
                    onChange={(event) => setPsychologyFormat(event.target.value)}
                  >
                    <option value="chat">Chat</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="offline">Oflayn</option>
                  </select>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setPsychologyFiles(Array.from(event.target.files || []))}
                    className="w-full text-xs"
                  />
                  <p className="text-[11px] text-amber-600">
                    Bu favqulodda holatlar uchun emas. Agar xavf bo'lsa, zudlik bilan mahalliy yordam xizmatiga murojaat qiling.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs text-white"
                  >
                    Suhbatni boshlash
                  </button>
                </div>
              )}
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Sessiya jarayoni</p>
              <div className="grid gap-2 text-[11px]">
                <span>1. Suhbat boshlandi</span>
                <span>2. Sessiya rejalashtirildi</span>
                <span>3. Sessiya o'tkazildi</span>
                <span>4. Yakunlandi</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat butun jarayon davomida ochiq qoladi.
              </p>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Fayllar & tavsiyalar</p>
              <p>PDF mashqlar, tavsiyalar, kundalik topshiriqlar.</p>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
                Watermark + "Faqat user uchun"
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Sessiya</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(service.price)} {service.currency}
              </p>
              <p className="text-xs text-slate-600">Davomiylik: {durations.join(", ")}</p>
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Format</label>
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"
                value={psychologyFormat}
                onChange={(event) => setPsychologyFormat(event.target.value)}
              >
                <option value="chat">Chat</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="offline">Oflayn</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPsychologyModalOpen(true)}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Xavfsiz yozish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat va fayllar faqat siz va psixologga ko'rinadi.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (isTranslation) {
    const translationCategoryLabels: Record<string, string> = {
      "translation-official": "Rasmiy hujjatlar",
      "translation-education": "Ta'lim hujjatlari",
      "translation-visa": "Visa / Migratsiya",
      "translation-business": "Biznes",
      "translation-medical": "Tibbiy",
      "translation-technical": "Texnik",
      "translation-oral": "Og'zaki",
      "translation-personal": "Shaxsiy"
    };
    const translationCategory =
      translationCategoryLabels[service.subCategory || ""] || "Tarjimonlik xizmati";
    const translationPair = `${service.sourceLang || "—"} → ${service.targetLang || "—"}`;
    const slaLabel =
      service.translationSpeed === "shoshilinch"
        ? "2-6 soat"
        : hashValue(service.id) % 3 === 0
          ? "24 soat"
          : "2-3 ish kuni";
    const officialTags = [
      service.notarization ? "Notarial" : "Oddiy",
      service.translationFormat === "Original" ? "Muhrli" : "Oddiy"
    ].filter((value, idx, arr) => arr.indexOf(value) === idx);
    const deliveryLabel =
      translationSpeedChoice === "fast" ? "Tezkor: 2-6 soat" : "Oddiy: 2-3 ish kuni";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{translationCategory}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tarjimonlik xizmati</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{service.title}</h2>
                  <p className="text-sm text-slate-600">{translationCategory}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                  ⏱ {slaLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">{translationPair}</span>
                {officialTags.map((tag) => (
                  <span key={`tag-${tag}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {tag}
                  </span>
                ))}
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {service.translationMode === "oral" ? "Og'zaki" : "Yozma"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Bu xizmat kimlar uchun: talaba, ishchi, tadbirkor va rasmiy hujjat egalari.
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Tarjimon ishonchliligi</p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={agent.avatar.src}
                  alt={agent.avatar.alt}
                  fallbackText={agent.name}
                  size={48}
                  className="border border-slate-300/70"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-[11px] text-slate-600">{agent.region || agent.location}</p>
                  <p className="text-[11px] text-slate-500">{(agent.languages || []).join(" · ")}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>✅ Tasdiqlangan tarjimon</span>
                <span>Reyting: {agent.rating.toFixed(1)}</span>
                <span>Tugallangan: {formatCount(agent.completedOrders ?? service.usedCount)}</span>
                <span>O'rtacha topshirish: {slaLabel}</span>
              </div>
              {service.certificates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {service.certificates.map((cert) => (
                    <span key={`cert-${cert}`} className="rounded-full bg-slate-100 px-3 py-1">
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Hujjat yuborish oqimi</p>
                <button
                  type="button"
                  onClick={() => {
                    setTranslationUploadOpen((prev) => !prev);
                    setTranslationStep(1);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {translationUploadOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {translationUploadOpen && (
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className={`rounded-full px-3 py-1 ${translationStep === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      1-qadam
                    </span>
                    <span className={`rounded-full px-3 py-1 ${translationStep === 2 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      2-qadam
                    </span>
                    <span className={`rounded-full px-3 py-1 ${translationStep === 3 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      3-qadam
                    </span>
                  </div>

                  {translationStep === 1 && (
                    <div className="space-y-3">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []);
                          setTranslationFiles(files.map((file) => ({ file, note: "" })));
                        }}
                        className="w-full text-xs"
                      />
                      {translationFiles.length > 0 && (
                        <div className="space-y-2">
                          {translationFiles.map((item, idx) => (
                            <div key={`${item.file.name}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-2">
                              <p className="text-[11px] text-slate-600">📎 {item.file.name}</p>
                              <input
                                value={item.note}
                                onChange={(event) => {
                                  const next = [...translationFiles];
                                  next[idx] = { ...next[idx], note: event.target.value };
                                  setTranslationFiles(next);
                                }}
                                placeholder="Izoh: pasport, diplom..."
                                className="mt-2 w-full rounded-full border border-slate-200 px-3 py-1 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setTranslationStep(2)}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                      >
                        Keyingi qadam
                      </button>
                    </div>
                  )}

                  {translationStep === 2 && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Rasmiylik</label>
                          <select
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                            value={translationOfficialChoice}
                            onChange={(event) => setTranslationOfficialChoice(event.target.value)}
                          >
                            <option value="oddiy">Oddiy</option>
                            <option value="notarial">Notarial</option>
                            <option value="muhrli">Muhrli</option>
                            <option value="guvohnoma">Guvohnoma bilan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tezlik</label>
                          <select
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                            value={translationSpeedChoice}
                            onChange={(event) => setTranslationSpeedChoice(event.target.value)}
                          >
                            <option value="normal">Oddiy (2-3 ish kuni)</option>
                            <option value="fast">Tezkor (2-6 soat)</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={translationExtraNote}
                        onChange={(event) => setTranslationExtraNote(event.target.value)}
                        className="h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        placeholder="Qo'shimcha izoh..."
                      />
                      <button
                        type="button"
                        onClick={() => setTranslationStep(3)}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                      >
                        Tasdiqlash
                      </button>
                    </div>
                  )}

                  {translationStep === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-900">Tasdiqlash</p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                        <p>Narx: {formatCount(service.price)} {service.currency} / {service.unit}</p>
                        <p>Deadline: {deliveryLabel}</p>
                        <p>Rasmiylik: {translationOfficialChoice}</p>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] text-slate-500">
                        <input
                          type="checkbox"
                          checked={translationConsent}
                          onChange={(event) => setTranslationConsent(event.target.checked)}
                        />
                        Maxfiylik roziligi
                      </label>
                      <button
                        type="button"
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs text-white"
                        onClick={handleOrder}
                      >
                        Order yaratish + chat
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Ish jarayoni</p>
              <div className="grid gap-2 text-[11px]">
                <span>✅ Qabul qilindi</span>
                <span>🔄 Tarjima jarayonda</span>
                <span>🧾 Tekshiruv</span>
                <span>📦 Tayyor</span>
              </div>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Natijani topshirish</p>
              <p>Yuklanadigan fayllar: PDF / DOCX</p>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
                QR CODE (secure download)
              </div>
              <div className="grid gap-1 text-[11px] text-slate-500">
                <span>Tarjimon: {agent.name}</span>
                <span>Sana: {new Date().toLocaleDateString("en-GB")}</span>
                <span>Tarjima ID: {service.id}</span>
                <span>UniServe orqali bajarilgan</span>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Narx & deadline</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(service.price)} {service.currency}
              </p>
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"
                value={translationSpeedChoice}
                onChange={(event) => setTranslationSpeedChoice(event.target.value)}
              >
                <option value="normal">Oddiy (2-3 ish kuni)</option>
                <option value="fast">Tezkor (2-6 soat)</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTranslationUploadOpen(true);
                    setTranslationStep(1);
                  }}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Hujjat yuklab berish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                To'lov escrow'da, tarjima topshirilgach agentga o'tadi.
              </p>
            </div>

            {showChat && isAuthenticated && (
              <div className="card space-y-2 p-5 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-900">Chat</p>
                <textarea
                  placeholder="Xabaringiz..."
                  className="h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                />
                <button
                  type="button"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                >
                  Xabar yuborish
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
        <p className="text-sm text-slate-700">{category.title}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5">
          {isConstruction ? (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Narx</span>
                <span className="font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency} / {service.unit}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Buyurtmalar soni</span>
                <span className="font-semibold text-slate-900">
                  {formatCount(agent.completedOrders ?? service.usedCount)}
                </span>
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
          ) : (
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
          )}

          {!isConstruction && agent.vehicleOptions && agent.vehicleOptions.length > 0 && (
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceImages.map((image) => (
              <img
                key={`service-img-${image.src}`}
                src={image.src}
                alt={image.alt}
                className="h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-700">
            {service.certificates.map((cert) => (
              <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                {cert}
              </span>
            ))}
          </div>

          {isConstruction && agent.equipment && agent.equipment.length > 0 && (
            <div className="mt-4 text-sm text-slate-800">
              <p className="text-xs uppercase tracking-wide text-sky-900">Texnika va jihozlar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {agent.equipment.map((item) => (
                  <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {isConstruction ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-900">Ish jarayoni</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {serviceImages.map((image, idx) => (
                    <img
                      key={`${service.id}-work-${idx}`}
                      src={image.src}
                      alt={image.alt}
                      className="h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>

        <DetailActionSidebar className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg">
          <DetailSidebarCard title="Agent">
            <SellerAgentCard
              avatarSrc={agent.avatar.src}
              avatarAlt={agent.avatar.alt}
              fallbackText={agent.name}
              name={agent.name}
              username={agent.nickname}
              badge={agent.verified ? "Verified" : null}
              trustLine={agent.specialty}
              metaRows={[
                { label: "Manzil", value: agent.location },
                {
                  label: "Bog'lanish",
                  value: showContacts
                    ? agent.contactPhone || agent.contactTelegram || "Chat orqali"
                    : "Buyurtmadan keyin ochiladi"
                },
                { label: "Tajriba", value: `${agent.experienceYears} yil` }
              ]}
              metrics={[
                { label: "Reyting", value: `${agent.rating.toFixed(1)}/5` },
                { label: "Mijoz", value: formatCount(agent.totalClients) },
                { label: "Buyurtma", value: formatCount(agent.completedOrders ?? service.usedCount) }
              ]}
            />
          </DetailSidebarCard>

          <DetailSidebarCard
            title="Asosiy actionlar"
            subtitle="Chat va rasmiy buyurtma bir-biridan alohida yuritiladi."
          >
            <DetailPrimaryActions
              status={
                showContacts
                  ? "So'rov yuborildi, kontaktlar ochildi."
                  : serviceChatThread
                    ? "Oldingi suhbatni davom ettirishingiz mumkin."
                    : null
              }
              actions={[
                {
                  label: showServiceOrderForm ? "Formani yopish" : "Buyurtma berish",
                  onClick: () => {
                    if (!isAuthenticated) {
                      setNotice("Buyurtma berish uchun oldin login bo'ling.");
                      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                      return;
                    }
                    setNotice(null);
                    setShowServiceOrderForm((prev) => !prev);
                  },
                  busy: submitState === "loading"
                },
                {
                  label: serviceChatOpen ? "Chat ochiq" : "Xabar yozish",
                  onClick: () => void handleOpenServiceChat(),
                  tone: "secondary"
                }
              ]}
            />
          </DetailSidebarCard>

          <DetailSidebarCard title="Ishonch signallari">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
                <p className="text-slate-500">Tasdiq</p>
                <p className="mt-1 font-semibold text-slate-900">{agent.verified ? "Tekshirilgan agent" : "Tekshirilmagan"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
                <p className="text-slate-500">Mavjudlik</p>
                <p className="mt-1 font-semibold text-slate-900">{getAvailabilityLabel(agent).label}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
                <p className="text-slate-500">Hudud</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {agent.region || agent.location}
                  {agent.distanceKm ? ` · ${agent.distanceKm} km` : ""}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
                <p className="text-slate-500">Javob kanali</p>
                <p className="mt-1 font-semibold text-slate-900">{agent.contactTelegram ? "Telegram / chat" : "Ichki chat"}</p>
              </div>
            </div>
          </DetailSidebarCard>

          <DetailSidebarCard>
            <FeedbackWidget
              title="Xizmat foydalimi?"
              description="Oddiy like emas, xizmat sizga qanchalik mos va foydali bo'lganini baholang."
              actions={[
                { label: "Foydali", value: "helpful", count: serviceReaction.likes },
                { label: "Mos emas", value: "unhelpful", count: serviceReaction.dislikes }
              ]}
              activeValue={
                serviceReaction.reaction === "like"
                  ? "helpful"
                  : serviceReaction.reaction === "dislike"
                    ? "unhelpful"
                    : null
              }
              disabled={service.canRate === false}
              loading={serviceReactionLoading}
              onSelect={(value) => void handleServiceReactionToggle(value === "helpful" ? "like" : "dislike")}
              saved={saved}
              onToggleSaved={handleToggleSavedState}
              onShare={() => void handleShareService()}
              reportReason={reportReason}
              onReportReasonChange={setReportReason}
              onSubmitReport={() => void handleSubmitServiceReport()}
              reportSubmitting={reportSubmitting}
            />
          </DetailSidebarCard>

          <DetailSidebarCard>
            {showServiceOrderForm ? (
              <RequestFormPanel
                title="Rasmiy so'rov / buyurtma"
                description="Manzil, telefon va xizmat talablaringiz structured ko'rinishda e'lon egasiga yuboriladi."
                submitLabel="Buyurtmani yuborish"
                onSubmit={() => void handleServiceOrderSubmit()}
                submitting={submitState === "loading"}
              >
                <input
                  value={serviceOrderDraft.customerName}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerName: event.target.value }))
                  }
                  placeholder="Ismingiz"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <input
                  value={serviceOrderDraft.customerPhone}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerPhone: event.target.value }))
                  }
                  placeholder="Telefon raqamingiz"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <textarea
                  value={serviceOrderDraft.customerAddress}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, customerAddress: event.target.value }))
                  }
                  placeholder="Olib ketish yoki asosiy manzil"
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <input
                  value={serviceOrderDraft.destinationAddress}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, destinationAddress: event.target.value }))
                  }
                  placeholder="Borish manzili (ixtiyoriy)"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <textarea
                  value={serviceOrderDraft.note}
                  onChange={(event) =>
                    setServiceOrderDraft((prev) => ({ ...prev, note: event.target.value }))
                  }
                  placeholder="Qo'shimcha izoh"
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
              </RequestFormPanel>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Rasmiy so'rov / buyurtma</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tezkor chatdan alohida ravishda, aniq manzil va kontaktlar bilan structured so'rov yuboring.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setNotice("Buyurtma berish uchun oldin login bo'ling.");
                      setTimeout(() => router.push(`/login?redirect=${encodeURIComponent(`/services/${routeId}`)}`), 500);
                      return;
                    }
                    setNotice(null);
                    setShowServiceOrderForm(true);
                  }}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Formani ochish
                </button>
              </div>
            )}
          </DetailSidebarCard>

          <DetailSidebarCard>
            {serviceChatOpen || serviceChatThread || serviceChatMessages.length > 0 ? (
              <InquiryComposer
                title="Tezkor xabarlashish"
                description="Narx, vaqt, manzil yoki qo'shimcha kelishuv bo'yicha agentga to'g'ridan-to'g'ri yozing."
                messages={serviceChatMessages.map((message) => ({
                  id: message.id,
                  threadId: message.threadId,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  recipientId: message.recipientId,
                  text: message.text,
                  createdAt: message.createdAt
                }))}
                draft={serviceChatDraft}
                onDraftChange={setServiceChatDraft}
                onSend={() => void handleSendServiceMessage()}
                loading={serviceChatLoading}
                sending={serviceChatSending}
                currentUserId={userId}
                existingThreadHint={serviceChatThread ? "Oldingi suhbatni davom ettiryapsiz." : null}
              />
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tezkor xabarlashish</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bu blok savol berish, kelishish va aniqlik kiritish uchun. Rasmiy buyurtma esa yuqoridagi forma orqali yuboriladi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleOpenServiceChat()}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Chatni ochish
                </button>
              </div>
            )}
          </DetailSidebarCard>

          {notice && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {notice}
            </p>
          )}
        </DetailActionSidebar>
      </div>
    </div>
  );
}
