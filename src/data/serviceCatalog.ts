export type ServiceImage = {
  src: string;
  alt: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  unit: string;
  description: string;
  certificates: string[];
  images: ServiceImage[];
  createdAt: string;
  usedCount: number;
  niceCount: number;
  shareCount: number;
  rating: number;
  reviewCount: number;
  canRate: boolean;
  subCategory?: string;
  translationMode?: "written" | "oral";
  translationSpeed?: "oddiy" | "shoshilinch";
  translationFormat?: "PDF" | "Scan" | "Original";
  notarization?: boolean;
  sourceLang?: string;
  targetLang?: string;
};

export type ServiceAgent = {
  id: string;
  name: string;
  nickname: string;
  gender?: "Ayol" | "Erkak";
  avatar: ServiceImage;
  specialty: string;
  location: string;
  region?: string;
  regionDetail?: string;
  distanceKm?: number;
  experienceYears: number;
  languages?: string[];
  audiences?: string[];
  achievement?: string;
  consultationFormats?: string[];
  consultationDurations?: string[];
  consultationLanguages?: string[];
  consultationPackages?: string[];
  equipment?: string[];
  completedOrders?: number;
  movingCapacityTons?: number;
  movingTruckType?: string;
  age?: number;
  maritalStatus?: "Oilali" | "Turmush qurmagan";
  healthStatus?: string;
  hasCriminalRecord?: boolean;
  identityImage?: ServiceImage;
  availability?: string[];
  careFocus?: string[];
  bio?: string;
  vehicleClass?: "comfort" | "business" | "limuzin";
  seatCount?: 4 | 7 | 9 | 13 | 20 | 30 | 40;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleOptions?: string[];
  contactPhone?: string;
  contactTelegram?: string;
  verified: boolean;
  followers: number;
  totalClients: number;
  rating: number;
  reviewCount: number;
  niceCount: number;
  shareCount: number;
  canRate: boolean;
  services: ServiceItem[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  agents: ServiceAgent[];
};

export type ServiceCatalogGroup = {
  id: "material" | "spiritual";
  title: string;
  description: string;
  categories: ServiceCategory[];
};

const makeCategorySet = (categoryId: string, label: string): ServiceImage[] =>
  Array.from({ length: 36 }, (_, idx) => ({
    src: `/services/${categoryId}/${String(idx + 1).padStart(2, "0")}.jpg`,
    alt: `${label} ${idx + 1}`
  }));

const categoryImages: Record<string, ServiceImage[]> = {
  taxi: makeCategorySet("taxi", "Taxi xizmati"),
  delivery: makeCategorySet("delivery", "Yetkazib berish xizmati"),
  technical: makeCategorySet("technical", "Texnik xizmat"),
  construction: makeCategorySet("construction", "Qurilish xizmati"),
  moving: makeCategorySet("moving", "Ko'chirish xizmati"),
  cleaning: makeCategorySet("cleaning", "Tozalik xizmati"),
  nanny: makeCategorySet("nanny", "Enagalik xizmati"),
  marketing: makeCategorySet("marketing", "Reklama xizmati"),
  employment: makeCategorySet("employment", "Ish topib berish xizmati"),
  education: makeCategorySet("education", "Ta'lim xizmati"),
  consulting: makeCategorySet("consulting", "Konsalting xizmati"),
  translation: makeCategorySet("translation", "Tarjimonlik xizmati"),
  psychology: makeCategorySet("psychology", "Ruhshunoslik xizmati"),
  legal: makeCategorySet("legal", "Huquqshunoslik xizmati"),
  sport: makeCategorySet("sport", "Sport treneri xizmati")
};

const categoryImageCursor: Record<string, number> = {};

export const getCategoryImagePool = (categoryId: string): ServiceImage[] =>
  categoryImages[categoryId] || categoryImages.taxi;

const getCategoryImages = (categoryId: string): ServiceImage[] => {
  const pool = getCategoryImagePool(categoryId);
  const start = categoryImageCursor[categoryId] ?? 0;
  categoryImageCursor[categoryId] = start + 3;
  return [pool[start % pool.length], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
};

const makeAvatar = (index: number, name: string): ServiceImage => ({
  src: `/avatars/agent-${String(index).padStart(2, "0")}.jpg`,
  alt: `${name} avatar`
});

const makePortrait = (seed: number, name: string): ServiceImage => ({
  src: `https://source.unsplash.com/600x800/?portrait,face&sig=${seed}`,
  alt: `${name} shaxsni tasdiqlovchi rasm`
});

const makeService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  categoryId: string,
  seed: number,
  canRate = false,
  extras: Partial<ServiceItem> = {}
): ServiceItem => ({
  id,
  title,
  price,
  currency: "UZS",
  unit,
  description,
  certificates,
  images: extras.images ?? getCategoryImages(categoryId),
  createdAt: new Date(2024, 0, 1 + seed).toISOString(),
  usedCount: 120 + seed * 7,
  niceCount: 40 + seed * 3,
  shareCount: 18 + seed * 2,
  rating: Number((4.3 + (seed % 4) * 0.15).toFixed(1)),
  reviewCount: 24 + seed * 2,
  canRate,
  ...extras
});

const makeAgent = (
  id: string,
  name: string,
  nickname: string,
  specialty: string,
  location: string,
  experienceYears: number,
  seed: number,
  avatarIndex: number,
  services: ServiceItem[],
  canRate = false,
  extras: Partial<
    Pick<
      ServiceAgent,
      | "vehicleClass"
      | "seatCount"
      | "vehicleModel"
      | "vehiclePlate"
      | "vehicleOptions"
      | "contactPhone"
      | "contactTelegram"
      | "gender"
      | "region"
      | "distanceKm"
      | "equipment"
      | "completedOrders"
      | "movingCapacityTons"
      | "movingTruckType"
      | "age"
      | "maritalStatus"
      | "healthStatus"
      | "hasCriminalRecord"
      | "identityImage"
      | "availability"
      | "careFocus"
      | "bio"
      | "regionDetail"
      | "languages"
      | "audiences"
      | "achievement"
      | "consultationFormats"
      | "consultationDurations"
      | "consultationLanguages"
      | "consultationPackages"
    >
  > = {}
): ServiceAgent => ({
  id,
  name,
  nickname,
  avatar: makeAvatar(avatarIndex, name),
  specialty,
  location,
  experienceYears,
  verified: true,
  followers: 210 + seed * 13,
  totalClients: 480 + seed * 21,
  rating: Number((4.4 + (seed % 3) * 0.2).toFixed(1)),
  reviewCount: 60 + seed * 4,
  niceCount: 140 + seed * 9,
  shareCount: 55 + seed * 5,
  canRate,
  services,
  ...extras
});

let constructionImageCursor = 0;

const constructionImageMap: Record<string, ServiceImage[]> = {
  "construction-general": [
    {
      src: "https://source.unsplash.com/featured/1200x800?construction,site&sig=11",
      alt: "Qurilish umumiy 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?builder,team&sig=12",
      alt: "Qurilish umumiy 2"
    }
  ],
  "exterior-facade": [
    {
      src: "https://source.unsplash.com/featured/1200x800?facade,building&sig=21",
      alt: "Fasad ishlari 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?plaster,facade&sig=22",
      alt: "Fasad ishlari 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?painting,exterior&sig=23",
      alt: "Fasad ishlari 3"
    }
  ],
  "exterior-concrete": [
    {
      src: "https://source.unsplash.com/featured/1200x800?concrete,pouring&sig=31",
      alt: "Beton ishlari 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?foundation,concrete&sig=32",
      alt: "Beton ishlari 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?construction,concrete&sig=33",
      alt: "Beton ishlari 3"
    }
  ],
  "exterior-brick": [
    {
      src: "https://source.unsplash.com/featured/1200x800?brick,wall&sig=41",
      alt: "G'isht terish 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?bricklaying,construction&sig=42",
      alt: "G'isht terish 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?masonry,brick&sig=43",
      alt: "G'isht terish 3"
    }
  ],
  "exterior-roofing": [
    {
      src: "https://source.unsplash.com/featured/1200x800?roof,construction&sig=51",
      alt: "Tom yopish 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?roofing,tiles&sig=52",
      alt: "Tom yopish 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?metal,roof&sig=53",
      alt: "Tom yopish 3"
    }
  ],
  "exterior-roof-repair": [
    {
      src: "https://source.unsplash.com/featured/1200x800?roof,repair&sig=61",
      alt: "Tom ta'mirlash 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?repair,roofing&sig=62",
      alt: "Tom ta'mirlash 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?leak,roof&sig=63",
      alt: "Tom ta'mirlash 3"
    }
  ],
  "interior-paint": [
    {
      src: "https://source.unsplash.com/featured/1200x800?interior,painting&sig=71",
      alt: "Bo'yoqchilik 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?wall,paint&sig=72",
      alt: "Bo'yoqchilik 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?roller,paint&sig=73",
      alt: "Bo'yoqchilik 3"
    }
  ],
  "interior-wallpaper": [
    {
      src: "https://source.unsplash.com/featured/1200x800?wallpaper,interior&sig=81",
      alt: "Gul qog'oz 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?wallpaper,design&sig=82",
      alt: "Gul qog'oz 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?pattern,wallpaper&sig=83",
      alt: "Gul qog'oz 3"
    }
  ],
  "interior-design": [
    {
      src: "https://source.unsplash.com/featured/1200x800?interior,design&sig=91",
      alt: "Dizayner xizmati 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?interior,planning&sig=92",
      alt: "Dizayner xizmati 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?architect,interior&sig=93",
      alt: "Dizayner xizmati 3"
    }
  ],
  "interior-doors-windows": [
    {
      src: "https://source.unsplash.com/featured/1200x800?door,installation&sig=101",
      alt: "Eshik va deraza romlari 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?window,installation&sig=102",
      alt: "Eshik va deraza romlari 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?carpentry,door&sig=103",
      alt: "Eshik va deraza romlari 3"
    }
  ],
  "interior-ceiling": [
    {
      src: "https://source.unsplash.com/featured/1200x800?ceiling,interior&sig=111",
      alt: "Shift ta'mirlash 1"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?ceiling,lights&sig=112",
      alt: "Shift ta'mirlash 2"
    },
    {
      src: "https://source.unsplash.com/featured/1200x800?drywall,ceiling&sig=113",
      alt: "Shift ta'mirlash 3"
    }
  ]
};

const constructionImageCursorMap: Record<string, number> = {};

const makeConstructionService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  seed: number,
  subCategory: string,
  canRate = false
) => {
  const pool = constructionImageMap[subCategory] || getCategoryImagePool("construction");
  const start = constructionImageCursorMap[subCategory] ?? 0;
  const images = Array.from({ length: 3 }, (_, idx) => pool[(start + idx) % pool.length]);
  constructionImageCursorMap[subCategory] = start + 3;
  if (!constructionImageMap[subCategory]) {
    constructionImageCursor += 3;
  }
  return makeService(
    id,
    title,
    price,
    unit,
    description,
    certificates,
    "construction",
    seed,
    canRate,
    { images, subCategory }
  );
};

const movingImageMap: Record<string, ServiceImage[]> = {
  "moving-1t": makeCategorySet("moving", "1 tonna yuk mashinasi"),
  "moving-2t": makeCategorySet("moving", "2 tonna yuk mashinasi"),
  "moving-5t": makeCategorySet("moving", "5 tonna yuk mashinasi"),
  "moving-20t": makeCategorySet("moving", "20 tonna yuk mashinasi"),
  "moving-40t": makeCategorySet("moving", "40 tonna yuk mashinasi")
};

const movingImageCursorMap: Record<string, number> = {};

const makeMovingService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  seed: number,
  subCategory: string,
  canRate = false
) => {
  const pool = movingImageMap[subCategory] || getCategoryImagePool("moving");
  const start = movingImageCursorMap[subCategory] ?? 0;
  const images = [
    pool[start % pool.length],
    pool[(start + 1) % pool.length],
    pool[(start + 2) % pool.length]
  ];
  movingImageCursorMap[subCategory] = start + 3;
  return makeService(
    id,
    title,
    price,
    unit,
    description,
    certificates,
    "moving",
    seed,
    canRate,
    { images, subCategory }
  );
};

let cleaningImageCursor = 0;

const makeCleaningService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  seed: number,
  canRate = false
) => {
  const pool = getCategoryImagePool("cleaning");
  const start = cleaningImageCursor;
  const images = [
    pool[start % pool.length],
    pool[(start + 1) % pool.length],
    pool[(start + 2) % pool.length]
  ];
  cleaningImageCursor += 3;
  return makeService(
    id,
    title,
    price,
    unit,
    description,
    certificates,
    "cleaning",
    seed,
    canRate,
    { images }
  );
};

let nannyImageCursor = 0;

const makeNannyService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  seed: number,
  canRate = false,
  subCategory?: string
) => {
  const pool = getCategoryImagePool("nanny");
  const start = nannyImageCursor;
  const images = [
    pool[start % pool.length],
    pool[(start + 1) % pool.length],
    pool[(start + 2) % pool.length]
  ];
  nannyImageCursor += 3;
  return makeService(
    id,
    title,
    price,
    unit,
    description,
    certificates,
    "nanny",
    seed,
    canRate,
    { images, subCategory: subCategory ?? "nanny-child" }
  );
};

type MovingAgentSpec = {
  id: string;
  name: string;
  nickname: string;
  specialty: string;
  location: string;
  region: string;
  experienceYears: number;
  avatarIndex: number;
  capacityTons: number;
  truckType: string;
  service: {
    id: string;
    title: string;
    price: number;
    unit: string;
    description: string;
    certificates: string[];
    seed: number;
    subCategory: string;
  };
};

const movingEquipmentMap: Record<string, string[]> = {
  "moving-1t": ["Sky car", "Yuk aravachasi", "Qadoqlash to'plami"],
  "moving-2t": ["Sky car", "Yuk aravachasi", "Balanslash kamari"],
  "moving-5t": ["Sky car", "Yuk ko'targich", "Qadoqlash to'plami"],
  "moving-20t": ["Sky car", "Yuk ko'targich", "Kran moslamasi"],
  "moving-40t": ["Sky car", "Kran moslamasi", "Gidravlik platforma"]
};

const movingAgentSpecs: MovingAgentSpec[] = [
  {
    id: "move-1t-1",
    name: "Ali Qosimov",
    nickname: "AliMove1",
    specialty: "1 tonna yuk ko'chirish",
    location: "Toshkent",
    region: "O'zbekiston",
    experienceYears: 5,
    avatarIndex: 12,
    capacityTons: 1,
    truckType: "Isuzu mini",
    service: {
      id: "move-1t-1",
      title: "1 tonna yuk ko'chirish",
      price: 380000,
      unit: "xizmat",
      description: "Kichik yuklar, xavfsiz qadoqlash va tezkor yetkazish.",
      certificates: ["Haydovchilik guvohnomasi", "Sug'urta"],
      seed: 61,
      subCategory: "moving-1t"
    }
  },
  {
    id: "move-1t-2",
    name: "Sevara Abdullayeva",
    nickname: "SevaraMove1",
    specialty: "1 tonna tezkor ko'chirish",
    location: "Samarqand",
    region: "O'zbekiston",
    experienceYears: 4,
    avatarIndex: 13,
    capacityTons: 1,
    truckType: "Hyundai Porter",
    service: {
      id: "move-1t-2",
      title: "1 tonna tezkor xizmat",
      price: 420000,
      unit: "xizmat",
      description: "Mahalliy ko'chirish va 1-2 xonali uylar uchun.",
      certificates: ["Transport litsenziyasi"],
      seed: 62,
      subCategory: "moving-1t"
    }
  },
  {
    id: "move-1t-3",
    name: "Jong-ho Lee",
    nickname: "JongMove1",
    specialty: "1 tonna ko'chirish",
    location: "Seul",
    region: "Koreya",
    experienceYears: 6,
    avatarIndex: 14,
    capacityTons: 1,
    truckType: "Kia Bongo",
    service: {
      id: "move-1t-3",
      title: "1 tonna xizmat (Seul)",
      price: 450000,
      unit: "xizmat",
      description: "Seul ichida tezkor ko'chirish va qadoqlash xizmati.",
      certificates: ["Transport ruxsatnomasi"],
      seed: 63,
      subCategory: "moving-1t"
    }
  },
  {
    id: "move-2t-1",
    name: "Murodjon Raximov",
    nickname: "MurodMove2",
    specialty: "2 tonna yuk ko'chirish",
    location: "Farg'ona",
    region: "O'zbekiston",
    experienceYears: 7,
    avatarIndex: 15,
    capacityTons: 2,
    truckType: "Isuzu NQR",
    service: {
      id: "move-2t-1",
      title: "2 tonna ko'chirish",
      price: 680000,
      unit: "xizmat",
      description: "2 tonnagacha yuklar, lift va sky car xizmatlari.",
      certificates: ["Transport litsenziyasi", "Sug'urta"],
      seed: 64,
      subCategory: "moving-2t"
    }
  },
  {
    id: "move-2t-2",
    name: "Madina Yo'ldosheva",
    nickname: "MadinaMove2",
    specialty: "2 tonna xizmat",
    location: "Toshkent",
    region: "O'zbekiston",
    experienceYears: 5,
    avatarIndex: 16,
    capacityTons: 2,
    truckType: "Hyundai HD35",
    service: {
      id: "move-2t-2",
      title: "2 tonna tezkor ko'chirish",
      price: 720000,
      unit: "xizmat",
      description: "Ko'p qavatli binolardan yuk tushirish va ko'chirish.",
      certificates: ["Yuk ko'tarish ruxsatnomasi"],
      seed: 65,
      subCategory: "moving-2t"
    }
  },
  {
    id: "move-2t-3",
    name: "Min-jae Park",
    nickname: "MinMove2",
    specialty: "2 tonna ko'chirish",
    location: "Busan",
    region: "Koreya",
    experienceYears: 6,
    avatarIndex: 17,
    capacityTons: 2,
    truckType: "Hyundai Mighty",
    service: {
      id: "move-2t-3",
      title: "2 tonna xizmat (Busan)",
      price: 760000,
      unit: "xizmat",
      description: "Busan ichida yuk ko'chirish va qadoqlash.",
      certificates: ["Transport ruxsatnomasi"],
      seed: 66,
      subCategory: "moving-2t"
    }
  },
  {
    id: "move-5t-1",
    name: "Otabek Karimov",
    nickname: "OtabekMove5",
    specialty: "5 tonna yuk ko'chirish",
    location: "Andijon",
    region: "O'zbekiston",
    experienceYears: 8,
    avatarIndex: 18,
    capacityTons: 5,
    truckType: "MAN 5T",
    service: {
      id: "move-5t-1",
      title: "5 tonna ko'chirish",
      price: 1250000,
      unit: "xizmat",
      description: "Ofis va katta yuklar uchun ko'chirish xizmati.",
      certificates: ["Transport litsenziyasi", "Shartnoma"],
      seed: 67,
      subCategory: "moving-5t"
    }
  },
  {
    id: "move-5t-2",
    name: "Gulbahor Ismoilova",
    nickname: "GulbahorMove5",
    specialty: "5 tonna xizmat",
    location: "Toshkent",
    region: "O'zbekiston",
    experienceYears: 6,
    avatarIndex: 19,
    capacityTons: 5,
    truckType: "Isuzu 5T",
    service: {
      id: "move-5t-2",
      title: "5 tonna tezkor xizmat",
      price: 1350000,
      unit: "xizmat",
      description: "Ko'chirish jarayoni va sky car orqali yuk tushirish.",
      certificates: ["Sug'urta", "Yuk ko'tarish ruxsatnomasi"],
      seed: 68,
      subCategory: "moving-5t"
    }
  },
  {
    id: "move-5t-3",
    name: "Ji-hoon Kim",
    nickname: "JihoonMove5",
    specialty: "5 tonna ko'chirish",
    location: "Incheon",
    region: "Koreya",
    experienceYears: 7,
    avatarIndex: 20,
    capacityTons: 5,
    truckType: "Hyundai 5T",
    service: {
      id: "move-5t-3",
      title: "5 tonna xizmat (Incheon)",
      price: 1480000,
      unit: "xizmat",
      description: "Incheon hududida ko'chirish va qadoqlash.",
      certificates: ["Transport ruxsatnomasi"],
      seed: 69,
      subCategory: "moving-5t"
    }
  },
  {
    id: "move-20t-1",
    name: "Sardor Tursunov",
    nickname: "SardorMove20",
    specialty: "20 tonna yuk ko'chirish",
    location: "Toshkent",
    region: "O'zbekiston",
    experienceYears: 9,
    avatarIndex: 21,
    capacityTons: 20,
    truckType: "Volvo 20T",
    service: {
      id: "move-20t-1",
      title: "20 tonna ko'chirish",
      price: 3200000,
      unit: "xizmat",
      description: "Katta yuklar uchun kran va sky car bilan ko'chirish.",
      certificates: ["Transport litsenziyasi", "Kran ruxsatnomasi"],
      seed: 70,
      subCategory: "moving-20t"
    }
  },
  {
    id: "move-20t-2",
    name: "Dilshod Mirzayev",
    nickname: "DilshodMove20",
    specialty: "20 tonna xizmat",
    location: "Buxoro",
    region: "O'zbekiston",
    experienceYears: 8,
    avatarIndex: 22,
    capacityTons: 20,
    truckType: "Scania 20T",
    service: {
      id: "move-20t-2",
      title: "20 tonna tezkor xizmat",
      price: 3400000,
      unit: "xizmat",
      description: "Uzoq masofali ko'chirish va yuklarni tushirish.",
      certificates: ["Sug'urta", "Shartnoma"],
      seed: 71,
      subCategory: "moving-20t"
    }
  },
  {
    id: "move-20t-3",
    name: "Hyun-woo Choi",
    nickname: "HyunMove20",
    specialty: "20 tonna ko'chirish",
    location: "Daegu",
    region: "Koreya",
    experienceYears: 9,
    avatarIndex: 23,
    capacityTons: 20,
    truckType: "Hyundai 20T",
    service: {
      id: "move-20t-3",
      title: "20 tonna xizmat (Daegu)",
      price: 3600000,
      unit: "xizmat",
      description: "Daegu hududida yirik yuklarni ko'chirish.",
      certificates: ["Transport ruxsatnomasi"],
      seed: 72,
      subCategory: "moving-20t"
    }
  },
  {
    id: "move-40t-1",
    name: "Javlon Abdullayev",
    nickname: "JavlonMove40",
    specialty: "40 tonna yuk ko'chirish",
    location: "Toshkent",
    region: "O'zbekiston",
    experienceYears: 11,
    avatarIndex: 24,
    capacityTons: 40,
    truckType: "MAN 40T",
    service: {
      id: "move-40t-1",
      title: "40 tonna ko'chirish",
      price: 5200000,
      unit: "xizmat",
      description: "Super og'ir yuklar va kranli ko'chirish.",
      certificates: ["Kran ruxsatnomasi", "Transport litsenziyasi"],
      seed: 73,
      subCategory: "moving-40t"
    }
  },
  {
    id: "move-40t-2",
    name: "Madinabonu Raximova",
    nickname: "MadiMove40",
    specialty: "40 tonna xizmat",
    location: "Samarqand",
    region: "O'zbekiston",
    experienceYears: 10,
    avatarIndex: 25,
    capacityTons: 40,
    truckType: "Volvo 40T",
    service: {
      id: "move-40t-2",
      title: "40 tonna tezkor xizmat",
      price: 5600000,
      unit: "xizmat",
      description: "Yirik sanoat yuklari uchun ko'chirish.",
      certificates: ["Sug'urta", "Shartnoma"],
      seed: 74,
      subCategory: "moving-40t"
    }
  },
  {
    id: "move-40t-3",
    name: "Seok-jin Han",
    nickname: "SeokMove40",
    specialty: "40 tonna ko'chirish",
    location: "Incheon",
    region: "Koreya",
    experienceYears: 12,
    avatarIndex: 26,
    capacityTons: 40,
    truckType: "Hyundai 40T",
    service: {
      id: "move-40t-3",
      title: "40 tonna xizmat (Incheon)",
      price: 5900000,
      unit: "xizmat",
      description: "Incheon hududida og'ir yuklarni ko'chirish.",
      certificates: ["Transport ruxsatnomasi"],
      seed: 75,
      subCategory: "moving-40t"
    }
  }
];

