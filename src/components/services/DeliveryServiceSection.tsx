"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

type TranslatedText = { en: string; uz: string; ru: string; ko: string };

type AgentCard = {
  name: string;
  role: TranslatedText;
  route: TranslatedText;
  rating: string;
  jobs: string;
  price: TranslatedText;
  image: string;
  tags: TranslatedText[];
  kind: "local" | "international";
  createdAt: string;
  details: {
    transport: TranslatedText;
    capacity: TranslatedText;
    deliveryType: TranslatedText;
    verified: TranslatedText[];
  };
};

const tr = (en: string, uz: string, ru: string, ko: string): TranslatedText => ({
  en,
  uz,
  ru,
  ko
});

const includesAny = (value: TranslatedText, keywords: string[]) => {
  const parts = [value.en, value.uz, value.ru, value.ko].map((text) => text.toLowerCase());
  return keywords.some((keyword) => parts.some((text) => text.includes(keyword)));
};

const includesAnyInArray = (values: TranslatedText[], keywords: string[]) =>
  values.some((value) => includesAny(value, keywords));

const localAgents: AgentCard[] = [
  {
    name: "Aziza Karimova",
    role: tr("Local express courier", "Mahalliy express kuryer", "Местный экспресс-курьер", "현지 익스프레스 배달원"),
    route: tr("Tashkent → Andijan", "Toshkent -> Andijon", "Ташкент → Андижан", "타슈кент → 안디жан"),
    rating: "4.9",
    jobs: "1,248",
    price: tr("18,000 UZS", "18 000 so'm", "18 000 сум", "18,000 сум"),
    image: "/services/delivery/07.jpg",
    tags: [
      tr("Face ID", "Face ID", "Face ID", "Face ID"),
      tr("Car: 10A123BC", "Avto: 10A123BC", "Авто: 10A123BC", "차량: 10A123BC"),
      tr("24/7 mode", "24/7 rejim", "режим 24/7", "24/7 режим")
    ],
    kind: "local",
    createdAt: "2024-12-10",
    details: {
      transport: tr("Sedan", "Yengil avtomobil", "Легковой автомобиль", "승용차"),
      capacity: tr("0-50 kg", "0-50 kg", "0-50 кг", "0-50 кг"),
      deliveryType: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      verified: [
        tr("Face ID", "Face ID", "Face ID", "Face ID"),
        tr("SMS code", "SMS kod", "SMS код", "SMS 코드"),
        tr("Car plate", "Avto raqam", "Номер авто", "차량 번호")
      ]
    }
  },
  {
    name: "Dilshod Murodov",
    role: tr("Local eco courier", "Mahalliy eko kuryer", "Местный эко-курьер", "현지 친환경 배달원"),
    route: tr("Samarkand ↔ Bukhara", "Samarqand <-> Buxoro", "Самарканд ↔ Бухара", "사마르칸트 ↔ 부하라"),
    rating: "4.7",
    jobs: "782",
    price: tr("12,000 UZS", "12 000 so'm", "12 000 сум", "12,000 сум"),
    image: "/services/delivery/15.jpg",
    tags: [
      tr("Bike courier", "Velokuryer", "Велокурьер", "자전거 배달원"),
      tr("Fast", "Tezkor", "Быстро", "빠름"),
      tr("Face ID", "Face ID", "Face ID", "Face ID")
    ],
    kind: "local",
    createdAt: "2024-11-22",
    details: {
      transport: tr("Bicycle", "Velokuryer", "Велокурьер", "자전거"),
      capacity: tr("0-15 kg", "0-15 kg", "0-15 кг", "0-15 кг"),
      deliveryType: tr("Within city", "Shahar ichida", "В пределах города", "도시 내"),
      verified: [
        tr("Face ID", "Face ID", "Face ID", "Face ID"),
        tr("Phone verification", "Telefon tasdiq", "Подтверждение телефона", "전화 확인")
      ]
    }
  },
  {
    name: "Malika Sobirova",
    role: tr("Local intercity agent", "Mahalliy shaharlararo agent", "Местный межгородской агент", "현지 도시간 에이전트"),
    route: tr("Fergana → Namangan", "Farg'ona -> Namangan", "Фергана → Наманган", "페르가나 → 나만간"),
    rating: "4.8",
    jobs: "954",
    price: tr("15,000 UZS", "15 000 so'm", "15 000 сум", "15,000 сум"),
    image: "/services/delivery/19.jpg",
    tags: [
      tr("Car: 40B778AA", "Avto: 40B778AA", "Авто: 40B778AA", "차량: 40B778AA"),
      tr("SMS code", "SMS kod", "SMS код", "SMS 코드"),
      tr("Fast", "Tezkor", "Быстро", "빠름")
    ],
    kind: "local",
    createdAt: "2025-01-08",
    details: {
      transport: tr("Sedan", "Yengil avtomobil", "Легковой автомобиль", "승용차"),
      capacity: tr("0-80 kg", "0-80 kg", "0-80 кг", "0-80 кг"),
      deliveryType: tr("Between regions", "Viloyatlar orasida", "Между регионами", "지역 간"),
      verified: [
        tr("SMS code", "SMS kod", "SMS код", "SMS 코드"),
        tr("Car plate", "Avto raqam", "Номер авто", "차량 번호"),
        tr("Document", "Hujjat", "Документ", "서류")
      ]
    }
  },
  {
    name: "Umidjon Raximov",
    role: tr("Local freight agent", "Mahalliy yuk tashish agenti", "Местный грузовой агент", "현지 화물 에이전트"),
    route: tr("Nukus → Urgench", "Nukus -> Urganch", "Нукус → Ургенч", "누쿠스 → ур겐치"),
    rating: "4.6",
    jobs: "611",
    price: tr("25,000 UZS", "25 000 so'm", "25 000 сум", "25,000 сум"),
    image: "/services/delivery/22.jpg",
    tags: [
      tr("Freight", "Yuk tashish", "Грузоперевозка", "화물 운송"),
      tr("SMS code", "SMS kod", "SMS код", "SMS 코드"),
      tr("Car: 95K330AA", "Avto: 95K330AA", "Авто: 95K330AA", "차량: 95K330AA")
    ],
    kind: "local",
    createdAt: "2024-10-18",
    details: {
      transport: tr("Cargo van", "Yuk furgoni", "Грузовой фургон", "화물 밴"),
      capacity: tr("30-200 kg", "30-200 kg", "30-200 кг", "30-200 кг"),
      deliveryType: tr("Between regions", "Viloyatlar orasida", "Между регионами", "지역 간"),
      verified: [
        tr("SMS code", "SMS kod", "SMS код", "SMS 코드"),
        tr("Document", "Hujjat", "Документ", "서류")
      ]
    }
  },
  {
    name: "Nilufar Tursunova",
    role: tr("Local fast courier", "Mahalliy tezkor kuryer", "Местный быстрый курьер", "현지 빠른 배달원"),
    route: tr("Tashkent → Jizzakh", "Toshkent -> Jizzax", "Ташкент → Джизак", "타슈кент → 지자흐"),
    rating: "4.9",
    jobs: "1,102",
    price: tr("20,000 UZS", "20 000 so'm", "20 000 сум", "20,000 сум"),
    image: "/services/delivery/26.jpg",
    tags: [
      tr("Fast", "Tezkor", "Быстро", "빠름"),
      tr("Face ID", "Face ID", "Face ID", "Face ID"),
      tr("Car: 01M555NA", "Avto: 01M555NA", "Авто: 01M555NA", "차량: 01M555NA")
    ],
    kind: "local",
    createdAt: "2025-02-03",
    details: {
      transport: tr("Sedan", "Yengil avtomobil", "Легковой автомобиль", "승용차"),
      capacity: tr("0-60 kg", "0-60 kg", "0-60 кг", "0-60 кг"),
      deliveryType: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      verified: [
        tr("Face ID", "Face ID", "Face ID", "Face ID"),
        tr("Car plate", "Avto raqam", "Номер авто", "차량 번호")
      ]
    }
  }
];

