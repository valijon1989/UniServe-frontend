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
  | "auth.signup.agentTypeLabel"
  | "auth.signup.agentTypeService"
  | "auth.signup.agentTypeSeller"
  | "auth.signup.agentGroupLabel"
  | "auth.signup.agentCategoryLabel"
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
  | "services.hub.label"
  | "services.hub.title"
  | "services.hub.description"
  | "services.hub.noteTitle"
  | "services.hub.noteBody"
  | "services.hub.wordLabel"
  | "services.add.badge"
  | "services.add.title"
  | "services.add.description"
  | "services.add.typeLabel"
  | "services.add.type.material"
  | "services.add.type.spiritual"
  | "services.add.categoryLabel"
  | "services.add.nameLabel"
  | "services.add.namePlaceholder"
  | "services.add.priceLabel"
  | "services.add.certLabel"
  | "services.add.certPlaceholder"
  | "services.add.descLabel"
  | "services.add.descPlaceholder"
  | "services.add.imagesTitle"
  | "services.add.imagesDesc"
  | "services.add.imagesSelected"
  | "services.add.agree"
  | "services.add.submit"
  | "services.add.success"
  | "services.add.errors.name"
  | "services.add.errors.category"
  | "services.add.errors.price"
  | "services.add.errors.description"
  | "services.add.errors.cert"
  | "services.add.errors.images"
  | "services.add.errors.agree"
  | "services.add.restrictedTitle"
  | "services.add.restrictedDesc"
  | "services.add.sellerTitle"
  | "services.add.sellerDesc"
  | "services.add.sellerCta"
  | "services.add.loginCta"
  | "services.agent.verified"
  | "services.agent.rating"
  | "services.agent.reviews"
  | "services.agent.clients"
  | "services.agent.followers"
  | "services.agent.nice"
  | "services.agent.shares"
  | "services.agent.rate"
  | "services.agent.rateOnly"
  | "services.service.rate"
  | "services.service.rateOnly"
  | "services.service.used"
  | "services.service.reviews"
  | "services.actions.nice"
  | "services.actions.follow"
  | "services.actions.share"
  | "services.actions.followAgent"
  | "services.sort.label"
  | "services.sort.top"
  | "services.sort.new"
  | "services.pagination.prev"
  | "services.pagination.next"
  | "services.pagination.page"
  | "services.pagination.of"
  | "services.list.title"
  | "services.service.variant"
  | "services.sort.priceLow"
  | "services.sort.priceHigh"
  | "services.sort.rating"
  | "services.search.placeholder"
  | "services.filter.button"
  | "services.filter.title"
  | "services.filter.provider"
  | "services.filter.provider.social"
  | "services.filter.provider.material"
  | "services.filter.delivery"
  | "services.filter.delivery.online"
  | "services.filter.delivery.offline"
  | "services.filter.delivery.both"
  | "services.filter.rating"
  | "services.filter.price"
  | "services.filter.priceMin"
  | "services.filter.priceMax"
  | "services.filter.apply"
  | "services.filter.clear"
  | "services.filter.close"
  | "services.filter.any"
  | "services.filter.all"
  | "services.error.title"
  | "services.error.retry"
  | "services.empty.title"
  | "services.empty.clear"
  | "services.loading.more"
  | "services.sidebar.title"
  | "services.card.verified"
  | "services.card.like"
  | "services.card.liked"
  | "services.card.save"
  | "services.card.saved"
  | "services.card.book"
  | "services.card.view"
  | "services.card.share"
  | "services.group.material"
  | "services.group.spiritual"
  | "services.group.material.desc"
  | "services.group.spiritual.desc"
  | "services.category.taxi"
  | "services.category.taxi.desc"
  | "services.category.delivery"
  | "services.category.delivery.desc"
  | "services.category.technical"
  | "services.category.technical.desc"
  | "services.category.construction"
  | "services.category.construction.desc"
  | "services.category.moving"
  | "services.category.moving.desc"
  | "services.category.cleaning"
  | "services.category.cleaning.desc"
  | "services.category.nanny"
  | "services.category.nanny.desc"
  | "services.category.marketing"
  | "services.category.marketing.desc"
  | "services.category.employment"
  | "services.category.employment.desc"
  | "services.category.education"
  | "services.category.education.desc"
  | "services.category.consulting"
  | "services.category.consulting.desc"
  | "services.category.translation"
  | "services.category.translation.desc"
  | "services.category.psychology"
  | "services.category.psychology.desc"
  | "services.category.legal"
  | "services.category.legal.desc"
  | "services.category.sport"
  | "services.category.sport.desc"
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
    "auth.signup.agentTypeLabel": "Agent type",
    "auth.signup.agentTypeService": "Service agent",
    "auth.signup.agentTypeSeller": "Seller agent",
    "auth.signup.agentGroupLabel": "Service group",
    "auth.signup.agentCategoryLabel": "Service category",
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
    "home.hero.tag.search": "Fast search",
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
    "services.hub.label": "Services hub",
    "services.hub.title": "Material and spiritual services catalog",
    "services.hub.description": "Services are split into material and spiritual types. Each category includes verified agents and their offerings.",
    "services.hub.noteTitle": "Note",
    "services.hub.noteBody": "Product sellers should post in the Products section, not Services.",
    "services.hub.wordLabel": "Words",
    "services.add.badge": "Add Service",
    "services.add.title": "Offer a service",
    "services.add.description": "Agents provide service type, certificates or documents, and a description up to 500 words. 3-20 images are required.",
    "services.add.typeLabel": "Service type",
    "services.add.type.material": "Material services",
    "services.add.type.spiritual": "Spiritual services",
    "services.add.categoryLabel": "Category",
    "services.add.nameLabel": "Service name",
    "services.add.namePlaceholder": "Example: Family consultation",
    "services.add.priceLabel": "Price",
    "services.add.certLabel": "Certificates or documents",
    "services.add.certPlaceholder": "Example: Diploma, certificate, license",
    "services.add.descLabel": "Description (up to 500 words)",
    "services.add.descPlaceholder": "Service details, experience, and terms...",
    "services.add.imagesTitle": "Image requirements",
    "services.add.imagesDesc": "Upload at least 3 and up to 20 images.",
    "services.add.imagesSelected": "Selected images",
    "services.add.agree": "I confirm I am a qualified specialist and have supporting documents.",
    "services.add.submit": "Submit service",
    "services.add.success": "Service offer received. It will be published after review.",
    "services.add.errors.name": "Enter a service name.",
    "services.add.errors.category": "Category not selected.",
    "services.add.errors.price": "Enter a valid price.",
    "services.add.errors.description": "Description must be 1-500 words.",
    "services.add.errors.cert": "Provide certificates or documents.",
    "services.add.errors.images": "Images must be between 3 and 20.",
    "services.add.errors.agree": "Specialist confirmation is required.",
    "services.add.restrictedTitle": "Add Service is for service agents only",
    "services.add.restrictedDesc": "Log in as a service agent to submit services.",
    "services.add.sellerTitle": "Seller agent account",
    "services.add.sellerDesc": "You are registered as a seller agent. Service submission is disabled.",
    "services.add.sellerCta": "Go to Products",
    "services.add.loginCta": "Log in",
    "services.agent.verified": "Verified",
    "services.agent.rating": "Rating",
    "services.agent.reviews": "Reviews",
    "services.agent.clients": "Clients",
    "services.agent.followers": "Followers",
    "services.agent.nice": "Nice",
    "services.agent.shares": "Shares",
    "services.agent.rate": "Rate agent",
    "services.agent.rateOnly": "Only clients can rate",
    "services.service.rate": "Rate",
    "services.service.rateOnly": "Only clients can rate",
    "services.service.used": "Used",
    "services.service.reviews": "Reviews",
    "services.actions.nice": "Nice",
    "services.actions.follow": "Follow",
    "services.actions.share": "Share",
    "services.actions.followAgent": "Follow agent",
    "services.sort.label": "Sort",
    "services.sort.top": "Popular",
    "services.sort.new": "Newest",
    "services.sort.priceLow": "Price low",
    "services.sort.priceHigh": "Price high",
    "services.sort.rating": "Rating",
    "services.pagination.prev": "Prev",
    "services.pagination.next": "Next",
    "services.pagination.page": "Page",
    "services.pagination.of": "of",
    "services.list.title": "Services",
    "services.service.variant": "Variant",
    "services.search.placeholder": "Search services...",
    "services.filter.button": "Filter",
    "services.filter.title": "Filters",
    "services.filter.provider": "Provider type",
    "services.filter.provider.social": "Social",
    "services.filter.provider.material": "Material",
    "services.filter.delivery": "Delivery mode",
    "services.filter.delivery.online": "Online",
    "services.filter.delivery.offline": "Offline",
    "services.filter.delivery.both": "Both",
    "services.filter.rating": "Min rating",
    "services.filter.price": "Price range",
    "services.filter.priceMin": "Min",
    "services.filter.priceMax": "Max",
    "services.filter.apply": "Apply",
    "services.filter.clear": "Clear",
    "services.filter.close": "Close",
    "services.filter.any": "Any",
    "services.filter.all": "All",
    "services.error.title": "Something went wrong. Please try again.",
    "services.error.retry": "Retry",
    "services.empty.title": "No services found",
    "services.empty.clear": "Clear filters",
    "services.loading.more": "Loading more services...",
    "services.sidebar.title": "Categories",
    "services.card.verified": "Verified",
    "services.card.like": "Yoqdi",
    "services.card.liked": "Yoqdi",
    "services.card.save": "Save",
    "services.card.saved": "Saved",
    "services.card.book": "Book / Contact",
    "services.card.view": "View",
    "services.card.share": "Share",
    "services.group.material": "Material services",
    "services.group.spiritual": "Spiritual services",
    "services.group.material.desc": "Transport, construction, and hands-on services. Each agent is verified in their field.",
    "services.group.spiritual.desc": "Education, consulting, and personal development services. Every agent is verified.",
    "services.category.taxi": "Taxi / transportation",
    "services.category.taxi.desc": "City rides, transfers, and scheduled trips.",
    "services.category.delivery": "Delivery service",
    "services.category.delivery.desc": "Courier and parcel delivery with tracking.",
    "services.category.technical": "Technical service",
    "services.category.technical.desc": "Repair and maintenance for devices and equipment.",
    "services.category.construction": "Construction services",
    "services.category.construction.desc": "Renovation, building, and contractor services.",
    "services.category.moving": "Moving services",
    "services.category.moving.desc": "Home and office relocation assistance.",
    "services.category.cleaning": "Cleaning services",
    "services.category.cleaning.desc": "Home, office, and industrial cleaning.",
    "services.category.nanny": "Nanny services",
    "services.category.nanny.desc": "Childcare and family support services.",
    "services.category.marketing": "Marketing & blogging",
    "services.category.marketing.desc": "Social media, influencer, and promotion services.",
    "services.category.employment": "Employment services",
    "services.category.employment.desc": "Recruitment and job placement services.",
    "services.category.education": "Education & courses",
    "services.category.education.desc": "Courses, mentoring, and tutoring services.",
    "services.category.consulting": "Consulting",
    "services.category.consulting.desc": "Business and strategy consulting.",
    "services.category.translation": "Translation",
    "services.category.translation.desc": "Document and interpretation services.",
    "services.category.psychology": "Psychology services",
    "services.category.psychology.desc": "Counseling and therapy sessions.",
    "services.category.legal": "Legal services",
    "services.category.legal.desc": "Legal advice and documentation.",
    "services.category.sport": "Sports coaching",
    "services.category.sport.desc": "Personal training and coaching.",
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
    "auth.signup.agentTypeLabel": "Agent turi",
    "auth.signup.agentTypeService": "Xizmat agenti",
    "auth.signup.agentTypeSeller": "Sotuvchi agent",
    "auth.signup.agentGroupLabel": "Xizmat bo'limi",
    "auth.signup.agentCategoryLabel": "Xizmat kategoriyasi",
    "auth.signup.error": "Ro'yhatdan o'tishda xato",
    "auth.signup.submit": "Akkaunt yaratish",
    "auth.signup.loading": "Yaratilmoqda...",
    "home.title": "UniServe lenta",
    "home.subtitle": "Agentlar va foydalanuvchilarning xizmatlari, mahsulotlari va ijtimoiy postlari shu yerda ko'rinadi.",
    "home.loading": "Yuklanmoqda...",
    "home.empty": "Hozircha postlar yo'q. Dastlabki ma'lumotlarni seed qilib ko'ring.",
    "home.hero.platform": "Platforma",
    "home.hero.title": "Tovar va xizmatlarni bir joyda toping, agentlar va hamjamiyat bilan bog‘laning",
    "home.hero.description": "UniServe - mahsulotlar, xizmatlar va hamjamiyat postlari jamlangan markaz. Tez filtrlar, tasdiqlangan agentlar va global hamkorlik orqali kerakli yechimni toping.",
    "home.hero.tag.search": "Tezkor qidiruv",
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
    "services.hub.label": "Xizmatlar bo'limi",
    "services.hub.title": "Moddiy va manaviy xizmatlar katalogi",
    "services.hub.description": "Xizmatlar ikki asosiy turga bo'lingan: moddiy va manaviy. Har bir kategoriya ichida kamida ikki agent va ularning xizmatlari mavjud. Agentlar tegishli soha mutaxassisi ekanligini tasdiqlagan bo'lishi shart.",
    "services.hub.noteTitle": "Eslatma",
    "services.hub.noteBody": "Mahsulot sotuvchilari xizmat emas, mahsulotlar bo'limiga e'lon joylaydi.",
    "services.hub.wordLabel": "So'zlar",
    "services.add.badge": "Xizmat qo'shish",
    "services.add.title": "Xizmat taklif qilish",
    "services.add.description": "Agentlar xizmat turini, sertifikat yoki hujjatlarni, va 500 so'zgacha tarifni kiritadi. Kamida 3 ta va ko'pi bilan 20 ta rasm talab etiladi.",
    "services.add.typeLabel": "Xizmat turi",
    "services.add.type.material": "Moddiy xizmatlar",
    "services.add.type.spiritual": "Manaviy xizmatlar",
    "services.add.categoryLabel": "Kategoriya",
    "services.add.nameLabel": "Xizmat nomi",
    "services.add.namePlaceholder": "Masalan: Oilaviy konsultatsiya",
    "services.add.priceLabel": "Narx",
    "services.add.certLabel": "Sertifikat yoki hujjatlar",
    "services.add.certPlaceholder": "Masalan: Diplom, sertifikat, litsenziya",
    "services.add.descLabel": "Tavsif (500 so'zgacha)",
    "services.add.descPlaceholder": "Xizmat tafsilotlari, tajriba va shartlar...",
    "services.add.imagesTitle": "Rasmlar talabi",
    "services.add.imagesDesc": "Kamida 3 ta, ko'pi bilan 20 ta rasm yuklashingiz kerak.",
    "services.add.imagesSelected": "Tanlangan rasmlar",
    "services.add.agree": "Men ushbu xizmat bo'yicha mutaxassis ekanligimni va hujjatlarim borligini tasdiqlayman.",
    "services.add.submit": "Xizmatni yuborish",
    "services.add.success": "Xizmat taklifi qabul qilindi. Tekshiruvdan so'ng e'lon qilinadi.",
    "services.add.errors.name": "Xizmat nomini kiriting.",
    "services.add.errors.category": "Kategoriya tanlanmagan.",
    "services.add.errors.price": "Narxni kiriting.",
    "services.add.errors.description": "Tavsif 1-500 so'z orasida bo'lishi kerak.",
    "services.add.errors.cert": "Sertifikat yoki hujjatlarni kiriting.",
    "services.add.errors.images": "Rasmlar soni kamida 3 ta, ko'pi bilan 20 ta bo'lishi kerak.",
    "services.add.errors.agree": "Mutaxassisligingizni tasdiqlash shart.",
    "services.add.restrictedTitle": "Xizmat qo'shish faqat xizmat agentlari uchun",
    "services.add.restrictedDesc": "Xizmat qo'shish uchun xizmat agenti sifatida kiring.",
    "services.add.sellerTitle": "Sotuvchi agent hisobi",
    "services.add.sellerDesc": "Siz sotuvchi agent sifatida ro'yxatdan o'tgansiz. Xizmat qo'shish bo'limi yopiq.",
    "services.add.sellerCta": "Mahsulotlar bo'limiga o'tish",
    "services.add.loginCta": "Kirish",
    "services.agent.verified": "Tasdiqlangan",
    "services.agent.rating": "Yulduz",
    "services.agent.reviews": "Baho",
    "services.agent.clients": "Mijozlar",
    "services.agent.followers": "Followerlar",
    "services.agent.nice": "Nice",
    "services.agent.shares": "Ulashish",
    "services.agent.rate": "Agentga baho berish",
    "services.agent.rateOnly": "Faqat foydalanganlar baholaydi",
    "services.service.rate": "Baho berish",
    "services.service.rateOnly": "Faqat foydalanganlar baholaydi",
    "services.service.used": "Foydalanganlar",
    "services.service.reviews": "Baho",
    "services.actions.nice": "Nice",
    "services.actions.follow": "Follow",
    "services.actions.share": "Ulashish",
    "services.actions.followAgent": "Agentga follow",
    "services.sort.label": "Saralash",
    "services.sort.top": "Ommabop",
    "services.sort.new": "Eng yangi",
    "services.sort.priceLow": "Arzon",
    "services.sort.priceHigh": "Qimmat",
    "services.sort.rating": "Reyting",
    "services.pagination.prev": "Oldingi",
    "services.pagination.next": "Keyingi",
    "services.pagination.page": "Sahifa",
    "services.pagination.of": "/",
    "services.list.title": "Xizmatlar",
    "services.service.variant": "Variant",
    "services.search.placeholder": "Xizmatlarni qidiring...",
    "services.filter.button": "Filtr",
    "services.filter.title": "Filtrlar",
    "services.filter.provider": "Agent turi",
    "services.filter.provider.social": "Ijtimoiy",
    "services.filter.provider.material": "Moddiy",
    "services.filter.delivery": "Yetkazish turi",
    "services.filter.delivery.online": "Onlayn",
    "services.filter.delivery.offline": "Offline",
    "services.filter.delivery.both": "Ikkalasi",
    "services.filter.rating": "Min reyting",
    "services.filter.price": "Narx oralig'i",
    "services.filter.priceMin": "Min",
    "services.filter.priceMax": "Max",
    "services.filter.apply": "Qo'llash",
    "services.filter.clear": "Tozalash",
    "services.filter.close": "Yopish",
    "services.filter.any": "Istalgan",
    "services.filter.all": "Barchasi",
    "services.error.title": "Xatolik yuz berdi. Qayta urinib ko'ring.",
    "services.error.retry": "Qayta urinish",
    "services.empty.title": "Xizmatlar topilmadi",
    "services.empty.clear": "Filtrlarni tozalash",
    "services.loading.more": "Yana xizmatlar yuklanmoqda...",
    "services.sidebar.title": "Kategoriyalar",
    "services.card.verified": "Tasdiqlangan",
    "services.card.like": "Like",
    "services.card.liked": "Liked",
    "services.card.save": "Saqlash",
    "services.card.saved": "Saqlangan",
    "services.card.book": "Bog'lanish",
    "services.card.view": "Ko'rish",
    "services.card.share": "Ulashish",
    "services.group.material": "Moddiy xizmatlar",
    "services.group.spiritual": "Manaviy xizmatlar",
    "services.group.material.desc": "Transport, qurilish va amaliy ishlar. Har bir agent tegishli mutaxassisligini tasdiqlagan.",
    "services.group.spiritual.desc": "Ta'lim, maslahat va rivojlanish xizmatlari. Har bir agent mutaxassisligini tasdiqlagan.",
    "services.category.taxi": "Eltib qo'yish (taxi xizmati)",
    "services.category.taxi.desc": "Shahar ichida va shaharlararo tezkor tashish.",
    "services.category.delivery": "Yetkazib berish (pochta xizmati)",
    "services.category.delivery.desc": "Hujjat, posilka va tezkor kur'er xizmati.",
    "services.category.technical": "Texnik xizmat ko'rsatish",
    "services.category.technical.desc": "Maishiy va sanoat uskunalarini ta'mirlash.",
    "services.category.construction": "Qurilish va quruvchilar xizmati",
    "services.category.construction.desc": "Remont, ustalik va obodonlashtirish.",
    "services.category.moving": "Ko'chish va ko'chirish xizmati",
    "services.category.moving.desc": "Uy va ofis ko'chirish, yuklash va tushirish.",
    "services.category.cleaning": "Tozalik xizmati",
    "services.category.cleaning.desc": "Uy, ofis va sanoat tozalash xizmati.",
    "services.category.nanny": "Enagalik xizmati",
    "services.category.nanny.desc": "Bolalar parvarishi va uyda yordam.",
    "services.category.marketing": "Reklama (blogerlar)",
    "services.category.marketing.desc": "Brend reklama va ijtimoiy tarmoqlar targ'iboti.",
    "services.category.employment": "Ish topib berish xizmati",
    "services.category.employment.desc": "Vakansiya topish va kadrlar tanlash.",
    "services.category.education": "Ta'lim (o'quv kurslari)",
    "services.category.education.desc": "Til, IT, biznes va shaxsiy rivojlanish kurslari.",
    "services.category.consulting": "Konsalting xizmati",
    "services.category.consulting.desc": "Biznes va strategik maslahatlarga yo'naltirilgan.",
    "services.category.translation": "Tarjimonlik xizmati",
    "services.category.translation.desc": "Hujjat va sinxron tarjima xizmatlari.",
    "services.category.psychology": "Ruhshunoslik xizmati",
    "services.category.psychology.desc": "Psixologik maslahat va terapiya seanslari.",
    "services.category.legal": "Huquqshunos xizmati",
    "services.category.legal.desc": "Yuridik maslahat va hujjatlar tayyorlash.",
    "services.category.sport": "Sport bo'yicha trener xizmati",
    "services.category.sport.desc": "Individual va guruh mashg'ulotlari.",
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
    "auth.signup.agentTypeLabel": "Тип агента",
    "auth.signup.agentTypeService": "Агент услуг",
    "auth.signup.agentTypeSeller": "Агент продавец",
    "auth.signup.agentGroupLabel": "Группа услуг",
    "auth.signup.agentCategoryLabel": "Категория услуг",
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
    "home.hero.tag.search": "Быстрый поиск",
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
    "services.hub.label": "Раздел услуг",
    "services.hub.title": "Каталог материальных и духовных услуг",
    "services.hub.description": "Услуги разделены на материальные и духовные. В каждой категории есть проверенные агенты и их предложения.",
    "services.hub.noteTitle": "Примечание",
    "services.hub.noteBody": "Продавцы товаров размещают объявления в разделе товаров, а не услуг.",
    "services.hub.wordLabel": "Слова",
    "services.add.badge": "Добавить услугу",
    "services.add.title": "Предложить услугу",
    "services.add.description": "Агенты указывают тип услуги, сертификаты или документы и описание до 500 слов. Требуется от 3 до 20 изображений.",
    "services.add.typeLabel": "Тип услуги",
    "services.add.type.material": "Материальные услуги",
    "services.add.type.spiritual": "Духовные услуги",
    "services.add.categoryLabel": "Категория",
    "services.add.nameLabel": "Название услуги",
    "services.add.namePlaceholder": "Например: Семейная консультация",
    "services.add.priceLabel": "Цена",
    "services.add.certLabel": "Сертификаты или документы",
    "services.add.certPlaceholder": "Например: Диплом, сертификат, лицензия",
    "services.add.descLabel": "Описание (до 500 слов)",
    "services.add.descPlaceholder": "Детали услуги, опыт и условия...",
    "services.add.imagesTitle": "Требования к изображениям",
    "services.add.imagesDesc": "Загрузите минимум 3 и максимум 20 изображений.",
    "services.add.imagesSelected": "Выбрано изображений",
    "services.add.agree": "Подтверждаю, что я квалифицированный специалист и у меня есть документы.",
    "services.add.submit": "Отправить услугу",
    "services.add.success": "Предложение принято. После проверки услуга будет опубликована.",
    "services.add.errors.name": "Введите название услуги.",
    "services.add.errors.category": "Категория не выбрана.",
    "services.add.errors.price": "Введите корректную цену.",
    "services.add.errors.description": "Описание должно быть от 1 до 500 слов.",
    "services.add.errors.cert": "Укажите сертификаты или документы.",
    "services.add.errors.images": "Количество изображений должно быть от 3 до 20.",
    "services.add.errors.agree": "Требуется подтверждение специалиста.",
    "services.add.restrictedTitle": "Добавление услуги доступно только агентам услуг",
    "services.add.restrictedDesc": "Войдите как агент услуг, чтобы размещать услуги.",
    "services.add.sellerTitle": "Аккаунт агента-продавца",
    "services.add.sellerDesc": "Вы зарегистрированы как агент-продавец. Раздел услуг недоступен.",
    "services.add.sellerCta": "Перейти к товарам",
    "services.add.loginCta": "Войти",
    "services.agent.verified": "Проверено",
    "services.agent.rating": "Рейтинг",
    "services.agent.reviews": "Отзывы",
    "services.agent.clients": "Клиенты",
    "services.agent.followers": "Подписчики",
    "services.agent.nice": "Нравится",
    "services.agent.shares": "Поделиться",
    "services.agent.rate": "Оценить агента",
    "services.agent.rateOnly": "Оценка доступна только клиентам",
    "services.service.rate": "Оценить",
    "services.service.rateOnly": "Оценка доступна только клиентам",
    "services.service.used": "Пользовались",
    "services.service.reviews": "Отзывы",
    "services.actions.nice": "Нравится",
    "services.actions.follow": "Подписаться",
    "services.actions.share": "Поделиться",
    "services.actions.followAgent": "Подписаться на агента",
    "services.sort.label": "Сортировка",
    "services.sort.top": "Популярные",
    "services.sort.new": "Сначала новые",
    "services.sort.priceLow": "Дешевле",
    "services.sort.priceHigh": "Дороже",
    "services.sort.rating": "Рейтинг",
    "services.pagination.prev": "Назад",
    "services.pagination.next": "Вперед",
    "services.pagination.page": "Стр.",
    "services.pagination.of": "из",
    "services.list.title": "Услуги",
    "services.service.variant": "Вариант",
    "services.search.placeholder": "Поиск услуг...",
    "services.filter.button": "Фильтр",
    "services.filter.title": "Фильтры",
    "services.filter.provider": "Тип исполнителя",
    "services.filter.provider.social": "Социальные",
    "services.filter.provider.material": "Материальные",
    "services.filter.delivery": "Формат",
    "services.filter.delivery.online": "Онлайн",
    "services.filter.delivery.offline": "Офлайн",
    "services.filter.delivery.both": "Оба",
    "services.filter.rating": "Мин. рейтинг",
    "services.filter.price": "Диапазон цены",
    "services.filter.priceMin": "Мин",
    "services.filter.priceMax": "Макс",
    "services.filter.apply": "Применить",
    "services.filter.clear": "Сбросить",
    "services.filter.close": "Закрыть",
    "services.filter.any": "Любой",
    "services.filter.all": "Все",
    "services.error.title": "Произошла ошибка. Попробуйте еще раз.",
    "services.error.retry": "Повторить",
    "services.empty.title": "Услуги не найдены",
    "services.empty.clear": "Сбросить фильтры",
    "services.loading.more": "Загружаем больше услуг...",
    "services.sidebar.title": "Категории",
    "services.card.verified": "Проверено",
    "services.card.like": "Нравится",
    "services.card.liked": "Нравится",
    "services.card.save": "Сохранить",
    "services.card.saved": "Сохранено",
    "services.card.book": "Связаться",
    "services.card.view": "Смотреть",
    "services.card.share": "Поделиться",
    "services.group.material": "Материальные услуги",
    "services.group.spiritual": "Духовные услуги",
    "services.group.material.desc": "Транспорт, строительство и практические услуги. Каждый агент подтвержден.",
    "services.group.spiritual.desc": "Обучение, консультации и развитие. Каждый агент подтвержден.",
    "services.category.taxi": "Такси и перевозки",
    "services.category.taxi.desc": "Городские поездки, трансферы и маршруты.",
    "services.category.delivery": "Доставка",
    "services.category.delivery.desc": "Курьерская доставка и посылки с отслеживанием.",
    "services.category.technical": "Техническое обслуживание",
    "services.category.technical.desc": "Ремонт и обслуживание техники и оборудования.",
    "services.category.construction": "Строительные услуги",
    "services.category.construction.desc": "Ремонт, строительство и подрядные работы.",
    "services.category.moving": "Переезды",
    "services.category.moving.desc": "Квартирные и офисные переезды.",
    "services.category.cleaning": "Клининг",
    "services.category.cleaning.desc": "Уборка дома, офиса и объектов.",
    "services.category.nanny": "Няни и уход",
    "services.category.nanny.desc": "Уход за детьми и помощь семье.",
    "services.category.marketing": "Маркетинг и блогеры",
    "services.category.marketing.desc": "SMM, реклама и продвижение.",
    "services.category.employment": "Трудоустройство",
    "services.category.employment.desc": "Рекрутинг и подбор персонала.",
    "services.category.education": "Обучение и курсы",
    "services.category.education.desc": "Курсы, наставничество и обучение.",
    "services.category.consulting": "Консалтинг",
    "services.category.consulting.desc": "Бизнес и стратегические консультации.",
    "services.category.translation": "Переводы",
    "services.category.translation.desc": "Переводы документов и синхронные услуги.",
    "services.category.psychology": "Психология",
    "services.category.psychology.desc": "Консультации и терапевтические сессии.",
    "services.category.legal": "Юридические услуги",
    "services.category.legal.desc": "Юридические консультации и документы.",
    "services.category.sport": "Спортивные тренеры",
    "services.category.sport.desc": "Индивидуальные и групповые тренировки.",
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
    "auth.signup.agentTypeLabel": "에이전트 유형",
    "auth.signup.agentTypeService": "서비스 에이전트",
    "auth.signup.agentTypeSeller": "판매 에이전트",
    "auth.signup.agentGroupLabel": "서비스 그룹",
    "auth.signup.agentCategoryLabel": "서비스 카테고리",
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
    "home.hero.tag.search": "빠른 검색",
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
    "services.hub.label": "서비스 허브",
    "services.hub.title": "물질/정신 서비스 카탈로그",
    "services.hub.description": "서비스는 물질과 정신 유형으로 나뉩니다. 각 카테고리에 검증된 에이전트와 서비스가 있습니다.",
    "services.hub.noteTitle": "안내",
    "services.hub.noteBody": "상품 판매자는 서비스가 아니라 상품 섹션에 게시합니다.",
    "services.hub.wordLabel": "단어 수",
    "services.add.badge": "서비스 추가",
    "services.add.title": "서비스 제안하기",
    "services.add.description": "에이전트는 서비스 유형, 증명서/문서, 500단어 이하 설명을 입력합니다. 3-20장의 이미지를 업로드해야 합니다.",
    "services.add.typeLabel": "서비스 유형",
    "services.add.type.material": "물질 서비스",
    "services.add.type.spiritual": "정신 서비스",
    "services.add.categoryLabel": "카테고리",
    "services.add.nameLabel": "서비스명",
    "services.add.namePlaceholder": "예: 가족 상담",
    "services.add.priceLabel": "가격",
    "services.add.certLabel": "증명서 또는 문서",
    "services.add.certPlaceholder": "예: diploma, certificate, license",
    "services.add.descLabel": "설명 (최대 500단어)",
    "services.add.descPlaceholder": "서비스 상세, 경험, 조건...",
    "services.add.imagesTitle": "이미지 요구사항",
    "services.add.imagesDesc": "최소 3장, 최대 20장의 이미지를 업로드하세요.",
    "services.add.imagesSelected": "선택된 이미지",
    "services.add.agree": "해당 서비스의 전문 자격과 문서가 있음을 확인합니다.",
    "services.add.submit": "서비스 제출",
    "services.add.success": "서비스 제안이 접수되었습니다. 검토 후 게시됩니다.",
    "services.add.errors.name": "서비스명을 입력하세요.",
    "services.add.errors.category": "카테고리가 선택되지 않았습니다.",
    "services.add.errors.price": "올바른 가격을 입력하세요.",
    "services.add.errors.description": "설명은 1-500단어여야 합니다.",
    "services.add.errors.cert": "증명서 또는 문서를 입력하세요.",
    "services.add.errors.images": "이미지는 3-20장 사이여야 합니다.",
    "services.add.errors.agree": "전문가 확인이 필요합니다.",
    "services.add.restrictedTitle": "서비스 추가는 서비스 에이전트 전용입니다",
    "services.add.restrictedDesc": "서비스 등록을 위해 서비스 에이전트로 로그인하세요.",
    "services.add.sellerTitle": "판매 에이전트 계정",
    "services.add.sellerDesc": "판매 에이전트로 등록되어 있어 서비스 등록이 제한됩니다.",
    "services.add.sellerCta": "상품 섹션으로 이동",
    "services.add.loginCta": "로그인",
    "services.agent.verified": "검증됨",
    "services.agent.rating": "평점",
    "services.agent.reviews": "리뷰",
    "services.agent.clients": "고객",
    "services.agent.followers": "팔로워",
    "services.agent.nice": "좋아요",
    "services.agent.shares": "공유",
    "services.agent.rate": "에이전트 평가",
    "services.agent.rateOnly": "이용자만 평가 가능",
    "services.service.rate": "평가하기",
    "services.service.rateOnly": "이용자만 평가 가능",
    "services.service.used": "이용",
    "services.service.reviews": "리뷰",
    "services.actions.nice": "좋아요",
    "services.actions.follow": "팔로우",
    "services.actions.share": "공유",
    "services.actions.followAgent": "에이전트 팔로우",
    "services.sort.label": "정렬",
    "services.sort.top": "인기순",
    "services.sort.new": "최신순",
    "services.sort.priceLow": "가격 낮은 순",
    "services.sort.priceHigh": "가격 높은 순",
    "services.sort.rating": "평점",
    "services.pagination.prev": "이전",
    "services.pagination.next": "다음",
    "services.pagination.page": "페이지",
    "services.pagination.of": "/",
    "services.list.title": "서비스",
    "services.service.variant": "변형",
    "services.search.placeholder": "서비스 검색...",
    "services.filter.button": "필터",
    "services.filter.title": "필터",
    "services.filter.provider": "제공자 유형",
    "services.filter.provider.social": "사회",
    "services.filter.provider.material": "물질",
    "services.filter.delivery": "제공 방식",
    "services.filter.delivery.online": "온라인",
    "services.filter.delivery.offline": "오프라인",
    "services.filter.delivery.both": "둘 다",
    "services.filter.rating": "최소 평점",
    "services.filter.price": "가격 범위",
    "services.filter.priceMin": "최소",
    "services.filter.priceMax": "최대",
    "services.filter.apply": "적용",
    "services.filter.clear": "초기화",
    "services.filter.close": "닫기",
    "services.filter.any": "무관",
    "services.filter.all": "전체",
    "services.error.title": "문제가 발생했습니다. 다시 시도하세요.",
    "services.error.retry": "다시 시도",
    "services.empty.title": "서비스를 찾을 수 없습니다",
    "services.empty.clear": "필터 초기화",
    "services.loading.more": "추가 서비스를 불러오는 중...",
    "services.sidebar.title": "카테고리",
    "services.card.verified": "검증됨",
    "services.card.like": "좋아요",
    "services.card.liked": "좋아요",
    "services.card.save": "저장",
    "services.card.saved": "저장됨",
    "services.card.book": "문의하기",
    "services.card.view": "보기",
    "services.card.share": "공유",
    "services.group.material": "물질 서비스",
    "services.group.spiritual": "정신 서비스",
    "services.group.material.desc": "교통, 건설, 실무형 서비스. 모든 에이전트는 검증됩니다.",
    "services.group.spiritual.desc": "교육, 컨설팅, 성장 서비스. 모든 에이전트는 검증됩니다.",
    "services.category.taxi": "택시/이동 서비스",
    "services.category.taxi.desc": "도시 이동, 공항 이동, 예약 서비스.",
    "services.category.delivery": "배송 서비스",
    "services.category.delivery.desc": "문서 및 소포 배송과 추적.",
    "services.category.technical": "기술 서비스",
    "services.category.technical.desc": "기기 및 장비 수리/점검.",
    "services.category.construction": "건설 서비스",
    "services.category.construction.desc": "리모델링 및 시공 서비스.",
    "services.category.moving": "이사 서비스",
    "services.category.moving.desc": "가정/사무실 이사 지원.",
    "services.category.cleaning": "청소 서비스",
    "services.category.cleaning.desc": "가정, 사무실, 시설 청소.",
    "services.category.nanny": "베이비시터 서비스",
    "services.category.nanny.desc": "육아 및 가정 돌봄.",
    "services.category.marketing": "마케팅/블로거",
    "services.category.marketing.desc": "SNS 홍보 및 마케팅.",
    "services.category.employment": "취업 지원",
    "services.category.employment.desc": "채용 및 취업 컨설팅.",
    "services.category.education": "교육/코스",
    "services.category.education.desc": "교육 과정과 튜터링.",
    "services.category.consulting": "컨설팅",
    "services.category.consulting.desc": "비즈니스/전략 컨설팅.",
    "services.category.translation": "번역 서비스",
    "services.category.translation.desc": "문서 번역 및 통역.",
    "services.category.psychology": "심리 상담",
    "services.category.psychology.desc": "상담 및 치료 세션.",
    "services.category.legal": "법률 서비스",
    "services.category.legal.desc": "법률 상담 및 문서 작성.",
    "services.category.sport": "스포츠 코칭",
    "services.category.sport.desc": "개인/그룹 트레이닝.",
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