const movingAgents: ServiceAgent[] = movingAgentSpecs.map((spec, idx) =>
  makeAgent(
    `moving-${spec.id}`,
    spec.name,
    spec.nickname,
    spec.specialty,
    spec.location,
    spec.experienceYears,
    80 + idx,
    spec.avatarIndex,
    [
      makeMovingService(
        spec.service.id,
        spec.service.title,
        spec.service.price,
        spec.service.unit,
        spec.service.description,
        spec.service.certificates,
        spec.service.seed,
        spec.service.subCategory
      )
    ],
    false,
    {
      region: spec.region,
      equipment: movingEquipmentMap[spec.service.subCategory] || movingEquipmentMap["moving-1t"],
      completedOrders: 140 + spec.experienceYears * 20,
      movingCapacityTons: spec.capacityTons,
      movingTruckType: spec.truckType
    }
  )
);

type ConstructionAgentSpec = {
  id: string;
  name: string;
  nickname: string;
  specialty: string;
  location: string;
  experienceYears: number;
  avatarIndex: number;
  equipment: string[];
  completedOrders: number;
  service: {
    id: string;
    title: string;
    price: number;
    unit: string;
    description: string;
    certificates: string[];
    seed: number;
    subCategory: string;
  };
  contactPhone?: string;
  contactTelegram?: string;
  region?: string;
  distanceKm?: number;
};

const constructionEquipmentMap: Record<string, string[]> = {
  "construction-general": ["Lazer nivo", "Perforator", "O'lchov qurilmalari"],
  "exterior-facade": ["Qurilish lift", "Fasad qalqonlari", "Kompressor"],
  "exterior-concrete": ["Beton aralashtirgich", "Vibrator", "Beton nasos"],
  "exterior-brick": ["G'isht kesgich", "Qorishma mikser", "Tekislash tayanchi"],
  "exterior-roofing": ["Tom lift", "Yopishtirish to'plami", "Kesgich"],
  "exterior-roof-repair": ["Namlik detektori", "Issiqlik pistoleti", "Tom tiklash to'plami"],
  "interior-paint": ["Bo'yoq purkagich", "Shpaklyovka seti", "Silliqlash mashinasi"],
  "interior-wallpaper": ["Gul qog'oz pressi", "Kesish pichoqi", "Yelim mikser"],
  "interior-design": ["3D skaner", "Lazer o'lchov", "Plan tushirish to'plami"],
  "interior-doors-windows": ["Montaj stanogi", "Silikon press", "Sozlash kalitlari"],
  "interior-ceiling": ["Gipsokarton ko'targich", "Burg'ulash to'plami", "LED montaj seti"]
};

const buildConstructionAgentSpecs = (
  subCategory: string,
  specialty: string,
  agents: Array<{
    name: string;
    nickname: string;
    location: string;
    region?: string;
    experienceYears: number;
    avatarIndex: number;
    service: {
      id: string;
      title: string;
      price: number;
      unit: string;
      description: string;
      certificates: string[];
      seed: number;
    };
  }>
): ConstructionAgentSpec[] =>
  agents.map((agent) => ({
    id: `${subCategory}-${agent.nickname}`,
    name: agent.name,
    nickname: agent.nickname,
    specialty,
    location: agent.location,
    experienceYears: agent.experienceYears,
    avatarIndex: agent.avatarIndex,
    service: {
      ...agent.service,
      subCategory
    },
    equipment: constructionEquipmentMap[subCategory] || constructionEquipmentMap["construction-general"],
    completedOrders: 120 + agent.experienceYears * 18,
    contactPhone: "+998 90 123 45 67",
    contactTelegram: `@${agent.nickname}`,
    region: agent.region || "Toshkent",
    distanceKm: 3.4
  }));

const constructionAgentSpecs: ConstructionAgentSpec[] = [
  ...buildConstructionAgentSpecs("exterior-facade", "Tashqi fasad ustasi", [
    {
      name: "Islom Akramov",
      nickname: "FasadIslom",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 8,
      avatarIndex: 12,
      service: {
        id: "build-facade-1",
        title: "Fasad bo'yash va himoya",
        price: 1800000,
        unit: "loyiha",
        description: "Fasadni bo'yash, suvoq va namlikdan himoya qatlami.",
        certificates: ["Usta guvohnomasi", "Fasad material pasporti"],
        seed: 21
      }
    },
    {
      name: "Doston Murodov",
      nickname: "DostonFasad",
      location: "Incheon",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 13,
      service: {
        id: "build-facade-2",
        title: "Dekorativ suvoq ishlari",
        price: 2200000,
        unit: "loyiha",
        description: "Dekorativ suvoq, tekstura va rang uyg'unligi.",
        certificates: ["Fasad ustasi sertifikati"],
        seed: 22
      }
    },
    {
      name: "Sherzod Qodirov",
      nickname: "SherzodFasad",
      location: "Daegu",
      region: "Koreya",
      experienceYears: 9,
      avatarIndex: 14,
      service: {
        id: "build-facade-3",
        title: "Issiqlik va sovuqlikdan himoya",
        price: 2600000,
        unit: "loyiha",
        description: "Fasadga issiqlik saqlovchi qatlam va dekor.",
        certificates: ["Loyihachi hujjati", "Kafolat shartnomasi"],
        seed: 23
      }
    }
  ]),
  ...buildConstructionAgentSpecs("exterior-concrete", "Beton quyish ustasi", [
    {
      name: "Bekzod Yoqubov",
      nickname: "BetonBek",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 10,
      avatarIndex: 15,
      service: {
        id: "build-concrete-1",
        title: "Monolit beton quyish",
        price: 3500000,
        unit: "loyiha",
        description: "Monolit karkas va tayanchlar uchun beton quyish.",
        certificates: ["Qurilish litsenziyasi", "Beton sertifikati"],
        seed: 24
      }
    },
    {
      name: "Kamoliddin Rasulov",
      nickname: "KamolBeton",
      location: "Goyang",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 16,
      service: {
        id: "build-concrete-2",
        title: "Poydevor quyish",
        price: 3000000,
        unit: "loyiha",
        description: "Mustahkam poydevor, armatura va geologiya nazorati.",
        certificates: ["Poydevor ishlari ruxsati"],
        seed: 25
      }
    },
    {
      name: "Ulug'bek Aripov",
      nickname: "BetonUsta",
      location: "Suwon",
      region: "Koreya",
      experienceYears: 5,
      avatarIndex: 17,
      service: {
        id: "build-concrete-3",
        title: "Sement-armiatura tayyorlash",
        price: 2100000,
        unit: "loyiha",
        description: "Armatura bog'lash va sement qorishmasi tayyorlash.",
        certificates: ["Texnika xavfsizligi"],
        seed: 26
      }
    }
  ]),
  ...buildConstructionAgentSpecs("exterior-brick", "G'isht terish ustasi", [
    {
      name: "Nodir Abdug'aniyev",
      nickname: "GishtNodir",
      location: "Farg'ona",
      region: "O'zbekiston",
      experienceYears: 11,
      avatarIndex: 18,
      service: {
        id: "build-brick-1",
        title: "G'isht terish (devor)",
        price: 1700000,
        unit: "loyiha",
        description: "Tashqi devorlar uchun g'isht terish va tekislash.",
        certificates: ["Usta guvohnomasi"],
        seed: 27
      }
    },
    {
      name: "Rustam Shokirov",
      nickname: "GishtRustam",
      location: "Daejeon",
      region: "Koreya",
      experienceYears: 8,
      avatarIndex: 19,
      service: {
        id: "build-brick-2",
        title: "G'isht ustunlari",
        price: 1900000,
        unit: "loyiha",
        description: "Mustahkam ustun va kolonalar terish.",
        certificates: ["Loyihachi pasporti"],
        seed: 28
      }
    },
    {
      name: "Shaxzod Tursunov",
      nickname: "GishtShaxzod",
      location: "Ulsan",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 20,
      service: {
        id: "build-brick-3",
        title: "Gazoblok terish",
        price: 1600000,
        unit: "loyiha",
        description: "Yengil bloklar bilan tezkor devor qurish.",
        certificates: ["Gazoblok texnika ko'rsatmasi"],
        seed: 29
      }
    }
  ]),
  ...buildConstructionAgentSpecs("exterior-roofing", "Tom yopish ustasi", [
    {
      name: "Akmal Sodiqov",
      nickname: "TomAkmal",
      location: "Jizzax",
      region: "O'zbekiston",
      experienceYears: 9,
      avatarIndex: 21,
      service: {
        id: "build-roof-1",
        title: "Metall tom yopish",
        price: 2400000,
        unit: "loyiha",
        description: "Metall profil, suv oqimi va shamol himoyasi.",
        certificates: ["Tom ustasi sertifikati"],
        seed: 30
      }
    },
    {
      name: "Dilshod Yakubov",
      nickname: "TomDilshod",
      location: "Seongnam",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 22,
      service: {
        id: "build-roof-2",
        title: "Shifer tom qoplash",
        price: 2000000,
        unit: "loyiha",
        description: "Shifer yoki bitum asosidagi tom yopish.",
        certificates: ["Material pasporti"],
        seed: 31
      }
    },
    {
      name: "Javlon Ortiqov",
      nickname: "TomJavlon",
      location: "Bucheon",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 23,
      service: {
        id: "build-roof-3",
        title: "Tom izolyatsiyasi",
        price: 2100000,
        unit: "loyiha",
        description: "Issiqlik va shovqindan himoya qatlami.",
        certificates: ["Izolyatsiya sertifikati"],
        seed: 32
      }
    }
  ]),
  ...buildConstructionAgentSpecs("exterior-roof-repair", "Tom ta'mirlash ustasi", [
    {
      name: "Sardor Mirzayev",
      nickname: "TomFix",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 12,
      avatarIndex: 24,
      service: {
        id: "build-roof-repair-1",
        title: "Tom oqishini bartaraf",
        price: 1400000,
        unit: "xizmat",
        description: "Oqayotgan joylarni aniqlash va tiklash.",
        certificates: ["Usta guvohnomasi"],
        seed: 33
      }
    },
    {
      name: "Azizbek Rasulov",
      nickname: "TomAziz",
      location: "Anyang",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 25,
      service: {
        id: "build-roof-repair-2",
        title: "Cherepitsa ta'miri",
        price: 1500000,
        unit: "xizmat",
        description: "Cherepitsa va metall qoplamani tiklash.",
        certificates: ["Material xavfsizligi"],
        seed: 34
      }
    },
    {
      name: "Otabek Holmatov",
      nickname: "TomOtabek",
      location: "Changwon",
      region: "Koreya",
      experienceYears: 5,
      avatarIndex: 26,
      service: {
        id: "build-roof-repair-3",
        title: "Tom qoplama yangilash",
        price: 1700000,
        unit: "xizmat",
        description: "Qoplamani to'liq yangilash va tiklash.",
        certificates: ["Kafolat shartnomasi"],
        seed: 35
      }
    }
  ]),
  ...buildConstructionAgentSpecs("interior-paint", "Ichki bo'yoqchi", [
    {
      name: "Malika To'raeva",
      nickname: "BoyoqMalika",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 6,
      avatarIndex: 27,
      service: {
        id: "build-paint-1",
        title: "Ichki bo'yoq ishlari",
        price: 1200000,
        unit: "xizmat",
        description: "Devor va shiftni sifatli bo'yash.",
        certificates: ["Usta guvohnomasi"],
        seed: 36
      }
    },
    {
      name: "Dilnoza Karimova",
      nickname: "BoyoqDilnoza",
      location: "Sejong",
      region: "Koreya",
      experienceYears: 5,
      avatarIndex: 28,
      service: {
        id: "build-paint-2",
        title: "Shpaklyovka va sirt tekislash",
        price: 900000,
        unit: "xizmat",
        description: "Sirt tekislash, shpaklyovka va grunt.",
        certificates: ["Material pasporti"],
        seed: 37
      }
    },
    {
      name: "Nigora Xasanova",
      nickname: "BoyoqNigora",
      location: "Gwangju",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 29,
      service: {
        id: "build-paint-3",
        title: "Dekor bo'yoq",
        price: 1400000,
        unit: "xizmat",
        description: "Dekorativ bo'yoq va to'qimalar.",
        certificates: ["Dekor bo'yoq sertifikati"],
        seed: 38
      }
    }
  ]),
  ...buildConstructionAgentSpecs("interior-wallpaper", "Gul qog'oz ustasi", [
    {
      name: "Shahzoda Tursunova",
      nickname: "GulQogozShahzoda",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 4,
      avatarIndex: 30,
      service: {
        id: "build-wallpaper-1",
        title: "Gul qog'oz yopishtirish",
        price: 850000,
        unit: "xizmat",
        description: "Oddiy va premium gul qog'ozlar.",
        certificates: ["Usta guvohnomasi"],
        seed: 39
      }
    },
    {
      name: "Gulbahor Soliyeva",
      nickname: "GulQogozGulbahor",
      location: "Incheon",
      region: "Koreya",
      experienceYears: 5,
      avatarIndex: 1,
      service: {
        id: "build-wallpaper-2",
        title: "Vinil gul qog'oz",
        price: 950000,
        unit: "xizmat",
        description: "Vinil va tozalash oson materiallar.",
        certificates: ["Material pasporti"],
        seed: 40
      }
    },
    {
      name: "Sevara Aliyeva",
      nickname: "GulQogozSevara",
      location: "Busan",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 2,
      service: {
        id: "build-wallpaper-3",
        title: "Burchak va chegara ishlari",
        price: 780000,
        unit: "xizmat",
        description: "Burchaklar, bezaklar va tutash joylar.",
        certificates: ["Usta guvohnomasi"],
        seed: 41
      }
    }
  ]),
  ...buildConstructionAgentSpecs("interior-design", "Ichki dizayner", [
    {
      name: "Kamola Nurmatova",
      nickname: "DizaynKamola",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 7,
      avatarIndex: 3,
      service: {
        id: "build-design-1",
        title: "Dizayn konsepti",
        price: 2500000,
        unit: "loyiha",
        description: "Rang, material va uslub bo'yicha konsept.",
        certificates: ["Dizayner diplomi"],
        seed: 42
      }
    },
    {
      name: "Aziza Xasanova",
      nickname: "DizaynAziza",
      location: "Seul",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 4,
      service: {
        id: "build-design-2",
        title: "3D vizualizatsiya",
        price: 2800000,
        unit: "loyiha",
        description: "3D model va dizayn eskizlari.",
        certificates: ["3D portfel"],
        seed: 43
      }
    },
    {
      name: "Zuhra Saydullayeva",
      nickname: "DizaynZuhra",
      location: "Daegu",
      region: "Koreya",
      experienceYears: 8,
      avatarIndex: 5,
      service: {
        id: "build-design-3",
        title: "Me'moriy reja",
        price: 3000000,
        unit: "loyiha",
        description: "Rejalashtirish va funksional zonalash.",
        certificates: ["Arxitektor guvohnomasi"],
        seed: 44
      }
    }
  ]),
  ...buildConstructionAgentSpecs("interior-doors-windows", "Eshik-deraza ustasi", [
    {
      name: "Rustam Yuldashev",
      nickname: "EshikRustam",
      location: "Suwon",
      region: "Koreya",
      experienceYears: 9,
      avatarIndex: 6,
      service: {
        id: "build-doors-1",
        title: "Eshik romi o'rnatish",
        price: 1100000,
        unit: "xizmat",
        description: "Eshik romini o'rnatish va sozlash.",
        certificates: ["Usta guvohnomasi"],
        seed: 45
      }
    },
    {
      name: "Shahobiddin Karimov",
      nickname: "DerazaShahob",
      location: "Daejeon",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 7,
      service: {
        id: "build-doors-2",
        title: "Deraza romi almashtirish",
        price: 1300000,
        unit: "xizmat",
        description: "Plastik va yog'och romlarni almashtirish.",
        certificates: ["Material pasporti"],
        seed: 46
      }
    },
    {
      name: "Farrux Ubaydullayev",
      nickname: "DerazaFarrux",
      location: "Ulsan",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 8,
      service: {
        id: "build-doors-3",
        title: "Romlarni sozlash",
        price: 900000,
        unit: "xizmat",
        description: "Romlarni sozlash, issiqlik izolyatsiyasi.",
        certificates: ["Kafolat shartnomasi"],
        seed: 47
      }
    }
  ]),
  ...buildConstructionAgentSpecs("interior-ceiling", "Shift ustasi", [
    {
      name: "Bobur Xudoyberdiyev",
      nickname: "ShiftBobur",
      location: "Toshkent",
      region: "O'zbekiston",
      experienceYears: 8,
      avatarIndex: 9,
      service: {
        id: "build-ceiling-1",
        title: "Gipsokarton shift",
        price: 1600000,
        unit: "xizmat",
        description: "Gipsokarton, profil va dizayn chiziqlari.",
        certificates: ["Usta guvohnomasi"],
        seed: 48
      }
    },
    {
      name: "Jamshid Ergashev",
      nickname: "ShiftJamshid",
      location: "Goyang",
      region: "Koreya",
      experienceYears: 6,
      avatarIndex: 10,
      service: {
        id: "build-ceiling-2",
        title: "Stretch shift",
        price: 1900000,
        unit: "xizmat",
        description: "Stretch shift, yoritish va toza montaj.",
        certificates: ["Stretch sertifikati"],
        seed: 49
      }
    },
    {
      name: "Iskandar Nasirov",
      nickname: "ShiftIskandar",
      location: "Bucheon",
      region: "Koreya",
      experienceYears: 7,
      avatarIndex: 11,
      service: {
        id: "build-ceiling-3",
        title: "Shift yoritish montaji",
        price: 1200000,
        unit: "xizmat",
        description: "Yoritish tizimi va kabel sozlash.",
        certificates: ["Elektr xavfsizligi"],
        seed: 50
      }
    }
  ])
];