const internationalAgents: AgentCard[] = [
  {
    name: "Park Ji-hoon",
    role: tr("International door-to-door", "Xalqaro eshikdan eshikgacha", "Международная дверь-дверь", "국제 문-문"),
    route: tr("Seoul → Tashkent", "Seul -> Toshkent", "Сеул → Ташкент", "서울 → 타슈кент"),
    rating: "4.8",
    jobs: "436",
    price: tr("$6 per kg", "kg uchun $6", "$6 за кг", "kg당 $6"),
    image: "/services/delivery/24.jpg",
    tags: [
      tr("Airport", "Aeroport", "Аэропорт", "공항"),
      tr("3-20 kg", "3-20 kg", "3-20 кг", "3-20 кг"),
      tr("Electronics", "Elektronika", "Электроника", "전자제품")
    ],
    kind: "international",
    createdAt: "2025-01-16",
    details: {
      transport: tr("Air cargo", "Aviayuk", "Авиагруз", "항공 화물"),
      capacity: tr("3-20 kg", "3-20 kg", "3-20 кг", "3-20 кг"),
      deliveryType: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      verified: [
        tr("Passport", "Pasport", "Паспорт", "여권"),
        tr("Face ID", "Face ID", "Face ID", "Face ID"),
        tr("Customs", "Bojxona", "Таможня", "세관")
      ]
    }
  },
  {
    name: "Aigerim Kenzhe",
    role: tr("International to airport", "Xalqaro aeroportgacha", "Международная до аэропорта", "국제 공항까지"),
    route: tr("Almaty → Tashkent", "Almata -> Toshkent", "Алматы → Ташкент", "알마티 → 타슈кент"),
    rating: "4.6",
    jobs: "289",
    price: tr("$4 per kg", "kg uchun $4", "$4 за кг", "kg당 $4"),
    image: "/services/delivery/28.jpg",
    tags: [
      tr("Airport", "Aeroport", "Аэропорт", "공항"),
      tr("1-15 kg", "1-15 kg", "1-15 кг", "1-15 кг"),
      tr("Documents", "Hujjatlar", "Документы", "서류")
    ],
    kind: "international",
    createdAt: "2024-09-05",
    details: {
      transport: tr("Air cargo", "Aviayuk", "Авиагруз", "항공 화물"),
      capacity: tr("1-15 kg", "1-15 kg", "1-15 кг", "1-15 кг"),
      deliveryType: tr("To airport", "Aeroportgacha", "До аэропорта", "공항까지"),
      verified: [
        tr("Passport", "Pasport", "Паспорт", "여권"),
        tr("Document", "Hujjat", "Документ", "서류")
      ]
    }
  },
  {
    name: "Said Aliyev",
    role: tr("International door-to-door", "Xalqaro eshikdan eshikgacha", "Международная дверь-дверь", "국제 문-문"),
    route: tr("Istanbul → Samarkand", "Istanbul -> Samarqand", "Стамбул → Самарканд", "이스탄불 → 사마르칸트"),
    rating: "4.9",
    jobs: "512",
    price: tr("$7 per kg", "kg uchun $7", "$7 за кг", "kg당 $7"),
    image: "/services/delivery/33.jpg",
    tags: [
      tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      tr("2-25 kg", "2-25 kg", "2-25 кг", "2-25 кг"),
      tr("Home appliances", "Maishiy texnika", "Бытовая техника", "가전제품")
    ],
    kind: "international",
    createdAt: "2025-02-01",
    details: {
      transport: tr("Air cargo + courier", "Aviayuk + kur'er", "Авиагруз + курьер", "항공 화물 + 배달"),
      capacity: tr("2-25 kg", "2-25 kg", "2-25 кг", "2-25 кг"),
      deliveryType: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      verified: [
        tr("Passport", "Pasport", "Паспорт", "여권"),
        tr("Face ID", "Face ID", "Face ID", "Face ID"),
        tr("Customs", "Bojxona", "Таможня", "세관")
      ]
    }
  },
  {
    name: "Yuna Choi",
    role: tr("International express agent", "Xalqaro tezkor agent", "Международный быстрый агент", "국제 익스프레스 에이전트"),
    route: tr("Busan → Tashkent", "Busan -> Toshkent", "Пусан → Ташкент", "부산 → 타슈кент"),
    rating: "4.7",
    jobs: "378",
    price: tr("$5 per kg", "kg uchun $5", "$5 за кг", "kg당 $5"),
    image: "/services/delivery/31.jpg",
    tags: [
      tr("Fast", "Tezkor", "Быстро", "빠름"),
      tr("Airport", "Aeroport", "Аэропорт", "공항"),
      tr("3-18 kg", "3-18 kg", "3-18 кг", "3-18 кг")
    ],
    kind: "international",
    createdAt: "2024-12-02",
    details: {
      transport: tr("Air cargo", "Aviayuk", "Авиагруз", "항공 화물"),
      capacity: tr("3-18 kg", "3-18 kg", "3-18 кг", "3-18 кг"),
      deliveryType: tr("To airport", "Aeroportgacha", "До аэропорта", "공항까지"),
      verified: [
        tr("Passport", "Pasport", "Паспорт", "여권"),
        tr("Customs", "Bojxona", "Таможня", "세관")
      ]
    }
  },
  {
    name: "Bunyod Ergashev",
    role: tr("International parcel", "Xalqaro posilka", "Международная посылка", "국제 소포"),
    route: tr("Dubai → Tashkent", "Dubay -> Toshkent", "Дубай → Ташкент", "두바이 → 타슈кент"),
    rating: "4.5",
    jobs: "264",
    price: tr("$6 per kg", "kg uchun $6", "$6 за кг", "kg당 $6"),
    image: "/services/delivery/35.jpg",
    tags: [
      tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      tr("5-30 kg", "5-30 kg", "5-30 кг", "5-30 кг"),
      tr("Branded goods", "Brend mahsulot", "Брендовые товары", "브랜드 제품")
    ],
    kind: "international",
    createdAt: "2024-08-14",
    details: {
      transport: tr("Air cargo", "Aviayuk", "Авиагруз", "항공 화물"),
      capacity: tr("5-30 kg", "5-30 kg", "5-30 кг", "5-30 кг"),
      deliveryType: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문"),
      verified: [
        tr("Passport", "Pasport", "Паспорт", "여권"),
        tr("Document", "Hujjat", "Документ", "서류")
      ]
    }
  }
];

