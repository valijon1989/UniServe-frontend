"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "uz" | "ru" | "ko";

type TranslationKey =
  | "nav.feed"
  | "nav.agentPanel"
  | "header.subtitle"
  | "auth.login.title"
  | "auth.login.subtitle"
  | "auth.login.email"
  | "auth.login.password"
  | "auth.login.error"
  | "auth.login.submit"
  | "auth.login.loading"
  | "auth.signup.title"
  | "auth.signup.subtitle"
  | "auth.signup.name"
  | "auth.signup.email"
  | "auth.signup.password"
  | "auth.signup.roleLabel"
  | "auth.signup.roleUser"
  | "auth.signup.roleAgent"
  | "auth.signup.error"
  | "auth.signup.submit"
  | "auth.signup.loading"
  | "home.title"
  | "home.subtitle"
  | "home.loading"
  | "home.empty"
  | "agents.panelTitle"
  | "agents.panelSubtitle"
  | "agents.newListing"
  | "agents.myListings"
  | "agents.loading"
  | "agents.empty"
  | "form.title"
  | "form.titlePlaceholder"
  | "form.category"
  | "form.category.social"
  | "form.category.material"
  | "form.category.product"
  | "form.description"
  | "form.descriptionPlaceholder"
  | "form.price"
  | "form.currency"
  | "form.image"
  | "form.error"
  | "form.save"
  | "form.saving"
  | "profile.loading"
  | "profile.about"
  | "profile.activityTitle"
  | "profile.roleItem"
  | "profile.privacyItem"
  | "profile.statsItem"
  | "auth.logout"
  | "auth.loginLink"
  | "auth.signupLink";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    "nav.feed": "Feed",
    "nav.agentPanel": "Agent Panel",
    "header.subtitle": "Global services hub",
    "auth.login.title": "Sign in",
    "auth.login.subtitle": "Enter as admin, agent, or regular user.",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.error": "Login failed",
    "auth.login.submit": "Sign in",
    "auth.login.loading": "Signing in...",
    "auth.signup.title": "Create account",
    "auth.signup.subtitle": "Create a new UniServe account.",
    "auth.signup.name": "Full name",
    "auth.signup.email": "Email",
    "auth.signup.password": "Password",
    "auth.signup.roleLabel": "Role",
    "auth.signup.roleUser": "User",
    "auth.signup.roleAgent": "Agent (service / product)",
    "auth.signup.error": "Signup failed",
    "auth.signup.submit": "Create account",
    "auth.signup.loading": "Creating...",
    "home.title": "UniServe feed",
    "home.subtitle": "Services, products, and social posts from agents and users appear here.",
    "home.loading": "Loading...",
    "home.empty": "No posts yet. Seed backend data to see initial feed items.",
    "agents.panelTitle": "Agent console",
    "agents.panelSubtitle": "Share your services and products to the UniServe feeds. A minimal CRUD form is available for now.",
    "agents.newListing": "New listing",
    "agents.myListings": "My listings",
    "agents.loading": "Loading...",
    "agents.empty": "No listings yet. Add your first listing.",
    "form.title": "Title",
    "form.titlePlaceholder": "Example: IELTS prep in Tashkent",
    "form.category": "Category",
    "form.category.social": "Social service",
    "form.category.material": "Material service",
    "form.category.product": "Product",
    "form.description": "Details",
    "form.descriptionPlaceholder": "What service or product are you offering?",
    "form.price": "Price",
    "form.currency": "Currency",
    "form.image": "Image URL",
    "form.error": "An error occurred",
    "form.save": "Save",
    "form.saving": "Saving...",
    "profile.loading": "Profile data is loading or you are not signed in.",
    "profile.about": "Profile editing, Face ID verification, and other settings will appear here later. For now we show the basic data returned by the backend.",
    "profile.activityTitle": "Activity and role",
    "profile.roleItem": "Role",
    "profile.privacyItem": "Coming soon: open/closed profile settings",
    "profile.statsItem": "If agent: listing and order stats",
    "auth.logout": "Sign out",
    "auth.loginLink": "Sign in",
    "auth.signupLink": "Sign up"
  },
  uz: {
    "nav.feed": "Lenta",
    "nav.agentPanel": "Agent Panel",
    "header.subtitle": "Global services hub",
    "auth.login.title": "Kirish",
    "auth.login.subtitle": "Admin, agent yoki oddiy foydalanuvchi sifatida tizimga kiring.",
    "auth.login.email": "Email",
    "auth.login.password": "Parol",
    "auth.login.error": "Login xatosi",
    "auth.login.submit": "Kirish",
    "auth.login.loading": "Kirilmoqda...",
    "auth.signup.title": "Ro'yhatdan o'tish",
    "auth.signup.subtitle": "UniServe platformasida yangi akkaunt yarating.",
    "auth.signup.name": "Ism familiya",
    "auth.signup.email": "Email",
    "auth.signup.password": "Parol",
    "auth.signup.roleLabel": "Rol",
    "auth.signup.roleUser": "Oddiy foydalanuvchi",
    "auth.signup.roleAgent": "Agent (xizmat / mahsulot)",
    "auth.signup.error": "Ro'yhatdan o'tishda xato",
    "auth.signup.submit": "Akkaunt yaratish",
    "auth.signup.loading": "Yaratilmoqda...",
    "home.title": "UniServe lenta",
    "home.subtitle": "Agentlar va foydalanuvchilarning xizmatlari, mahsulotlari va ijtimoiy postlari shu yerda ko'rinadi.",
    "home.loading": "Yuklanmoqda...",
    "home.empty": "Hozircha postlar yo'q. Dastlabki ma'lumotlarni seed qilib ko'ring.",
    "agents.panelTitle": "Agent paneli",
    "agents.panelSubtitle": "Bu yerda siz xizmat va mahsulotlaringizni UniServe lentalariga joylashtirasiz. Hozircha minimal CRUD shakli ishlatilmoqda.",
    "agents.newListing": "Yangi e'lon",
    "agents.myListings": "Mening e'lonlarim",
    "agents.loading": "Yuklanmoqda...",
    "agents.empty": "Hozircha e'lonlar yo'q. Yangi e'lon qo'shing.",
    "form.title": "Sarlavha",
    "form.titlePlaceholder": "Masalan: Toshkentda IELTS tayyorlov",
    "form.category": "Kategoriya",
    "form.category.social": "Ijtimoiy xizmat",
    "form.category.material": "Moddiy xizmat",
    "form.category.product": "Mahsulot",
    "form.description": "Batafsil",
    "form.descriptionPlaceholder": "Qanday xizmat yoki mahsulot taklif qilasiz?",
    "form.price": "Narx",
    "form.currency": "Valyuta",
    "form.image": "Rasm URL",
    "form.error": "Xatolik yuz berdi",
    "form.save": "Saqlash",
    "form.saving": "Saqlanmoqda...",
    "profile.loading": "Profil ma'lumotlari yuklanmoqda yoki siz tizimga kirmagansiz.",
    "profile.about": "Bu sahifada keyinchalik profil tahriri, Face ID tasdig'i va boshqa sozlamalar joylashadi. Hozircha backenddan qaytgan asosiy ma'lumotlar ko'rsatilmoqda.",
    "profile.activityTitle": "Faoliyat va roli",
    "profile.roleItem": "Rol",
    "profile.privacyItem": "Kelajakda: yopiq/ochiq profil sozlamalari",
    "profile.statsItem": "Agent bo'lsa: e'lonlar va buyurtmalar statistikasi",
    "auth.logout": "Chiqish",
    "auth.loginLink": "Kirish",
    "auth.signupLink": "Ro'yhatdan o'tish"
  },
  ru: {
    "nav.feed": "Лента",
    "nav.agentPanel": "Панель агента",
    "header.subtitle": "Платформа услуг и товаров",
    "auth.login.title": "Вход",
    "auth.login.subtitle": "Войдите как админ, агент или пользователь.",
    "auth.login.email": "Email",
    "auth.login.password": "Пароль",
    "auth.login.error": "Ошибка входа",
    "auth.login.submit": "Войти",
    "auth.login.loading": "Входим...",
    "auth.signup.title": "Регистрация",
    "auth.signup.subtitle": "Создайте новый аккаунт UniServe.",
    "auth.signup.name": "Имя и фамилия",
    "auth.signup.email": "Email",
    "auth.signup.password": "Пароль",
    "auth.signup.roleLabel": "Роль",
    "auth.signup.roleUser": "Пользователь",
    "auth.signup.roleAgent": "Агент (услуги / товары)",
    "auth.signup.error": "Ошибка регистрации",
    "auth.signup.submit": "Создать аккаунт",
    "auth.signup.loading": "Создаем...",
    "home.title": "Лента UniServe",
    "home.subtitle": "Услуги, товары и посты агентов и пользователей появляются здесь.",
    "home.loading": "Загрузка...",
    "home.empty": "Пока нет постов. Засидируйте данные бэкенда, чтобы увидеть примеры.",
    "agents.panelTitle": "Панель агента",
    "agents.panelSubtitle": "Публикуйте свои услуги и товары в ленту UniServe. Сейчас доступна минимальная форма CRUD.",
    "agents.newListing": "Новое объявление",
    "agents.myListings": "Мои объявления",
    "agents.loading": "Загрузка...",
    "agents.empty": "Пока нет объявлений. Добавьте первое.",
    "form.title": "Заголовок",
    "form.titlePlaceholder": "Например: Подготовка к IELTS в Ташкенте",
    "form.category": "Категория",
    "form.category.social": "Социальная услуга",
    "form.category.material": "Материальная услуга",
    "form.category.product": "Товар",
    "form.description": "Описание",
    "form.descriptionPlaceholder": "Какую услугу или товар вы предлагаете?",
    "form.price": "Цена",
    "form.currency": "Валюта",
    "form.image": "Ссылка на изображение",
    "form.error": "Произошла ошибка",
    "form.save": "Сохранить",
    "form.saving": "Сохраняем...",
    "profile.loading": "Данные профиля загружаются или вы не авторизованы.",
    "profile.about": "Здесь появится редактирование профиля, Face ID и другие настройки. Пока показываем базовые данные с бэкенда.",
    "profile.activityTitle": "Активность и роль",
    "profile.roleItem": "Роль",
    "profile.privacyItem": "Скоро: настройки открытого/закрытого профиля",
    "profile.statsItem": "Если агент: статистика объявлений и заказов",
    "auth.logout": "Выйти",
    "auth.loginLink": "Войти",
    "auth.signupLink": "Регистрация"
  },
  ko: {
    "nav.feed": "피드",
    "nav.agentPanel": "에이전트 패널",
    "header.subtitle": "글로벌 서비스 허브",
    "auth.login.title": "로그인",
    "auth.login.subtitle": "관리자, 에이전트 또는 일반 사용자로 로그인하세요.",
    "auth.login.email": "이메일",
    "auth.login.password": "비밀번호",
    "auth.login.error": "로그인 오류",
    "auth.login.submit": "로그인",
    "auth.login.loading": "로그인 중...",
    "auth.signup.title": "회원가입",
    "auth.signup.subtitle": "새로운 UniServe 계정을 생성하세요.",
    "auth.signup.name": "이름",
    "auth.signup.email": "이메일",
    "auth.signup.password": "비밀번호",
    "auth.signup.roleLabel": "역할",
    "auth.signup.roleUser": "사용자",
    "auth.signup.roleAgent": "에이전트 (서비스 / 상품)",
    "auth.signup.error": "회원가입 오류",
    "auth.signup.submit": "계정 만들기",
    "auth.signup.loading": "생성 중...",
    "home.title": "UniServe 피드",
    "home.subtitle": "에이전트와 사용자의 서비스, 상품, 소셜 포스트가 여기에 표시됩니다.",
    "home.loading": "로딩 중...",
    "home.empty": "아직 포스트가 없습니다. 백엔드 데이터를 시드하면 예시가 보입니다.",
    "agents.panelTitle": "에이전트 패널",
    "agents.panelSubtitle": "여기서 서비스와 상품을 UniServe 피드에 게시하세요. 현재는 최소 CRUD 폼이 제공됩니다.",
    "agents.newListing": "새 게시물",
    "agents.myListings": "내 게시물",
    "agents.loading": "로딩 중...",
    "agents.empty": "아직 게시물이 없습니다. 첫 게시물을 추가하세요.",
    "form.title": "제목",
    "form.titlePlaceholder": "예: 타슈켄트 IELTS 준비",
    "form.category": "카테고리",
    "form.category.social": "사회 서비스",
    "form.category.material": "물질 서비스",
    "form.category.product": "상품",
    "form.description": "상세",
    "form.descriptionPlaceholder": "어떤 서비스나 상품을 제공하나요?",
    "form.price": "가격",
    "form.currency": "통화",
    "form.image": "이미지 URL",
    "form.error": "오류가 발생했습니다",
    "form.save": "저장",
    "form.saving": "저장 중...",
    "profile.loading": "프로필 데이터를 불러오는 중이거나 로그인되지 않았습니다.",
    "profile.about": "추후 프로필 수정, Face ID 확인 등 설정이 여기에 표시됩니다. 지금은 백엔드에서 받은 기본 정보만 보여줍니다.",
    "profile.activityTitle": "활동 및 역할",
    "profile.roleItem": "역할",
    "profile.privacyItem": "곧 제공: 공개/비공개 프로필 설정",
    "profile.statsItem": "에이전트인 경우: 게시물 및 주문 통계",
    "auth.logout": "로그아웃",
    "auth.loginLink": "로그인",
    "auth.signupLink": "회원가입"
  }
};

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "uniserve_language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("uz");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && ["en", "uz", "ru", "ko"].includes(stored)) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key: TranslationKey) =>
        translations[language]?.[key] ??
        translations.en[key] ??
        key
    };
  }, [language]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export const languageOptions: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" }
];
