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
};

export type ServiceAgent = {
  id: string;
  name: string;
  nickname: string;
  avatar: ServiceImage;
  specialty: string;
  location: string;
  experienceYears: number;
  vehicleClass?: "comfort" | "business" | "limuzin";
  seatCount?: 4 | 7 | 9 | 13 | 20 | 30 | 40;
  vehicleModel?: string;
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

const makeService = (
  id: string,
  title: string,
  price: number,
  unit: string,
  description: string,
  certificates: string[],
  categoryId: string,
  seed: number,
  canRate = false
): ServiceItem => ({
  id,
  title,
  price,
  currency: "UZS",
  unit,
  description,
  certificates,
  images: getCategoryImages(categoryId),
  createdAt: new Date(2024, 0, 1 + seed).toISOString(),
  usedCount: 120 + seed * 7,
  niceCount: 40 + seed * 3,
  shareCount: 18 + seed * 2,
  rating: Number((4.3 + (seed % 4) * 0.15).toFixed(1)),
  reviewCount: 24 + seed * 2,
  canRate
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
  extras: Partial<Pick<ServiceAgent, "vehicleClass" | "seatCount" | "vehicleModel">> = {}
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
            "Toshkent",
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
            { vehicleClass: "comfort", seatCount: 4, vehicleModel: "Chevrolet Malibu" }
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
            { vehicleClass: "comfort", seatCount: 7, vehicleModel: "Hyundai Staria" }
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
            { vehicleClass: "business", seatCount: 9, vehicleModel: "Toyota Hiace" }
          ),
          makeAgent(
            "taxi-business-2",
            "Mohira Islomova",
            "MohiraBusiness",
            "Konferensiya va delegatsiya tashish",
            "Buxoro",
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
            { vehicleClass: "business", seatCount: 13, vehicleModel: "Mercedes Sprinter" }
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
            { vehicleClass: "limuzin", seatCount: 20, vehicleModel: "Higer Coach" }
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
            { vehicleClass: "limuzin", seatCount: 40, vehicleModel: "Yutong Coach" }
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
        agents: [
          makeAgent(
            "build-1",
            "Bunyod Qodirov",
            "BunyodUsta",
            "Usta va brigada boshligi",
            "Toshkent",
            10,
            7,
            7,
            [
              makeService(
                "build-1-1",
                "Kvartira remonti",
                4500000,
                "loyiha",
                "Dizayn, smeta va sifat nazorati bilan.",
                ["Qurilish litsenziyasi", "Shartnoma"],
                "construction",
                13,
                true
              ),
              makeService(
                "build-1-2",
                "Elektr va santexnika",
                650000,
                "xizmat",
                "Uy va ofis uchun kompleks ishlar.",
                ["Usta guvohnomasi"],
                "construction",
                14
              )
            ],
            true
          ),
          makeAgent(
            "build-2",
            "Murod Bekmurod",
            "MurodBuilder",
            "Fasad va tom ishlari",
            "Buxoro",
            9,
            8,
            8,
            [
              makeService(
                "build-2-1",
                "Tom yopish xizmati",
                2500000,
                "loyiha",
                "Sifatli material va kafolat.",
                ["Qurilish litsenziyasi"],
                "construction",
                15
              ),
              makeService(
                "build-2-2",
                "Fasad bo'yash",
                1200000,
                "loyiha",
                "Yomg'ir va issiqka chidamli bo'yoq.",
                ["Usta guvohnomasi"],
                "construction",
                16
              )
            ]
          )
        ]
      },
      {
        id: "moving",
        title: "Ko'chish va ko'chirish xizmati",
        description: "Uy va ofis ko'chirish, yuklash va tushirish.",
        agents: [
          makeAgent(
            "move-1",
            "Jahongir Saidov",
            "JahongirMove",
            "Uy ko'chirish logistikasi",
            "Toshkent",
            6,
            9,
            9,
            [
              makeService(
                "move-1-1",
                "Uy ko'chirish (ekonom)",
                600000,
                "xizmat",
                "Mebel yig'ish va o'rash xizmati bilan.",
                ["Shartnoma", "Yuk xavfsizligi guvohnomasi"],
                "moving",
                17,
                true
              ),
              makeService(
                "move-1-2",
                "Ofis ko'chirish",
                1200000,
                "xizmat",
                "Tungi ko'chirish va IT jihozlarini himoya qilish.",
                ["Shartnoma", "Yuk xavfsizligi guvohnomasi"],
                "moving",
                18
              )
            ],
            true
          ),
          makeAgent(
            "move-2",
            "Doston Rahimov",
            "DostonCargo",
            "Yirik yuklar transporti",
            "Andijon",
            7,
            10,
            10,
            [
              makeService(
                "move-2-1",
                "Katta texnika ko'chirish",
                950000,
                "xizmat",
                "Maxsus qadoqlash va ko'tarish texnikasi bilan.",
                ["Yuk tashish litsenziyasi"],
                "moving",
                19
              ),
              makeService(
                "move-2-2",
                "Mahalliy yuk tashish",
                350000,
                "xizmat",
                "Samarali marshrut va vaqtni tejash.",
                ["Yuk tashish litsenziyasi"],
                "moving",
                20
              )
            ]
          )
        ]
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
              makeService(
                "clean-1-1",
                "General tozalash",
                320000,
                "xizmat",
                "Kimyoviy tozalash va dezinfeksiya.",
                ["Sanitar kitobcha"],
                "cleaning",
                21,
                true
              ),
              makeService(
                "clean-1-2",
                "Ofis tozalash (oylik)",
                1200000,
                "oy",
                "Haftalik reja va doimiy nazorat.",
                ["Sanitar kitobcha", "Shartnoma"],
                "cleaning",
                22
              )
            ],
            true
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
              makeService(
                "clean-2-1",
                "Mehmonxona xonalari tozaligi",
                400000,
                "xizmat",
                "Qat'iy standartlar bo'yicha xizmat.",
                ["Sanitar kitobcha"],
                "cleaning",
                23
              ),
              makeService(
                "clean-2-2",
                "Deraza va fasad tozalash",
                500000,
                "xizmat",
                "Maxsus jihozlar bilan tozalash.",
                ["Xavfsizlik sertifikati"],
                "cleaning",
                24
              )
            ]
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
            "Mohinur Norqobil",
            "MohinurNanny",
            "Enagalik va bolalar rivoji",
            "Toshkent",
            6,
            13,
            13,
            [
              makeService(
                "nanny-1-1",
                "Kunlik enaga",
                180000,
                "kun",
                "Ovqatlantirish, o'yin va xavfsizlik nazorati.",
                ["Pedagogik diplom", "Tibbiy ma'lumotnoma"],
                "nanny",
                25,
                true
              ),
              makeService(
                "nanny-1-2",
                "Kecha-kunduz enaga",
                320000,
                "kun",
                "Uyda doimiy parvarish va tartib.",
                ["Pedagogik diplom", "Tibbiy ma'lumotnoma"],
                "nanny",
                26
              )
            ],
            true
          ),
          makeAgent(
            "nanny-2",
            "Aziza Yakubova",
            "AzizaNanny",
            "Kichik yoshdagi bolalar tarbiyasi",
            "Qarshi",
            4,
            14,
            14,
            [
              makeService(
                "nanny-2-1",
                "Bog'cha yoshidagi bolalar",
                150000,
                "kun",
                "Rivojlantiruvchi mashg'ulotlar bilan.",
                ["Pedagogik diplom"],
                "nanny",
                27
              ),
              makeService(
                "nanny-2-2",
                "Chaqaloqlar parvarishi",
                200000,
                "kun",
                "Gigiyena va ovqatlantirish rejasi.",
                ["Tibbiy ma'lumotnoma"],
                "nanny",
                28
              )
            ]
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
            true
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
            ]
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
                true
              ),
              makeService(
                "cons-1-2",
                "Startap mentorlik",
                1500000,
                "oy",
                "Haftalik uchrashuvlar va investor pitch.",
                ["MBA diplomi"],
                "consulting",
                42
              )
            ],
            true
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
                43
              ),
              makeService(
                "cons-2-2",
                "SMM audit",
                650000,
                "audit",
                "Kontent va reklama auditlari.",
                ["Marketing sertifikati"],
                "consulting",
                44
              )
            ]
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
            "Ingliz-rus tarjimon",
            "Toshkent",
            9,
            23,
            23,
            [
              makeService(
                "trans-1-1",
                "Hujjat tarjimasi",
                90000,
                "bet",
                "Notarial tasdiqlashga tayyor tarjima.",
                ["Tarjimon guvohnomasi"],
                "translation",
                45,
                true
              ),
              makeService(
                "trans-1-2",
                "Sinxron tarjima",
                1200000,
                "soat",
                "Konferensiya va uchrashuvlar uchun.",
                ["Tarjimon guvohnomasi"],
                "translation",
                46
              )
            ],
            true
          ),
          makeAgent(
            "trans-2",
            "Malohat Alimuhamed",
            "MalohatLingua",
            "Turk va ingliz tili tarjimoni",
            "Navoiy",
            6,
            24,
            24,
            [
              makeService(
                "trans-2-1",
                "Texnik tarjima",
                110000,
                "bet",
                "Texnik hujjatlar va yo'riqnoma.",
                ["Tarjimon guvohnomasi"],
                "translation",
                47
              ),
              makeService(
                "trans-2-2",
                "Biznes yozishmalar tarjimasi",
                75000,
                "bet",
                "Rasmiy uslubda tarjima.",
                ["Tarjimon guvohnomasi"],
                "translation",
                48
              )
            ]
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