const verificationSteps: Array<{ title: TranslatedText; desc: TranslatedText }> = [
  {
    title: tr("Agent onboarding request", "Agentlikka o'tish so'rovi", "Запрос на подключение агента", "에이전트 신청"),
    desc: tr(
      "Phone, email, personal photo, home address, and Face ID are submitted.",
      "Telefon, @mail, shaxsiy rasm, uy manzili va Face ID yuboriladi.",
      "Отправляются телефон, email, личное фото, адрес и Face ID.",
      "전화, 이메일, личное фото, 주소, Face ID 제출."
    )
  },
  {
    title: tr("Admin review", "Admin tekshiruvi", "Проверка админом", "관리자 검토"),
    desc: tr(
      "Approved within 1 minute if documents and face match.",
      "Hujjatlar va yuz tasdig'i mos bo'lsa 1 daqiqada tasdiqlanadi.",
      "Если документы и лицо совпадают — подтверждение за 1 минуту.",
      "서류와 얼굴이 일치하면 1분 내 승인."
    )
  },
  {
    title: tr("1–2 minute monitoring", "1-2 daqiqalik monitoring", "Мониторинг 1–2 минуты", "1–2분 모니터링"),
    desc: tr(
      "If status doesn't change, user gets a contact admin notice.",
      "Maqom o'zgarmasa, foydalanuvchiga admin bilan bog'lanish xabari yuboriladi.",
      "Если статус не меняется, пользователю приходит сообщение связаться с админом.",
      "상태가 바뀌지 않으면 관리자에게 문의 알림."
    )
  },
  {
    title: tr("Agent types", "Agent turlari", "Типы агентов", "에이전트 유형"),
    desc: tr(
      "Special requirements apply per type (local/international).",
      "Har bir tur uchun maxsus talablar (mahalliy/xalqaro) qo'llanadi.",
      "Для каждого типа действуют особые требования (местный/международный).",
      "유형별 요구사항 적용 (현지/국제)."
    )
  }
];

