import { serviceCatalog } from "@/data/serviceCatalog";
import { getServiceImageUrl } from "@/lib/serviceImage";

type ProviderSeed = {
  name: string;
  avatar: string;
  verified: boolean;
};

const providers: ProviderSeed[] = [
  { name: "Aziza Tursunova", avatar: "/avatars/agent-02.jpg", verified: true },
  { name: "Shahzod Aliyev", avatar: "/avatars/agent-03.jpg", verified: true },
  { name: "Diyorbek Raximov", avatar: "/avatars/agent-06.jpg", verified: true },
  { name: "Sabina Ahmedova", avatar: "/avatars/agent-07.jpg", verified: true },
  { name: "Kamola Karimova", avatar: "/avatars/agent-09.jpg", verified: false },
  { name: "Otabek Rustamov", avatar: "/avatars/agent-10.jpg", verified: true },
  { name: "Nilufar Abdullayeva", avatar: "/avatars/agent-05.jpg", verified: false },
  { name: "Gulnoza Umarova", avatar: "/avatars/agent-11.jpg", verified: true }
];

const tagPool = {
  default: ["Verified", "Trusted", "Fast"],
  consulting: ["Career", "Visa", "Business"],
  translation: ["Official", "Fast", "Localization"],
  legal: ["Contracts", "Litigation"],
  psychology: ["Confidential", "Therapy"],
  sports: ["Coaching", "Remote", "On-site"]
};

const prefixMap: Record<string, string> = {
  consulting: "Consulting",
  translation: "Translation",
  legal: "Legal",
  psychology: "Psychology",
  sports: "Sports",
  taxi: "Taxi",
  delivery: "Delivery",
  construction: "Construction",
  cleaning: "Cleaning",
  education: "Education",
  marketing: "Marketing",
  employment: "Employment",
  nursing: "Care",
  technical: "Technical"
};

const makePrice = (index: number, groupId: string) => {
  const base = 25 + index * 8;
  return groupId === "material" ? base + 15 : base;
};

const descriptionMap: Record<string, string> = {
  consulting: "Strategy advice, coaching, and visa walkthroughs.",
  translation: "Official document, business, and video translation.",
  legal: "Contracts, compliance, and trademark support.",
  psychology: "Therapy, coaching, and emotional support.",
  sports: "Personal coaching, nutrition, and online training."
};

type MockService = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  price: number;
  priceType: "fixed" | "hourly";
  currency: "USD" | "UZS" | "KRW";
  category: string;
  groupId: string;
  provider: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  certificates: string[];
  stats: {
    views: number;
    likes: number;
    saves: number;
    rating: number;
    ratingCount: number;
  };
  createdAt: string;
};

const buildServices = (): MockService[] => {
  return serviceCatalog.flatMap((group) =>
    group.categories.flatMap((category, catIndex) =>
      Array.from({ length: 3 }, (_, idx) => {
        const id = `${category.id}-${idx + 1}`;
        const providerSeed = providers[(idx + catIndex) % providers.length];
        const price = makePrice(idx, group.id);
        const priceType = idx % 2 === 0 ? "fixed" : "hourly";
        const currency = idx % 3 === 0 ? "USD" : idx % 3 === 1 ? "UZS" : "KRW";
        const tagSet = tagPool[category.id as keyof typeof tagPool] || tagPool.default;
        return {
          id,
          title: `${prefixMap[category.id] || category.title} Concierge ${idx + 1}`,
          description: descriptionMap[category.id as keyof typeof descriptionMap] || category.description,
          coverUrl: getServiceImageUrl(category.id, id),
          price,
          priceType,
          currency,
          category: category.id,
          groupId: group.id,
          provider: {
            id: `${providerSeed.name.replace(/\s+/g, "-").toLowerCase()}-${idx + 1}`,
            name: providerSeed.name,
            avatar: providerSeed.avatar,
            verified: providerSeed.verified
          },
          tags: [...tagSet.slice(0, 2), idx % 2 === 0 ? "Premium" : "Flexible"],
          certificates: ["Certified specialist", "Background checked"],
          stats: {
            views: 320 + idx * 45 + catIndex * 10,
            likes: 5 + idx * 2,
            saves: 3 + idx,
            rating: 4.5 - (idx * 0.2),
            ratingCount: 12 + idx * 4
          },
          createdAt: new Date(Date.now() - idx * 3600 * 1000).toISOString()
        };
      })
    )
  );
};

export const servicesMock = buildServices();
