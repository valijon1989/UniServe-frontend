export type EducationCategory = "language" | "profession" | "special";
export type CourseMode = "online" | "offline";

export type EducationCourse = {
  id: string;
  title: string;
  description: string;
  agentName: string;
  agentHandle: string;
  rating: number;
  studentsCount: number;
  price: string;
  category: EducationCategory;
  subCategory: string;
  mode: CourseMode;
  teachingLanguage: string;
  weeklyDays: number;
  weeklyHours: number;
  durationWeeks: number;
  scheduleDays: string;
  scheduleTime: string;
  outcomes: string[];
  certificates: string[];
  location?: string;
  room?: string;
  images: string[];
  contactPhone?: string;
  contactTelegram?: string;
  chatUrl?: string;
};

const imagePath = (index: number) => `/services/education/${String(index).padStart(2, "0")}.jpg`;

export const educationCategories: Record<EducationCategory, string> = {
  language: "Til o'rganish",
  profession: "Kasb o'rganish",
  special: "Maxsus bilimlar"
};

export const educationSubCategories: Record<EducationCategory, string[]> = {
  language: ["Koreys tili", "Ingliz tili", "O'zbek tili", "Rus tili", "Ispan tili", "Xitoy tili", "Arab tili"],
  profession: [
    "Avtomobil ta'mirlash",
    "Payvandlash",
    "Elektr energiya",
    "Oshpazlik",
    "Go'zallik",
    "Hamshiralik",
    "Santexnika"
  ],
  special: ["IT va dasturlash", "Informatika", "Traderlik", "Data analitika"]
};

type CourseSeed = {
  category: EducationCategory;
  subCategory: string;
  teachingLanguage: string;
  outcomes: string[];
  certificates: string[];
  location: string;
  room: string;
};

const courseSeeds: CourseSeed[] = [
  {
    category: "language",
    subCategory: "Koreys tili",
    teachingLanguage: "O'zbek",
    outcomes: ["TOPIK 2-3 daraja", "Suhbat amaliyoti", "Talaffuz mustahkamlash"],
    certificates: ["TOPIK 5 sertifikat", "Koreys tili diplomi"],
    location: "Toshkent, Chilonzor, 5-bino",
    room: "204-xona"
  },
  {
    category: "language",
    subCategory: "Ingliz tili",
    teachingLanguage: "O'zbek/English",
    outcomes: ["IELTS 6.5+ natija", "Speaking mock", "Writing struktura"],
    certificates: ["CELTA", "IELTS 8.0"],
    location: "Toshkent, Yunusobod, 3-bino",
    room: "301-xona"
  },
  {
    category: "language",
    subCategory: "O'zbek tili",
    teachingLanguage: "O'zbek",
    outcomes: ["Nutq ravonligi", "Imlo ko'nikma", "Akademik yozish"],
    certificates: ["Filologiya sertifikat"],
    location: "Toshkent, Olmazor, 2-bino",
    room: "102-xona"
  },
  {
    category: "language",
    subCategory: "Rus tili",
    teachingLanguage: "O'zbek/Rus",
    outcomes: ["Og'zaki nutq", "Grammatika", "Test ishlash"],
    certificates: ["TRKI sertifikat"],
    location: "Toshkent, Shayxontohur, 1-bino",
    room: "210-xona"
  },
  {
    category: "language",
    subCategory: "Ispan tili",
    teachingLanguage: "O'zbek",
    outcomes: ["A2 daraja", "Suhbat klubi", "Talaffuz"],
    certificates: ["DELE tayyorlov"],
    location: "Toshkent, Mirzo Ulug'bek, 6-bino",
    room: "112-xona"
  },
  {
    category: "language",
    subCategory: "Xitoy tili",
    teachingLanguage: "O'zbek/Rus",
    outcomes: ["HSK 2-3", "Ieroglif yozish", "Og'zaki mashg'ulot"],
    certificates: ["HSK 5", "Xitoy tili diplomi"],
    location: "Toshkent, Yashnobod, 7-bino",
    room: "105-xona"
  },
  {
    category: "language",
    subCategory: "Arab tili",
    teachingLanguage: "O'zbek",
    outcomes: ["Arab alifbosi", "Talaffuz", "Boshlang'ich grammatika"],
    certificates: ["Arab tili sertifikat"],
    location: "Toshkent, Yunusobod, 8-bino",
    room: "109-xona"
  },
  {
    category: "profession",
    subCategory: "Avtomobil ta'mirlash",
    teachingLanguage: "O'zbek",
    outcomes: ["Diagnostika protokoli", "Sensor tahlil", "Amaliy servis"],
    certificates: ["Usta guvohnoma", "Servis sertifikat"],
    location: "Toshkent, Sergeli, 9-bino",
    room: "Servis zal"
  },
  {
    category: "profession",
    subCategory: "Payvandlash",
    teachingLanguage: "O'zbek/Rus",
    outcomes: ["MMA/MIG ko'nikma", "Metall biriktirish", "Xavfsizlik protokoli"],
    certificates: ["Payvandchi sertifikati"],
    location: "Toshkent, Yashnobod, 4-bino",
    room: "Usta sex"
  },
  {
    category: "profession",
    subCategory: "Elektr energiya",
    teachingLanguage: "O'zbek",
    outcomes: ["Elektr xavfsizligi", "Tarmoqlar ulash", "Nosozlik topish"],
    certificates: ["Elektrik sertifikat"],
    location: "Toshkent, Bektemir, 2-bino",
    room: "Lab 3"
  },
  {
    category: "profession",
    subCategory: "Oshpazlik",
    teachingLanguage: "O'zbek",
    outcomes: ["Menu tuzish", "Amaliy pishirish", "Servis standartlari"],
    certificates: ["Chef sertifikat"],
    location: "Toshkent, Shayxontohur, 4-bino",
    room: "Oshxona lab"
  },
  {
    category: "profession",
    subCategory: "Go'zallik",
    teachingLanguage: "O'zbek/Rus",
    outcomes: ["Make-up texnika", "Salon etikasi", "Amaliy portfel"],
    certificates: ["Beautician sertifikat"],
    location: "Toshkent, Chilonzor, 8-bino",
    room: "Studio 2"
  },
  {
    category: "profession",
    subCategory: "Hamshiralik",
    teachingLanguage: "O'zbek",
    outcomes: ["Tibbiy protokol", "Amaliy mashg'ulot", "Bemor parvarishi"],
    certificates: ["Hamshira sertifikati"],
    location: "Toshkent, Olmazor, 5-bino",
    room: "Trening zali"
  },
  {
    category: "profession",
    subCategory: "Santexnika",
    teachingLanguage: "O'zbek",
    outcomes: ["Quvur ulash", "Sxema o'qish", "Nosozlik bartaraf"],
    certificates: ["Santexnik sertifikat"],
    location: "Toshkent, Sergeli, 6-bino",
    room: "Usta maydon"
  },
  {
    category: "special",
    subCategory: "IT va dasturlash",
    teachingLanguage: "O'zbek",
    outcomes: ["Portfolio sayt", "React mini loyiha", "Git asoslari"],
    certificates: ["Frontend sertifikat"],
    location: "Toshkent, Yashnobod, 6-bino",
    room: "IT Lab"
  },
  {
    category: "special",
    subCategory: "Informatika",
    teachingLanguage: "O'zbek",
    outcomes: ["Test ishlash", "Algoritm asoslari", "Amaliy masalalar"],
    certificates: ["O'quv markazi sertifikat"],
    location: "Toshkent, Olmazor, 9-bino",
    room: "208-xona"
  },
  {
    category: "special",
    subCategory: "Traderlik",
    teachingLanguage: "O'zbek/Rus",
    outcomes: ["Risk management", "Strategiya test", "Bozor tahlili"],
    certificates: ["Traderlik sertifikat"],
    location: "Toshkent, Mirzo Ulug'bek, 11-bino",
    room: "Biznes xona"
  },
  {
    category: "special",
    subCategory: "Data analitika",
    teachingLanguage: "O'zbek",
    outcomes: ["Excel/SQL", "Dashboard", "Amaliy loyiha"],
    certificates: ["Data analitika sertifikat"],
    location: "Toshkent, Yunusobod, 12-bino",
    room: "Data Lab"
  }
];