const controlItems: Array<{ title: TranslatedText; desc: TranslatedText }> = [
  {
    title: tr("Statuses and management", "Statuslar va boshqaruv", "Статусы и управление", "상태 및 관리"),
    desc: tr(
      "Admin switches agent to active, block, deleted and changes type.",
      "Admin agentni active, block, deleted holatlariga o'tkazadi va turini o'zgartiradi.",
      "Админ переводит агента в active/block/deleted и меняет тип.",
      "관리자가 active/block/deleted 전환 및 유형 변경."
    )
  },
  {
    title: tr("Communication window", "Muloqot oynasi", "Окно общения", "소통 창"),
    desc: tr(
      "After approval, a chat opens and safety notice appears.",
      "Agent tasdiqlansa, Kerrot kabi chat ochiladi va xavfsizlik ogohlantirishi ko'rinadi.",
      "После подтверждения открывается чат и показывается предупреждение о безопасности.",
      "승인 후 чат이 열리고 보안 안내가 표시됩니다."
    )
  },
  {
    title: tr("Secure payments", "Ishonchli to'lov", "Безопасная оплата", "안전 결제"),
    desc: tr(
      "Payment is held by the platform and released after completion.",
      "To'lov loyihaning hisobida saqlanadi, xizmat bajarilgach agentga o'tkaziladi.",
      "Оплата хранится на платформе и переводится после выполнения.",
      "결제는 플랫폼에 보관되며 완료 후 전달됩니다."
    )
  }
];

