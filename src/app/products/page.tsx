"use client";

import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { Spinner } from "@/components/shared/Spinner";
import { useProducts } from "@/hooks/useProducts";
import CategoriesSidebar from "@/components/CategoriesSidebar";
import type { Product } from "@/api/products";

export default function ProductsPage() {
  const {
    items,
    loading,
    filters,
    setFilters,
    pagination,
    setPagination
  } = useProducts({
    category: "",
    order: "popular"
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (next: typeof filters) => {
    setFilters(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategorySelect = (slug: string) => {
    setFilters({ ...filters, category: slug });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const [foodSubcategory, setFoodSubcategory] = useState<string | null>(null);
  const [foodFilters, setFoodFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    condition: "any" | "fresh" | "frozen";
  }>({
    brand: "",
    condition: "any"
  });
  const isFoodCategory = filters.category === "oziq-ovqat";

  const [beautySubcategory, setBeautySubcategory] = useState<string | null>(null);
  const [beautyFilters, setBeautyFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    audience: "any" | "women" | "men" | "kids" | "unisex";
  }>({
    brand: "",
    audience: "any"
  });
  const isBeautyCategory = filters.category === "gozallik";

  const [electronicsSubcategory, setElectronicsSubcategory] = useState<string | null>(null);
  const [electronicsFilters, setElectronicsFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    condition: "any" | "new" | "used";
  }>({
    brand: "",
    condition: "any"
  });
  const isElectronicsCategory = filters.category === "elektronika";

  const [autoSubcategory, setAutoSubcategory] = useState<string | null>(null);
  const [autoFilters, setAutoFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    condition: "any" | "new" | "used";
  }>({
    brand: "",
    condition: "any"
  });
  const isAutoCategory = filters.category === "avto-texnika";

  const [homeSubcategory, setHomeSubcategory] = useState<string | null>(null);
  const [homeFilters, setHomeFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    condition: "any" | "new" | "used";
  }>({
    brand: "",
    condition: "any"
  });
  const isHomeCategory = filters.category === "maishiy-uskunalar";

  const [clothingSubcategory, setClothingSubcategory] = useState<string | null>(null);
  const [clothingFilters, setClothingFilters] = useState<{
    brand: string;
    priceMin?: number;
    priceMax?: number;
    size: "any" | "s" | "m" | "l" | "xl";
    season: "any" | "summer" | "winter" | "allseason";
  }>({
    brand: "",
    size: "any",
    season: "any"
  });
  const isClothingCategory = filters.category === "kiyim-kechak";

  const foodSubcategories = [
    { key: "tayyor", label: "Tayyor mahsulotlar" },
    { key: "yarim-tayyor", label: "Yarim tayyor" },
    { key: "bolalar", label: "Bolalar" },
    { key: "goshtli", label: "Go'shtli mahsulotlar" },
    { key: "exclusive", label: "Exclusive" }
  ] as const;

  const beautySubcategories = [
    { key: "fragrance", label: "Atirlar" },
    { key: "skincare", label: "Yuz kremlari" },
    { key: "haircare", label: "Soch uchun" },
    { key: "makeup", label: "Bo'yanish vositalari" },
    { key: "bodycare", label: "Tana parvarishi" },
    { key: "nails", label: "Manikyur/Pedikyur" },
    { key: "tools", label: "Asboblar va aksessuarlar" },
    { key: "bathspa", label: "Vannalar va spa" },
    { key: "suncare", label: "Quyoshdan himoya" }
  ] as const;

  const electronicsSubcategories = [
    { key: "pc", label: "PC" },
    { key: "mobile", label: "Mobile" },
    { key: "tv", label: "TV" },
    { key: "game", label: "Game" },
    { key: "cameras", label: "Cameras" },
    { key: "others", label: "Others" }
  ] as const;

  const autoSubcategories = [
    { key: "cars", label: "Avtomobillar" },
    { key: "car-parts", label: "Avto ehtiyot qismlar" },
    { key: "tech", label: "Texnika" },
    { key: "tech-parts", label: "Texnika ehtiyot qismlar" }
  ] as const;

  const homeSubcategories = [
    { key: "vacuum", label: "Chang yutkich" },
    { key: "washer", label: "Kir yuvish mashinalari" },
    { key: "kitchen", label: "Oshxona texnikalari" },
    { key: "fridge", label: "Sovutkich/Muzlatkichlar" },
    { key: "ac", label: "Havo sovutgich" },
    { key: "air-purifier", label: "Havo tozalagich" },
    { key: "others-home", label: "Others" }
  ] as const;

  const clothingSubcategories = [
    { key: "men", label: "Erkaklar" },
    { key: "women", label: "Ayollar" },
    { key: "kids", label: "Bolalar" },
    { key: "elderly", label: "Keksalar" },
    { key: "special", label: "Maxsus bo'lim" }
  ] as const;

  const foodProductsMock: Record<string, Product[]> = {
    tayyor: [
      {
        id: "ready-1",
        name: "Mediterranean mezze set",
        description: "Humus, tabbouleh va pita noni to'plami",
        price: 24.9,
        thumbnail: "https://images.unsplash.com/photo-1604908177035-0ac1c9bb646c?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1604908177035-0ac1c9bb646c?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 120 },
        stats: { views: 1200, likes: 340, purchases: 210 }
      },
      {
        id: "ready-2",
        name: "Sushi mix box",
        description: "12 dona nigiri va maki kombo",
        price: 29.5,
        thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 95 },
        stats: { views: 980, likes: 280, purchases: 180 }
      },
      {
        id: "ready-3",
        name: "Vegetarian bowl",
        description: "Quinoa, avokado va qovurilgan sabzavotlar",
        price: 18.0,
        thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 88 },
        stats: { views: 720, likes: 190, purchases: 140 }
      }
    ],
    "yarim-tayyor": [
      {
        id: "semiready-1",
        name: "Manti semi-ready",
        description: "Bug'doy xamiri va mol go'shti aralashmasi",
        price: 14.9,
        thumbnail: "https://images.unsplash.com/photo-1604908177553-0ac1c9bb646d?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1604908177553-0ac1c9bb646d?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 64 },
        stats: { views: 540, likes: 130, purchases: 90 }
      },
      {
        id: "semiready-2",
        name: "Pelmeni set",
        description: "1 kg muzlatilgan tovuq pelmeni",
        price: 12.5,
        thumbnail: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 52 },
        stats: { views: 460, likes: 110, purchases: 80 }
      },
      {
        id: "semiready-3",
        name: "Pizza base kit",
        description: "2 ta xamirdan iborat, sous va pishloq bilan",
        price: 16.0,
        thumbnail: "https://images.unsplash.com/photo-1548365328-8b8c1f1c2a0b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1548365328-8b8c1f1c2a0b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 70 },
        stats: { views: 610, likes: 150, purchases: 100 }
      }
    ],
    bolalar: [
      {
        id: "kids-1",
        name: "Organic apple puree",
        description: "Shakar qo'shilmagan, 6+ oy",
        price: 4.5,
        thumbnail: "https://images.unsplash.com/photo-1604908177791-0ac1c9bb6471?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1604908177791-0ac1c9bb6471?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.9, count: 140 },
        stats: { views: 880, likes: 260, purchases: 210 }
      },
      {
        id: "kids-2",
        name: "Kids cereal mix",
        description: "Vitaminli donalar, kakao ta'mi",
        price: 6.9,
        thumbnail: "https://images.unsplash.com/photo-1523473827535-6cb2c1c0632c?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1523473827535-6cb2c1c0632c?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 90 },
        stats: { views: 720, likes: 190, purchases: 150 }
      },
      {
        id: "kids-3",
        name: "Mini fruit snacks",
        description: "Quruq mevalar, paketli",
        price: 5.2,
        thumbnail: "https://images.unsplash.com/photo-1505253216365-4f6161e1dcea?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1505253216365-4f6161e1dcea?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 60 },
        stats: { views: 500, likes: 120, purchases: 90 }
      }
    ],
    goshtli: [
      {
        id: "meat-1",
        name: "Ribeye steak",
        description: "Alo navli mol go'shti, 350g",
        price: 21.0,
        thumbnail: "https://images.unsplash.com/photo-1604908177059-0ac1c9bb646f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1604908177059-0ac1c9bb646f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 110 },
        stats: { views: 940, likes: 280, purchases: 200 }
      },
      {
        id: "meat-2",
        name: "Chicken fillet pack",
        description: "1 kg terisiz tovuq filesi",
        price: 9.8,
        thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 85 },
        stats: { views: 780, likes: 210, purchases: 170 }
      },
      {
        id: "meat-3",
        name: "Lamb kebab mix",
        description: "Tayyorlangan marinadlangan qoy go'shti",
        price: 17.5,
        thumbnail: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 92 },
        stats: { views: 820, likes: 230, purchases: 160 }
      }
    ],
    exclusive: [
      {
        id: "ex-1",
        name: "Truffle pasta kit",
        description: "Qora truffle sousi va artisan makaron",
        price: 34.0,
        thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.9, count: 60 },
        stats: { views: 620, likes: 190, purchases: 120 }
      },
      {
        id: "ex-2",
        name: "Artisan cheese board",
        description: "5 xil premium pishloq va qoshimchalar",
        price: 42.0,
        thumbnail: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 75 },
        stats: { views: 700, likes: 210, purchases: 130 }
      },
      {
        id: "ex-3",
        name: "Single-origin cocoa set",
        description: "Yuqori sifatli kakao donalari va sharbatlari",
        price: 27.5,
        thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 68 },
        stats: { views: 650, likes: 180, purchases: 115 }
      }
    ]
  };

  const beautyProductsMock: Record<string, Product[]> = {
    fragrance: [
      {
        id: "frag-1",
        name: "Floral Breeze",
        description: "Yengil bahor atiri, uzun davomiylik",
        price: 89,
        brand: "Fleur",
        thumbnail: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 160 },
        stats: { views: 1100, likes: 340, purchases: 240 },
        audience: "women"
      },
      {
        id: "frag-2",
        name: "Woody Noir",
        description: "Daraxt va achchiq notalar, kechki chiqishlar uchun",
        price: 105,
        brand: "Noir",
        thumbnail: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 140 },
        stats: { views: 980, likes: 320, purchases: 210 },
        audience: "men"
      },
      {
        id: "frag-3",
        name: "Citrus Glow",
        description: "Sitrus asosida unisex atir",
        price: 79,
        brand: "Lumen",
        thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 120 },
        stats: { views: 860, likes: 270, purchases: 180 },
        audience: "unisex"
      }
    ],
    skincare: [
      {
        id: "skin-1",
        name: "Hydra Glow Cream",
        description: "Namlovchi yuz kremi, gialuron kislotasi",
        price: 42,
        brand: "Hydra",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 200 },
        stats: { views: 1250, likes: 390, purchases: 260 },
        audience: "women"
      },
      {
        id: "skin-2",
        name: "Vitamin C Serum",
        description: "Yuzni yorqinlashtiruvchi 10% vitamin C",
        price: 38,
        brand: "C-Light",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 150 },
        stats: { views: 980, likes: 310, purchases: 210 },
        audience: "unisex"
      },
      {
        id: "skin-3",
        name: "SPF 50 Daily",
        description: "Keng spektrli quyoshdan himoya",
        price: 29,
        brand: "SunGuard",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 130 },
        stats: { views: 820, likes: 250, purchases: 170 },
        audience: "unisex"
      }
    ],
    haircare: [
      {
        id: "hair-1",
        name: "Keratin Shampoo",
        description: "Sochni mustahkamlovchi keratinli shampun",
        price: 19,
        brand: "Kerax",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 110 },
        stats: { views: 740, likes: 200, purchases: 150 },
        audience: "women"
      },
      {
        id: "hair-2",
        name: "Volume Spray",
        description: "Hajm beruvchi styling spreyi",
        price: 24,
        brand: "Volumix",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 95 },
        stats: { views: 680, likes: 180, purchases: 130 },
        audience: "women"
      },
      {
        id: "hair-3",
        name: "Beard Oil",
        description: "Erkaklar uchun yengil yog'li aralashma",
        price: 21,
        brand: "Gentle",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 80 },
        stats: { views: 560, likes: 170, purchases: 120 },
        audience: "men"
      }
    ],
    makeup: [
      {
        id: "makeup-1",
        name: "Matte Lipstick",
        description: "Uzoq saqlanuvchi, mat effekt",
        price: 22,
        brand: "Velvet",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 140 },
        stats: { views: 880, likes: 260, purchases: 190 },
        audience: "women"
      },
      {
        id: "makeup-2",
        name: "All-day Foundation",
        description: "Yengil va yuqori yopuvchanlik",
        price: 34,
        brand: "Prime",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 120 },
        stats: { views: 760, likes: 220, purchases: 170 },
        audience: "women"
      },
      {
        id: "makeup-3",
        name: "Mascara Lift",
        description: "Uzaytiruvchi va qalinlashtiruvchi maskara",
        price: 18,
        brand: "Lift",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 130 },
        stats: { views: 690, likes: 200, purchases: 150 },
        audience: "women"
      }
    ],
    bodycare: [
      {
        id: "body-1",
        name: "Shea Body Butter",
        description: "Quruq teri uchun intensiv namlovchi",
        price: 26,
        brand: "SheaLux",
        thumbnail: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 100 },
        stats: { views: 620, likes: 180, purchases: 130 },
        audience: "unisex"
      },
      {
        id: "body-2",
        name: "Kids Gentle Wash",
        description: "Bolalar uchun yumshoq yuvinish geli",
        price: 14,
        brand: "SoftKids",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 90 },
        stats: { views: 540, likes: 150, purchases: 110 },
        audience: "kids"
      },
      {
        id: "body-3",
        name: "Men's Body Wash",
        description: "Erkaklar uchun yangilovchi jel",
        price: 17,
        brand: "FreshMen",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 85 },
        stats: { views: 500, likes: 140, purchases: 95 },
        audience: "men"
      }
    ],
    nails: [
      {
        id: "nail-1",
        name: "Gel nail polish set",
        description: "3 ta gel lak va top coat",
        price: 28,
        brand: "Lumi Nails",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 90 },
        stats: { views: 610, likes: 170, purchases: 120 },
        audience: "women"
      },
      {
        id: "nail-2",
        name: "Cuticle oil",
        description: "Oziqlantiruvchi bodom yog'i asosida",
        price: 12,
        brand: "SoftNail",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 70 },
        stats: { views: 480, likes: 140, purchases: 90 },
        audience: "unisex"
      },
      {
        id: "nail-3",
        name: "Nail care kit",
        description: "Pilka, buff va metall asboblar to'plami",
        price: 19,
        brand: "CareKit",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 60 },
        stats: { views: 430, likes: 120, purchases: 80 },
        audience: "unisex"
      }
    ],
    tools: [
      {
        id: "tool-1",
        name: "Makeup brush set",
        description: "12 dona professional cho'tkalar",
        price: 39,
        brand: "BrushPro",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 130 },
        stats: { views: 720, likes: 210, purchases: 150 },
        audience: "women"
      },
      {
        id: "tool-2",
        name: "Hair dryer ionic",
        description: "Ioniq funksiyali, 3 rejim",
        price: 65,
        brand: "IonicAir",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 100 },
        stats: { views: 650, likes: 180, purchases: 120 },
        audience: "unisex"
      },
      {
        id: "tool-3",
        name: "Face cleansing brush",
        description: "Elektron yuz tozalash cho'tkasi",
        price: 45,
        brand: "PureFace",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 95 },
        stats: { views: 580, likes: 170, purchases: 110 },
        audience: "women"
      }
    ],
    bathspa: [
      {
        id: "bath-1",
        name: "Bath bomb set",
        description: "Lavanda, sitrus va vanil aromatlari",
        price: 22,
        brand: "Calm",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 90 },
        stats: { views: 520, likes: 150, purchases: 100 },
        audience: "unisex"
      },
      {
        id: "bath-2",
        name: "Eucalyptus shower gel",
        description: "Tiniqlik beruvchi dush jeli",
        price: 16,
        brand: "FreshSpa",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 80 },
        stats: { views: 470, likes: 130, purchases: 90 },
        audience: "unisex"
      },
      {
        id: "bath-3",
        name: "Body scrub sea salt",
        description: "Mineralli skrab, terini yangilaydi",
        price: 27,
        brand: "Ocean",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 85 },
        stats: { views: 510, likes: 140, purchases: 95 },
        audience: "unisex"
      }
    ],
    suncare: [
      {
        id: "sun-1",
        name: "SPF 50 Mist",
        description: "Yengil purkagich, makiyaj ustiga mos",
        price: 33,
        brand: "SunMist",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 90 },
        stats: { views: 480, likes: 150, purchases: 100 },
        audience: "unisex"
      },
      {
        id: "sun-2",
        name: "Mineral SPF 30",
        description: "Hissiz, keng spektrli, bolalar va kattalar uchun",
        price: 29,
        brand: "Mineral",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 85 },
        stats: { views: 450, likes: 130, purchases: 90 },
        audience: "kids"
      },
      {
        id: "sun-3",
        name: "After-sun gel",
        description: "Aloe vera asosida tinchlantiruvchi",
        price: 18,
        brand: "CoolAloe",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 75 },
        stats: { views: 420, likes: 120, purchases: 80 },
        audience: "unisex"
      }
    ]
  };

  const electronicsProductsMock: Record<string, Product[]> = {
    pc: [
      {
        id: "pc-1",
        name: "Gaming Laptop RTX",
        description: "RTX 4060, 16GB RAM, 1TB SSD",
        price: 1299,
        brand: "Aorus",
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 220 },
        stats: { views: 2200, likes: 640, purchases: 410 }
      },
      {
        id: "pc-2",
        name: "Ultrabook Pro",
        description: "13\" ultrabook, 16GB RAM, 512GB SSD",
        price: 1099,
        brand: "Zen",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 190 },
        stats: { views: 1800, likes: 520, purchases: 360 }
      },
      {
        id: "pc-3",
        name: "Desktop Creator",
        description: "Ryzen 7, 32GB RAM, RTX 4070",
        price: 1499,
        brand: "Creator",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.9, count: 150 },
        stats: { views: 2100, likes: 590, purchases: 320 }
      }
    ],
    mobile: [
      {
        id: "mobile-1",
        name: "Flagship X",
        description: "AMOLED 120Hz, 256GB, 50MP",
        price: 899,
        brand: "Fenix",
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 310 },
        stats: { views: 2800, likes: 840, purchases: 470 }
      },
      {
        id: "mobile-2",
        name: "Compact 5G",
        description: "5G, 8GB RAM, 128GB",
        price: 599,
        brand: "Nano",
        thumbnail: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 210 },
        stats: { views: 1900, likes: 520, purchases: 330 }
      },
      {
        id: "mobile-3",
        name: "Camera Phone Pro",
        description: "Periscope 10x, 256GB",
        price: 999,
        brand: "Optica",
        thumbnail: "https://images.unsplash.com/photo-1512499617640-c2f999098c03?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1512499617640-c2f999098c03?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 260 },
        stats: { views: 2400, likes: 700, purchases: 380 }
      }
    ],
    tv: [
      {
        id: "tv-1",
        name: "OLED Vision 65\"",
        description: "4K OLED, Dolby Vision",
        price: 1899,
        brand: "Vista",
        thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.9, count: 140 },
        stats: { views: 1600, likes: 520, purchases: 210 }
      },
      {
        id: "tv-2",
        name: "QLED Bright 55\"",
        description: "4K QLED, 120Hz",
        price: 1299,
        brand: "Bright",
        thumbnail: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 160 },
        stats: { views: 1500, likes: 440, purchases: 190 }
      },
      {
        id: "tv-3",
        name: "Smart LED 43\"",
        description: "Full HD, smart TV",
        price: 499,
        brand: "Lite",
        thumbnail: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 190 },
        stats: { views: 1300, likes: 360, purchases: 220 }
      }
    ],
    game: [
      {
        id: "game-1",
        name: "Next-gen Console",
        description: "1TB SSD, 4K gaming",
        price: 599,
        brand: "PlayOne",
        thumbnail: "https://images.unsplash.com/photo-1587202372775-98927c4a1c86?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1587202372775-98927c4a1c86?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.9, count: 310 },
        stats: { views: 2600, likes: 900, purchases: 520 }
      },
      {
        id: "game-2",
        name: "VR Headset",
        description: "6DOF tracking, high-res display",
        price: 399,
        brand: "Immersive",
        thumbnail: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 170 },
        stats: { views: 1500, likes: 520, purchases: 260 }
      },
      {
        id: "game-3",
        name: "Pro Controller",
        description: "Customizable buttons, Hall sensors",
        price: 149,
        brand: "ProX",
        thumbnail: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 130 },
        stats: { views: 900, likes: 280, purchases: 180 }
      }
    ],
    cameras: [
      {
        id: "cam-1",
        name: "Mirrorless Pro",
        description: "Full-frame, 24MP, 4K video",
        price: 1799,
        brand: "Lumina",
        thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 210 },
        stats: { views: 1700, likes: 520, purchases: 240 }
      },
      {
        id: "cam-2",
        name: "Action Cam 5K",
        description: "5K60, stabilization",
        price: 499,
        brand: "GoWave",
        thumbnail: "https://images.unsplash.com/photo-1495704907664-81f74a7efdff?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1495704907664-81f74a7efdff?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 160 },
        stats: { views: 1200, likes: 340, purchases: 190 }
      },
      {
        id: "cam-3",
        name: "Compact Vlog Cam",
        description: "Flip screen, fast AF",
        price: 799,
        brand: "VlogX",
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 140 },
        stats: { views: 1300, likes: 380, purchases: 200 }
      }
    ],
    others: [
      {
        id: "oth-1",
        name: "Wireless earbuds",
        description: "ANC, 24h battery",
        price: 159,
        brand: "ZenSound",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 240 },
        stats: { views: 1400, likes: 420, purchases: 260 }
      },
      {
        id: "oth-2",
        name: "Smartwatch",
        description: "AMOLED, GPS, ECG",
        price: 249,
        brand: "Pulse",
        thumbnail: "https://images.unsplash.com/photo-1511735643442-503bb3bd3481?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1511735643442-503bb3bd3481?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 210 },
        stats: { views: 1300, likes: 380, purchases: 220 }
      },
      {
        id: "oth-3",
        name: "Bluetooth speaker",
        description: "Waterproof, 12h playtime",
        price: 129,
        brand: "Boom",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 180 },
        stats: { views: 1100, likes: 320, purchases: 190 }
      }
    ]
  };

  const autoProductsMock: Record<string, Product[]> = {
    cars: [
      {
        id: "car-1",
        name: "Hyundai Sonata 2019",
        description: "2.0, avtomat, 85 000 km, servisda ko‘rilgan",
        price: 17500,
        brand: "Hyundai",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 90 },
        stats: { views: 2200, likes: 520, purchases: 140 },
        condition: "used"
      },
      {
        id: "car-2",
        name: "Kia K5 2022",
        description: "1.6T, 18 000 km, ADAS paketi",
        price: 24500,
        brand: "Kia",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 110 },
        stats: { views: 2500, likes: 610, purchases: 160 },
        condition: "used"
      },
      {
        id: "car-3",
        name: "Chevrolet Malibu 2020",
        description: "2.0 turbo, 60 000 km, qora salon",
        price: 19800,
        brand: "Chevrolet",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 95 },
        stats: { views: 2100, likes: 480, purchases: 130 },
        condition: "used"
      }
    ],
    "car-parts": [
      {
        id: "carpart-1",
        name: "Brake pads set (Sonata/K5)",
        description: "Old va orqa, original sifatdagi analog",
        price: 120,
        brand: "Hankook Parts",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1597773150797-3be2363b88fc?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1597773150797-3be2363b88fc?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 75 },
        stats: { views: 740, likes: 210, purchases: 150 },
        condition: "new"
      },
      {
        id: "carpart-2",
        name: "LED headlight (Malibu)",
        description: "Ong/chap to‘plam, moslama va lampalar bilan",
        price: 320,
        brand: "Vision",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1583267746897-dde3619a4c8c?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1583267746897-dde3619a4c8c?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 68 },
        stats: { views: 660, likes: 190, purchases: 120 },
        condition: "new"
      },
      {
        id: "carpart-3",
        name: "All-season tires 215/55 R17",
        description: "4 dona, balansi tekshirilgan",
        price: 420,
        brand: "Nexen",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 82 },
        stats: { views: 780, likes: 210, purchases: 130 },
        condition: "new"
      }
    ],
    tech: [
      {
        id: "tech-1",
        name: "Generator 5kW inverter",
        description: "Uy/garaj uchun, past shovqinli",
        price: 980,
        brand: "GenX",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 70 },
        stats: { views: 620, likes: 180, purchases: 110 },
        condition: "new"
      },
      {
        id: "tech-2",
        name: "Industrial pressure washer",
        description: "180 bar, 2500W, metall pompali",
        price: 650,
        brand: "Pressa",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 64 },
        stats: { views: 570, likes: 170, purchases: 100 },
        condition: "new"
      },
      {
        id: "tech-3",
        name: "Mini loader (used)",
        description: "Bobcat S70, 2018, 1800 soat",
        price: 15500,
        brand: "Bobcat",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 40 },
        stats: { views: 820, likes: 200, purchases: 70 },
        condition: "used"
      }
    ],
    "tech-parts": [
      {
        id: "techpart-1",
        name: "Compressor pump kit",
        description: "Qurilish kompressorlari uchun 3 kVt, 8 bar",
        price: 240,
        brand: "AirPro",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 55 },
        stats: { views: 480, likes: 140, purchases: 95 },
        condition: "new"
      },
      {
        id: "techpart-2",
        name: "Pressure washer lance set",
        description: "Moslashuvchan shlang + nozullar, 180 bar gacha",
        price: 120,
        brand: "WashKit",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 48 },
        stats: { views: 430, likes: 120, purchases: 80 },
        condition: "new"
      },
      {
        id: "techpart-3",
        name: "Generator carburetor kit",
        description: "4-6 kVt benzin generatorlar uchun",
        price: 85,
        brand: "GenKit",
        category: "avto-texnika",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 44 },
        stats: { views: 400, likes: 110, purchases: 70 },
        condition: "new"
      }
    ]
  };

  const homeProductsMock: Record<string, Product[]> = {
    vacuum: [
      {
        id: "vac-1",
        name: "Dyson V11 Absolute",
        description: "Simssiz, kuchli siklon tizimi",
        price: 650,
        brand: "Dyson",
        thumbnail: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 210 },
        stats: { views: 1300, likes: 380, purchases: 220 },
        condition: "new"
      },
      {
        id: "vac-2",
        name: "Samsung Jet 90",
        description: "Ko'p-bosqichli filtr va kuchli tortish",
        price: 520,
        brand: "Samsung",
        thumbnail: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 170 },
        stats: { views: 980, likes: 290, purchases: 180 },
        condition: "new"
      },
      {
        id: "vac-3",
        name: "Robot vacuum S7",
        description: "Lidar navigatsiya, mop funksiyasi",
        price: 480,
        brand: "Roborock",
        thumbnail: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 150 },
        stats: { views: 920, likes: 270, purchases: 170 },
        condition: "new"
      }
    ],
    washer: [
      {
        id: "wash-1",
        name: "LG WashTower",
        description: "Yig'ma kir yuvish va quritish, AI DD",
        price: 1200,
        brand: "LG",
        thumbnail: "https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 130 },
        stats: { views: 880, likes: 250, purchases: 140 },
        condition: "new"
      },
      {
        id: "wash-2",
        name: "Samsung EcoBubble 9kg",
        description: "Pufakchali yuvish, energiya tejamkor",
        price: 780,
        brand: "Samsung",
        thumbnail: "https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 120 },
        stats: { views: 760, likes: 220, purchases: 130 },
        condition: "new"
      },
      {
        id: "wash-3",
        name: "Bosch Series 6",
        description: "5 yil ishlatilgan, toza holatda",
        price: 420,
        brand: "Bosch",
        thumbnail: "https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1582719478181-2f2df1a7de7b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 90 },
        stats: { views: 640, likes: 180, purchases: 110 },
        condition: "used"
      }
    ],
    kitchen: [
      {
        id: "kitchen-1",
        name: "KitchenAid Stand Mixer",
        description: "5 qt, ko'p nasadkali, premium",
        price: 480,
        brand: "KitchenAid",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 140 },
        stats: { views: 900, likes: 260, purchases: 150 },
        condition: "new"
      },
      {
        id: "kitchen-2",
        name: "Philips Air Fryer XXL",
        description: "Sog'lom pishirish, 1.4 kg sig'im",
        price: 260,
        brand: "Philips",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 110 },
        stats: { views: 780, likes: 230, purchases: 130 },
        condition: "new"
      },
      {
        id: "kitchen-3",
        name: "Delonghi Coffee Maker",
        description: "Espresso va cappuccino, 15 bar",
        price: 320,
        brand: "Delonghi",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 100 },
        stats: { views: 720, likes: 200, purchases: 120 },
        condition: "used"
      }
    ],
    fridge: [
      {
        id: "fridge-1",
        name: "LG InstaView 550L",
        description: "No frost, shisha panel, yangi",
        price: 1400,
        brand: "LG",
        thumbnail: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 120 },
        stats: { views: 860, likes: 250, purchases: 140 },
        condition: "new"
      },
      {
        id: "fridge-2",
        name: "Samsung Side-by-Side 650L",
        description: "Inverter, musaffo sovutish",
        price: 1250,
        brand: "Samsung",
        thumbnail: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 110 },
        stats: { views: 810, likes: 230, purchases: 130 },
        condition: "new"
      },
      {
        id: "fridge-3",
        name: "Beko 320L",
        description: "3 yil ishlatilgan, toza holatda",
        price: 420,
        brand: "Beko",
        thumbnail: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 80 },
        stats: { views: 620, likes: 170, purchases: 100 },
        condition: "used"
      }
    ],
    ac: [
      {
        id: "ac-1",
        name: "Daikin inverter 12k BTU",
        description: "Sovutish/isitish, A++",
        price: 850,
        brand: "Daikin",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 90 },
        stats: { views: 730, likes: 210, purchases: 120 },
        condition: "new"
      },
      {
        id: "ac-2",
        name: "Gree U-Crown 18k BTU",
        description: "Inverter, Wi-Fi, 2021",
        price: 980,
        brand: "Gree",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 80 },
        stats: { views: 680, likes: 190, purchases: 110 },
        condition: "used"
      },
      {
        id: "ac-3",
        name: "Portable AC 9000 BTU",
        description: "Ofis va kichik xonalar uchun",
        price: 350,
        brand: "Cooler",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.3, count: 70 },
        stats: { views: 520, likes: 140, purchases: 90 },
        condition: "used"
      }
    ],
    "air-purifier": [
      {
        id: "air-1",
        name: "Xiaomi Air Purifier 4 Pro",
        description: "HEPA H13 filtr, 60 m² gacha",
        price: 280,
        brand: "Xiaomi",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 100 },
        stats: { views: 610, likes: 180, purchases: 120 },
        condition: "new"
      },
      {
        id: "air-2",
        name: "Philips Series 3000i",
        description: "True HEPA, smart sensor",
        price: 360,
        brand: "Philips",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 95 },
        stats: { views: 580, likes: 170, purchases: 110 },
        condition: "new"
      },
      {
        id: "air-3",
        name: "Coway Mighty AP-1512HH",
        description: "Uch bosqichli filtr, 50 m²",
        price: 240,
        brand: "Coway",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 85 },
        stats: { views: 520, likes: 150, purchases: 100 },
        condition: "used"
      }
    ],
    "others-home": [
      {
        id: "otherhome-1",
        name: "Steam iron",
        description: "Kerakli bug' darajasi, keramika tovon",
        price: 65,
        brand: "Tefal",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 70 },
        stats: { views: 430, likes: 120, purchases: 85 },
        condition: "new"
      },
      {
        id: "otherhome-2",
        name: "Humidifier 5L",
        description: "Tungi chiroq, avtomatik o'chish",
        price: 55,
        brand: "Airly",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 60 },
        stats: { views: 400, likes: 110, purchases: 80 },
        condition: "new"
      },
      {
        id: "otherhome-3",
        name: "Smart curtain motor",
        description: "Wi-Fi, ovozli boshqaruv",
        price: 130,
        brand: "SmartHome",
        thumbnail: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 55 },
        stats: { views: 360, likes: 100, purchases: 70 },
        condition: "new"
      }
    ]
  };

  const clothingProductsMock: Record<string, Product[]> = {
    men: [
      {
        id: "men-1",
        name: "Classic blazer",
        description: "Slim fit, 100% jun, ko'k rang",
        price: 220,
        brand: "Tailor",
        thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 90 },
        stats: { views: 620, likes: 180, purchases: 120 },
        size: "l",
        season: "allseason"
      },
      {
        id: "men-2",
        name: "Sport krossovka",
        description: "Yengil va nafas oluvchi, yugurish uchun",
        price: 140,
        brand: "Runner",
        thumbnail: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 110 },
        stats: { views: 540, likes: 150, purchases: 100 },
        size: "m",
        season: "summer"
      },
      {
        id: "men-3",
        name: "Qishki kurtka",
        description: "Suv o'tkazmaydigan, kapyushonli",
        price: 180,
        brand: "Nord",
        thumbnail: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 85 },
        stats: { views: 580, likes: 170, purchases: 110 },
        size: "l",
        season: "winter"
      }
    ],
    women: [
      {
        id: "women-1",
        name: "Midi dress",
        description: "Yozgi, paxta mato, gul naqsh",
        price: 95,
        brand: "Flora",
        thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.8, count: 140 },
        stats: { views: 720, likes: 210, purchases: 150 },
        size: "m",
        season: "summer"
      },
      {
        id: "women-2",
        name: "Office kostyum",
        description: "Blazer + shim, neytral kulrang",
        price: 210,
        brand: "Linea",
        thumbnail: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 100 },
        stats: { views: 640, likes: 180, purchases: 120 },
        size: "m",
        season: "allseason"
      },
      {
        id: "women-3",
        name: "Trench coat",
        description: "Yengil, bahor-kuz uchun",
        price: 160,
        brand: "Urban",
        thumbnail: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 95 },
        stats: { views: 610, likes: 170, purchases: 115 },
        size: "l",
        season: "allseason"
      }
    ],
    kids: [
      {
        id: "kids-cloth-1",
        name: "Bolalar sport kiyimi",
        description: "Paxta to'plam, 6-8 yosh",
        price: 45,
        brand: "KidSport",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 80 },
        stats: { views: 420, likes: 130, purchases: 90 },
        size: "s",
        season: "allseason"
      },
      {
        id: "kids-cloth-2",
        name: "Qishki kombinezon",
        description: "Suv o'tkazmas, issiq astar, 3-5 yosh",
        price: 70,
        brand: "SnowKids",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 65 },
        stats: { views: 380, likes: 110, purchases: 75 },
        size: "s",
        season: "winter"
      },
      {
        id: "kids-cloth-3",
        name: "Yozgi futbolka to‘plami",
        description: "3 dona, 100% paxta",
        price: 35,
        brand: "Sunny",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 70 },
        stats: { views: 360, likes: 100, purchases: 70 },
        size: "s",
        season: "summer"
      }
    ],
    elderly: [
      {
        id: "elder-1",
        name: "Ortopedik poyabzal",
        description: "Yumshoq tagcharm, qo‘shimcha tayanch",
        price: 85,
        brand: "Orto",
        thumbnail: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.5, count: 60 },
        stats: { views: 320, likes: 90, purchases: 65 },
        size: "m",
        season: "allseason"
      },
      {
        id: "elder-2",
        name: "Issiq kardigan",
        description: "Jun aralash, pastelli rang",
        price: 95,
        brand: "Warm",
        thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 55 },
        stats: { views: 300, likes: 85, purchases: 60 },
        size: "l",
        season: "winter"
      },
      {
        id: "elder-3",
        name: "Quvvatlovchi paypoqlar",
        description: "Kompression, 2 juft",
        price: 28,
        brand: "Support",
        thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.4, count: 50 },
        stats: { views: 260, likes: 70, purchases: 55 },
        size: "m",
        season: "allseason"
      }
    ],
    special: [
      {
        id: "spec-1",
        name: "Haj kiyimlari to‘plami",
        description: "Yupqa, nafas oluvchi mato",
        price: 75,
        brand: "Makkah",
        thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 58 },
        stats: { views: 310, likes: 90, purchases: 65 },
        size: "l",
        season: "summer"
      },
      {
        id: "spec-2",
        name: "Sport Performance set",
        description: "UV himoya, tez quriydigan material",
        price: 110,
        brand: "Active",
        thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.7, count: 70 },
        stats: { views: 340, likes: 100, purchases: 70 },
        size: "m",
        season: "summer"
      },
      {
        id: "spec-3",
        name: "Tibbiy kiyim to‘plami",
        description: "Antibakterial mato, ko‘k rang",
        price: 95,
        brand: "MedPro",
        thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"],
        rating: { avg: 4.6, count: 62 },
        stats: { views: 320, likes: 95, purchases: 68 },
        size: "l",
        season: "allseason"
      }
    ]
  };

  const showFoodStub = isFoodCategory && !!foodSubcategory;
  const showElectronicsStub = isElectronicsCategory;

  const filteredElectronics = useMemo(() => {
    if (!isElectronicsCategory) return [];
    const list = electronicsSubcategory
      ? electronicsProductsMock[electronicsSubcategory] || []
      : Object.values(electronicsProductsMock).flat();

    return list.filter((item) => {
      const brandMatch = electronicsFilters.brand
        ? item.brand?.toLowerCase().includes(electronicsFilters.brand.toLowerCase())
        : true;
      const priceMatch =
        (electronicsFilters.priceMin === undefined || (item.price ?? 0) >= electronicsFilters.priceMin) &&
        (electronicsFilters.priceMax === undefined || (item.price ?? 0) <= electronicsFilters.priceMax);
      const conditionMatch =
        electronicsFilters.condition === "any" ||
        (electronicsFilters.condition === "new" ? (item as any).condition !== "used" : (item as any).condition === "used");
      return brandMatch && priceMatch && conditionMatch;
    });
  }, [electronicsFilters.brand, electronicsFilters.condition, electronicsFilters.priceMax, electronicsFilters.priceMin, electronicsProductsMock, electronicsSubcategory, isElectronicsCategory]);

  const filteredFood = useMemo(() => {
    if (!isFoodCategory) return [];
    const list = foodSubcategory
      ? foodProductsMock[foodSubcategory] || []
      : Object.values(foodProductsMock).flat();

    const applyFilters = list.filter((item) => {
      const brandMatch = foodFilters.brand
        ? (item as any).brand?.toLowerCase?.().includes(foodFilters.brand.toLowerCase()) ?? false
        : true;
      const priceMatch =
        (foodFilters.priceMin === undefined || (item.price ?? 0) >= foodFilters.priceMin) &&
        (foodFilters.priceMax === undefined || (item.price ?? 0) <= foodFilters.priceMax);
      const conditionMatch =
        foodFilters.condition === "any" ||
        (foodFilters.condition === "fresh"
          ? (item as any).condition !== "frozen"
          : (item as any).condition === "frozen");
      return brandMatch && priceMatch && conditionMatch;
    });

    const score = (p: Product) => {
      const stats = p.stats || { purchases: p.orders ?? 0, likes: p.likes ?? 0, views: p.views ?? 0 };
      return {
        purchases: stats.purchases ?? stats.orders ?? 0,
        likes: stats.likes ?? 0,
        views: stats.views ?? 0
      };
    };

    return [...applyFilters].sort((a, b) => {
      const sa = score(a);
      const sb = score(b);
      if (sb.purchases !== sa.purchases) return sb.purchases - sa.purchases;
      if (sb.likes !== sa.likes) return sb.likes - sa.likes;
      return sb.views - sa.views;
    });
  }, [
    foodFilters.brand,
    foodFilters.condition,
    foodFilters.priceMax,
    foodFilters.priceMin,
    foodProductsMock,
    foodSubcategory,
    isFoodCategory
  ]);

  const filteredBeauty = useMemo(() => {
    if (!isBeautyCategory) return [];
    const list = beautySubcategory
      ? beautyProductsMock[beautySubcategory] || []
      : Object.values(beautyProductsMock).flat();
    return list.filter((item) => {
      const brandMatch = beautyFilters.brand
        ? (item as any).brand?.toLowerCase?.().includes(beautyFilters.brand.toLowerCase()) ?? false
        : true;
      const priceMatch =
        (beautyFilters.priceMin === undefined || (item.price ?? 0) >= beautyFilters.priceMin) &&
        (beautyFilters.priceMax === undefined || (item.price ?? 0) <= beautyFilters.priceMax);
      const audienceMatch =
        beautyFilters.audience === "any" ||
        (item as any).audience === beautyFilters.audience ||
        ((item as any).audience === "unisex" && beautyFilters.audience !== "kids");
      return brandMatch && priceMatch && audienceMatch;
    });
  }, [beautyFilters.audience, beautyFilters.brand, beautyFilters.priceMax, beautyFilters.priceMin, beautyProductsMock, beautySubcategory, isBeautyCategory]);

  const filteredAuto = useMemo(() => {
    if (!isAutoCategory) return [];
    const list = autoSubcategory
      ? autoProductsMock[autoSubcategory] || []
      : Object.values(autoProductsMock).flat();
    return list.filter((item) => {
      const brandMatch = autoFilters.brand
        ? (item as any).brand?.toLowerCase?.().includes(autoFilters.brand.toLowerCase()) ?? false
        : true;
      const priceMatch =
        (autoFilters.priceMin === undefined || (item.price ?? 0) >= autoFilters.priceMin) &&
        (autoFilters.priceMax === undefined || (item.price ?? 0) <= autoFilters.priceMax);
      const conditionMatch =
        autoFilters.condition === "any" ||
        (autoFilters.condition === "new"
          ? (item as any).condition !== "used"
          : (item as any).condition === "used");
      return brandMatch && priceMatch && conditionMatch;
    });
  }, [autoFilters.brand, autoFilters.condition, autoFilters.priceMax, autoFilters.priceMin, autoProductsMock, autoSubcategory, isAutoCategory]);

  const filteredHome = useMemo(() => {
    if (!isHomeCategory) return [];
    const list = homeSubcategory
      ? homeProductsMock[homeSubcategory] || []
      : Object.values(homeProductsMock).flat();
    return list.filter((item) => {
      const brandMatch = homeFilters.brand
        ? (item as any).brand?.toLowerCase?.().includes(homeFilters.brand.toLowerCase()) ?? false
        : true;
      const priceMatch =
        (homeFilters.priceMin === undefined || (item.price ?? 0) >= homeFilters.priceMin) &&
        (homeFilters.priceMax === undefined || (item.price ?? 0) <= homeFilters.priceMax);
      const conditionMatch =
        homeFilters.condition === "any" ||
        (homeFilters.condition === "new"
          ? (item as any).condition !== "used"
          : (item as any).condition === "used");
      return brandMatch && priceMatch && conditionMatch;
    });
  }, [homeFilters.brand, homeFilters.condition, homeFilters.priceMax, homeFilters.priceMin, homeProductsMock, homeSubcategory, isHomeCategory]);

  const filteredClothing = useMemo(() => {
    if (!isClothingCategory) return [];
    const list =
      clothingSubcategory && clothingProductsMock[clothingSubcategory]
        ? clothingProductsMock[clothingSubcategory]
        : Object.values(clothingProductsMock).flat();

    return list.filter((item) => {
      const brandMatch = clothingFilters.brand
        ? (item as any).brand?.toLowerCase?.().includes(clothingFilters.brand.toLowerCase()) ?? false
        : true;
      const priceMatch =
        (clothingFilters.priceMin === undefined || (item.price ?? 0) >= clothingFilters.priceMin) &&
        (clothingFilters.priceMax === undefined || (item.price ?? 0) <= clothingFilters.priceMax);
      const sizeMatch =
        clothingFilters.size === "any" ||
        (item as any).size === clothingFilters.size;
      const seasonMatch =
        clothingFilters.season === "any" ||
        (clothingFilters.season === "allseason"
          ? (item as any).season === "allseason"
          : (item as any).season === clothingFilters.season || (item as any).season === "allseason");
      return brandMatch && priceMatch && sizeMatch && seasonMatch;
    });
  }, [
    clothingFilters.brand,
    clothingFilters.priceMax,
    clothingFilters.priceMin,
    clothingFilters.season,
    clothingFilters.size,
    clothingProductsMock,
    clothingSubcategory,
    isClothingCategory
  ]);

  const allMockProducts = useMemo(() => {
    const flatten = <T extends Product>(map: Record<string, T[]>) =>
      Object.values(map).reduce<T[]>((acc, arr) => acc.concat(arr), []);
    return [
      ...flatten(foodProductsMock),
      ...flatten(beautyProductsMock),
      ...flatten(electronicsProductsMock),
      ...flatten(autoProductsMock),
      ...flatten(homeProductsMock),
      ...flatten(clothingProductsMock)
    ];
  }, [autoProductsMock, beautyProductsMock, clothingProductsMock, electronicsProductsMock, foodProductsMock, homeProductsMock]);

  const defaultSorted = useMemo(() => {
    const combined = [...items, ...allMockProducts];
    const score = (p: Product) => {
      const stats = p.stats || { purchases: p.orders ?? 0, likes: p.likes ?? 0, views: p.views ?? 0 };
      const purchases = stats.purchases ?? stats.orders ?? 0;
      const likes = stats.likes ?? 0;
      const views = stats.views ?? 0;
      return { purchases, likes, views };
    };
    return [...combined].sort((a, b) => {
      const sa = score(a);
      const sb = score(b);
      if (sb.purchases !== sa.purchases) return sb.purchases - sa.purchases;
      if (sb.likes !== sa.likes) return sb.likes - sa.likes;
      return sb.views - sa.views;
    });
  }, [allMockProducts, items]);

  const displayItems = isFoodCategory
    ? filteredFood
    : isBeautyCategory
      ? filteredBeauty
      : isAutoCategory
        ? filteredAuto
        : isHomeCategory
          ? filteredHome
          : isClothingCategory
            ? filteredClothing
            : showElectronicsStub
              ? filteredElectronics
              : defaultSorted;

  const uniqueDisplayItems = useMemo(() => {
    const seen = new Set<string>();
    return displayItems.filter((item, idx) => {
      const keyBase = (item._id ?? item.id ?? (item as any).slug ?? item.name ?? idx).toString().trim();
      const key = keyBase.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [displayItems]);

  const resolveProductKey = (product: Product, idx: number) => {
    const keyBase = (product._id ?? product.id ?? (product as any).slug ?? product.name ?? idx).toString().trim();
    return `${keyBase}-${idx}`;
  };

  const displayLoading = isFoodCategory
    ? false
    : isBeautyCategory
      ? false
      : isAutoCategory
        ? false
        : isHomeCategory
          ? false
          : isClothingCategory
            ? false
            : showElectronicsStub
              ? false
              : loading;
  const headerBgOverride = isElectronicsCategory
    ? "linear-gradient(90deg, rgba(18,46,89,0.85), rgba(29,78,216,0.7)), url('/images/products/all-products-banner.svg')"
    : "linear-gradient(90deg, rgba(12,12,12,0.70), rgba(0,0,0,0.45)), url('/images/products/all-products-banner.svg')";

  const surfaceBg = useMemo(() => {
    switch (filters.category) {
      case "oziq-ovqat":
        return "linear-gradient(180deg, #e8f7ec 0%, #f6fff9 100%)";
      case "elektronika":
        return "linear-gradient(180deg, #e8f2ff 0%, #f6fbff 100%)";
      case "gozallik":
        return "linear-gradient(180deg, #fde7f3 0%, #fff5fb 100%)";
      case "avto-texnika":
        return "linear-gradient(180deg, #e8ecf3 0%, #f7f9fc 100%)";
      case "maishiy-uskunalar":
        return "linear-gradient(180deg, #f4fbda 0%, #fcfff0 100%)";
      case "kiyim-kechak":
        return "linear-gradient(180deg, #fff0f5 0%, #fff8fb 100%)";
      default:
        return "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)";
    }
  }, [filters.category]);

  return (
    <div className="space-y-5" style={{ backgroundImage: surfaceBg, borderRadius: "24px", padding: "12px" }}>
      <header
        className="rounded-3xl px-6 py-8 text-white shadow-lg"
        style={{
          backgroundImage: headerBgOverride,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <p className="text-sm uppercase tracking-[0.15em]">UniServe · Marketplace</p>
        <h1 className="mt-2 text-3xl font-extrabold">Mahsulotlar</h1>
        <p className="mt-1 max-w-2xl text-sm text-emerald-50">
          Sellzy uslubidagi toza grid: ommabop tovarlar, kuchli filtrlar va tezkor xarid statistikasi.
        </p>
      </header>

      <div className="products-layout">
        <div className="sidebar-stack">
          <CategoriesSidebar
            selected={filters.category}
            onSelect={(slug) => {
              handleCategorySelect(slug);
              setFoodSubcategory(null);
              setBeautySubcategory(null);
              setBeautyFilters({ brand: "", audience: "any" });
              setElectronicsSubcategory(null);
              setElectronicsFilters({ brand: "", condition: "any" });
              setAutoSubcategory(null);
              setAutoFilters({ brand: "", condition: "any" });
              setHomeSubcategory(null);
              setHomeFilters({ brand: "", condition: "any" });
              setClothingSubcategory(null);
              setClothingFilters({ brand: "", size: "any", season: "any" });
            }}
          />

          {isFoodCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Oziq-ovqat bo'limi</p>
              <div className="subpanel-items">
                {foodSubcategories.map((sub) => {
                  const active = foodSubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setFoodSubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brend yoki yetkazib beruvchi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Nestle"
                    value={foodFilters.brand}
                    onChange={(e) => setFoodFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={foodFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setFoodFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={foodFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setFoodFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row">
                  <label className="subpanel-label">Holati</label>
                  <select
                    value={foodFilters.condition}
                    onChange={(e) =>
                      setFoodFilters((f) => ({
                        ...f,
                        condition: e.target.value as "any" | "fresh" | "frozen"
                      }))
                    }
                    className="subpanel-input"
                  >
                    <option value="any">Barchasi</option>
                    <option value="fresh">Yangi / yangi tayyorlangan</option>
                    <option value="frozen">Muzlatilgan</option>
                  </select>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setFoodFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        condition: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}

          {isElectronicsCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Elektronika bo'limi</p>
              <div className="subpanel-items">
                {electronicsSubcategories.map((sub) => {
                  const active = electronicsSubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setElectronicsSubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brand</label>
                  <input
                    type="text"
                    placeholder="Masalan: Samsung"
                    value={electronicsFilters.brand}
                    onChange={(e) => setElectronicsFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={electronicsFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setElectronicsFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="3000"
                      value={electronicsFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setElectronicsFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row">
                  <label className="subpanel-label">Holati</label>
                  <select
                    value={electronicsFilters.condition}
                    onChange={(e) =>
                      setElectronicsFilters((f) => ({
                        ...f,
                        condition: e.target.value as "any" | "new" | "used"
                      }))
                    }
                    className="subpanel-input"
                  >
                    <option value="any">Barchasi</option>
                    <option value="new">Yangi</option>
                    <option value="used">Ishlatilgan</option>
                  </select>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setElectronicsFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        condition: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}

          {isBeautyCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Go'zallik bo'limi</p>
              <div className="subpanel-items">
                {beautySubcategories.map((sub) => {
                  const active = beautySubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setBeautySubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brend</label>
                  <input
                    type="text"
                    placeholder="Masalan: Dior"
                    value={beautyFilters.brand}
                    onChange={(e) => setBeautyFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={beautyFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setBeautyFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="300"
                      value={beautyFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setBeautyFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row">
                  <label className="subpanel-label">Auditoriya</label>
                  <select
                    value={beautyFilters.audience}
                    onChange={(e) =>
                      setBeautyFilters((f) => ({
                        ...f,
                        audience: e.target.value as "any" | "women" | "men" | "kids" | "unisex"
                      }))
                    }
                    className="subpanel-input"
                  >
                    <option value="any">Barchasi</option>
                    <option value="women">Ayollar</option>
                    <option value="men">Erkaklar</option>
                    <option value="kids">Bolalar</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setBeautyFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        audience: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAutoCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Avtomobil va texnika bo'limi</p>
              <div className="subpanel-items">
                {autoSubcategories.map((sub) => {
                  const active = autoSubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setAutoSubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brend/Model</label>
                  <input
                    type="text"
                    placeholder="Masalan: Hyundai"
                    value={autoFilters.brand}
                    onChange={(e) => setAutoFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={autoFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setAutoFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={autoFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setAutoFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row">
                  <label className="subpanel-label">Holati</label>
                  <select
                    value={autoFilters.condition}
                    onChange={(e) =>
                      setAutoFilters((f) => ({
                        ...f,
                        condition: e.target.value as "any" | "new" | "used"
                      }))
                    }
                    className="subpanel-input"
                  >
                    <option value="any">Barchasi</option>
                    <option value="new">Yangi</option>
                    <option value="used">Ishlatilgan</option>
                  </select>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setAutoFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        condition: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}

          {isHomeCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Maishiy uskunalar bo'limi</p>
              <div className="subpanel-items">
                {homeSubcategories.map((sub) => {
                  const active = homeSubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setHomeSubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brend/Model</label>
                  <input
                    type="text"
                    placeholder="Masalan: LG"
                    value={homeFilters.brand}
                    onChange={(e) => setHomeFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={homeFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setHomeFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={homeFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setHomeFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row">
                  <label className="subpanel-label">Holati</label>
                  <select
                    value={homeFilters.condition}
                    onChange={(e) =>
                      setHomeFilters((f) => ({
                        ...f,
                        condition: e.target.value as "any" | "new" | "used"
                      }))
                    }
                    className="subpanel-input"
                  >
                    <option value="any">Barchasi</option>
                    <option value="new">Yangi</option>
                    <option value="used">Ishlatilgan</option>
                  </select>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setHomeFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        condition: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}

          {isClothingCategory && (
            <div className="food-subpanel">
              <p className="subpanel-title">Kiyim-kechak bo'limi</p>
              <div className="subpanel-items">
                {clothingSubcategories.map((sub) => {
                  const active = clothingSubcategory === sub.key;
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      className={`subcat-chip ${active ? "active" : ""}`}
                      onClick={() => setClothingSubcategory(sub.key)}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
              <div className="subpanel-filter">
                <div className="subpanel-row">
                  <label className="subpanel-label">Brend</label>
                  <input
                    type="text"
                    placeholder="Masalan: Zara"
                    value={clothingFilters.brand}
                    onChange={(e) => setClothingFilters((f) => ({ ...f, brand: e.target.value }))}
                    className="subpanel-input"
                  />
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">Narx min</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={clothingFilters.priceMin ?? ""}
                      onChange={(e) =>
                        setClothingFilters((f) => ({
                          ...f,
                          priceMin: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                  <div>
                    <label className="subpanel-label">Narx max</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={clothingFilters.priceMax ?? ""}
                      onChange={(e) =>
                        setClothingFilters((f) => ({
                          ...f,
                          priceMax: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                      className="subpanel-input"
                    />
                  </div>
                </div>
                <div className="subpanel-row two-cols">
                  <div>
                    <label className="subpanel-label">O'lcham</label>
                    <select
                      value={clothingFilters.size}
                      onChange={(e) =>
                        setClothingFilters((f) => ({
                          ...f,
                          size: e.target.value as "any" | "s" | "m" | "l" | "xl"
                        }))
                      }
                      className="subpanel-input"
                    >
                      <option value="any">Barchasi</option>
                      <option value="s">S</option>
                      <option value="m">M</option>
                      <option value="l">L</option>
                      <option value="xl">XL</option>
                    </select>
                  </div>
                  <div>
                    <label className="subpanel-label">Mavsum</label>
                    <select
                      value={clothingFilters.season}
                      onChange={(e) =>
                        setClothingFilters((f) => ({
                          ...f,
                          season: e.target.value as "any" | "summer" | "winter" | "allseason"
                        }))
                      }
                      className="subpanel-input"
                    >
                      <option value="any">Barchasi</option>
                      <option value="summer">Yozgi</option>
                      <option value="winter">Qishki</option>
                      <option value="allseason">Barcha mavsum</option>
                    </select>
                  </div>
                </div>
                <div className="subpanel-actions">
                  <button
                    type="button"
                    className="subcat-chip active"
                    onClick={() =>
                      setClothingFilters({
                        brand: "",
                        priceMin: undefined,
                        priceMax: undefined,
                        size: "any",
                        season: "any"
                      })
                    }
                  >
                    Filtrlarni tiklash
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="products-main">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />

          {displayLoading ? (
            <Spinner label="Mahsulotlar yuklanmoqda" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uniqueDisplayItems.map((p, idx) => (
                <ProductCard
                  key={resolveProductKey(p, idx)}
                  data={p}
                  disableNavigation={isAutoCategory || p.category === "avto-texnika"}
                />
              ))}
              {displayItems.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-500">
                  Hozircha mahsulot topilmadi.
                </div>
              )}
            </div>
          )}

          <Pagination
            page={pagination.page}
            total={pagination.total ?? items.length}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
