"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "uz" | "ru" | "ko";

type TranslationKey =
  | "nav.home"
  | "nav.news"
  | "nav.products"
  | "nav.services"
  | "nav.agents"
  | "nav.community"
  | "nav.feed"
  | "nav.agentPanel"
  | "nav.explore"
  | "nav.profile"
  | "nav.agent.listings"
  | "nav.agent.new"
  | "nav.admin.dashboard"
  | "nav.admin.users"
  | "nav.admin.agents"
  | "nav.admin.moderation"
  | "footer.title"
  | "footer.description"
  | "footer.tagline"
  | "footer.rights"
  | "contact.facebook"
  | "contact.instagram"
  | "contact.telegram"
  | "contact.kakao"
  | "contact.email"
  | "contact.phone"
  | "contact.address"
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
  | "home.hero.platform"
  | "home.hero.title"
  | "home.hero.description"
  | "home.hero.tag.search"
  | "home.hero.tag.verified"
  | "home.hero.tag.community"
  | "home.hero.slide.products.title"
  | "home.hero.slide.products.desc"
  | "home.hero.slide.products.badge"
  | "home.hero.slide.services.title"
  | "home.hero.slide.services.desc"
  | "home.hero.slide.services.badge"
  | "home.hero.slide.community.title"
  | "home.hero.slide.community.desc"
  | "home.hero.slide.community.badge"
  | "home.hero.slide.agents.title"
  | "home.hero.slide.agents.desc"
  | "home.hero.slide.agents.badge"
  | "home.hero.slide.feed.title"
  | "home.hero.slide.feed.desc"
  | "home.hero.slide.feed.badge"
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
    "nav.home": "Home",
    "nav.news": "News",
    "nav.products": "Products",
    "nav.services": "Services",
    "nav.agents": "Agents",
    "nav.community": "Community",
    "nav.feed": "Feed",
    "nav.agentPanel": "Agent Panel",
    "nav.explore": "Explore",
    "nav.profile": "Profile",
    "nav.agent.listings": "My Listings",
    "nav.agent.new": "Add Listing",
    "nav.admin.dashboard": "Dashboard",
    "nav.admin.users": "Manage Users",
    "nav.admin.agents": "Manage Agents",
    "nav.admin.moderation": "Feed Moderation",
    "footer.title": "UniServe",
    "footer.description": "UniServe connects services and products worldwide. With trusted partners and a simple experience, people quickly find solutions that fit.",
    "footer.tagline": "Global services and products in one place.",
    "footer.rights": "All rights reserved.",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.telegram": "Telegram",
    "contact.kakao": "KakaoTalk",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.address": "Address",
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
    "home.hero.platform": "Platform",
    "home.hero.title": "Find products and services in one place; connect with agents and community",
    "home.hero.description": "UniServe brings together products, services, and community posts. With quick filters, verified agents, and global collaboration, find the solution you need faster.",
    "home.hero.tag.search": "⚡ Fast search",
    "home.hero.tag.verified": "✅ Verified agents",
    "home.hero.tag.community": "🌍 Community",
    "home.hero.slide.products.title": "Products",
    "home.hero.slide.products.desc": "Electronics, fashion, toys, and more",
    "home.hero.slide.products.badge": "Products",
    "home.hero.slide.services.title": "Services",
    "home.hero.slide.services.desc": "IT, marketing, design, and education",
    "home.hero.slide.services.badge": "Services",
    "home.hero.slide.community.title": "Community",
    "home.hero.slide.community.desc": "Share ideas and find new partners",
    "home.hero.slide.community.badge": "Forum",
    "home.hero.slide.agents.title": "Agents",
    "home.hero.slide.agents.desc": "Verified sellers and providers",
    "home.hero.slide.agents.badge": "Verified",
    "home.hero.slide.feed.title": "Feed",
    "home.hero.slide.feed.desc": "News and offers in one stream",
    "home.hero.slide.feed.badge": "Feed",
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
    "nav.home": "Bosh sahifa",
    "nav.news": "Yangiliklar",
    "nav.products": "Mahsulotlar",
    "nav.services": "Xizmatlar",
    "nav.agents": "Agentlar",
    "nav.community": "Jamiyat",
    "nav.feed": "Lenta",
    "nav.agentPanel": "Agent Panel",
    "nav.explore": "Katalog",
    "nav.profile": "Profil",
    "nav.agent.listings": "Mening e'lonlarim",
    "nav.agent.new": "Yangi e'lon",
    "nav.admin.dashboard": "Boshqaruv",
    "nav.admin.users": "Foydalanuvchilar",
    "nav.admin.agents": "Agentlar",
    "nav.admin.moderation": "Moderatsiya",
    "footer.title": "UniServe",
    "footer.description": "UniServe butun dunyo bo‘ylab xizmatlar va mahsulotlarni bog‘laydi. Ishonchli hamkorlar va qulay tajriba bilan odamlar tezda o‘ziga mos yechimni topadi.",
    "footer.tagline": "Global xizmatlar va mahsulotlar bir joyda.",
    "footer.rights": "Barcha huquqlar himoyalangan.",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.telegram": "Telegram",
    "contact.kakao": "KakaoTalk",
    "contact.email": "Email",
    "contact.phone": "Telefon",
    "contact.address": "Manzil",
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
    "home.hero.platform": "Platforma",
    "home.hero.title": "Tovar va xizmatlarni bir joyda toping, agentlar va hamjamiyat bilan bog‘laning",
    "home.hero.description": "UniServe — mahsulotlar, xizmatlar va hamjamiyat postlari jamlangan markaz. Tez filtrlar, tasdiqlangan agentlar va global hamkorlik orqali kerakli yechimni toping.",
    "home.hero.tag.search": "⚡ Tezkor qidiruv",
    "home.hero.tag.verified": "✅ Tasdiqlangan agentlar",
    "home.hero.tag.community": "🌍 Hamjamiyat",
    "home.hero.slide.products.title": "Mahsulotlar",
    "home.hero.slide.products.desc": "Elektronika, moda, o'yinchoqlar va boshqa",
    "home.hero.slide.products.badge": "Mahsulotlar",
    "home.hero.slide.services.title": "Xizmatlar",
    "home.hero.slide.services.desc": "IT, marketing, dizayn va ta'lim",
    "home.hero.slide.services.badge": "Xizmatlar",
    "home.hero.slide.community.title": "Hamjamiyat",
    "home.hero.slide.community.desc": "Fikr almashish va hamkor topish",
    "home.hero.slide.community.badge": "Forum",
    "home.hero.slide.agents.title": "Agentlar",
    "home.hero.slide.agents.desc": "Tasdiqlangan sotuvchilar va ijrochilar",
    "home.hero.slide.agents.badge": "Verified",
    "home.hero.slide.feed.title": "Lenta",
    "home.hero.slide.feed.desc": "Yangiliklar va takliflar bir oqimda",
    "home.hero.slide.feed.badge": "Lenta",
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
    "nav.home": "Главная",
    "nav.news": "Новости",
    "nav.products": "Товары",
    "nav.services": "Услуги",
    "nav.agents": "Агенты",
    "nav.community": "Сообщество",
    "nav.feed": "Лента",
    "nav.agentPanel": "Панель агента",
    "nav.explore": "Каталог",
    "nav.profile": "Профиль",
    "nav.agent.listings": "Мои объявления",
    "nav.agent.new": "Добавить объявление",
    "nav.admin.dashboard": "Дашборд",
    "nav.admin.users": "Пользователи",
    "nav.admin.agents": "Агенты",
    "nav.admin.moderation": "Модерация",
    "footer.title": "UniServe",
    "footer.description": "UniServe объединяет услуги и товары по всему миру. С надежными партнерами и простой подачей люди быстро находят подходящие решения.",
    "footer.tagline": "Глобальные услуги и товары в одном месте.",
    "footer.rights": "Все права защищены.",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.telegram": "Telegram",
    "contact.kakao": "KakaoTalk",
    "contact.email": "Email",
    "contact.phone": "Телефон",
    "contact.address": "Адрес",
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
    "home.hero.platform": "Платформа",
    "home.hero.title": "Найдите товары и услуги в одном месте, общайтесь с агентами и сообществом",
    "home.hero.description": "UniServe объединяет товары, услуги и посты сообщества. Быстрые фильтры, проверенные агенты и глобальное взаимодействие помогают быстрее найти нужное решение.",
    "home.hero.tag.search": "⚡ Быстрый поиск",
    "home.hero.tag.verified": "✅ Проверенные агенты",
    "home.hero.tag.community": "🌍 Сообщество",
    "home.hero.slide.products.title": "Товары",
    "home.hero.slide.products.desc": "Электроника, мода, игрушки и другое",
    "home.hero.slide.products.badge": "Товары",
    "home.hero.slide.services.title": "Услуги",
    "home.hero.slide.services.desc": "IT, маркетинг, дизайн и обучение",
    "home.hero.slide.services.badge": "Услуги",
    "home.hero.slide.community.title": "Сообщество",
    "home.hero.slide.community.desc": "Обмен идеями и поиск новых партнеров",
    "home.hero.slide.community.badge": "Форум",
    "home.hero.slide.agents.title": "Агенты",
    "home.hero.slide.agents.desc": "Проверенные продавцы и исполнители",
    "home.hero.slide.agents.badge": "Verified",
    "home.hero.slide.feed.title": "Лента",
    "home.hero.slide.feed.desc": "Новости и предложения в одном потоке",
    "home.hero.slide.feed.badge": "Лента",
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
    "nav.home": "홈",
    "nav.news": "뉴스",
    "nav.products": "상품",
    "nav.services": "서비스",
    "nav.agents": "에이전트",
    "nav.community": "커뮤니티",
    "nav.feed": "피드",
    "nav.agentPanel": "에이전트 패널",
    "nav.explore": "탐색",
    "nav.profile": "프로필",
    "nav.agent.listings": "내 게시물",
    "nav.agent.new": "새 게시물",
    "nav.admin.dashboard": "대시보드",
    "nav.admin.users": "사용자 관리",
    "nav.admin.agents": "에이전트 관리",
    "nav.admin.moderation": "피드 모더레이션",
    "footer.title": "UniServe",
    "footer.description": "UniServe는 전 세계의 서비스와 상품을 연결합니다. 신뢰할 수 있는 파트너와 간단한 경험으로 원하는 해법을 빠르게 찾을 수 있습니다.",
    "footer.tagline": "글로벌 서비스와 상품, 한곳에.",
    "footer.rights": "판권 소유.",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.telegram": "Telegram",
    "contact.kakao": "KakaoTalk",
    "contact.email": "Email",
    "contact.phone": "전화",
    "contact.address": "주소",
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
    "home.hero.platform": "플랫폼",
    "home.hero.title": "상품과 서비스를 한 곳에서 찾고, 에이전트와 커뮤니티와 연결하세요",
    "home.hero.description": "UniServe는 상품, 서비스, 커뮤니티 포스트를 모두 모았습니다. 빠른 필터, 검증된 에이전트, 글로벌 협업으로 원하는 해법을 더 빨리 찾을 수 있습니다.",
    "home.hero.tag.search": "⚡ 빠른 검색",
    "home.hero.tag.verified": "✅ 검증된 에이전트",
    "home.hero.tag.community": "🌍 커뮤니티",
    "home.hero.slide.products.title": "상품",
    "home.hero.slide.products.desc": "전자제품, 패션, 장난감 등",
    "home.hero.slide.products.badge": "상품",
    "home.hero.slide.services.title": "서비스",
    "home.hero.slide.services.desc": "IT, 마케팅, 디자인, 교육",
    "home.hero.slide.services.badge": "서비스",
    "home.hero.slide.community.title": "커뮤니티",
    "home.hero.slide.community.desc": "아이디어 공유 및 파트너 찾기",
    "home.hero.slide.community.badge": "포럼",
    "home.hero.slide.agents.title": "에이전트",
    "home.hero.slide.agents.desc": "검증된 판매자와 제공자",
    "home.hero.slide.agents.badge": "Verified",
    "home.hero.slide.feed.title": "피드",
    "home.hero.slide.feed.desc": "뉴스와 제안을 한 스트림에",
    "home.hero.slide.feed.badge": "피드",
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