const filters: Array<{ id: string; label: TranslatedText }> = [
  { id: "top", label: tr("Top rated", "Eng yuqori baho", "Высокий рейтинг", "상위 평점") },
  { id: "fast", label: tr("Fast delivery", "Tezkor yetkazish", "Быстрая доставка", "빠른 доставка") },
  { id: "local", label: tr("Local", "Mahalliy", "Местные", "현지") },
  { id: "international", label: tr("International", "Xalqaro", "Международные", "국제") },
  { id: "weight-3-20", label: tr("3-20 kg", "3-20 kg", "3-20 кг", "3-20 кг") },
  { id: "door", label: tr("Door-to-door", "Eshikdan eshikgacha", "Дверь-дверь", "문-문") },
  { id: "airport", label: tr("To airport", "Aeroportgacha", "До аэропорта", "공항까지") }
];

export function DeliveryServiceSection() {
  const { t } = useI18n();
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
      setNotice(
        t({
          en: "Please sign up or log in to use the service.",
          uz: "Xizmatdan foydalanish uchun ro'yxatdan o'ting yoki login qiling.",
          ru: "Зарегистрируйтесь или войдите, чтобы воспользоваться сервисом.",
          ko: "서비스를 이용하려면 가입하거나 로그인하세요."
        })
      );
      return;
    }
    setNotice(
      t({
        en: "Request sent. Payment will be confirmed after completion.",
        uz: "So'rov yuborildi. To'lov xizmat yakunlangach tasdiqlanadi.",
        ru: "Запрос отправлен. Оплата подтверждается после выполнения.",
        ko: "요청이 отправлено. 완료 후 결제가 подтверж됩니다."
      })
    );
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice(
        t({
          en: "Please sign up or log in to chat.",
          uz: "Xabarlashish uchun ro'yxatdan o'ting yoki login qiling.",
          ru: "Зарегистрируйтесь или войдите для чата.",
          ko: "채팅하려면 가입하거나 로그인하세요."
        })
      );
      return;
    }
    setShowChat(true);
    setShowDispute(false);
    setNotice(null);
  };

  const handleOpenDispute = () => {
    if (!isAuthenticated) {
      setNotice(
        t({
          en: "Please sign up or log in to open a dispute.",
          uz: "Nizo ochish uchun ro'yxatdan o'ting yoki login qiling.",
          ru: "Зарегистрируйтесь или войдите, чтобы открыть спор.",
          ko: "분쟁을 열려면 가입하거나 로그인하세요."
        })
      );
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
      const fast = includesAnyInArray(agent.tags, ["tezkor", "fast", "экспресс", "быстро", "빠른", "빠름"]) ||
        includesAny(agent.role, ["express", "tezkor", "экспресс", "быстро", "빠른"]);
      if (!fast) return false;
    }

    if (activeFilters.includes("weight-3-20")) {
      const range = parseRange(agent.details.capacity.uz);
      if (!range || range.min > 20 || range.max < 3) return false;
    }

    if (
      activeFilters.includes("door") &&
      !includesAny(agent.details.deliveryType, ["eshik", "door", "двер", "문"])
    ) {
      return false;
    }

    if (
      activeFilters.includes("airport") &&
      !includesAny(agent.details.deliveryType, ["aeroport", "airport", "аэропорт", "공항"])
    ) {
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
  const chatTemplates: TranslatedText[] = [
    {
      en: "Please clarify the price.",
      uz: "Narxni aniqlashtirib bering.",
      ru: "Уточните цену, пожалуйста.",
      ko: "가격을 уточ해 주세요."
    },
    {
      en: "How many days is delivery?",
      uz: "Yetkazish muddati nechchi kun?",
      ru: "Сколько дней доставка?",
      ko: "배송 срок은 며칠인가요?"
    },
    {
      en: "Do you offer door-to-door service?",
      uz: "Eshikdan eshikgacha xizmat bormi?",
      ru: "Есть ли услуга дверь-дверь?",
      ko: "문-문 서비스가 있나요?"
    },
    {
      en: "Are there prohibited cargo types?",
      uz: "Qabul qilinmaydigan yuk turlari bormi?",
      ru: "Есть ли запрещенные типы груза?",
      ko: "제한되는 화물 종류가 있나요?"
    }
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
              <div key={step.title.uz} className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-100">
                  0{index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{t(step.title)}</p>
                  <p className="text-xs text-slate-400">{t(step.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-emerald-50">Nazorat va ishonch</h2>
          <div className="mt-4 grid gap-4">
            {controlItems.map((item) => (
              <div key={item.title.uz} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-slate-100">{t(item.title)}</p>
                <p className="mt-2 text-xs text-slate-400">{t(item.desc)}</p>
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
                {t(filter.label)}
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
                    className="group flex h-[360px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 transition hover:-translate-y-1 hover:border-emerald-500/40"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-emerald-200">{t(agent.role)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>📍 {t(agent.route)}</span>
                        <span>⭐ {agent.rating}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                        <span>💰 {t(agent.price)}</span>
                        <span>🧾 {agent.jobs}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.slice(0, 3).map((tag, idx) => (
                          <span key={`${agent.name}-${idx}`} className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
                            {t(tag)}
                          </span>
                        ))}
                        {agent.tags.length > 3 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
                            +{agent.tags.length - 3}
                          </span>
                        )}
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
                          👁
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
                          ✅
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
                    className="group flex h-[360px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 transition hover:-translate-y-1 hover:border-amber-400/40"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-amber-200">{t(agent.role)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>📍 {t(agent.route)}</span>
                        <span>⭐ {agent.rating}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                        <span>💰 {t(agent.price)}</span>
                        <span>🧾 {agent.jobs}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.slice(0, 3).map((tag, idx) => (
                          <span key={`${agent.name}-${idx}`} className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
                            {t(tag)}
                          </span>
                        ))}
                        {agent.tags.length > 3 && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
                            +{agent.tags.length - 3}
                          </span>
                        )}
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
                          👁
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
                          ✅
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
                <p className="text-sm text-slate-400">{t(selectedAgent.role)}</p>
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
                    <span className="text-slate-100">{t(selectedAgent.route)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Narx</span>
                    <span className="text-emerald-200">{t(selectedAgent.price)}</span>
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
                {selectedAgent.tags.map((tag, idx) => (
                  <span key={`${selectedAgent.name}-tag-${idx}`} className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                    {t(tag)}
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
                      <span className="text-slate-100">{t(selectedAgent.details.transport)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sig'im</span>
                      <span className="text-slate-100">{t(selectedAgent.details.capacity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Yetkazish turi</span>
                      <span className="text-slate-100">{t(selectedAgent.details.deliveryType)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAgent.details.verified.map((item, idx) => (
                      <span key={`${selectedAgent.name}-${idx}`} className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-200">
                        {t(item)}
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
                          key={template.uz}
                          type="button"
                          onClick={() => setMessageDraft(t(template))}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300"
                        >
                          {t(template)}
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
