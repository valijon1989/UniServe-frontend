export type JobKind = "permanent" | "temporary";

export type LocalizedText = { en: string; uz: string; ru: string; ko: string };

export type JobListing = {
  id: string;
  image: string;
  title: LocalizedText;
  company: LocalizedText;
  location: LocalizedText;
  distanceKm: number;
  schedule: LocalizedText;
  salary: LocalizedText;
  jobType: LocalizedText;
  housing: LocalizedText;
  meals: LocalizedText;
  requirements: string[];
  visaTypes: string[];
  contactPhone?: string;
  contactTelegram?: string;
  chatUrl?: string;
  kind: JobKind;
  postedAt: string;
};

export const tx = (en: string, uz: string, ru: string, ko: string): LocalizedText => ({
  en,
  uz,
  ru,
  ko
});

export const initialJobListings: JobListing[] = [
  {
    id: "perm-1",
    image: "/services/employment/01.jpg",
    title: tx("Korean factory: assembler", "Koreya zavodi: yig'uvchilik", "Корейский завод: сборщик", "한국 공장: 조립원"),
    company: tx("Goyang Electronics", "Goyang Electronics", "Goyang Electronics", "Goyang Electronics"),
    location: tx("Goyang, South Korea", "Goyang, Janubiy Koreya", "Гоян, Южная Корея", "고양, 대한민국"),
    distanceKm: 6.2,
    schedule: tx("08:00 - 18:00, 6/1", "08:00 - 18:00, 6/1", "08:00 - 18:00, 6/1", "08:00 - 18:00, 6/1"),
    salary: tx("2,300,000 UZS per month", "oyiga 2 300 000 so'm", "2 300 000 сум в месяц", "월 2,300,000 쏨"),
    jobType: tx("Factory, shifts", "Zavod, smenali", "Завод, смены", "공장, 교대근무"),
    housing: tx("Dorm provided", "Yotoqxona bor", "Общежитие предоставлено", "숙소 제공"),
    meals: tx("Meals: 2 times per day", "Ovqat: 2 mahal", "Питание: 2 раза в день", "식사: 하루 2회"),
    requirements: ["18-45 yosh", "Sog'liqdan o'tgan", "Jamoada ishlash"],
    visaTypes: ["E-9", "H-2", "D-4"],
    contactPhone: "+82 10 2345 6789",
    contactTelegram: "@korea_jobs_hr",
    chatUrl: "/chat?job=perm-1",
    kind: "permanent",
    postedAt: "2025-02-12"
  },
  {
    id: "perm-2",
    image: "/services/employment/02.jpg",
    title: tx("Logistics center operator", "Logistika markazi: operator", "Оператор логистического центра", "물류 센터 오퍼레이터"),
    company: tx("Incheon Logistic Hub", "Incheon Logistic Hub", "Incheon Logistic Hub", "Incheon Logistic Hub"),
    location: tx("Incheon, South Korea", "Incheon, Janubiy Koreya", "Инчхон, Южная Корея", "인천, 대한민국"),
    distanceKm: 12.4,
    schedule: tx("09:00 - 19:00, 5/2", "09:00 - 19:00, 5/2", "09:00 - 19:00, 5/2", "09:00 - 19:00, 5/2"),
    salary: tx("2,700,000 UZS per month", "oyiga 2 700 000 so'm", "2 700 000 сум в месяц", "월 2,700,000 쏨"),
    jobType: tx("Warehouse, permanent", "Ombor, doimiy", "Склад, постоянная", "창고, 정규직"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежитие отсутствует", "기숙사 없음"),
    meals: tx("Meals: 1 time", "Ovqat: 1 mahal", "Питание: 1 раз", "식사: 하루 1회"),
    requirements: ["Minimal ingliz tili", "Kompyuter savodxonligi"],
    visaTypes: ["E-7", "H-2"],
    contactPhone: "+82 10 9876 3210",
    contactTelegram: "@incheon_hr",
    chatUrl: "/chat?job=perm-2",
    kind: "permanent",
    postedAt: "2025-02-09"
  },
  {
    id: "perm-3",
    image: "/services/employment/03.jpg",
    title: tx("Construction crew: rebar fixer", "Qurilish brigadasi: armaturachi", "Стройбригада: арматурщик", "건설팀: 철근공"),
    company: tx("Busan Build", "Busan Build", "Busan Build", "Busan Build"),
    location: tx("Busan, South Korea", "Busan, Janubiy Koreya", "Пусан, Южная Корея", "부산, 대한민국"),
    distanceKm: 4.8,
    schedule: tx("07:30 - 17:30, 6/1", "07:30 - 17:30, 6/1", "07:30 - 17:30, 6/1", "07:30 - 17:30, 6/1"),
    salary: tx("3,100,000 UZS per month", "oyiga 3 100 000 so'm", "3 100 000 сум в месяц", "월 3,100,000 쏨"),
    jobType: tx("Construction, permanent", "Qurilish, doimiy", "Строительство, постоянная", "건설, 정규직"),
    housing: tx("Dorm provided", "Yotoqxona bor", "Общежитие предоставлено", "기숙사 제공"),
    meals: tx("Meals: 3 times", "Ovqat: 3 mahal", "Питание: 3 раза", "식사: 하루 3회"),
    requirements: ["Tajriba 1 yil+", "Jismoniy tayyorgarlik"],
    visaTypes: ["E-9", "H-2"],
    contactPhone: "+82 10 7654 1122",
    contactTelegram: "@busan_build",
    chatUrl: "/chat?job=perm-3",
    kind: "permanent",
    postedAt: "2025-02-05"
  },
  {
    id: "perm-4",
    image: "/services/employment/07.jpg",
    title: tx("Korean plant: packaging operator", "Koreya zavodi: qadoqlash operatori", "Корейский завод: упаковщик", "한국 공장: 포장 작업자"),
    company: tx("Daegu Food Tech", "Daegu Food Tech", "Daegu Food Tech", "Daegu Food Tech"),
    location: tx("Daegu, South Korea", "Daegu, Janubiy Koreya", "Тэгу, Южная Корея", "대구, 대한민국"),
    distanceKm: 8.9,
    schedule: tx("08:30 - 18:30, 6/1", "08:30 - 18:30, 6/1", "08:30 - 18:30, 6/1", "08:30 - 18:30, 6/1"),
    salary: tx("2,450,000 UZS per month", "oyiga 2 450 000 so'm", "2 450 000 сум в месяц", "월 2,450,000 쏨"),
    jobType: tx("Factory, permanent", "Zavod, doimiy", "Завод, постоянная", "공장, 정규직"),
    housing: tx("Dorm provided", "Yotoqxona bor", "Общежитие предоставлено", "기숙사 제공"),
    meals: tx("Meals: 2 per day", "Ovqat: 2 mahal", "Питание: 2 раза в день", "식사: 하루 2회"),
    requirements: ["Diqqat-e'tibor", "Sog'liqdan o'tgan"],
    visaTypes: ["E-9", "H-2"],
    contactPhone: "+82 10 5566 7788",
    contactTelegram: "@daegu_foodtech",
    chatUrl: "/chat?job=perm-4",
    kind: "permanent",
    postedAt: "2025-02-03"
  },
  {
    id: "perm-5",
    image: "/services/employment/08.jpg",
    title: tx("Technical service: machine operator", "Texnik xizmat: stanok operatori", "Техническое обслуживание: оператор станка", "기술 서비스: 기계 조작자"),
    company: tx("Seoul Metal Works", "Seoul Metal Works", "Seoul Metal Works", "Seoul Metal Works"),
    location: tx("Seoul, South Korea", "Seoul, Janubiy Koreya", "Сеул, Южная Корея", "서울, 대한민국"),
    distanceKm: 15.2,
    schedule: tx("07:00 - 16:00, 5/2", "07:00 - 16:00, 5/2", "07:00 - 16:00, 5/2", "07:00 - 16:00, 5/2"),
    salary: tx("2,900,000 UZS per month", "oyiga 2 900 000 so'm", "2 900 000 сум в месяц", "월 2,900,000 쏨"),
    jobType: tx("Manufacturing, permanent", "Ishlab chiqarish, doimiy", "Производство, постоянная", "제조, 정규직"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежитие отсутствует", "기숙사 없음"),
    meals: tx("Meals: 1 time", "Ovqat: 1 mahal", "Питание: 1 раз", "식사: 하루 1회"),
    requirements: ["Tajriba 1 yil+", "Texnika xavfsizligi"],
    visaTypes: ["E-7", "H-2"],
    contactPhone: "+82 10 4455 6677",
    contactTelegram: "@seoul_metal",
    chatUrl: "/chat?job=perm-5",
    kind: "permanent",
    postedAt: "2025-01-30"
  },
  {
    id: "perm-6",
    image: "/services/employment/09.jpg",
    title: tx("Agriculture: greenhouse worker", "Qishloq xo'jaligi: issiqxona ishchisi", "Сельское хозяйство: работник теплицы", "농업: 온실 직원"),
    company: tx("Gyeonggi Farm", "Gyeonggi Farm", "Gyeonggi Farm", "Gyeonggi Farm"),
    location: tx("Suwon, South Korea", "Suwon, Janubiy Koreya", "Сувон, Южная Корея", "수원, 대한민국"),
    distanceKm: 5.4,
    schedule: tx("06:30 - 15:30, 6/1", "06:30 - 15:30, 6/1", "06:30 - 15:30, 6/1", "06:30 - 15:30, 6/1"),
    salary: tx("2,200,000 UZS per month", "oyiga 2 200 000 so'm", "2 200 000 сум в месяц", "월 2,200,000 쏨"),
    jobType: tx("Agriculture, permanent", "Qishloq xo'jaligi, doimiy", "Сельское хозяйство, постоянная", "농업, 정규직"),
    housing: tx("Dorm provided", "Yotoqxona bor", "Общежитие предоставлено", "기숙사 제공"),
    meals: tx("Meals: 3 times", "Ovqat: 3 mahal", "Питание: 3 раза", "식사: 하루 3회"),
    requirements: ["Jismoniy tayyorgarlik", "Tartiblilik"],
    visaTypes: ["E-9"],
    contactPhone: "+82 10 2233 8899",
    contactTelegram: "@gyeonggi_farm",
    chatUrl: "/chat?job=perm-6",
    kind: "permanent",
    postedAt: "2025-01-26"
  },
  {
    id: "temp-1",
    image: "/services/employment/04.jpg",
    title: tx(
      "One-day warehouse sorting",
      "Bir kunlik ombor saralash",
      "Однодневная сортировка склада",
      "하루 창고 정리"
    ),
    company: tx("Toshkent Logistics", "Toshkent Logistics", "Ташкент логистика", "타슈켄트 물류"),
    location: tx("Toshkent, Sergeli", "Toshkent, Sergeli", "Ташкент, Сергели", "타슈켄트, 세르게리"),
    distanceKm: 2.1,
    schedule: tx("10:00 - 18:00", "10:00 - 18:00", "10:00 - 18:00", "10:00 - 18:00"),
    salary: tx("180 000 UZS per day", "kuniga 180 000 so'm", "180 000 сум в день", "하루 180,000 숨"),
    jobType: tx("Warehouse, one-day", "Ombor, bir kunlik", "Склад, один день", "창고, 하루 일"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: none", "Ovqat: yo'q", "Питание: нет", "식사: 없음"),
    requirements: ["Pasport nusxasi", "18+ yosh"],
    visaTypes: [],
    contactPhone: "+998 90 123 45 67",
    contactTelegram: "@toshkent_logistics",
    chatUrl: "/chat?job=temp-1",
    kind: "temporary",
    postedAt: "2025-02-14"
  },
  {
    id: "temp-2",
    image: "/services/employment/05.jpg",
    title: tx(
      "3-hour cafe assistant",
      "3 soatlik kafe yordamchisi",
      "3-часовой помощник в кафе",
      "3시간 카페 어시스턴트"
    ),
    company: tx("Green Coffee", "Green Coffee", "Green Coffee", "Green Coffee"),
    location: tx("Toshkent, Chilonzor", "Toshkent, Chilonzor", "Ташкент, Чиланзар", "타슈켄트, 칠란조르"),
    distanceKm: 3.6,
    schedule: tx("16:00 - 19:00", "16:00 - 19:00", "16:00 - 19:00", "16:00 - 19:00"),
    salary: tx("35 000 UZS/hour", "soatiga 35 000 so'm", "35 000 сум/час", "시급 35,000 숨"),
    jobType: tx("Cafe, short shift", "Kafe, qisqa smena", "Кафе, краткая смена", "카페, 짧은 근무"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: 1 time", "Ovqat: 1 mahal", "Питание: 1 раз", "식사: 하루 1회"),
    requirements: ["Tartiblilik", "Tezkorlik"],
    visaTypes: [],
    contactPhone: "+998 93 555 22 11",
    contactTelegram: "@green_coffee",
    chatUrl: "/chat?job=temp-2",
    kind: "temporary",
    postedAt: "2025-02-11"
  },
  {
    id: "temp-3",
    image: "/services/employment/06.jpg",
    title: tx("1-week call center", "1 haftalik call-center", "1-недельный колл-центр", "1주 콜센터"),
    company: tx("Customer Support Pro", "Customer Support Pro", "Customer Support Pro", "Customer Support Pro"),
    location: tx("Toshkent, Yashnobod", "Toshkent, Yashnobod", "Ташкент, Яшнабад", "타슈켄트, 야스나바드"),
    distanceKm: 7.5,
    schedule: tx("09:00 - 17:00, 5 days", "09:00 - 17:00, 5 kun", "09:00 - 17:00, 5 дней", "09:00 - 17:00, 5일"),
    salary: tx("950 000 UZS/week", "haftasiga 950 000 so'm", "950 000 сум в неделю", "주당 950,000 숨"),
    jobType: tx("Office, temporary", "Ofis, vaqtinchalik", "Офис, временная", "오피스, 임시직"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: none", "Ovqat: yo'q", "Питание: нет", "식사: 없음"),
    requirements: ["O'zbekcha ravon", "Minimal rus tili"],
    visaTypes: [],
    contactPhone: "+998 97 100 20 30",
    contactTelegram: "@support_pro",
    chatUrl: "/chat?job=temp-3",
    kind: "temporary",
    postedAt: "2025-02-07"
  },
  {
    id: "temp-4",
    image: "/services/employment/10.jpg",
    title: tx("2-day event loader", "2 kunlik tadbir montajchi", "2-дневный грузчик мероприятия", "2일 행사 설치 지원"),
    company: tx("Expo Service", "Expo Service", "Expo Service", "Expo Service"),
    location: tx("Toshkent, Yunusobod", "Toshkent, Yunusobod", "Ташкент, Юнусабад", "타슈켄트, 유누소버드"),
    distanceKm: 4.2,
    schedule: tx("09:00 - 19:00, 2 days", "09:00 - 19:00, 2 kun", "09:00 - 19:00, 2 дня", "09:00 - 19:00, 2일"),
    salary: tx("220 000 UZS/day", "kuniga 220 000 so'm", "220 000 сум/день", "일당 220,000 숨"),
    jobType: tx("Event, temporary", "Tadbir, vaqtinchalik", "Событие, временная работа", "행사, 임시직"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: 1 time", "Ovqat: 1 mahal", "Питание: 1 раз", "식사: 하루 1회"),
    requirements: ["Jismoniy tayyorgarlik", "Punktuallik"],
    visaTypes: [],
    contactPhone: "+998 99 200 10 10",
    contactTelegram: "@expo_service",
    chatUrl: "/chat?job=temp-4",
    kind: "temporary",
    postedAt: "2025-02-06"
  },
  {
    id: "temp-5",
    image: "/services/employment/11.jpg",
    title: tx("4-hour delivery", "4 soatlik yetkazib berish", "4-часовая доставка", "4시간 배달"),
    company: tx("Fresh Market", "Fresh Market", "Fresh Market", "Fresh Market"),
    location: tx("Toshkent, Shayxontohur", "Toshkent, Shayxontohur", "Ташкент, Шайхонтохур", "타슈켄트, 샤이혼토흐르"),
    distanceKm: 1.8,
    schedule: tx("12:00 - 16:00", "12:00 - 16:00", "12:00 - 16:00", "12:00 - 16:00"),
    salary: tx("40 000 UZS/hour", "soatiga 40 000 so'm", "40 000 сум/час", "시급 40,000 숨"),
    jobType: tx("Courier, short shift", "Kuryer, qisqa smena", "Курьер, короткая смена", "배달원, 짧은 근무"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: none", "Ovqat: yo'q", "Питание: нет", "식사: 없음"),
    requirements: ["Smartfon", "Mas'uliyat"],
    visaTypes: [],
    contactPhone: "+998 93 444 55 66",
    contactTelegram: "@fresh_market",
    chatUrl: "/chat?job=temp-5",
    kind: "temporary",
    postedAt: "2025-02-04"
  },
  {
    id: "temp-6",
    image: "/services/employment/12.jpg",
    title: tx("5-day sales assistant", "5 kunlik savdo yordamchisi", "5-дневный помощник по продажам", "5일 판매 어시스턴트"),
    company: tx("Urban Retail", "Urban Retail", "Urban Retail", "Urban Retail"),
    location: tx("Toshkent, Mirzo Ulug'bek", "Toshkent, Mirzo Ulug'bek", "Ташкент, Мирзо Улугбек", "타슈켄트, 미르조 울루그벡"),
    distanceKm: 6.9,
    schedule: tx("10:00 - 18:00, 5 days", "10:00 - 18:00, 5 kun", "10:00 - 18:00, 5 дней", "10:00 - 18:00, 5일"),
    salary: tx("1 150 000 UZS/week", "haftasiga 1 150 000 so'm", "1 150 000 сум в неделю", "주당 1,150,000 숨"),
    jobType: tx("Sales, temporary", "Savdo, vaqtinchalik", "Продажи, временная работа", "판매, 임시직"),
    housing: tx("No dorm", "Yotoqxona yo'q", "Общежития нет", "기숙사 없음"),
    meals: tx("Meals: 1 time", "Ovqat: 1 mahal", "Питание: 1 раз", "식사: 하루 1회"),
    requirements: ["Mijozlar bilan ishlash", "Tartiblilik"],
    visaTypes: [],
    contactPhone: "+998 90 777 88 99",
    contactTelegram: "@urban_retail",
    chatUrl: "/chat?job=temp-6",
    kind: "temporary",
    postedAt: "2025-01-31"
  }
];
