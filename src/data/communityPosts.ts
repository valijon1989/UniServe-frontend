import type { CommunityPost } from "@/types/community";

const now = new Date();
const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

export const communityPosts: CommunityPost[] = [
  {
    id: "p-consult-001",
    groupId: "g-consult-001",
    title: "Visa case study: 6 oy ichida muvaffaqiyatli ariza",
    body: "Men ro'yxatdan o'tgan 18 ta KPI bo'yicha muhim hujjatlarni tayyorladim, hozircha chiqish qabetesi kamaymoqda.",
    type: "post",
    category: "Consulting",
    author: "Dilshod Karimov",
    role: "Expert",
    createdAt: iso(2),
    likes: 14,
    replies: 3,
    attachments: [
      { id: "a1", type: "document", label: "Checklist.pdf" },
      { id: "a2", type: "image", label: "Flowchart" }
    ]
  },
  {
    id: "p-consult-002",
    groupId: "g-consult-001",
    title: "Savol: audit raportini qanday tuzatish?",
    body: "Oylik auditda investitsiya qayerga ketishni aniqlashga yordam bering, xatoliklarni qanday qisqartirish mumkin?",
    type: "question",
    category: "Consulting",
    author: "Madina Omonova",
    role: "Member",
    createdAt: iso(5),
    likes: 9,
    replies: 5
  },
  {
    id: "p-consult-003",
    groupId: "g-consult-001",
    title: "Feedback: Bosh menejerni counsellor jamoasi",
    body: "Bugun 1-chi sessionda 7 ta KPI trendlari ko'rsatildi va 5 ta action plan yaratildi.",
    type: "comment",
    category: "Consulting",
    author: "Saodat Ergasheva",
    role: "Admin",
    createdAt: iso(20),
    likes: 6,
    replies: 2
  },
  {
    id: "p-translation-001",
    groupId: "g-translation-002",
    title: "Document Translation (Korean-English) sample",
    body: "Hujjatda yangi copyright yo'riqnomalari bor, qatiy formatga rioya qilish kerak.",
    type: "file",
    category: "Translation",
    author: "Madina Omonova",
    role: "Expert",
    createdAt: iso(3),
    likes: 12,
    replies: 4,
    attachments: [{ id: "a3", type: "document", label: "Migration-agreement.docx" }]
  },
  {
    id: "p-translation-002",
    groupId: "g-translation-002",
    title: "Savol: Zoom-da real-time tarjima strategiyasi",
    body: "Agar klient 15 daqiqa ichida 3 tilni almashtirsa, tizim qanday bo'lishi kerak?",
    type: "question",
    category: "Translation",
    author: "Aziza Tursunova",
    role: "Agent",
    createdAt: iso(6),
    likes: 8,
    replies: 3
  },
  {
    id: "p-translation-003",
    groupId: "g-translation-002",
    title: "Like: Reklam materiallarini ko'rib chiqish",
    body: "Jamoa yangi landing matnlarini maqtadi, variant 2 juda aniq.",
    type: "like",
    category: "Translation",
    author: "Javohir Usmonov",
    role: "Member",
    createdAt: iso(30),
    likes: 5,
    replies: 1
  },
  {
    id: "p-legal-001",
    groupId: "g-legal-003",
    title: "Notarial blankalar uchun yagona format",
    body: "Yuridik bo'limda 24ta blankani yagona faylga jamladik, boshqaruvga yuborish tayyor.",
    type: "file",
    category: "Legal",
    author: "Zafarbek Rahmatov",
    role: "Admin",
    createdAt: iso(4),
    likes: 16,
    replies: 4,
    attachments: [{ id: "a4", type: "document", label: "Notarial-set.zip" }]
  },
  {
    id: "p-legal-002",
    groupId: "g-legal-003",
    title: "Savol: Kontrakt clause 7.2 izohi",
    body: "Qanday qilib shartnomada 7.2-banddagi riskni kamaytirishni hujjatlashtirish kerak?",
    type: "question",
    category: "Legal",
    author: "Gulnoza Umarova",
    role: "Member",
    createdAt: iso(10),
    likes: 7,
    replies: 2
  },
  {
    id: "p-legal-003",
    groupId: "g-legal-003",
    title: "Comment: Yangi e'lon qoidalari",
    body: "Admin chiqqan e'lonning birinchi qatorida to'liq identifikatsiya bo'lishi shart deb topildi.",
    type: "comment",
    category: "Legal",
    author: "Elyor Po'latov",
    role: "Member",
    createdAt: iso(18),
    likes: 3,
    replies: 0
  },
  {
    id: "p-psych-001",
    groupId: "g-psychology-004",
    title: "Savol-javob: Stressni masofaviy ishda kamaytirish",
    body: "Mas’uliyatli vazifani 3 qismga bo'lib, har birini agent bilan baham ko'rish nimani beradi?",
    type: "question",
    category: "Psychology",
    author: "Sabina Ahmedova",
    role: "Expert",
    createdAt: iso(1),
    likes: 18,
    replies: 6
  },
  {
    id: "p-psych-002",
    groupId: "g-psychology-004",
    title: "Session recap: Kundalik Ishonch mashg'ulotlari",
    body: "Bugun 45 daqiqa davomida 5 ta nafas olish mashqlarini sinovdan o'tkazdik.",
    type: "post",
    category: "Psychology",
    author: "Malika Raxmatova",
    role: "Member",
    createdAt: iso(8),
    likes: 11,
    replies: 3
  },
  {
    id: "p-psych-003",
    groupId: "g-psychology-004",
    title: "Like: Audio-guided meditatsiya",
    body: "O'tgan kafedra meditatsiyasi 10 daqiqali audio fayl sifatida joylandi.",
    type: "like",
    category: "Psychology",
    author: "Nilufar Abdullayeva",
    role: "Member",
    createdAt: iso(15),
    likes: 4,
    replies: 0
  },
  {
    id: "p-sports-001",
    groupId: "g-sports-005",
    title: "Video: Pass-to-dribble kombinatsiyasi",
    body: "Trener video namoyish etmoqda: 3 ta kombinatsiyani ekranga ulab tomosha qiling.",
    type: "file",
    category: "Sports",
    author: "Shuhrat Ergashev",
    role: "Expert",
    createdAt: iso(3),
    likes: 20,
    replies: 10,
    attachments: [{ id: "a5", type: "video", label: "Pass-set.mp4" }]
  },
  {
    id: "p-sports-002",
    groupId: "g-sports-005",
    title: "Savol: Musobaqaga tayyorgarlik",
    body: "Nega ketma-ket 3 ta mashg'ulotdan so'ng tiklanish rejasi kerak?",
    type: "question",
    category: "Sports",
    author: "Akmal Sobirov",
    role: "Member",
    createdAt: iso(7),
    likes: 13,
    replies: 4
  },
  {
    id: "p-sports-003",
    groupId: "g-sports-005",
    title: "Comment: Anjomlar uchun joylashuv",
    body: "Yangi stadion anjomlarini startapga yetkazib berdik, 320 ta yoritish bor.",
    type: "comment",
    category: "Sports",
    author: "Kamola Karimova",
    role: "Agent",
    createdAt: iso(26),
    likes: 5,
    replies: 1
  },
  {
    id: "p-products-001",
    groupId: "g-products-006",
    title: "Mahsulot: Camera kit review",
    body: "20MP sensor, 4k video va 10x optik zoom — hamma o'zgarishlar ro'yxati.",
    type: "post",
    category: "Products",
    author: "Javohir Usmonov",
    role: "Member",
    createdAt: iso(3),
    likes: 17,
    replies: 5,
    attachments: [{ id: "a6", type: "document", label: "Camera-brief.pdf" }]
  },
  {
    id: "p-products-002",
    groupId: "g-products-006",
    title: "Savol: Qanday qilib online review tayyorlaymiz",
    body: "Agentlar 4K video va foto bilan birga loyihaga qanchalik tez qo'shilish mumkin?",
    type: "question",
    category: "Products",
    author: "Malika Raxmatova",
    role: "Member",
    createdAt: iso(12),
    likes: 6,
    replies: 2
  },
  {
    id: "p-products-003",
    groupId: "g-products-006",
    title: "Like: Video call orqali demo",
    body: "Online demo paytida har bir kamera tomonidan 2 ta burchak ko'rsatildi.",
    type: "like",
    category: "Products",
    author: "Rustam Xolmurodov",
    role: "Agent",
    createdAt: iso(22),
    likes: 2,
    replies: 0
  }
];

export const getGroupPosts = (groupId: string): CommunityPost[] => {
  return communityPosts.filter((post) => post.groupId === groupId).slice(0, 6);
};