const agentNames = [
  "Kamila",
  "Azizbek",
  "Sardor",
  "Nilufar",
  "Dilshod",
  "Malika",
  "Jasur",
  "Nargiza",
  "Bekzod",
  "Sarvinoz",
  "Javohir",
  "Asal",
  "Shahzod",
  "Diyor",
  "Nodira",
  "Umid",
  "Zarina",
  "Rustam",
  "Shoira",
  "Islom"
];

const scheduleVariants = [
  { days: "Du/Ch/Ju", time: "19:00 - 21:00" },
  { days: "Se/Ch/Ju/Ya", time: "18:30 - 20:30" },
  { days: "Du/Pu", time: "17:00 - 19:00" },
  { days: "Sh/Ya", time: "09:00 - 11:00" }
];

const buildCourses = () => {
  let imgIndex = 1;
  let agentIndex = 0;
  const results: EducationCourse[] = [];
  courseSeeds.forEach((seed, seedIndex) => {
    const modes: CourseMode[] = ["online", "online", "offline", "offline"];
    modes.forEach((mode, idx) => {
      const agentName = `${agentNames[agentIndex % agentNames.length]} ${seed.subCategory.split(" ")[0]}`;
      const agentHandle = `@${agentNames[agentIndex % agentNames.length]}_${seed.subCategory
        .split(" ")[0]
        .toLowerCase()}`;
      const schedule = scheduleVariants[(seedIndex + idx) % scheduleVariants.length];
      const weeklyDays = mode === "online" ? 3 : 2;
      const weeklyHours = mode === "online" ? 6 : 4;
      const durationWeeks = mode === "online" ? 12 : 8;
      const courseId = `${seed.category}-${seed.subCategory
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}-${mode}-${idx + 1}`;
      results.push({
        id: courseId,
        title: `${seed.subCategory} ${mode === "online" ? "online" : "offline"} kurs`,
        description: `${seed.subCategory} bo'yicha ${mode} formatda chuqurlashtirilgan kurs.`,
        agentName,
        agentHandle,
        rating: Number((4.5 + (idx % 3) * 0.2).toFixed(1)),
        studentsCount: 60 + seedIndex * 5 + idx * 12,
        price: mode === "online" ? "oyiga 850 000 so'm" : "kurs: 2 200 000 so'm",
        category: seed.category,
        subCategory: seed.subCategory,
        mode,
        teachingLanguage: seed.teachingLanguage,
        weeklyDays,
        weeklyHours,
        durationWeeks,
        scheduleDays: schedule.days,
        scheduleTime: schedule.time,
        outcomes: seed.outcomes,
        certificates: seed.certificates,
        location: mode === "offline" ? seed.location : undefined,
        room: mode === "offline" ? seed.room : undefined,
        images: [imagePath(imgIndex)],
        contactPhone: `+998 9${(seedIndex % 9) + 1} ${200 + idx} ${10 + seedIndex} ${20 + idx}`,
        contactTelegram: `@${agentHandle.replace("@", "").toLowerCase()}`,
        chatUrl: `/chat?course=${courseId}`
      });
      imgIndex += 1;
      agentIndex += 1;
    });
  });
  return results;
};

export const educationCourses: EducationCourse[] = buildCourses();