const constructionAgents: ServiceAgent[] = [
  makeAgent(
    "build-1",
    "Bunyod Qodirov",
    "BunyodUsta",
    "Usta va brigada boshligi",
    "Seul",
    10,
    7,
    7,
    [
      makeConstructionService(
        "build-1-1",
        "Kvartira remonti",
        4500000,
        "loyiha",
        "Dizayn, smeta va sifat nazorati bilan.",
        ["Qurilish litsenziyasi", "Shartnoma"],
        13,
        "construction-general",
        true
      ),
      makeConstructionService(
        "build-1-2",
        "Elektr va santexnika",
        650000,
        "xizmat",
        "Uy va ofis uchun kompleks ishlar.",
        ["Usta guvohnomasi"],
        14,
        "construction-general"
      )
    ],
    true,
    {
      region: "Koreya",
      equipment: ["Qurilish krani", "Beton aralashtirgich", "Lazer nivo"],
      completedOrders: 420
    }
  ),
  makeAgent(
    "build-2",
    "Murod Bekmurod",
    "MurodBuilder",
    "Fasad va tom ishlari",
    "Busan",
    9,
    8,
    8,
    [
      makeConstructionService(
        "build-2-1",
        "Tom yopish xizmati",
        2500000,
        "loyiha",
        "Sifatli material va kafolat.",
        ["Qurilish litsenziyasi"],
        15,
        "construction-general"
      ),
      makeConstructionService(
        "build-2-2",
        "Fasad bo'yash",
        1200000,
        "loyiha",
        "Yomg'ir va issiqka chidamli bo'yoq.",
        ["Usta guvohnomasi"],
        16,
        "construction-general"
      )
    ],
    false,
    {
      region: "Koreya",
      equipment: ["Tom lift", "Fasad qalqonlari", "Kompressor"],
      completedOrders: 310
    }
  ),
  ...constructionAgentSpecs.map((spec, idx) =>
    makeAgent(
      `build-${spec.id}`,
      spec.name,
      spec.nickname,
      spec.specialty,
      spec.location,
      spec.experienceYears,
      60 + idx,
      spec.avatarIndex,
      [
        makeConstructionService(
          spec.service.id,
          spec.service.title,
          spec.service.price,
          spec.service.unit,
          spec.service.description,
          spec.service.certificates,
          spec.service.seed,
          spec.service.subCategory
        )
      ],
      false,
      {
        contactPhone: spec.contactPhone,
        contactTelegram: spec.contactTelegram,
        region: spec.region,
        distanceKm: spec.distanceKm,
        equipment: spec.equipment,
        completedOrders: spec.completedOrders
      }
    )
  )
];

export const serviceCatalog: ServiceCatalogGroup[] = [
  {
    id: "material",
    title: "Moddiy xizmatlar",
    description:
      "Transport, qurilish va amaliy ishlar. Har bir agent tegishli mutaxassisligini tasdiqlagan.",
    categories: [
      {
        id: "taxi",
        title: "Eltib qo'yish (taxi xizmati)",
        description: "Shahar ichida va shaharlararo tezkor tashish.",
        agents: [
          makeAgent(
            "taxi-comfort-1",
            "Sardor Jo'rayev",
            "SardorComfort",
            "Qulay va tejamkor shahar ichi taxi",
            "Seul",
            6,
            1,
            1,
            [
              makeService(
                "taxi-comfort-1-1",
                "Shahar ichida komfort taxi",
                45000,
                "yo'l",
                "Konditsioner, toza salon va yumshoq haydash.",
                ["Haydovchilik guvohnomasi", "Texnik ko'rik"],
                "taxi",
                1,
                true
              ),
              makeService(
                "taxi-comfort-1-2",
                "Kechki navbatchilik",
                55000,
                "yo'l",
                "22:00 dan keyin tezkor chaqiruvlar.",
                ["Sug'urta polisi", "Texnik ko'rik"],
                "taxi",
                2
              )
            ],
            true,
            {
              vehicleClass: "comfort",
              seatCount: 4,
              vehicleModel: "Chevrolet Malibu",
              region: "Seul",
              distanceKm: 6.4
            }
          ),
          makeAgent(
            "taxi-comfort-2",
            "Dilnoza Sodiqova",
            "DilnozaComfort",
            "Oilaviy yo'lovchilar uchun xavfsiz xizmat",
            "Samarqand",
            4,
            2,
            2,
            [
              makeService(
                "taxi-comfort-2-1",
                "Oila uchun 7 o'rinli taxi",
                65000,
                "yo'l",
                "Keng salon, bolalar kreslosi mavjud.",
                ["Haydovchilik guvohnomasi", "Bolalar kreslosi sertifikati"],
                "taxi",
                3
              ),
              makeService(
                "taxi-comfort-2-2",
                "Shaharlararo komfort",
                190000,
                "yo'l",
                "Uzoq masofada qulaylik va xavfsizlik.",
                ["Sug'urta polisi", "Texnik ko'rik"],
                "taxi",
                4
              )
            ],
            false,
            {
              vehicleClass: "comfort",
              seatCount: 7,
              vehicleModel: "Hyundai Staria",
              region: "Incheon",
              distanceKm: 18.2
            }
          ),
          makeAgent(
            "taxi-business-1",
            "Azizbek Qodirov",
            "AzizBusiness",
            "Biznes uchrashuvlar uchun premium xizmat",
            "Toshkent",
            8,
            5,
            3,
            [
              makeService(
                "taxi-business-1-1",
                "Biznes transfer",
                95000,
                "yo'l",
                "Xizmat darajasi yuqori, vaqtga rioya.",
                ["VIP litsenziya", "Texnik ko'rik"],
                "taxi",
                5,
                true
              ),
              makeService(
                "taxi-business-1-2",
                "Mehmonlarni kutib olish",
                140000,
                "yo'l",
                "Mehmonxona va aeroport uchun premium servis.",
                ["Sug'urta polisi", "VIP litsenziya"],
                "taxi",
                6
              )
            ],
            true,
            {
              vehicleClass: "business",
              seatCount: 9,
              vehicleModel: "Toyota Hiace",
              region: "Busan",
              distanceKm: 3.9
            }
          ),
          makeAgent(
            "taxi-business-2",
            "Mohira Islomova",
            "MohiraBusiness",
            "Konferensiya va delegatsiya tashish",
            "Busan",
            7,
            6,
            4,
            [
              makeService(
                "taxi-business-2-1",
                "Delegatsiya uchun transport",
                180000,
                "yo'l",
                "Qulay salon, Wi-Fi va suv bilan.",
                ["VIP litsenziya", "Texnik ko'rik"],
                "taxi",
                7
              ),
              makeService(
                "taxi-business-2-2",
                "Shaharlararo biznes marshrut",
                260000,
                "yo'l",
                "Uzoq masofa uchun qulay joylashuv.",
                ["Sug'urta polisi", "VIP litsenziya"],
                "taxi",
                8
              )
            ],
            false,
            {
              vehicleClass: "business",
              seatCount: 13,
              vehicleModel: "Mercedes Sprinter",
              region: "Daegu",
              distanceKm: 25.6
            }
          ),
          makeAgent(
            "taxi-limuzin-1",
            "Kamol Tojiyev",
            "KamolLimuzin",
            "Tadbirlar va to'ylar uchun limuzin",
            "Toshkent",
            10,
            7,
            5,
            [
              makeService(
                "taxi-limuzin-1-1",
                "To'y marosimi transporti",
                350000,
                "soat",
                "20 kishigacha qulay va keng salon.",
                ["Maxsus litsenziya", "Texnik ko'rik"],
                "taxi",
                9,
                true
              ),
              makeService(
                "taxi-limuzin-1-2",
                "Shahar bo'ylab tantanali aylanish",
                280000,
                "soat",
                "Tantanali bezak va musiqiy imkoniyatlar.",
                ["Maxsus litsenziya", "Sug'urta polisi"],
                "taxi",
                10
              )
            ],
            true,
            {
              vehicleClass: "limuzin",
              seatCount: 20,
              vehicleModel: "Higer Coach",
              region: "Gwangju",
              distanceKm: 12.8
            }
          ),
          makeAgent(
            "taxi-limuzin-2",
            "Shahnoza Rasulova",
            "ShahnozaLimuzin",
            "Katta guruhlar uchun limuzin xizmat",
            "Urganch",
            9,
            8,
            6,
            [
              makeService(
                "taxi-limuzin-2-1",
                "30-40 o'rinli maxsus reys",
                520000,
                "soat",
                "Katta guruhlar uchun keng avtobus.",
                ["Maxsus litsenziya", "Texnik ko'rik"],
                "taxi",
                11
              ),
              makeService(
                "taxi-limuzin-2-2",
                "Shaharlararo tantanali tashish",
                780000,
                "reys",
                "Qulaylik va xavfsizlikka urg'u.",
                ["Sug'urta polisi", "Maxsus litsenziya"],
                "taxi",
                12
              )
            ],
            false,
            {
              vehicleClass: "limuzin",
              seatCount: 40,
              vehicleModel: "Yutong Coach",
              vehiclePlate: "01 A 777 ZA",
              vehicleOptions: ["Keng salon", "Konditsioner", "Mikrofon", "Katta bagaj bo'limi"],
              contactPhone: "+998 90 123 45 67",
              contactTelegram: "@ShahnozaLimuzin",
              gender: "Ayol",
              region: "Daejeon",
              distanceKm: 31.4
            }
          )
        ]
      },
      {
        id: "delivery",
        title: "Yetkazib berish (pochta xizmati)",
        description: "Hujjat, posilka va tezkor kur'er xizmati.",
        agents: [
          makeAgent(
            "delivery-1",
            "Kamron Usmonov",
            "KamronExpress",
            "Ekspress yetkazib berish va kuzatuv",
            "Toshkent",
            5,
            3,
            3,
            [
              makeService(
                "delivery-1-1",
                "Ekspress hujjat yetkazish",
                65000,
                "paket",
                "1-3 soat ichida shahar bo'ylab yetkazish.",
                ["Kur'er guvohnomasi", "Shartnoma"],
                "delivery",
                5,
                true
              ),
              makeService(
                "delivery-1-2",
                "Posilka kuzatuvi bilan",
                80000,
                "paket",
                "GPS kuzatuv va mijozga xabar berish xizmati.",
                ["Kur'er guvohnomasi"],
                "delivery",
                6
              )
            ],
            true
          ),
          makeAgent(
            "delivery-2",
            "Malika Abduvali",
            "MalikaCourier",
            "Katta posilkalar va ombor logistika",
            "Farg'ona",
            7,
            4,
            4,
            [
              makeService(
                "delivery-2-1",
                "Ombordan omborga yetkazish",
                120000,
                "reys",
                "Yukni qabul qilish va topshirish nazorati bilan.",
                ["Logistika sertifikati", "Shartnoma"],
                "delivery",
                7
              ),
              makeService(
                "delivery-2-2",
                "Issiq ovqat kur'er xizmati",
                35000,
                "yetkazish",
                "Kafe va restoranlar uchun tezkor kur'er.",
                ["Sanitar kitobcha", "Kur'er guvohnomasi"],
                "delivery",
                8
              )
            ]
          )
        ]
      },
      {
        id: "technical",
        title: "Texnik xizmat ko'rsatish",
        description: "Maishiy va sanoat uskunalarini ta'mirlash.",
        agents: [
          makeAgent(
            "tech-1",
            "Islom Shukurov",
            "IslomUsta",
            "Maishiy texnika ustasi",
            "Toshkent",
            8,
            5,
            5,
            [
              makeService(
                "tech-1-1",
                "Konditsioner diagnostikasi",
                95000,
                "xizmat",
                "Diagnostika va tezkor ta'mirlash.",
                ["Texnik sertifikat", "Mehnat guvohnomasi"],
                "technical",
                9,
                true
              ),
              makeService(
                "tech-1-2",
                "Kir yuvish mashinasi ta'miri",
                110000,
                "xizmat",
                "Original ehtiyot qismlar bilan ta'mirlash.",
                ["Texnik sertifikat"],
                "technical",
                10
              )
            ],
            true
          ),
          makeAgent(
            "tech-2",
            "Anvar Karimov",
            "AnvarIT",
            "IT va printer xizmatlari",
            "Namangan",
            6,
            6,
            6,
            [
              makeService(
                "tech-2-1",
                "Kompyuter sozlash",
                70000,
                "xizmat",
                "Windows, antivirus va tarmoq sozlash.",
                ["IT sertifikati"],
                "technical",
                11
              ),
              makeService(
                "tech-2-2",
                "Printer ta'mirlash",
                85000,
                "xizmat",
                "Kartuj to'ldirish va diagnostika.",
                ["IT sertifikati", "Servis shartnomasi"],
                "technical",
                12
              )
            ]
          )
        ]
      },
      {
        id: "construction",
        title: "Qurilish va quruvchilar xizmati",
        description: "Remont, ustalik va obodonlashtirish.",
        agents: constructionAgents
      },
      {
        id: "moving",
        title: "Ko'chish va ko'chirish xizmati",
        description: "Uy va ofis ko'chirish, yuklash va tushirish.",
        agents: movingAgents
      },
      {
        id: "cleaning",
        title: "Tozalik xizmati",
        description: "Uy, ofis va sanoat tozalash xizmati.",
        agents: [
          makeAgent(
            "clean-1",
            "Madina To'lqinova",
            "MadinaClean",
            "Uy va ofis tozaligi",
            "Toshkent",
            5,
            11,
            11,
            [
              makeCleaningService(
                "clean-1-1",
                "General tozalash",
                320000,
                "xizmat",
                "Kimyoviy tozalash va dezinfeksiya.",
                ["Sanitar kitobcha"],
                21,
                true
              ),
              makeCleaningService(
                "clean-1-2",
                "Ofis tozalash (oylik)",
                1200000,
                "oy",
                "Haftalik reja va doimiy nazorat.",
                ["Sanitar kitobcha", "Shartnoma"],
                22
              )
            ],
            true,
            {
              region: "O'zbekiston",
              equipment: ["Vakuum tozalagich", "Bug' tozalagich", "Kimyoviy tozalash seti"],
              completedOrders: 280
            }
          ),
          makeAgent(
            "clean-2",
            "Gulbahor Mirzaeva",
            "GulbahorClean",
            "Mehmonxona tozaligi",
            "Xiva",
            8,
            12,
            12,
            [
              makeCleaningService(
                "clean-2-1",
                "Mehmonxona xonalari tozaligi",
                400000,
                "xizmat",
                "Qat'iy standartlar bo'yicha xizmat.",
                ["Sanitar kitobcha"],
                23
              ),
              makeCleaningService(
                "clean-2-2",
                "Deraza va fasad tozalash",
                500000,
                "xizmat",
                "Maxsus jihozlar bilan tozalash.",
                ["Xavfsizlik sertifikati"],
                24
              )
            ],
            false,
            {
              region: "O'zbekiston",
              equipment: ["Polisher", "Deraza yuvish seti", "Dezinfeksiya purkagich"],
              completedOrders: 410
            }
          )
        ]
      },
      {
        id: "nanny",
        title: "Enagalik xizmati",
        description: "Bolalar parvarishi va uyda yordam.",
        agents: [
          makeAgent(
            "nanny-1",
            "Sabina Rasulova",
            "SabinaNanny",
            "Chaqaloqlar parvarishi",
            "Toshkent",
            7,
            13,
            13,
            [
              makeNannyService(
                "nanny-1-1",
                "Yangi tug'ilgan chaqaloq parvarishi",
                350000,
                "kun",
                "Emizish jadvali, gigiyena va parvarish.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                61,
                true
              ),
              makeNannyService(
                "nanny-1-2",
                "Tun bo'yi parvarish",
                500000,
                "tun",
                "Tungi navbatchilik, shoshilinch parvarish.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                62
              ),
              makeNannyService(
                "nanny-1-3",
                "24/7 chaqaloq kuzatuvi",
                700000,
                "kun",
                "24 soatlik kuzatuv va parvarish rejasi.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                63
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 32,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom, tibbiy ko'rikdan o'tgan",
              hasCriminalRecord: false,
              identityImage: makeAvatar(21, "Sabina Rasulova"),
              region: "O'zbekiston",
              regionDetail: "Toshkent shahri, Mirzo Ulug'bek tumani, Yangiobod mahallasi",
              equipment: ["Bolalar aravachasi", "Birinchi yordam to'plami", "Sterilizator"],
              completedOrders: 420,
              availability: ["24/7", "08:00-18:00"],
              careFocus: ["0-2 yosh", "Chaqaloq parvarishi"],
              bio: "Sabina 7 yillik tajribaga ega enaga, chaqaloqlar va 2 yoshgacha bo'lgan bolalar bilan ishlashga ixtisoslashgan. U har bir bolaning uyqu, ovqatlanish va gigiyena tartibini ota-onalar bilan kelishib, aniq jadval asosida yuritadi. Emizish va qo'shimcha ovqatlantirish jarayonida xavfsizlik qoidalariga qat'iy amal qiladi, allergik holatlar va shifokor tavsiyalarini doimiy nazoratda ushlaydi. Sabina bolani tinchlantirish, uxlashga yotqizish, kunlik shaxsiy gigiyena, kiyim almashtirish va xona havosini nazorat qilish bo'yicha to'liq mas'uliyat oladi. U kundalik kuzatuv daftarini yuritib, bolaning holati, kayfiyati, ishtahasi va rivojlanishidagi o'zgarishlarni yozib boradi. Ota-onalar bilan muntazam muloqot qilib, zarur paytda foto yoki qisqa hisobot yuboradi. U mehribon, ammo tartibli yondashuvni yoqtiradi, bola bilan muloyim gaplashadi, uni qo'rqitmaydi va stressga tushirmaydi. Uy sharoitida ishlash tajribasi keng, xavfsiz o'yinlar, yumshoq massaj va rivojlantiruvchi mashqlarni qo'llaydi. Sabina vaziyatga tez moslashadi, tun bo'yi navbatchilikda ham sergak bo'lib, kichik shikastlar yoki isitma holatlarida birinchi yordam ko'rsatish bo'yicha tayyor. Shuningdek u chaqaloq massaji, nazoratli cho'miltirish, xona sterilizatsiyasi va steril idishlardan foydalanish bo'yicha tajribaga ega. Ota-onalar bilan haftalik reja tuzib, emlash kalendarini yodda tutadi, vaqtida eslatma beradi. Sabina bolani tarbiyalashda muloyim intizomni qo'llaydi, shoshirmaydi, lekin tartibni mustahkam saqlaydi. U ota-onalarning ko'rsatmalarini yozma tarzda saqlab, dori vositalari va rejalarni chalkashtirmaydi, har bir vazifani vaqtida bajarishga intiladi. U har hafta tozalash va antiseptik rejasini yangilaydi."
            }
          ),
          makeAgent(
            "nanny-2",
            "Dilrabo Xolmatova",
            "DilraboNanny",
            "Uyda bolalar parvarishi",
            "Andijon",
            5,
            14,
            14,
            [
              makeNannyService(
                "nanny-2-1",
                "Uyda bolalarni kuzatish",
                280000,
                "kun",
                "Bog'cha yoshidagi bolalar bilan ishlash.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                64
              ),
              makeNannyService(
                "nanny-2-2",
                "Bolalar bog'chasiga olib borish",
                150000,
                "xizmat",
                "Uy- bog'cha- uy transporti.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                65
              ),
              makeNannyService(
                "nanny-2-3",
                "Kunduzgi parvarish (8-18)",
                320000,
                "kun",
                "O'yinlar, ovqatlanish va dam olish rejasi.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                66
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 28,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(22, "Dilrabo Xolmatova"),
              region: "O'zbekiston",
              regionDetail: "Andijon viloyati, Andijon tumani, Bo'z mahallasi",
              equipment: ["Bolalar o'rindig'i", "O'yinchoqlar to'plami", "Birinchi yordam"],
              completedOrders: 310,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["3-5 yosh", "Bog'cha yoshidagi parvarish"],
              bio: "Dilrabo 5 yillik tajribaga ega enaga bo'lib, bog'cha yoshidagi bolalar bilan ishlashni yaxshi biladi. U bolaning kunlik rejasi, ovqatlanish vaqtlarini va dam olish oraliqlarini ota-onalar bilan muhokama qilib, doimiy tarzda bajaradi. Dilrabo bolani bog'chaga olib borish va qaytarish jarayonida xavfsizlikni birinchi o'ringa qo'yadi, yo'l qoidalariga rioya qiladi, bolaning qo'lini ushlab yuradi va oldindan kelishilgan marshrutni buzmaydi. U bolalarning hissiy holatini kuzatib, kerak bo'lsa ularni tinchlantiruvchi o'yinlar bilan band qiladi. Kunduzgi parvarish vaqtida u tartib va tozalikka e'tibor beradi, kiyimlarni to'g'ri tanlash, suv ichish tartibi va kundalik gigiyena jarayonlarini nazorat qiladi. Dilrabo ota-onalar bilan ochiq muloqotda bo'lib, bolaning kayfiyati, ishtahasi va faoliyati haqida qisqa hisobotlar beradi. U bolalarga multfilm yoki telefon bilan uzoq vaqt shug'ullanishni tavsiya etmaydi, buning o'rniga harakatli va ijodiy o'yinlarni afzal ko'radi. Muammoli vaziyatlarda u xotirjamlikni saqlaydi, bolaning xavfsizligini ta'minlaydi va zarur bo'lsa birinchi yordam ko'rsatadi. Dilrabo moslashuvchan ish jadvaliga ega, qisqa muddatli xizmatlarni ham bajara oladi, shuningdek kechki parvarish vaqtida bola uyqu rejimiga amal qilishiga yordam beradi. U uyga qaytganda kiyimlarni tartiblaydi, kichik gigiyena odatlarini o'rgatadi, xavfsiz o'yin maydonini tayyorlaydi. Dilrabo shoshilinch holatlarda yaqin qarindoshlar bilan aloqa tartibini ham oldindan kelishadi. U bola bog'chadan qaytgach kiyimlarini tartiblaydi, qo'l yuvish va tartibli o'yin odatlarini mustahkamlaydi, natijada bolalar tez moslashadi."
            }
          ),
          makeAgent(
            "nanny-3",
            "Zarina Tursunova",
            "ZarinaNanny",
            "Maktabgacha parvarish",
            "Farg'ona",
            6,
            15,
            15,
            [
              makeNannyService(
                "nanny-3-1",
                "Maktabgacha parvarish",
                300000,
                "kun",
                "Rivojlantiruvchi o'yinlar va darslar.",
                ["Pedagog sertifikati"],
                67
              ),
              makeNannyService(
                "nanny-3-2",
                "Yarim kunlik parvarish",
                180000,
                "kun",
                "4-5 soatlik nazorat va parvarish.",
                ["Pedagog sertifikati"],
                68
              ),
              makeNannyService(
                "nanny-3-3",
                "Uyga chiqib xizmat",
                260000,
                "xizmat",
                "Uyda bolani kuzatish va o'qishiga yordam.",
                ["Tibbiy ma'lumotnoma"],
                69
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 30,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(23, "Zarina Tursunova"),
              region: "O'zbekiston",
              regionDetail: "Farg'ona viloyati, Oltiariq tumani, Navbahor mahallasi",
              equipment: ["O'yinlar to'plami", "Kitoblar", "Birinchi yordam"],
              completedOrders: 260,
              availability: ["08:00-18:00"],
              careFocus: ["3-6 yosh", "Maktabgacha tarbiya"],
              bio: "Zarina maktabgacha tarbiya yo'nalishida 6 yillik tajribaga ega. U bolalarning nutq, xotira va mantiqiy fikrlash ko'nikmalarini rivojlantirishga qaratilgan o'yinlar va mashg'ulotlarni tashkil qiladi. Zarina har bir bolaning qiziqishini kuzatib, individual yondashuvni qo'llaydi, shuning uchun darslar majburiy emas, qiziqarli va erkin shaklda o'tadi. U ertak o'qish, rasm chizish, plastilin bilan ishlash va musiqa asosida faoliyatlar orqali bolaning ijodkorligini oshiradi. Kundalik parvarish vaqtida gigiyena, ovqatlanish va dam olish tartibi doimo nazoratda bo'ladi, shuningdek u ota-onalar bilan kelishilgan jadvalni buzmaslikka e'tibor beradi. Zarina bolaga muloyim, ammo tartibli tarzda muomala qiladi, chegaralarni to'g'ri tushuntiradi va bolani qichqiriqsiz tarbiyalashga intiladi. U bolaning holati haqida kun yakunida qisqa hisobot tayyorlab, ota-onaga yuboradi. Zarina hushyor va mas'uliyatli, shoshilinch vaziyatlarda birinchi yordam ko'rsatishga tayyor, zarur bo'lsa yaqin shifokor bilan bog'lanadi. U oilaviy muhitda ishlashni yaxshi ko'radi, uy tartibini hurmat qiladi, begona odamlarga nisbatan ehtiyotkor bo'ladi. Tajribasi tufayli u bir nechta bolali oilalarda ham navbat bilan nazorat olib borishga qodir. Zarina logopedik mashqlar, talaffuzni yaxshilash uchun qisqa topshiriqlar beradi, she'r yodlash va qo'shiq kuylashni rag'batlantiradi. U bolalarning ijtimoiy ko'nikmalarini oshirish uchun rolli o'yinlar tashkil qiladi. Zarina kichik testlar orqali bolaning qiziqishlarini aniqlab, ota-onaga tavsiyalar beradi, shuningdek maktabga tayyorgarlik bo'yicha uy vazifalarini bosqichma-bosqich beradi. Zarina ota-onaga uyda bajariladigan mashqlar ro'yxatini beradi."
            }
          ),
          makeAgent(
            "nanny-4",
            "Malika Sodiqova",
            "MalikaNanny",
            "Kechki parvarish",
            "Samarqand",
            7,
            16,
            16,
            [
              makeNannyService(
                "nanny-4-1",
                "Kechki navbatchilik",
                320000,
                "tun",
                "18:00-08:00 oralig'ida kuzatuv.",
                ["Tibbiy ma'lumotnoma"],
                70
              ),
              makeNannyService(
                "nanny-4-2",
                "Dam olish kunlari parvarish",
                260000,
                "kun",
                "Shanba/Yakshanba xizmatlari.",
                ["Sertifikat"],
                71
              ),
              makeNannyService(
                "nanny-4-3",
                "2-3 soatlik xizmat",
                120000,
                "xizmat",
                "Qisqa vaqtli parvarish.",
                ["Tibbiy ma'lumotnoma"],
                72
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 27,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(24, "Malika Sodiqova"),
              region: "O'zbekiston",
              regionDetail: "Samarqand viloyati, Samarqand shahri, Registon mahallasi",
              equipment: ["Birinchi yordam", "Bolalar o'yinlari", "Nazorat daftar"],
              completedOrders: 190,
              availability: ["18:00-08:00", "14:00-18:00"],
              careFocus: ["2-6 yosh", "Kechki parvarish"],
              bio: "Malika 7 yildan beri kechki navbatchilik va qisqa muddatli parvarish xizmatlarida ishlaydi. U bolani kechki ovqatlantirish, uyquga tayyorlash, tish yuvish va gigiyenik tartiblarni aniq vaqtida bajaradi. Malika shovqinli yoki bezovta vaziyatlarda bolani tinchlantirish usullarini yaxshi biladi, xotirjamlikni saqlaydi va bola o'zini xavfsiz his qilishi uchun sokin muhit yaratadi. U uyqu vaqtida xavfsizlik nazoratini doimiy olib boradi, harorat, yorug'lik va havoni tekshiradi. Malika dars tayyorlash yoki ertangi kun uchun kiyim va sumkani tayyorlashda ham yordam beradi. U ota-onalar bilan oldindan kelishilgan qoidalarga qat'iy rioya qiladi, qo'shimcha shaxsiy narsalardan foydalanmaydi va uy tartibini hurmat qiladi. Bolalarning yoshiga mos ravishda ertak o'qish, sokin o'yinlar va qisqa suhbatlar o'tkazadi, telefon yoki planshetni haddan tashqari ishlatmaydi. Malika birinchi yordam ko'rsatish bo'yicha tayyor, kichik jarohatlar va yengil isitmada to'g'ri chora ko'radi. U kechki xizmatdan keyin ertalabki hisobotni yuboradi, bolaning kayfiyati va uyqu sifati haqida ma'lumot beradi. Malika tartibli, mas'uliyatli va oilaviy muhitga tez moslashadigan enaga hisoblanadi. U tunda yorug'likni to'g'ri darajada ushlab, bolaning uyg'onib ketmasligi uchun sharoit yaratadi. Malika bolaga mos sokin musiqalar qo'yadi, tanish buyumlarini yonida qoldiradi va tush ko'rishdan qo'rqsa muloyim qo'llab-quvvatlaydi. U kechki ovqatdan keyin tish tozalashni eslatadi, suv ichishni nazorat qiladi, kerak bo'lsa yengil iliq ichimlik bilan uyqu jarayonini yumshatadi. U har kecha uyqudan oldin qisqa duo o'qiydi."
            }
          ),
          makeAgent(
            "nanny-5",
            "Kim Ji-eun",
            "JieunNanny",
            "Chaqaloq va toddler parvarishi",
            "Seul",
            8,
            17,
            17,
            [
              makeNannyService(
                "nanny-5-1",
                "Toddler parvarishi",
                480000,
                "kun",
                "2-4 yoshdagi bolalar uchun parvarish.",
                ["Tibbiy ma'lumotnoma"],
                73
              ),
              makeNannyService(
                "nanny-5-2",
                "Ona yordamchisi",
                520000,
                "kun",
                "Uy ishlari va bolalar parvarishi.",
                ["Sertifikat"],
                74
              ),
              makeNannyService(
                "nanny-5-3",
                "24 soatlik kuzatuv",
                760000,
                "kun",
                "Tun-u kun nazorat.",
                ["Tibbiy ma'lumotnoma"],
                75
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 34,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(25, "Kim Ji-eun"),
              region: "Koreya",
              regionDetail: "충청남도 천안시 서북구 직산읍",
              equipment: ["Bolalar aravachasi", "Sterilizator", "Birinchi yordam"],
              completedOrders: 520,
              availability: ["24/7", "08:00-18:00"],
              careFocus: ["0-4 yosh", "Toddler parvarishi"],
              bio: "Kim Ji-eun 8 yillik tajribaga ega bo'lib, chaqaloq va toddler yoshidagi bolalar parvarishiga ixtisoslashgan. U har bir bolaning rivojlanish bosqichlarini kuzatadi, yangi ko'nikmalar paydo bo'lganda ota-onalarga batafsil ma'lumot beradi. Kim bolalarning gigiyenasi, ovqatlantirish va uyqu tartibini aniq rejada olib boradi, allergiya va ovqatlanish cheklovlari bo'lsa alohida e'tibor beradi. U uy sharoitida xavfsiz muhit yaratadi, xavfli buyumlarni chetga olib, o'yin maydonini tartibga keltiradi. Kim bolaga mos rivojlantiruvchi o'yinlar, sensor mashg'ulotlar va motorika mashqlarini taklif qiladi, musiqa va ritm bilan ishlash orqali bola e'tiborini kuchaytiradi. U koreys va o'zbek oilalari bilan ishlash tajribasiga ega bo'lib, madaniy farqlarni hurmat qiladi va oilaviy qoidalarni buzmaydi. Kim muntazam ravishda kunlik kuzatuv jurnalini yuritadi, bolaning kayfiyati, ishtahasi va uyqu sifati haqida yozib boradi. Shoshilinch vaziyatlarda u xotirjamlikni saqlab, birinchi yordam ko'rsatadi va ota-onalarga tezkor xabar beradi. U juda muloyim, ammo mas'uliyatli, bolaga mehr bilan yondashadi va uning mustaqil bo'lishiga to'g'ri yo'naltirish beradi. Kim tun bo'yi navbatchilikda ham sergak bo'lib, bolaning tinch uyqusini doimiy nazoratda ushlab turadi. Kim uyqudan oldin yengil cho'zilish va nafas mashqlarini qo'llaydi, bolaga sokin signal beradi. U ovqatlanishdagi porsiya nazorati va suyuqlik balansini kuzatadi, kerak bo'lsa shifokor tavsiyalariga mos kundalik menyu tuzadi. Kim ota-onalar bilan haftalik reja tuzadi, emlash yoki shifokor ko'rsatmalarini esdan chiqarmaslik uchun qisqa eslatmalar yuboradi."
            }
          ),
          makeAgent(
            "nanny-6",
            "Lee Min-ho",
            "MinhoNanny",
            "Maktabdan olib borib-kelish",
            "Incheon",
            5,
            18,
            18,
            [
              makeNannyService(
                "nanny-6-1",
                "Maktabdan olib kelish",
                180000,
                "xizmat",
                "5+ yosh bolalarni maktabdan olib kelish.",
                ["Transport ruxsatnomasi"],
                76
              ),
              makeNannyService(
                "nanny-6-2",
                "To'garakka olib borish",
                160000,
                "xizmat",
                "Sport va san'at to'garaklariga olib borish.",
                ["Transport ruxsatnomasi"],
                77
              ),
              makeNannyService(
                "nanny-6-3",
                "Maktabgacha kuzatuv",
                220000,
                "xizmat",
                "Maktabdan keyin 2-3 soat nazorat.",
                ["Transport ruxsatnomasi"],
                78
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 29,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(26, "Lee Min-ho"),
              region: "Koreya",
              regionDetail: "인천광역시 미추홀구 주안동",
              equipment: ["Bolalar o'rindig'i", "GPS treker", "Birinchi yordam"],
              completedOrders: 140,
              availability: ["08:00-18:00", "14:00-20:00"],
              careFocus: ["5+ yosh", "Maktabdan olib kelish"],
              bio: "Lee Min-ho maktabdan olib borib-kelish xizmatida 6 yillik tajribaga ega. U bolalarni xavfsiz transportda olib yurish, yo'l qoidalariga qat'iy rioya qilish va vaqtni aniq rejalashtirishni asosiy tamoyil sifatida qabul qiladi. Lee har bir bola uchun alohida kuzatuv olib boradi, sinf jadvalini, to'garak vaqtlarini va ota-onalar bilan kelishilgan marshrutlarni hisobga oladi. U bolalar o'zini xavfsiz his qilishi uchun muloqotga katta e'tibor beradi, yo'lda bolani zeriktirmaslik uchun qisqa o'yinlar va suhbatlar o'tkazadi. Lee sport bilan shug'ullanadi va harakatli o'yinlarga qiziqadi, shuning uchun bolalarning jismoniy faolligini ham qo'llab-quvvatlaydi. U bolani maktabdan olgach, uy vazifasini eslatadi, uyga yetib kelgandan so'ng ota-onaga xabar beradi. Lee favqulodda holatlarda birinchi yordam ko'rsatish bo'yicha tayyor, kichik jarohatlarda to'g'ri chora ko'radi. U tartibli, mas'uliyatli va o'z vaqtiga qat'iy, bolani yolg'iz qoldirmaydi, kerak bo'lsa uy eshigigacha kuzatib qo'yadi. Ota-onalar bilan doimiy aloqada bo'lib, har safar yo'l davomiyligi va farzandning kayfiyati haqida qisqa ma'lumot beradi. Lee bolalarning xavfsizligi va ishonchi uchun doimo muloyim, xotirjam va hurmat bilan muomala qiladi. U yo'lda xavfsizlik kamari va bolalar o'rindig'ini har safar tekshiradi, ob-havoga qarab qo'shimcha kiyim olib yuradi. Lee bolani to'garakdan qaytgach uyga eson-omon yetkazib, ota-onaga aniq vaqtni bildiradi. Lee har safar maktabdan chiqish vaqtini tekshiradi, bolaning yonida bo'ladi va transportga o'tirishda xavfsiz masofani saqlaydi."
            }
          ),
          makeAgent(
            "nanny-7",
            "Nodira Karimova",
            "NodiraNanny",
            "Oilaviy enaga",
            "Namangan",
            10,
            19,
            19,
            [
              makeNannyService(
                "nanny-7-1",
                "Oilaviy parvarish",
                420000,
                "kun",
                "Ko'p bolali oilalar bilan ishlash.",
                ["Sertifikat", "Tibbiy ma'lumotnoma"],
                79
              ),
              makeNannyService(
                "nanny-7-2",
                "Uy ishlarida yordam",
                260000,
                "kun",
                "Bolalar bilan birga uy ishlari.",
                ["Sertifikat"],
                80
              ),
              makeNannyService(
                "nanny-7-3",
                "Weekend parvarish",
                280000,
                "kun",
                "Dam olish kunlari parvarish.",
                ["Tibbiy ma'lumotnoma"],
                81
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 38,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(27, "Nodira Karimova"),
              region: "O'zbekiston",
              regionDetail: "Namangan viloyati, Namangan tumani, Chortoq shaharchasi",
              equipment: ["Bolalar o'yinlari", "Birinchi yordam", "Nazorat daftar"],
              completedOrders: 640,
              availability: ["24/7", "08:00-18:00"],
              careFocus: ["3-10 yosh", "Oilaviy parvarish"],
              bio: "Nodira Karimova oilaviy parvarish bo'yicha 9 yillik tajribaga ega. U ko'p bolali oilalarda ishlashni yaxshi biladi, har bir bolaning yoshiga mos parvarish rejasini tuzadi va ularni o'zaro hurmat ruhida tarbiyalaydi. Nodira dars tayyorlashda yordam beradi, kunlik uy vazifalarini nazorat qiladi, o'qishga qiziqish uyg'otish uchun suhbat va kichik mashqlar tashkil qiladi. U ovqatlanish tartibini ota-onalar bilan kelishgan holda olib boradi, allergiya yoki sog'liq cheklovlari bo'lsa alohida e'tibor beradi. Nodira tartibli va mas'uliyatli, uyda tartib saqlash, gigiyena va xavfsizlik qoidalariga qat'iy amal qiladi. U bolalar bilan ko'chaga chiqishda xavfsiz yo'l tanlaydi, o'yin maydonchalarida doimiy kuzatuvda bo'ladi. Nodira bolalarning hissiy holatini kuzatib, kerak bo'lsa tinchlantiruvchi mashg'ulotlar yoki ijodiy o'yinlar taklif qiladi. U ota-onalar bilan doimiy muloqotda bo'lib, har kuni bolaning kayfiyati, ishtahasi va faoliyati haqida qisqa hisobot beradi. Nodira birinchi yordam bo'yicha tayyor, kichik jarohatlarda to'g'ri chora ko'radi, zarur bo'lsa shifokor bilan bog'lanadi. U oilaviy qadriyatlarni hurmat qiladi, begona odamlar bilan muloqotda ehtiyotkor bo'ladi va bolalarni har doim nazoratda ushlab turadi. Nodiraning yondashuvi mehribon, lekin chegaralarni aniq belgilaydi, shuning uchun bolalar uni hurmat qiladi va ishonch bildiradi. Nodira oilaviy an'analarni e'zozlaydi, bolalarga kattalarni hurmat qilish, navbat kutish va o'zaro yordam ko'nikmalarini singdiradi. U tartibli jadval orqali bolalarning bir-biriga to'g'ri munosabatini boshqaradi. U bolalarga kichik mas'uliyat topshiriqlari berib, o'zlariga ishonchini oshiradi."
            }
          ),
          makeAgent(
            "nanny-8",
            "Saida Yuldasheva",
            "SaidaNanny",
            "Kunduzgi enaga",
            "Buxoro",
            6,
            20,
            20,
            [
              makeNannyService(
                "nanny-8-1",
                "Kunduzgi parvarish",
                260000,
                "kun",
                "08:00-18:00 oralig'ida xizmat.",
                ["Tibbiy ma'lumotnoma"],
                82
              ),
              makeNannyService(
                "nanny-8-2",
                "Bog'cha olib borish",
                140000,
                "xizmat",
                "Bog'cha va uy oralig'i xizmatlari.",
                ["Sertifikat"],
                83
              ),
              makeNannyService(
                "nanny-8-3",
                "Qisqa vaqtli parvarish",
                120000,
                "xizmat",
                "2-3 soatlik parvarish.",
                ["Tibbiy ma'lumotnoma"],
                84
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 26,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(28, "Saida Yuldasheva"),
              region: "O'zbekiston",
              regionDetail: "Buxoro viloyati, Buxoro shahri, G'ijduvon ko'chasi",
              equipment: ["Bolalar o'rindig'i", "O'yinchoqlar", "Birinchi yordam"],
              completedOrders: 220,
              availability: ["08:00-18:00", "10:00-14:00"],
              careFocus: ["2-6 yosh", "Bog'cha olib borish"],
              bio: "Saida Yuldasheva bog'cha va uy parvarishi bo'yicha 6 yillik tajribaga ega. U bolalarning ertalabki tayyorgarligini tartibli tashkil qiladi, kiyim-kechak, nonushta va yo'lga chiqish vaqtlarini aniq rejalashtiradi. Saida bolani bog'chaga olib borish va qaytarish jarayonida xavfsizlikni yuqori darajada ta'minlaydi, bolaning kayfiyati va sog'lig'ini kuzatadi. U uyga qaytgach bolani yuvinish, ovqatlanish va dam olishga tayyorlaydi, kerak bo'lsa o'quv o'yinlar va ijodiy mashg'ulotlar tashkil qiladi. Saida bolalarning ruhiy holatini nazorat qiladi, stress yoki qo'rquv belgilari bo'lsa muloyim suhbatlar orqali tinchlantiradi. U ota-onalar bilan ochiq muloqotda bo'lib, bola kun davomida nimalar bilan shug'ullangani haqida batafsil ma'lumot beradi. Saida gigiyena va tozalik qoidalariga qat'iy amal qiladi, o'yinchoqlar va jihozlarni tartibda ushlab turadi. U birinchi yordam ko'rsatish bo'yicha tayyor, kichik jarohatlar yoki yengil isitmada to'g'ri chora ko'radi. Saida o'z ishida halol va mas'uliyatli, qo'shimcha topshiriqlarga ham moslashuvchan, qisqa muddatli xizmatlarni ham bajaradi. U bolalar bilan muloyim, ammo tartibli muomala qiladi, shuning uchun ular o'zini xavfsiz va qulay his qiladi. Saida nutqni rivojlantirish uchun oddiy she'rlar va savol-javob o'yinlarini qo'llaydi, bolani mustaqil gapirishga undaydi. U tashqarida yurishda xavfsiz yo'laklardan foydalanadi, qo'lni ushlab yurishni qat'iy talab qiladi. Saida bolalarga kunlik kichik vazifalar beradi, o'yinchoqlarni yig'ish, kiyimni tartiblash va stolni tozalash kabi odatlarni singdiradi. Saida bolaga sodda mas'uliyatni qadrlashni eslatadi."
            }
          ),
          makeAgent(
            "nanny-9",
            "Park Soo-min",
            "SoominNanny",
            "Kechki parvarish",
            "Busan",
            7,
            21,
            21,
            [
              makeNannyService(
                "nanny-9-1",
                "Kechki parvarish",
                320000,
                "tun",
                "18:00-08:00 oralig'ida xizmat.",
                ["Tibbiy ma'lumotnoma"],
                85
              ),
              makeNannyService(
                "nanny-9-2",
                "Tungi nazorat",
                360000,
                "tun",
                "Tungi navbatchilik va kuzatuv.",
                ["Sertifikat"],
                86
              ),
              makeNannyService(
                "nanny-9-3",
                "Weekend kechki xizmat",
                340000,
                "tun",
                "Dam olish kunlari kechki xizmat.",
                ["Tibbiy ma'lumotnoma"],
                87
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 31,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(29, "Park Soo-min"),
              region: "Koreya",
              regionDetail: "경기도 수원시 영통구 매탄동",
              equipment: ["Birinchi yordam", "Yorug'lik nazorati", "O'yinlar"],
              completedOrders: 360,
              availability: ["18:00-08:00", "20:00-23:00"],
              careFocus: ["3-8 yosh", "Kechki parvarish"],
              bio: "Park Soo-min Koreyada bolalar parvarishi bo'yicha 7 yillik tajribaga ega. U kechki parvarishda bolalarning tinch uxlashi va xavfsizligini ta'minlashga alohida e'tibor beradi. Park uyquga tayyorgarlik tartibini aniq belgilab, yuvinish, tish tozalash, kitob o'qish va sokin o'yinlar orqali bolani tinchlantiradi. U bolalarning kayfiyatini kuzatadi, qo'rquv yoki bezovtalik bo'lsa muloyim suhbat va nafas mashqlari orqali tinchlikni qaytaradi. Park inglizcha asosiy so'zlarni o'rgatish bo'yicha kichik mashg'ulotlar o'tkazadi, bu esa bolaning qiziqishini oshiradi va e'tiborini mustahkamlaydi. U ota-onalar bilan doimiy aloqa qiladi, kechki rejim va uyqu sifati haqida yozma yoki og'zaki hisobot beradi. Park uy sharoitini hurmat qiladi, shaxsiy chegaralarga rioya qiladi va tartibni saqlaydi. U birinchi yordam ko'rsatish bo'yicha tayyor, kichik jarohatlar yoki yengil isitmada to'g'ri chora ko'radi, zarur bo'lsa shifokor bilan maslahatlashadi. Park mas'uliyatli va ehtiyotkor, bolani yolg'iz qoldirmaydi, xavfsizlik jihozlaridan to'g'ri foydalanadi. Kechki navbatchilikda ham sergak bo'lib, bolaning nafas olish ritmi va umumiy holatini muntazam tekshiradi, shuning uchun ota-onalar uning xizmatiga ishonch bilan murojaat qiladi. U kechki xizmatda ham ota-onadan oldindan kelishilgan kontaktlarni tayyor tutadi, favqulodda vaziyatda tezkor harakat qiladi. Park bolalarni ertalab uyg'otish rejimini ham kelishib, keyingi kun uchun yumshoq reja beradi. Park uyqudan oldin ekran vaqtini cheklaydi, sokin suhbatlar orqali bolaning o'zini xavfsiz his qilishiga yordam beradi. Park uyquga tayyorgarlikda issiq suv ichishini eslatadi."
            }
          ),
          makeAgent(
            "nanny-10",
            "Dilfuza Sattorova",
            "DilfuzaNanny",
            "Kunduzgi enaga",
            "Toshkent",
            6,
            22,
            22,
            [
              makeNannyService(
                "nanny-10-1",
                "Kunduzgi parvarish",
                260000,
                "kun",
                "Kunduzgi 8-18 oralig'ida parvarish.",
                ["Tibbiy ma'lumotnoma"],
                88
              ),
              makeNannyService(
                "nanny-10-2",
                "Uyda kuzatuv",
                220000,
                "xizmat",
                "Uyda bolani kuzatish va tarbiya.",
                ["Sertifikat"],
                89
              ),
              makeNannyService(
                "nanny-10-3",
                "2 soatlik parvarish",
                110000,
                "xizmat",
                "Qisqa vaqtli xizmat.",
                ["Tibbiy ma'lumotnoma"],
                90
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 29,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(30, "Dilfuza Sattorova"),
              region: "O'zbekiston",
              regionDetail: "Toshkent shahri, Chilonzor tumani, Farhod mahallasi",
              equipment: ["Birinchi yordam", "O'yinchoqlar", "Bolalar o'rindig'i"],
              completedOrders: 280,
              availability: ["08:00-18:00", "12:00-16:00"],
              careFocus: ["2-6 yosh", "Kunduzgi parvarish"],
              bio: "Dilfuza Sattorova to'liq kunlik parvarish va uyga chiqib xizmat ko'rsatishda 8 yillik tajribaga ega. U bolalarning kundalik rejasi, ovqatlanishi, dam olishi va faoliyati o'rtasida muvozanatni saqlashga katta e'tibor beradi. Dilfuza ertalabki uyg'onishdan boshlab gigiyena tartibini to'g'ri tashkil qiladi, kiyimlarni ob-havoga mos tanlaydi, ovqatlanish vaqtida sog'lom odatlarni shakllantiradi. U bolalarning qiziqishini hisobga olib, rasm chizish, qo'l mehnati, konstruktorlar va hikoya o'qish orqali tarbiyaviy muloqotni kuchaytiradi. Dilfuza bolalarni telefon yoki planshetga bog'lab qo'ymaslikka intiladi, uning o'rniga jismoniy faollik va ijodiy mashg'ulotlarga ustunlik beradi. U ota-onalar bilan doimiy muloqotda bo'lib, bolaning kayfiyati, ishtahasi va kun davomida o'rgangan ko'nikmalari haqida ma'lumot beradi. Dilfuza tartibli, mas'uliyatli va ishiga jiddiy yondashadi, uy sharoitida tartibni saqlaydi va xavfsizlikka rioya qiladi. Shoshilinch vaziyatlarda birinchi yordam ko'rsatishga tayyor, kichik jarohatlarda to'g'ri chora ko'radi, zarur bo'lsa shifokor bilan maslahatlashadi. U bolaning mustaqil bo'lishini qo'llab-quvvatlaydi, lekin doimiy nazoratni unutmaydi, shuning uchun ota-onalar uning xizmatidan xotirjam foydalanadi. Dilfuza bolalarning til va muloqotini rivojlantirish uchun kichik suhbatlar, tasvirli kartochkalar va oddiy hikoyalar bilan ishlaydi. U toza havo rejimini qo'llab, qisqa sayrlar yoki derazani shamollatishni esdan chiqarmaydi, bolaga xavfsiz muhit yaratadi. Dilfuza har hafta ota-onaga qisqa yakuniy hisobot beradi, bola rivoji va odatlari bo'yicha aniq tavsiyalarni yozma tarzda taqdim etadi. Dilfuza bolaga toza kiyim va tartibli javonni o'rgatadi."
            }
          )
          ,
          makeAgent(
            "nanny-11",
            "Murod Sodiqov",
            "MurodCare",
            "Qariyalar parvarishi",
            "Toshkent",
            9,
            23,
            11,
            [
              makeNannyService(
                "nanny-11-1",
                "Qariyalar kunduzgi parvarishi",
                360000,
                "kun",
                "Qariyalarga kunduzgi nazorat va kundalik yordam.",
                ["Tibbiy ma'lumotnoma", "Parvarish sertifikati"],
                91,
                true,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-11-2",
                "Dori nazorati va ovqatlantirish",
                280000,
                "kun",
                "Dori vaqtlarini eslatish va ovqatlanishni boshqarish.",
                ["Tibbiy ma'lumotnoma"],
                92,
                false,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-11-3",
                "Kechki parvarish (18-08)",
                420000,
                "tun",
                "Tunda qariyalarni kuzatish va xavfsizlik nazorati.",
                ["Parvarish sertifikati"],
                93,
                false,
                "nanny-elderly"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 41,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(11, "Murod Sodiqov"),
              region: "O'zbekiston",
              regionDetail: "Toshkent shahri, Yunusobod tumani, Bodomzor mahallasi",
              equipment: ["Qon bosimi o'lchagich", "Glyukoza nazorati", "Birinchi yordam"],
              completedOrders: 310,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Qariyalar parvarishi", "Dori nazorati"],
              bio: "Murod Sodiqov 9 yillik tajribaga ega parvarishchi bo'lib, yoshi katta qariyalar bilan ishlashga ixtisoslashgan. U qariyalarning kundalik ehtiyojlarini biladi, ovqatlanish tartibini nazorat qiladi va dori vaqtlarini eslatishda juda sinchkov. Murod qariyalar bilan muloyim muloqot qiladi, ularning kayfiyati va ruhiy holatini kuzatib, tushkunlik bo'lsa suhbat yoki oddiy mashg'ulotlar orqali ruhlantiradi. U qon bosimi va shakar nazoratini o'z vaqtida olib boradi, natijalarni yozib boradi va kerak bo'lsa shifokor ko'rsatmalarini bajaradi. Murod uy sharoitida xavfsizlikni ta'minlash uchun sirpanchiq joylarni tekshiradi, ortiqcha buyumlarni tartibga keltiradi va yotoq joyini to'g'ri sozlaydi. U yengil jismoniy mashqlar, nafas mashqlari va yurish bo'yicha yordam beradi, qariyalarning mustaqilligini saqlashga harakat qiladi. Murod kechki parvarishda ham sergak bo'lib, tungi holatlarni kuzatadi, harorat va umumiy holatni tekshiradi. Ota-onalar yoki qarindoshlar bilan doimiy aloqada bo'lib, kunlik hisobot va zarur tavsiyalar beradi. U birinchi yordam ko'rsatish bo'yicha tayyor, kichik jarohatlar va holsizlanishda tezkor chora ko'radi. Murod tartibli, sabrli va mas'uliyatli, qariyalarning shaxsiy hududini hurmat qiladi va ularni e'zozlaydi. U jadvalga qat'iy amal qiladi, dori nomlarini chalkashtirmaslik uchun belgilangan daftar yuritadi. Shuningdek, har kuni qisqa yurish yoki qo'l-oyoqlarni yengil harakatlantirish mashqlarini tavsiya qiladi, bu esa sog'liqni barqaror ushlab turishga yordam beradi. Murod har bir tashrifdan so'ng qisqa yozma xulosa tayyorlaydi, bu oila a'zolariga keyingi parvarishni rejalashda yordam beradi."
            }
          ),
          makeAgent(
            "nanny-12",
            "Gulnora Ismoilova",
            "GulnoraCare",
            "Qariyalar reabilitatsiyasi",
            "Sirdaryo",
            8,
            24,
            12,
            [
              makeNannyService(
                "nanny-12-1",
                "Yurish va reabilitatsiya yordami",
                300000,
                "kun",
                "Yengil reabilitatsiya va yurish bo'yicha yordam.",
                ["Reabilitatsiya guvohnomasi"],
                94,
                false,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-12-2",
                "Uy sharoitida parvarish",
                340000,
                "kun",
                "Qariyalarga uy sharoitida kunduzgi nazorat.",
                ["Tibbiy ma'lumotnoma"],
                95,
                false,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-12-3",
                "Parhez va ovqatlanish nazorati",
                260000,
                "kun",
                "Parhezli ovqatlanish va suv balansini kuzatish.",
                ["Parvarish sertifikati"],
                96,
                false,
                "nanny-elderly"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 37,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(12, "Gulnora Ismoilova"),
              region: "O'zbekiston",
              regionDetail: "Sirdaryo viloyati, Guliston shahri, Do'stlik mahallasi",
              equipment: ["Reabilitatsiya kamar", "Bosim o'lchagich", "Birinchi yordam"],
              completedOrders: 280,
              availability: ["08:00-18:00"],
              careFocus: ["Qariyalar reabilitatsiyasi", "Parhez nazorati"],
              bio: "Gulnora Ismoilova 8 yillik tajribaga ega bo'lib, qariyalar reabilitatsiyasi va kunduzgi parvarish xizmatlarini ko'rsatadi. U yurish, yengil gimnastika va nafas mashqlari orqali qariyalarning harakatchanligini saqlashga yordam beradi. Gulnora parhezli ovqatlanish bo'yicha tajribaga ega, suv balansini nazorat qiladi, shifokor tavsiyasiga ko'ra menyuni moslashtiradi. U qon bosimi va umumiy holatni muntazam tekshiradi, natijalarni yozib boradi va qarindoshlarga yetkazadi. Gulnora uy sharoitida xavfsizlikni ta'minlash uchun mebel joylashuvini tartiblaydi, sirpanchiq joylarni tozalaydi, yorug'lik va havoni nazorat qiladi. U qariyalarga dori vaqtlarini eslatadi, dori qabulini kuzatadi, aralashib ketmasligi uchun alohida tartib yaratadi. Gulnora qariyalar bilan muloyim muloqot qiladi, ular bilan suhbatlashib, ruhiy holatini ko'tarishga harakat qiladi, yolg'izlik hissini kamaytiradi. Oila a'zolari bilan doimiy aloqada bo'lib, kunlik hisobot taqdim etadi va zarur tavsiyalar beradi. U birinchi yordam ko'rsatish bo'yicha tayyor, holsizlanish yoki bosim ko'tarilishida tezkor chora ko'radi. Gulnora sabrli, tartibli va mas'uliyatli, qariyalarning shaxsiy hududini hurmat qiladi, ularning odatlari va jadvaliga moslashadi. U har kuni yengil massaj yoki qo'l-oyoq mashqlarini qo'llab, qon aylanishini yaxshilashga yordam beradi. Shuningdek, yaqin qarindoshlar bilan haftalik reja tuzib, parvarish jarayonini izchil yuritadi. Gulnora reabilitatsiya vaqtida og'riq darajasini baholaydi, ortiqcha yuklama bermaydi va dam olish oralig'ini to'g'ri belgilaydi. U oilaga telefon orqali maslahat berib, dori jadvali va ovqatlanish bo'yicha kichik eslatmalar yuboradi."
            }
          ),
          makeAgent(
            "nanny-13",
            "Park Ji-young",
            "JiyoungCare",
            "Qariyalar parvarishi",
            "Cheonan",
            10,
            25,
            13,
            [
              makeNannyService(
                "nanny-13-1",
                "Kunduzgi qariyalar parvarishi",
                520000,
                "kun",
                "Koreyada kunduzgi parvarish va nazorat.",
                ["Parvarish sertifikati"],
                97,
                false,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-13-2",
                "Kecha parvarishi",
                620000,
                "tun",
                "Tungi nazorat va xavfsizlik.",
                ["Tibbiy ma'lumotnoma"],
                98,
                false,
                "nanny-elderly"
              ),
              makeNannyService(
                "nanny-13-3",
                "Reabilitatsiya yordami",
                480000,
                "kun",
                "Yengil reabilitatsiya va jismoniy mashqlar.",
                ["Reabilitatsiya guvohnomasi"],
                99,
                false,
                "nanny-elderly"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 42,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(13, "Park Ji-young"),
              region: "Koreya",
              regionDetail: "충청남도 천안시 동남구 성남동",
              equipment: ["Qon bosimi o'lchagich", "Reabilitatsiya to'plami", "Birinchi yordam"],
              completedOrders: 360,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Qariyalar parvarishi", "Reabilitatsiya"],
              bio: "Park Ji-young Koreyada 10 yildan ortiq tajribaga ega parvarishchi bo'lib, qariyalar uchun kunduzgi va kechki parvarish xizmatlarini olib boradi. U har bir mijozning tibbiy tarixini o'rganadi, dori qabul qilish jadvalini tuzadi va nazorat qiladi. Park qariyalar bilan hushmuomala, sabrli va ehtiyotkor bo'lib, ularning kayfiyatini ko'tarish uchun suhbatlar va xotira mashqlarini qo'llaydi. U reabilitatsiya bo'yicha yengil mashqlarni to'g'ri bajarishga yordam beradi, yurish uchun qo'ltiqtayoq yoki qo'llab-quvvatlovchi kamarlarni to'g'ri ishlatishni ko'rsatadi. Park uy sharoitida xavfsizlikni ta'minlash uchun joylarni tartibga keltiradi, yotoq va hammom xavfsizligini tekshiradi, yoritishni to'g'ri sozlaydi. U parhezli ovqatlanish bo'yicha tajribaga ega, suyuqlik balansini kuzatadi va shifokor tavsiyalarini bajaradi. Park kundalik hisobot yuritadi, qarindoshlar bilan doimiy aloqada bo'ladi, o'zgarishlarni tezkor xabar qiladi. U shoshilinch vaziyatlarda birinchi yordam ko'rsatadi, zarur bo'lsa shifokor yoki tez yordamga murojaat qiladi. Park mas'uliyatli, tartibli va qat'iy, lekin insoniylikni unutmaydi, qariyalar uchun qulay muhit yaratadi. Uning xizmatidan foydalanayotgan oilalar uning e'tiborli va ehtiyotkor yondashuvini yuqori baholaydi. Park haftalik reabilitatsiya jadvalini tuzib, har bir mashg'ulotni qayd etadi, bu esa davolanish natijalarini kuzatishga yordam beradi. U shuningdek qariyalarga xotira mashqlari uchun oddiy kartalar va daftarlar tayyorlaydi. Park oila a'zolariga uyda bajariladigan mashqlar ro'yxatini beradi va ularning bajarilishini keyingi tashrifda tekshiradi. Park har oy tibbiy ko'rsatkichlar jadvalini yangilaydi va oila bilan muhokama qiladi."
            }
          ),
          makeAgent(
            "nanny-14",
            "Aziza Mirzaeva",
            "AzizaClinic",
            "Shifoxona parvarishi",
            "Toshkent",
            6,
            26,
            14,
            [
              makeNannyService(
                "nanny-14-1",
                "Shifoxonada kunduzgi parvarish",
                400000,
                "kun",
                "Shifoxonada bemorni kuzatish va yordam.",
                ["Tibbiy ma'lumotnoma"],
                100,
                true,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-14-2",
                "Shifoxonada tun bo'yi navbatchilik",
                520000,
                "tun",
                "Tungi nazorat va dori vaqtlarini eslatish.",
                ["Parvarish sertifikati"],
                101,
                false,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-14-3",
                "Operatsiyadan keyingi kuzatuv",
                460000,
                "kun",
                "Operatsiyadan keyin bemorni parvarish qilish.",
                ["Tibbiy ma'lumotnoma"],
                102,
                false,
                "nanny-hospital"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 33,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(14, "Aziza Mirzaeva"),
              region: "O'zbekiston",
              regionDetail: "Toshkent shahri, Shayxontohur tumani, Qatortol ko'chasi",
              equipment: ["Tibbiy qo'lqop", "Antiseptik", "Birinchi yordam"],
              completedOrders: 240,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Shifoxona parvarishi", "Operatsiyadan keyingi kuzatuv"],
              bio: "Aziza Mirzaeva shifoxonada parvarish xizmatida 6 yillik tajribaga ega. U bemorning holatini doimiy nazorat qilib, dori vaqtlarini eslatadi, shifokor ko'rsatmalariga to'liq amal qiladi va bemor uchun qulay sharoit yaratadi. Aziza tibbiy gigiyena qoidalarini juda yaxshi biladi, antiseptik ishlatish, qo'l tozaligi va xavfsizlik choralariga qat'iy rioya qiladi. U bemorning kayfiyati va og'riq darajasini kuzatib, shifokorlar bilan aloqa qiladi, zarur bo'lsa oila a'zolariga holat haqida xabar beradi. Aziza operatsiyadan keyingi bemorlarni parvarish qilish bo'yicha tajribaga ega, ovqatlanish, suyuqlik qabul qilish va harakat rejimini kuzatadi. U bemorni harakatlantirishda ehtiyotkor, ularni og'riqsiz joylashga yordam beradi va shamollash xavfini kamaytiradi. Aziza hujjat va dori nomlarini chalkashtirmaslik uchun yozma ro'yxatlar yuritadi, har bir vazifani belgilangan vaqtda bajaradi. U bemor bilan muloyim muloqot qiladi, ruhiy qo'llab-quvvatlaydi va ijobiy kayfiyat yaratishga intiladi. Shifoxona sharoitida ishlashda tartib va intizomni yuqori darajada saqlaydi. Aziza birinchi yordam bo'yicha tayyor, shoshilinch holatlarda tezkor chora ko'radi va shifokor ko'rsatmalarini qat'iy bajaradi. Uning ish uslubi ishonchli va xotirjam, shu bois ko'plab oilalar uni tanlaydi. Aziza bemorning uyqu rejimini barqaror saqlashga yordam beradi, bezovtalikni kamaytirish uchun sokin muhit yaratadi. U palata holatini tozaligini tekshiradi, bemor uchun toza kiyim va choyshablarni vaqtida almashtirishni nazorat qiladi. Aziza hamshira postlari bilan kelishib, bemor uchun qulay va uzluksiz parvarish jadvalini saqlashga intiladi."
            }
          ),
          makeAgent(
            "nanny-15",
            "Yunho Kim",
            "YunhoClinic",
            "Shifoxona parvarishi",
            "Seul",
            7,
            27,
            15,
            [
              makeNannyService(
                "nanny-15-1",
                "Bemorni kunduzgi kuzatish",
                640000,
                "kun",
                "Shifoxonada bemorni kunduzgi kuzatish.",
                ["Parvarish sertifikati"],
                103,
                false,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-15-2",
                "Kechki navbatchilik",
                720000,
                "tun",
                "Tungi kuzatuv va dori nazorati.",
                ["Tibbiy ma'lumotnoma"],
                104,
                false,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-15-3",
                "Reabilitatsiya bo'limi yordamchisi",
                580000,
                "kun",
                "Reabilitatsiya bo'limida bemorga ko'mak.",
                ["Reabilitatsiya guvohnomasi"],
                105,
                false,
                "nanny-hospital"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 35,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(15, "Yunho Kim"),
              region: "Koreya",
              regionDetail: "서울특별시 송파구 문정동",
              equipment: ["Tibbiy qo'lqop", "Antiseptik", "Nazorat daftar"],
              completedOrders: 210,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Shifoxona parvarishi", "Reabilitatsiya"],
              bio: "Yunho Kim 7 yillik tajribaga ega bo'lib, shifoxona sharoitida bemorlarni parvarish qilishda ixtisoslashgan. U bemorning umumiy holatini doimiy nazorat qiladi, dori vaqtlarini eslatadi va shifokor ko'rsatmalariga qat'iy amal qiladi. Yunho gigiyena va xavfsizlik qoidalariga alohida e'tibor beradi, bemor xonasining tozaligi va tartibini nazorat qiladi, antiseptiklardan to'g'ri foydalanadi. U reabilitatsiya bo'limida bemorlarga yengil mashqlarni bajarishda yordam beradi, yurish yoki harakatlanish uchun qo'llab-quvvatlash usullarini qo'llaydi. Yunho bemor bilan muloyim muloqot qiladi, ruhiy qo'llab-quvvatlashga vaqt ajratadi, bemorni tushkunlikdan chiqarish uchun motivatsion suhbatlar o'tkazadi. U oila a'zolari bilan aloqada bo'lib, holat o'zgarishlarini tezkor yetkazadi. Yunho hujjat va dori ro'yxatlarini tartib bilan yuritadi, har bir vazifani belgilangan vaqtda bajaradi. Shoshilinch vaziyatlarda birinchi yordam ko'rsatishga tayyor, zarur bo'lsa shifokor yoki hamshiralar bilan tez bog'lanadi. Yunho tartibli, mas'uliyatli va hushyor, shifoxona tartib-qoidalarini buzmaydi. Uning tajribasi bemorlarga xavfsiz va barqaror parvarish ta'minlaydi, shu bois ko'plab oilalar unga ishonch bildiradi. Yunho bemorning ovqatlanish jadvalini nazorat qiladi, suyuqlik yetarli bo'lishini tekshiradi va shifokor ruxsatisiz parhezni o'zgartirmaydi. U bemorlarning tushkunlik holatini kamaytirish uchun qisqa mashg'ulotlar yoki kitob o'qishni taklif qiladi. Yunho har kuni bemor bilan qisqa suhbat o'tkazib, stressni kamaytiradi va tiklanish motivatsiyasini kuchaytiradi. U har smenada bemor holatini yozma daftarida belgilab, hamshira bilan tekshiradi. Yunho smena oxirida qisqa xulosa tayyorlaydi."
            }
          ),
          makeAgent(
            "nanny-16",
            "Dilshod Rakhmonov",
            "DilshodClinic",
            "Shifoxona parvarishi",
            "Namangan",
            6,
            28,
            16,
            [
              makeNannyService(
                "nanny-16-1",
                "Bemorni kunlik parvarish",
                380000,
                "kun",
                "Shifoxonada kunduzgi parvarish va yordam.",
                ["Tibbiy ma'lumotnoma"],
                106,
                false,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-16-2",
                "Operatsiyadan keyingi yordam",
                420000,
                "kun",
                "Operatsiyadan keyin nazorat va yengil parvarish.",
                ["Parvarish sertifikati"],
                107,
                false,
                "nanny-hospital"
              ),
              makeNannyService(
                "nanny-16-3",
                "Tunda bemorni kuzatish",
                500000,
                "tun",
                "Tungi navbatchilik va bemor holatini nazorat qilish.",
                ["Tibbiy ma'lumotnoma"],
                108,
                false,
                "nanny-hospital"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 31,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(16, "Dilshod Rakhmonov"),
              region: "O'zbekiston",
              regionDetail: "Namangan viloyati, Pop tumani, Toshbuloq mahallasi",
              equipment: ["Tibbiy qo'lqop", "Antiseptik", "Birinchi yordam"],
              completedOrders: 190,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Shifoxona parvarishi", "Operatsiyadan keyingi nazorat"],
              bio: "Dilshod Rakhmonov shifoxona parvarishi bo'yicha 6 yillik tajribaga ega. U bemorning holatini kuzatishda sinchkov, dori jadvaliga qat'iy rioya qiladi va shifokor ko'rsatmalarini o'z vaqtida bajaradi. Dilshod gigiyena qoidalarini yuqori darajada saqlaydi, bemor uchun xavfsiz va toza muhit yaratadi, antiseptik va himoya vositalaridan to'g'ri foydalanadi. U operatsiyadan keyingi bemorlar bilan ishlashda ehtiyotkor, og'riq darajasini kuzatadi, harakatlantirishda to'g'ri usullarni qo'llaydi. Dilshod bemorni ovqatlantirish, suyuqlik balansini nazorat qilish va dam olish rejimini ta'minlashga yordam beradi. U bemor va oila a'zolari bilan ochiq muloqot qiladi, holat o'zgarishlarini tezkor xabar qiladi. Dilshod shoshilinch vaziyatlarda tezkor harakat qiladi, birinchi yordam ko'rsatishga tayyor va shifokorlarni tezda chaqiradi. U hujjatlarni tartib bilan yuritadi, dori nomlari va vaqtlarini chalkashtirmaydi. Dilshod sabrli, mas'uliyatli va xushmuomala, shifoxona tartib-qoidalariga qat'iy amal qiladi. Uning xizmatidan foydalanganlar uni ishonchli va ehtiyotkor parvarishchi sifatida baholashadi. Dilshod bemorning uyqu rejimini kuzatadi, zarur bo'lsa shifokor bilan muhokama qilib, qo'shimcha nazorat choralarini qo'llaydi. U palata ichidagi tartibni saqlab, bemor uchun qulay muhitni doimiy tekshiradi. Dilshod palata haroratini, namligini va shovqin darajasini kuzatadi, bu bemorning tezroq tiklanishiga ijobiy ta'sir qiladi. Dilshod bemorning suyuqlik balansini qayd etadi va ovqatlanishdagi o'zgarishlarni shifokorga bildiradi. U har kuni yengil nafas mashqlarini eslatadi. Dilshod bemorning his-tuyg'ularini tinglab, qo'shimcha ruhiy taskin beradi. Dilshod doimo xotirjam ishlaydi."
            }
          ),
          makeAgent(
            "nanny-17",
            "Shahnoza Karimova",
            "ShahnozaHome",
            "Uy sharoitida kasal parvarishi",
            "Samarqand",
            7,
            29,
            17,
            [
              makeNannyService(
                "nanny-17-1",
                "Uy sharoitida kunduzgi parvarish",
                340000,
                "kun",
                "Uyda bemorni kunduzgi nazorat qilish.",
                ["Tibbiy ma'lumotnoma"],
                109,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-17-2",
                "Dori va parhez nazorati",
                280000,
                "kun",
                "Dori vaqtlarini eslatish va parhez nazorati.",
                ["Parvarish sertifikati"],
                110,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-17-3",
                "Uyda kechki parvarish",
                420000,
                "tun",
                "Tunda bemorni kuzatish va xavfsizlik nazorati.",
                ["Tibbiy ma'lumotnoma"],
                111,
                false,
                "nanny-homecare"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 36,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(17, "Shahnoza Karimova"),
              region: "O'zbekiston",
              regionDetail: "Samarqand viloyati, Kattaqo'rg'on tumani, Loyiha mahallasi",
              equipment: ["Birinchi yordam", "Bosim o'lchagich", "Antiseptik"],
              completedOrders: 230,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Uy sharoitida parvarish", "Dori nazorati"],
              bio: "Shahnoza Karimova uy sharoitida kasallarni parvarish qilish bo'yicha 7 yillik tajribaga ega. U bemorning kunlik holatini kuzatadi, dori vaqtlarini eslatadi va parhezli ovqatlanish tartibiga rioya qilishda yordam beradi. Shahnoza bemorning bosimini, haroratini va umumiy holatini tekshiradi, natijalarni yozib boradi va qarindoshlarga yetkazadi. U uy sharoitida xavfsizlikni ta'minlash uchun yotoq joyini to'g'ri sozlaydi, sirpanchiq joylarni tozalaydi va xonani muntazam shamollatadi. Shahnoza bemorni yengil harakatlantirish, yotish va turish jarayonlarida ehtiyotkor, og'riqni kamaytirish uchun qulay holatlarni taklif qiladi. U ruhiy qo'llab-quvvatlashga ham e'tibor beradi, bemor bilan suhbatlashib, ijobiy kayfiyat yaratishga intiladi. Shahnoza oila a'zolari bilan doimiy muloqotda bo'lib, holatdagi o'zgarishlarni tezkor xabar qiladi. U shoshilinch vaziyatlarda birinchi yordam ko'rsatishga tayyor, zarur bo'lsa shifokor bilan bog'lanadi. Shahnoza tartibli, mas'uliyatli va ehtiyotkor, bemorning shaxsiy hududini hurmat qiladi. Uning xizmatidan foydalanganlar uni ishonchli va sabrli parvarishchi sifatida baholashadi. Shahnoza bemorning ovqatini belgilangan vaqtda tayyorlab beradi, suyuqlik miqdorini nazorat qiladi va uyqu rejimini buzmaslikka harakat qiladi. U haftalik parvarish rejasini yozib, oilaga aniq tavsiyalar taqdim etadi. Shahnoza uyda tibbiy jihozlarni to'g'ri saqlaydi, dori idishlarini belgilab qo'yadi va gigiyena tartibini doimiy yangilab boradi. U bemor uchun qulay kiyim va yotoq buyumlarini tayyorlaydi, terini parvarish qilish bo'yicha ham yordam beradi. Shahnoza bemor bilan muntazam aloqa orqali ishonchni mustahkamlaydi. Shahnoza juda ehtiyotkor."
            }
          ),
          makeAgent(
            "nanny-18",
            "Kamoliddin Yusupov",
            "KamolHome",
            "Uy sharoitida parvarish",
            "Buxoro",
            6,
            30,
            18,
            [
              makeNannyService(
                "nanny-18-1",
                "Uyda bemorni kunduzgi nazorat",
                320000,
                "kun",
                "Uy sharoitida kunduzgi parvarish va yordam.",
                ["Tibbiy ma'lumotnoma"],
                112,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-18-2",
                "Reabilitatsiya yordami",
                360000,
                "kun",
                "Yengil mashqlar va reabilitatsiya nazorati.",
                ["Reabilitatsiya guvohnomasi"],
                113,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-18-3",
                "Kechki parvarish",
                400000,
                "tun",
                "Tunda bemorni kuzatish va xavfsizlik nazorati.",
                ["Parvarish sertifikati"],
                114,
                false,
                "nanny-homecare"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 34,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(18, "Kamoliddin Yusupov"),
              region: "O'zbekiston",
              regionDetail: "Buxoro viloyati, Buxoro tumani, G'ijduvon yo'li",
              equipment: ["Qon bosimi o'lchagich", "Reabilitatsiya to'plami", "Birinchi yordam"],
              completedOrders: 180,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Uy sharoitida parvarish", "Reabilitatsiya"],
              bio: "Kamoliddin Yusupov uy sharoitida bemorlarni parvarish qilishda 6 yillik tajribaga ega. U bemorning kundalik holatini kuzatadi, dori qabul qilish jadvaliga rioya qiladi va parhezli ovqatlanishni nazorat qiladi. Kamoliddin reabilitatsiya mashqlarini to'g'ri bajarishga yordam beradi, yurish yoki o'rnidan turish jarayonlarida ehtiyotkorlik bilan qo'llab-quvvatlaydi. U uy sharoitida xavfsizlikni ta'minlash uchun xonadagi ortiqcha buyumlarni tartiblaydi, yoritish va shamollatishni tekshiradi. Kamoliddin bemorning kayfiyati va ruhiy holatini kuzatib, tushkunlik bo'lsa suhbatlar orqali qo'llab-quvvatlaydi. U oila a'zolari bilan doimiy aloqada bo'lib, bemor holati haqida muntazam hisobot beradi. Kamoliddin shoshilinch vaziyatlarda birinchi yordam ko'rsatishga tayyor, zarur bo'lsa shifokor yoki tez yordamga murojaat qiladi. U dori nomlarini chalkashtirmaslik uchun yozma ro'yxat tuzadi, vazifalarni tartib bilan bajaradi. Kamoliddin mas'uliyatli, tartibli va ehtiyotkor, bemorning shaxsiy hududini hurmat qiladi. Uning xizmatidan foydalanganlar uni ishonchli va e'tiborli parvarishchi sifatida baholashadi. Kamoliddin ovqatlanish jadvalini biriktirib, parhez ro'yxatini ko'rsatib boradi, bu esa qarindoshlarga nazoratni osonlashtiradi. U bemorni yengil mashqlarga jalb qilib, mushaklarning kuchsizlanib ketmasligiga yordam beradi. Kamoliddin reabilitatsiya jarayonida bemorning holatini baholaydi, kerak bo'lsa mashqlarni qisqartiradi va ortiqcha og'riqni oldini oladi. Kamoliddin har kuni qisqa sog'liq eslatmalarini yozib, qarindoshlarga topshiradi, shuningdek uy jihozlarini xavfsiz holatda saqlaydi. Kamoliddin bemorning kayfiyatini baholab, stressni kamaytiruvchi yengil mashqlarni tavsiya qiladi. Kamoliddin nazoratni uzluksiz davom ettiradi va vaqtni aniq belgilaydi."
            }
          ),
          makeAgent(
            "nanny-19",
            "Lee Seo-yeon",
            "SeoyeonHome",
            "Uy sharoitida kasal parvarishi",
            "Incheon",
            8,
            31,
            19,
            [
              makeNannyService(
                "nanny-19-1",
                "Uyda kunduzgi parvarish",
                540000,
                "kun",
                "Uyda bemorni kunduzgi nazorat qilish.",
                ["Parvarish sertifikati"],
                115,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-19-2",
                "Tungi parvarish",
                680000,
                "tun",
                "Tunda bemorni kuzatish va yordam.",
                ["Tibbiy ma'lumotnoma"],
                116,
                false,
                "nanny-homecare"
              ),
              makeNannyService(
                "nanny-19-3",
                "Dori va ovqat nazorati",
                460000,
                "kun",
                "Dori qabulini nazorat qilish va parhez.",
                ["Parvarish sertifikati"],
                117,
                false,
                "nanny-homecare"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 33,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(19, "Lee Seo-yeon"),
              region: "Koreya",
              regionDetail: "인천광역시 남동구 구월동",
              equipment: ["Antiseptik", "Bosim o'lchagich", "Birinchi yordam"],
              completedOrders: 260,
              availability: ["08:00-18:00", "18:00-08:00"],
              careFocus: ["Uy sharoitida parvarish", "Dori nazorati"],
              bio: "Lee Seo-yeon uy sharoitida kasal parvarishi bo'yicha 8 yillik tajribaga ega. U bemorning holatini muntazam kuzatadi, dori qabul qilish jadvalini aniq belgilaydi va vaqtida eslatib turadi. Lee parhezli ovqatlanish bo'yicha tajribali, suyuqlik balansini nazorat qiladi, shifokor tavsiyasiga mos ovqatlanish rejasini tuzadi. U bemorni harakatlantirishda ehtiyotkorlik bilan yordam beradi, yotish va turish jarayonini og'riqsiz tashkil qiladi. Lee uy sharoitida xavfsizlikni ta'minlash uchun yotoq va hammom joylarini nazorat qiladi, sirpanchiq joylarni tozalaydi, xonani shamollatib turadi. U bemorning ruhiy holatini kuzatadi, muloyim muloqot orqali qo'llab-quvvatlaydi, stressni kamaytirish uchun sokin mashg'ulotlar taklif qiladi. Lee oila a'zolari bilan doimiy aloqada bo'lib, holatdagi o'zgarishlarni tezkor yetkazadi. U birinchi yordam ko'rsatish bo'yicha tayyor, shoshilinch vaziyatlarda tezkor chora ko'radi va tibbiy xodimlarga murojaat qiladi. Lee tartibli, mas'uliyatli va ehtiyotkor, bemorning shaxsiy hududini hurmat qiladi. Uning yondashuvi ishonchli, shuning uchun ko'plab oilalar unga doimiy tarzda murojaat qiladi. Lee bemorning dam olish rejimini barqaror saqlash uchun yoritish va shovqin darajasini nazorat qiladi, ovqatdan keyingi nazoratni ham unutmadi. U haftalik parvarish rejasini qayd etib, oilaga aniq tavsiyalar beradi. Lee shifokor tavsiyalarini yozma ko'rinishda saqlaydi, har bir o'zgarishni qayd etadi va oilaga aniq tushuntirish beradi. Lee har hafta tibbiy ko'rsatkichlarni jamlab, oilaga qisqa xulosa beradi. U dori jadvalini va vaqtlarini muntazam yangilaydi."
            }
          ),
          makeAgent(
            "nanny-20",
            "Nargiza Muminova",
            "NargizaPet",
            "Uy hayvonlari enagasi",
            "Toshkent",
            5,
            32,
            20,
            [
              makeNannyService(
                "nanny-20-1",
                "It va mushuklarni kunduzgi parvarish",
                220000,
                "kun",
                "Uy hayvonlariga kunduzgi nazorat va parvarish.",
                ["Parvarish sertifikati"],
                118,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-20-2",
                "Uy hayvonini sayrga olib chiqish",
                90000,
                "xizmat",
                "Itlarni sayrga olib chiqish va xavfsiz qaytarish.",
                ["Veterinar tavsiyasi"],
                119,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-20-3",
                "Ovqatlantirish va dori berish",
                120000,
                "xizmat",
                "Ovqat va dori jadvalini nazorat qilish.",
                ["Parvarish sertifikati"],
                120,
                false,
                "nanny-pet"
              )
            ],
            true,
            {
              gender: "Ayol",
              age: 27,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(20, "Nargiza Muminova"),
              region: "O'zbekiston",
              regionDetail: "Toshkent shahri, Yakkasaroy tumani, Kushbegi mahallasi",
              equipment: ["Sayr arqoni", "Oziqlantirish idishlari", "Gigiyena to'plami"],
              completedOrders: 150,
              availability: ["08:00-18:00", "10:00-20:00"],
              careFocus: ["Uy hayvonlari parvarishi", "Sayr"],
              bio: "Nargiza Muminova uy hayvonlari parvarishi bo'yicha 5 yillik tajribaga ega. U it va mushuklarning kunlik ovqatlanish rejimini kuzatadi, suyuqlik balansini tekshiradi va hayvonlarning faolligini nazorat qiladi. Nargiza sayr vaqtida xavfsizlikni birinchi o'ringa qo'yadi, yo'l qoidalariga rioya qiladi, itlarni to'g'ri arqon bilan boshqaradi va tashqi muhitdagi xavflardan himoya qiladi. U hayvonlarning kayfiyati va sog'lig'ini kuzatadi, ishtaha pasayishi yoki g'alati xatti-harakat sezsa egalariga darhol xabar beradi. Nargiza uy sharoitida gigiyena qoidalariga e'tibor beradi, idishlarni tozalaydi, yotoq joylarini tartibga keltiradi va hayvonlar uchun qulay muhit yaratadi. U veterinarning ko'rsatmalariga asoslanib dori berish yoki maxsus yemlarni tayyorlash bo'yicha tajribaga ega. Nargiza hayvonlar bilan muloyim muomala qiladi, ularning stressini kamaytirish uchun sokin muhit yaratadi, o'yin va mashg'ulotlar orqali faoliyatni qo'llab-quvvatlaydi. U egalar bilan doimiy aloqada bo'lib, har kuni qisqa hisobot beradi. Nargiza mas'uliyatli, tartibli va hayvonlarga mehribon, shuning uchun ko'plab egalari uning xizmatidan xotirjam foydalanadi. U sayrdan keyin panjalarni tozalashni unutmaydi, hayvon uchun toza suv va xotirjam joy tayyorlaydi. Nargiza egaga ovqatlantirish bo'yicha kichik tavsiyalar berib, hayvonning vaznini nazorat qilishga yordam beradi. Nargiza uy hayvonlari uchun xavfsiz o'yin maydonini tayyorlaydi, ortiqcha shovqin yoki qo'rquv bo'lsa hayvonni tinchlantirish usullarini qo'llaydi. U emlash yoki veterinarga borish vaqtlarini ham egaga eslatadi, hujjatlarni tartibda saqlaydi. Nargiza mas'uliyatni doimiy nazorat qiladi."
            }
          ),
          makeAgent(
            "nanny-21",
            "Rustam Qodirov",
            "RustamPet",
            "Uy hayvonlari enagasi",
            "Farg'ona",
            6,
            33,
            21,
            [
              makeNannyService(
                "nanny-21-1",
                "Hayvonlarni kunduzgi nazorat",
                200000,
                "kun",
                "Uy hayvonlarini kunduzgi parvarish.",
                ["Parvarish sertifikati"],
                121,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-21-2",
                "Sayr va mashg'ulot",
                110000,
                "xizmat",
                "Itlarni sayrga olib chiqish va mashg'ulotlar.",
                ["Veterinar tavsiyasi"],
                122,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-21-3",
                "Parhez va ovqatlantirish",
                130000,
                "xizmat",
                "Parhezli ovqatlantirish va nazorat.",
                ["Parvarish sertifikati"],
                123,
                false,
                "nanny-pet"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 30,
              maritalStatus: "Oilali",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(21, "Rustam Qodirov"),
              region: "O'zbekiston",
              regionDetail: "Farg'ona viloyati, Farg'ona shahri, Yangi bozor mahallasi",
              equipment: ["Sayr arqoni", "Mashg'ulot o'yinchoqlari", "Gigiyena to'plami"],
              completedOrders: 170,
              availability: ["08:00-18:00", "18:00-22:00"],
              careFocus: ["Uy hayvonlari parvarishi", "Faol sayr"],
              bio: "Rustam Qodirov uy hayvonlari parvarishi bo'yicha 6 yillik tajribaga ega. U it va mushuklarning parheziga e'tibor beradi, ovqatlantirish va suv rejimini nazorat qiladi, veterinarning tavsiyalarini aniq bajaradi. Rustam sayr vaqtida hayvonlarning xavfsizligini ta'minlaydi, gavjum joylarda ehtiyotkor bo'ladi, boshqa hayvonlar bilan to'qnashuvlardan qochadi. U hayvonlarning xulqini kuzatadi, ortiqcha agressiya yoki tushkunlik belgilari bo'lsa egalariga xabar beradi. Rustam mashg'ulotlar orqali hayvonlarning faolligini oshiradi, buyruq bajarish, toza yurish va sokin muomala kabi ko'nikmalarni rivojlantiradi. U uy sharoitida gigiyena qoidalariga qat'iy amal qiladi, yotoq joyini tozalaydi, idishlarni yuvadi va hidlarni kamaytiradi. Rustam hayvonlarga mehribon, lekin intizomli, kerak bo'lsa yumshoq cheklovlar qo'llaydi. U egalar bilan doimiy muloqotda bo'lib, har kuni qisqa hisobot yuboradi. Rustam tartibli, mas'uliyatli va hayvonlarning xavfsizligi uchun javobgarlikni to'liq oladi, shu sababli ko'plab egalar uning xizmatini doimiy tanlaydi. U sayr vaqtini ob-havoga moslashtiradi, issiq kunda qisqa, salqin vaqtda esa faol sayrni tanlaydi. Rustam hayvonlar uchun o'yinchoqlarni toza saqlab, xavfsiz materiallardan foydalanadi. Rustam parhez rejasini egalar bilan kelishib, semirish yoki vazn yo'qotish holatlarini nazorat qiladi, kerak bo'lsa veterinarga murojaat qiladi. Rustam stress belgilari bo'lsa hayvonni tinchlantiruvchi mashg'ulotlar bilan band qiladi, shuningdek tish va panja gigiyenasini tekshiradi. U egaga ovqatlanish bo'yicha yozma eslatma beradi. Rustam egalar bilan haftalik reja tuzadi va o'zgarishlarni bildiradi. Rustam xotirjam va ehtiyotkor."
            }
          ),
          makeAgent(
            "nanny-22",
            "Choi Min-kyu",
            "MinkyuPet",
            "Uy hayvonlari parvarishi",
            "Suwon",
            7,
            34,
            22,
            [
              makeNannyService(
                "nanny-22-1",
                "Kunduzgi pet-sitter",
                480000,
                "kun",
                "Uy hayvonlarini kunduzgi nazorat va parvarish.",
                ["Parvarish sertifikati"],
                124,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-22-2",
                "Sayr va o'yin mashg'ulotlari",
                210000,
                "xizmat",
                "Faol sayr va o'yinlar orqali parvarish.",
                ["Veterinar tavsiyasi"],
                125,
                false,
                "nanny-pet"
              ),
              makeNannyService(
                "nanny-22-3",
                "Ovqatlantirish va dori nazorati",
                240000,
                "xizmat",
                "Ovqat va dori jadvalini kuzatish.",
                ["Parvarish sertifikati"],
                126,
                false,
                "nanny-pet"
              )
            ],
            true,
            {
              gender: "Erkak",
              age: 32,
              maritalStatus: "Turmush qurmagan",
              healthStatus: "Sog'lom",
              hasCriminalRecord: false,
              identityImage: makeAvatar(22, "Choi Min-kyu"),
              region: "Koreya",
              regionDetail: "경기도 수원시 장안구 정자동",
              equipment: ["Sayr arqoni", "O'yinchoqlar", "Gigiyena to'plami"],
              completedOrders: 190,
              availability: ["08:00-18:00", "10:00-22:00"],
              careFocus: ["Uy hayvonlari parvarishi", "Faol mashg'ulotlar"],
              bio: "Choi Min-kyu Koreyada uy hayvonlari parvarishi bo'yicha 7 yillik tajribaga ega. U it va mushuklarning xulq-atvorini yaxshi biladi, ularning ehtiyojiga qarab parvarish rejasini tuzadi. Min-kyu ovqatlantirish jadvalini aniq belgilaydi, parhezli ovqatlar va maxsus yemlar bilan ishlashni yaxshi biladi. U sayr vaqtida xavfsizlikni birinchi o'ringa qo'yadi, yo'l qoidalariga amal qiladi, arqonni to'g'ri boshqaradi va boshqa hayvonlar bilan xavfli vaziyatlardan saqlaydi. Min-kyu uy hayvonlarining kayfiyati va sog'lig'ini kuzatadi, g'alati holatlar bo'lsa egalariga darhol xabar qiladi. U uy sharoitida gigiyena qoidalariga qat'iy amal qiladi, yotoq joylarini tozalaydi, idishlarni yuvadi va hidlarni kamaytiradi. Min-kyu hayvonlar bilan o'yin mashg'ulotlarini o'tkazadi, ularning faolligini oshiradi, ortiqcha energiyani chiqishga yordam beradi. U egalar bilan doimiy aloqada bo'lib, har kuni qisqa hisobot beradi. Min-kyu mas'uliyatli va mehribon, hayvonlar bilan ehtiyotkor muomala qiladi, shuning uchun ko'plab mijozlar uning xizmatini ishonch bilan tanlaydi. U sayrdan qaytgach hayvonning panjalarini tozalaydi, allergiya belgilari bo'lsa kuzatib boradi va egaga yozma tavsiyalar beradi. Min-kyu har bir hayvon uchun alohida o'yin rejasi tuzib, faollikni me'yorida ushlab turadi. Min-kyu hayvonning kundalik faollik darajasini yozib boradi, energiya pasayganda mashg'ulotlarni moslashtiradi va egaga maslahat beradi. U hayvonning ovqatlanish tartibini kalendar bilan belgilab, egaga o'z vaqtida eslatmalar yuboradi. Min-kyu gigiyena tozaligini nazorat qiladi. U egalar bilan haftalik reja kelishadi. Min-kyu ehtiyotkor."
            }
          )
        ]
      },
      {
        id: "marketing",
        title: "Reklama (blogerlar)",
        description: "Brend reklama va ijtimoiy tarmoqlar targ'iboti.",
        agents: [
          makeAgent(
            "ads-1",
            "Ulug'bek Bahromov",
            "UlugbekAds",
            "Instagram va TikTok reklama",
            "Toshkent",
            5,
            15,
            15,
            [
              makeService(
                "ads-1-1",
                "Brend uchun video reklama",
                950000,
                "post",
                "Ssenariy, suratga olish va montaj.",
                ["Media shartnoma"],
                "marketing",
                29,
                true
              ),
              makeService(
                "ads-1-2",
                "Story reklama paketi",
                450000,
                "paket",
                "3 ta story va havola bilan.",
                ["Media shartnoma"],
                "marketing",
                30
              )
            ],
            true,
            {
              region: "Toshkent sh.",
              contactPhone: "+998 90 555 11 22",
              contactTelegram: "@ulugbekads",
              bio: "Ulug'bek brendlar uchun qisqa video va story kontentlar tayyorlaydi. U auditoriya moslashtirilgan ssenariy yozadi, post strukturasini rejalaydi va taqdimotga urg'u beradi."
            }
          ),
          makeAgent(
            "ads-2",
            "Sabina Karim",
            "SabinaSMM",
            "Bloger va kopirayter",
            "Namangan",
            4,
            16,
            16,
            [
              makeService(
                "ads-2-1",
                "Reklama matn va post",
                220000,
                "post",
                "Target uchun moslashtirilgan matn.",
                ["SMM sertifikati"],
                "marketing",
                31
              ),
              makeService(
                "ads-2-2",
                "Mahsulot sharhi",
                380000,
                "post",
                "Sifatli foto va batafsil sharh.",
                ["Media shartnoma"],
                "marketing",
                32
              )
            ],
            false,
            {
              region: "Namangan sh.",
              contactPhone: "+998 93 200 45 67",
              contactTelegram: "@sabinasmm",
              bio: "Sabina mahsulot sharhlari va reklama matnlarini yozadi. U kontent yo'nalishini auditoriya statistikasi bilan moslashtirib, postlarni brend tiliga yaqinlashtiradi."
            }
          )
        ]
      },
      {
        id: "employment",
        title: "Ish topib berish xizmati",
        description: "Vakansiya topish va kadrlar tanlash.",
        agents: [
          makeAgent(
            "job-1",
            "Kamila Ergasheva",
            "KamilaHR",
            "HR va rekruting mutaxassisi",
            "Toshkent",
            9,
            17,
            17,
            [
              makeService(
                "job-1-1",
                "CV va suhbat tayyorlash",
                250000,
                "xizmat",
                "Intervyu mashqlari va profil tuzish.",
                ["HR sertifikati"],
                "employment",
                33,
                true
              ),
              makeService(
                "job-1-2",
                "Vakansiya topish paketi",
                650000,
                "paket",
                "7 kun ichida 3 ta suhbat tashkil qilish.",
                ["HR sertifikati", "Shartnoma"],
                "employment",
                34
              )
            ],
            true
          ),
          makeAgent(
            "job-2",
            "Jalol Nurmatov",
            "JalolHR",
            "Kadrlar bo'yicha maslahatchi",
            "Buxoro",
            7,
            18,
            18,
            [
              makeService(
                "job-2-1",
                "Mutaxassis tanlash",
                1200000,
                "xizmat",
                "Kompaniyalar uchun tezkor rekruting.",
                ["HR sertifikati"],
                "employment",
                35
              ),
              makeService(
                "job-2-2",
                "Ishga joylashtirish konsaltingi",
                480000,
                "xizmat",
                "Mehnat bozorini tahlil qilish.",
                ["HR sertifikati"],
                "employment",
                36
              )
            ]
          )
        ]
      }
    ]
  },
  {
    id: "spiritual",
    title: "Manaviy xizmatlar",
    description:
      "Ta'lim, maslahat va rivojlanish xizmatlari. Har bir agent mutaxassisligini tasdiqlagan.",
    categories: [
      {
        id: "education",
        title: "Ta'lim (o'quv kurslari)",
        description: "Til, IT, biznes va shaxsiy rivojlanish kurslari.",
        agents: [
          makeAgent(
            "edu-1",
            "Azizbek Karimov",
            "AzizbekEdu",
            "Frontend va dizayn kurslari",
            "Toshkent",
            6,
            19,
            19,
            [
              makeService(
                "edu-1-1",
                "Frontend bootcamp",
                1800000,
                "kurs",
                "8 haftalik intensiv kurs va mentorlik.",
                ["O'quv markaz litsenziyasi"],
                "education",
                37,
                true
              ),
              makeService(
                "edu-1-2",
                "UI/UX asoslari",
                950000,
                "kurs",
                "Figma, prototip va portfolio.",
                ["O'quv markaz litsenziyasi"],
                "education",
                38
              )
            ],
            true
          ),
          makeAgent(
            "edu-2",
            "Dilafruz Qosimova",
            "DilafruzIELTS",
            "Ingliz tili ustoz",
            "Andijon",
            8,
            20,
            20,
            [
              makeService(
                "edu-2-1",
                "IELTS tayyorlov",
                1200000,
                "oy",
                "Speaking va writing bo'yicha individual reja.",
                ["TESOL sertifikati"],
                "education",
                39
              ),
              makeService(
                "edu-2-2",
                "Beginner English",
                600000,
                "oy",
                "Boshlang'ich darajadagi darslar.",
                ["TESOL sertifikati"],
                "education",
                40
              )
            ]
          )
        ]
      },
      {
        id: "consulting",
        title: "Konsalting xizmati",
        description: "Biznes va strategik maslahatlarga yo'naltirilgan.",
        agents: [
          makeAgent(
            "cons-1",
            "Sherzod Mahmudov",
            "SherzodConsult",
            "Biznes strategiya konsultanti",
            "Toshkent",
            11,
            21,
            21,
            [
              makeService(
                "cons-1-1",
                "Biznes diagnostika",
                2200000,
                "loyiha",
                "Moliyaviy tahlil va o'sish rejasi.",
                ["MBA diplomi", "Konsalting sertifikati"],
                "consulting",
                41,
                true,
                { subCategory: "consult-business" }
              ),
              makeService(
                "cons-1-2",
                "Startap mentorlik",
                1500000,
                "oy",
                "Haftalik uchrashuvlar va investor pitch.",
                ["MBA diplomi"],
                "consulting",
                42,
                false,
                { subCategory: "consult-business" }
              )
            ],
            true,
            {
              region: "Toshkent sh.",
              languages: ["UZ", "RU", "EN", "KR"],
              audiences: ["Tadbirkor", "Yangi kelganlar"],
              achievement: "Koreyada 2 startapni ishga tushirishga yordam bergan.",
              consultationFormats: ["Online", "Offline"],
              consultationDurations: ["30 min", "60 min"],
              consultationLanguages: ["UZ", "RU", "EN", "KR"],
              consultationPackages: ["1 martalik", "3 ta seans paketi"],
              contactPhone: "+998 90 111 22 33",
              contactTelegram: "@sherzodconsult",
              bio: "Sherzod biznes va startaplar uchun strategik yo'l xaritasi tuzadi. U Koreya bozorida kirish strategiyasi va investor tayyorgarligi bo'yicha amaliy tajribaga ega."
            }
          ),
          makeAgent(
            "cons-2",
            "Lola Nematova",
            "LolaMarketing",
            "Marketing konsalting",
            "Samarqand",
            7,
            22,
            22,
            [
              makeService(
                "cons-2-1",
                "Brend strategiya",
                1400000,
                "loyiha",
                "Pozitsiya, narx va bozorda joylashuv.",
                ["Marketing sertifikati"],
                "consulting",
                43,
                false,
                { subCategory: "consult-education" }
              ),
              makeService(
                "cons-2-2",
                "SMM audit",
                650000,
                "audit",
                "Kontent va reklama auditlari.",
                ["Marketing sertifikati"],
                "consulting",
                44,
                false,
                { subCategory: "consult-career" }
              )
            ],
            false,
            {
              region: "Samarqand sh.",
              languages: ["UZ", "RU"],
              audiences: ["Talaba", "Ishchi", "Ota-ona"],
              achievement: "Koreya bozoriga chiqqan 10+ brend kampaniyasi.",
              consultationFormats: ["Online"],
              consultationDurations: ["60 min"],
              consultationLanguages: ["UZ", "RU"],
              consultationPackages: ["1 martalik", "Paket (oylik)"],
              contactPhone: "+998 91 555 44 33",
              contactTelegram: "@lolamarketing",
              bio: "Lola konsaltingi brend strategiya va auditoriya moslashuviga qaratilgan. U reklama matnlari va kontent yo'nalishini koreys bozoriga moslashtiradi."
            }
          ),
          makeAgent(
            "cons-3",
            "Jasmina Lee",
            "JasminaKorea",
            "Koreya ta'lim va viza konsultanti",
            "Seul",
            6,
            23,
            23,
            [
              makeService(
                "cons-3-1",
                "Universitet tanlash va grant",
                980000,
                "paket",
                "TOPIK, GKS va hujjat topshirish yo'l xaritasi.",
                ["GKS tajribasi"],
                "consulting",
                45,
                false,
                { subCategory: "consult-education" }
              ),
              makeService(
                "cons-3-2",
                "Viza hujjatlari tekshiruvi",
                720000,
                "xizmat",
                "D-2, D-4 va E-7 hujjatlari bo'yicha audit.",
                ["Koreya viza amaliyoti"],
                "consulting",
                46,
                false,
                { subCategory: "consult-visa" }
              ),
              makeService(
                "cons-3-3",
                "Til va moslashuv bo'yicha reja",
                520000,
                "sessiya",
                "TOPIK strategiya va kundalik koreyscha.",
                ["TOPIK 5"],
                "consulting",
                47,
                false,
                { subCategory: "consult-language" }
              ),
              makeService(
                "cons-3-4",
                "Huquqiy va maishiy maslahat",
                680000,
                "sessiya",
                "Ijara, bank va telefon masalalari bo'yicha yo'l-yo'riq.",
                ["Maishiy huquq tajribasi"],
                "consulting",
                48,
                false,
                { subCategory: "consult-legal" }
              ),
              makeService(
                "cons-3-5",
                "Sog'liq va ijtimoiy qo'llab-quvvatlash",
                450000,
                "sessiya",
                "Sug'urta va shifoxona tizimi bo'yicha yo'nalish.",
                ["Koreya sog'liq tizimi"],
                "consulting",
                49,
                false,
                { subCategory: "consult-health" }
              ),
              makeService(
                "cons-3-6",
                "Ish va karyera yo'nalishi",
                760000,
                "sessiya",
                "CV, intervyu va ish bozori bo'yicha maslahat.",
                ["HR tajribasi"],
                "consulting",
                50,
                false,
                { subCategory: "consult-career" }
              )
            ],
            true,
            {
              region: "Seul",
              languages: ["UZ", "KR", "EN"],
              audiences: ["Talaba", "Ishchi", "Yangi kelganlar", "Ota-ona"],
              achievement: "Koreyada 200+ talabaga qabul va viza yo'l xaritasi bergan.",
              consultationFormats: ["Online", "Offline"],
              consultationDurations: ["30 min", "60 min"],
              consultationLanguages: ["UZ", "KR", "EN"],
              consultationPackages: ["1 martalik", "Paket (3-5 sessiya)"],
              contactPhone: "+82 10 5555 1234",
              contactTelegram: "@jasminakorea",
              bio: "Jasmina Koreyada ta'lim, viza va moslashuv bo'yicha amaliy maslahat beradi. U hujjatlarning aniq ro'yxatini beradi va har bir bosqichni tushuntirib beradi."
            }
          )
        ]
      },
      {
        id: "translation",
        title: "Tarjimonlik xizmati",
        description: "Hujjat va sinxron tarjima xizmatlari.",
        agents: [
          makeAgent(
            "trans-1",
            "Umid Rahmatov",
            "UmidTranslate",
            "Ingliz va koreys tarjimon",
            "Toshkent",
            9,
            23,
            23,
            [
              makeService(
                "trans-1-1",
                "Rasmiy hujjatlar tarjimasi",
                240000,
                "sahifa",
                "Pasport, diplom va notarial hujjatlar tarjimasi.",
                ["Tarjimon guvohnomasi"],
                "translation",
                45,
                false,
                {
                  subCategory: "translation-official",
                  translationMode: "written",
                  translationSpeed: "oddiy",
                  translationFormat: "PDF",
                  notarization: true,
                  sourceLang: "UZ",
                  targetLang: "KR"
                }
              ),
              makeService(
                "trans-1-2",
                "Og'zaki tarjima (meeting)",
                1600000,
                "soat",
                "Online meeting va intervyu tarjimasi.",
                ["Tarjimon guvohnomasi"],
                "translation",
                46,
                false,
                {
                  subCategory: "translation-oral",
                  translationMode: "oral",
                  translationSpeed: "oddiy",
                  translationFormat: "Original",
                  notarization: false,
                  sourceLang: "KR",
                  targetLang: "UZ"
                }
              )
            ],
            true,
            {
              region: "Toshkent sh.",
              languages: ["UZ", "KR", "RU", "EN"],
              audiences: ["Talaba", "Ishchi", "Yangi kelganlar"],
              achievement: "200+ rasmiy hujjat tarjima qilgan.",
              contactPhone: "+998 90 333 44 55",
              contactTelegram: "@umidtranslate",
              bio: "Umid rasmiy va og'zaki tarjimalar bo'yicha ishlaydi. U hujjatlarning aniqligi va terminlarga alohida e'tibor beradi."
            }
          ),
          makeAgent(
            "trans-2",
            "Dilnoza Iskandarova",
            "DilnozaTrans",
            "Koreys va rus tarjimon",
            "Farg'ona",
            6,
            24,
            24,
            [
              makeService(
                "trans-2-1",
                "Ta'lim hujjatlari tarjimasi",
                200000,
                "sahifa",
                "Universitet hujjatlari, study plan va recommendation.",
                ["Tarjimon guvohnomasi"],
                "translation",
                47,
                false,
                {
                  subCategory: "translation-education",
                  translationMode: "written",
                  translationSpeed: "oddiy",
                  translationFormat: "PDF",
                  notarization: false,
                  sourceLang: "KR",
                  targetLang: "RU"
                }
              ),
              makeService(
                "trans-2-2",
                "Texnik va IT tarjima",
                360000,
                "sahifa",
                "Texnik dokumentatsiya va IT matnlar.",
                ["Texnik lug'at"],
                "translation",
                48,
                false,
                {
                  subCategory: "translation-technical",
                  translationMode: "written",
                  translationSpeed: "shoshilinch",
                  translationFormat: "Scan",
                  notarization: false,
                  sourceLang: "EN",
                  targetLang: "KR"
                }
              )
            ],
            true,
            {
              region: "Farg'ona",
              languages: ["UZ", "KR", "RU", "EN"],
              audiences: ["Talaba", "Ishchi", "Yangi kelganlar"],
              achievement: "300+ ta hujjat tarjima qilgan.",
              contactPhone: "+998 93 800 77 66",
              contactTelegram: "@dilnozatrans",
              bio: "Dilnoza ta'lim va texnik tarjimalar bo'yicha ixtisoslashgan. U hujjatlarni tekshirish va moslashtirishda tajribaga ega."
            }
          ),
          makeAgent(
            "trans-3",
            "Andrew Park",
            "AndrewLegal",
            "Biznes va yuridik tarjimon",
            "Seul",
            8,
            25,
            25,
            [
              makeService(
                "trans-3-1",
                "Biznes & yuridik tarjima",
                480000,
                "sahifa",
                "Shartnoma, NDA va kompaniya hujjatlari.",
                ["Legal tajriba"],
                "translation",
                49,
                false,
                {
                  subCategory: "translation-business",
                  translationMode: "written",
                  translationSpeed: "oddiy",
                  translationFormat: "PDF",
                  notarization: true,
                  sourceLang: "EN",
                  targetLang: "KR"
                }
              ),
              makeService(
                "trans-3-2",
                "Viza va migratsiya tarjimasi",
                320000,
                "sahifa",
                "D-2, D-4, E-7 va migratsiya formalar.",
                ["Koreya migratsiya tajribasi"],
                "translation",
                50,
                false,
                {
                  subCategory: "translation-visa",
                  translationMode: "written",
                  translationSpeed: "shoshilinch",
                  translationFormat: "Scan",
                  notarization: true,
                  sourceLang: "KR",
                  targetLang: "UZ"
                }
              )
            ],
            true,
            {
              region: "Seul",
              languages: ["EN", "KR", "UZ", "RU"],
              audiences: ["Tadbirkor", "Yangi kelganlar"],
              achievement: "Koreyada 100+ biznes shartnomalar tarjimasi.",
              contactPhone: "+82 10 8888 9090",
              contactTelegram: "@andrewlegal",
              bio: "Andrew biznes va migratsiya hujjatlari bo'yicha tarjima qiladi. U hujjatlarning yuridik aniqligiga e'tibor beradi."
            }
          ),
          makeAgent(
            "trans-4",
            "Malika Yuldasheva",
            "MalikaMed",
            "Tibbiy tarjimon",
            "Andijon",
            5,
            26,
            26,
            [
              makeService(
                "trans-4-1",
                "Tibbiy hujjatlar tarjimasi",
                260000,
                "sahifa",
                "Diagnostika, retsept va sug'urta hujjatlari.",
                ["Tibbiy terminologiya"],
                "translation",
                51,
                false,
                {
                  subCategory: "translation-medical",
                  translationMode: "written",
                  translationSpeed: "oddiy",
                  translationFormat: "PDF",
                  notarization: false,
                  sourceLang: "RU",
                  targetLang: "UZ"
                }
              ),
              makeService(
                "trans-4-2",
                "Shifokor bilan uchrashuv",
                1200000,
                "soat",
                "Og'zaki tarjima: shifoxona va konsultatsiya.",
                ["Tibbiy tajriba"],
                "translation",
                52,
                false,
                {
                  subCategory: "translation-oral",
                  translationMode: "oral",
                  translationSpeed: "oddiy",
                  translationFormat: "Original",
                  notarization: false,
                  sourceLang: "KR",
                  targetLang: "UZ"
                }
              )
            ],
            false,
            {
              region: "Andijon",
              languages: ["UZ", "KR", "RU"],
              audiences: ["Ishchi", "Ota-ona"],
              achievement: "Koreya klinikalari uchun 80+ tibbiy tarjima.",
              contactPhone: "+998 90 322 11 00",
              contactTelegram: "@malikamed",
              bio: "Malika tibbiy tarjimalar va shifokor bilan uchrashuvlarda tarjima qiladi. U maxfiylikni qat'iy saqlaydi."
            }
          ),
          makeAgent(
            "trans-5",
            "Nargiza Abdullayeva",
            "NargizaPersonal",
            "Shaxsiy va kundalik tarjimon",
            "Buxoro",
            4,
            27,
            27,
            [
              makeService(
                "trans-5-1",
                "Kundalik va shaxsiy tarjima",
                150000,
                "sahifa",
                "Xatlar, arizalar va shaxsiy yozishmalar.",
                ["Tarjimon guvohnomasi"],
                "translation",
                53,
                false,
                {
                  subCategory: "translation-personal",
                  translationMode: "written",
                  translationSpeed: "oddiy",
                  translationFormat: "PDF",
                  notarization: false,
                  sourceLang: "EN",
                  targetLang: "UZ"
                }
              )
            ],
            false,
            {
              region: "Buxoro",
              languages: ["UZ", "RU", "EN"],
              audiences: ["Talaba", "Ota-ona"],
              achievement: "100+ shaxsiy hujjat tarjimasi.",
              contactPhone: "+998 91 212 33 44",
              contactTelegram: "@nargizapersonal",
              bio: "Nargiza shaxsiy yozishmalar va kundalik hujjatlar bo'yicha tarjima qiladi. U tezkor va aniq xizmat ko'rsatadi."
            }
          )
        ]
      },
      {
        id: "psychology",
        title: "Ruhshunoslik xizmati",
        description: "Psixologik maslahat va terapiya seanslari.",
        agents: [
          makeAgent(
            "psy-1",
            "Nodira Qodirova",
            "NodiraPsy",
            "Oilaviy psixolog",
            "Toshkent",
            8,
            25,
            25,
            [
              makeService(
                "psy-1-1",
                "Oilaviy konsultatsiya",
                350000,
                "seans",
                "Muammolarni aniqlash va yechim topish.",
                ["Psixolog diplomi", "Amaliyot guvohnomasi"],
                "psychology",
                49,
                true
              ),
              makeService(
                "psy-1-2",
                "Stressni boshqarish",
                280000,
                "seans",
                "Individual suhbat va amaliy mashqlar.",
                ["Psixolog diplomi"],
                "psychology",
                50
              )
            ],
            true
          ),
          makeAgent(
            "psy-2",
            "Shohrux Ibragimov",
            "ShohruxCoach",
            "Karyera va motivatsiya coach",
            "Sirdaryo",
            5,
            26,
            26,
            [
              makeService(
                "psy-2-1",
                "Motivatsion seans",
                250000,
                "seans",
                "Maqsad qo'yish va reja tuzish.",
                ["Coach sertifikati"],
                "psychology",
                51
              ),
              makeService(
                "psy-2-2",
                "Karyera diagnostikasi",
                300000,
                "seans",
                "Kasbiy yo'nalishni aniqlash.",
                ["Coach sertifikati"],
                "psychology",
                52
              )
            ]
          )
        ]
      },
      {
        id: "legal",
        title: "Huquqshunos xizmati",
        description: "Yuridik maslahat va hujjatlar tayyorlash.",
        agents: [
          makeAgent(
            "law-1",
            "Farhod Jo'rabek",
            "FarhodLaw",
            "Yuridik maslahatchi",
            "Toshkent",
            12,
            27,
            27,
            [
              makeService(
                "law-1-1",
                "Shartnoma tayyorlash",
                450000,
                "xizmat",
                "Kompaniya va yakka tadbirkorlar uchun.",
                ["Yuridik litsenziya"],
                "legal",
                53,
                true
              ),
              makeService(
                "law-1-2",
                "Sudga tayyorgarlik",
                1800000,
                "xizmat",
                "Huquqiy tahlil va hujjatlar.",
                ["Yuridik litsenziya"],
                "legal",
                54
              )
            ],
            true
          ),
          makeAgent(
            "law-2",
            "Nargiza Yusupova",
            "NargizaLaw",
            "Mehnat huquqi bo'yicha yurist",
            "Qo'qon",
            9,
            28,
            28,
            [
              makeService(
                "law-2-1",
                "Mehnat shartnomalari",
                380000,
                "xizmat",
                "Ish beruvchi va xodimlar uchun.",
                ["Yuridik litsenziya"],
                "legal",
                55
              ),
              makeService(
                "law-2-2",
                "Huquqiy audit",
                950000,
                "audit",
                "Kompaniya hujjatlarini tekshirish.",
                ["Yuridik litsenziya"],
                "legal",
                56
              )
            ]
          )
        ]
      },
      {
        id: "sport",
        title: "Sport bo'yicha trener xizmati",
        description: "Individual va guruh mashg'ulotlari.",
        agents: [
          makeAgent(
            "sport-1",
            "Bekzod Akramov",
            "BekzodFit",
            "Fitness va kuch treneri",
            "Toshkent",
            7,
            29,
            29,
            [
              makeService(
                "sport-1-1",
                "Individual trening",
                200000,
                "seans",
                "Shaxsiy dastur va ovqatlanish rejasi.",
                ["Trener sertifikati", "Sog'liq hujjati"],
                "sport",
                57,
                true
              ),
              makeService(
                "sport-1-2",
                "Guruh mashg'uloti",
                120000,
                "seans",
                "6-8 kishilik guruhlar uchun.",
                ["Trener sertifikati"],
                "sport",
                58
              )
            ],
            true
          ),
          makeAgent(
            "sport-2",
            "Sitora Karimova",
            "SitoraYoga",
            "Yoga va pilates treneri",
            "Toshkent",
            6,
            30,
            30,
            [
              makeService(
                "sport-2-1",
                "Yoga seansi",
                150000,
                "seans",
                "Stressni kamaytirish va moslashuv.",
                ["Yoga sertifikati"],
                "sport",
                59
              ),
              makeService(
                "sport-2-2",
                "Pilates kursi",
                900000,
                "oy",
                "10 ta mashg'ulot paketi.",
                ["Pilates sertifikati"],
                "sport",
                60
              )
            ]
          )
        ]
      }
    ]
  }
];

export type ServiceAgentEntry = ServiceAgent & {
  groupId: ServiceCatalogGroup["id"];
  groupTitle: string;
  categoryId: string;
  categoryTitle: string;
};

export const serviceAgents: ServiceAgentEntry[] = serviceCatalog.flatMap((group) =>
  group.categories.flatMap((category) =>
    category.agents.map((agent) => ({
      ...agent,
      groupId: group.id,
      groupTitle: group.title,
      categoryId: category.id,
      categoryTitle: category.title
    }))
  )
);
