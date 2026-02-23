export type OrderStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "dispute";

export type PaymentStatus = "escrowed" | "released" | "refunded";

export type OrderType = "hourly" | "package";

export type OrderCategory =
  | "consulting"
  | "translation"
  | "legal"
  | "psychology"
  | "sports"
  | "products";

export type OrderAgent = {
  id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
  role: string;
};

export type OrderItem = {
  id: string;
  status: OrderStatus;
  serviceTitle: string;
  agent: OrderAgent;
  price: number;
  currency: "USD" | "UZS" | "EUR";
  paymentStatus: PaymentStatus;
  createdAt: string;
  deadline: string;
  orderType: OrderType;
  hasDispute?: boolean;
  category: OrderCategory;
};

export const ordersMock: OrderItem[] = [
  {
    id: "ORD-2026-0142",
    status: "in_progress",
    serviceTitle: "UZ↔KR Document Translation",
    agent: {
      id: "agent-201",
      name: "Aziza Tursunova",
      avatar: "/avatars/agent-01.jpg",
      verified: true,
      role: "Translator"
    },
    price: 45,
    currency: "USD",
    paymentStatus: "escrowed",
    createdAt: "2026-01-28",
    deadline: "2026-02-02",
    orderType: "package",
    category: "translation"
  },
  {
    id: "ORD-2026-0141",
    status: "pending",
    serviceTitle: "Career & Visa Consulting Session",
    agent: {
      id: "agent-188",
      name: "Muslima Bozorova",
      avatar: "/avatars/agent-02.jpg",
      verified: true,
      role: "Consultant"
    },
    price: 20,
    currency: "USD",
    paymentStatus: "escrowed",
    createdAt: "2026-01-30",
    deadline: "2026-02-03",
    orderType: "hourly",
    category: "consulting"
  },
  {
    id: "ORD-2026-0138",
    status: "delivered",
    serviceTitle: "Contract Review & Legal Notes",
    agent: {
      id: "agent-133",
      name: "Shahzod Aliyev",
      avatar: "/avatars/agent-03.jpg",
      verified: true,
      role: "Legal Advisor"
    },
    price: 65,
    currency: "USD",
    paymentStatus: "escrowed",
    createdAt: "2026-01-22",
    deadline: "2026-01-29",
    orderType: "package",
    category: "legal"
  },
  {
    id: "ORD-2026-0129",
    status: "completed",
    serviceTitle: "Sports Coaching Plan (4 weeks)",
    agent: {
      id: "agent-104",
      name: "Shuhrat Ergashev",
      avatar: "/avatars/agent-04.jpg",
      verified: false,
      role: "Sports Coach"
    },
    price: 120,
    currency: "USD",
    paymentStatus: "released",
    createdAt: "2026-01-10",
    deadline: "2026-01-24",
    orderType: "package",
    category: "sports"
  },
  {
    id: "ORD-2026-0124",
    status: "dispute",
    serviceTitle: "Therapy Follow-up Session",
    agent: {
      id: "agent-078",
      name: "Nilufar Abdullayeva",
      avatar: "/avatars/agent-05.jpg",
      verified: true,
      role: "Psychologist"
    },
    price: 35,
    currency: "USD",
    paymentStatus: "escrowed",
    createdAt: "2026-01-09",
    deadline: "2026-01-16",
    orderType: "hourly",
    hasDispute: true,
    category: "psychology"
  }
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  dispute: "Dispute"
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  escrowed: "Escrowed",
  released: "Released",
  refunded: "Refunded"
};

export const orderCategoryLabel: Record<OrderCategory, string> = {
  consulting: "Consulting",
  translation: "Translation",
  legal: "Legal",
  psychology: "Psychology",
  sports: "Sports",
  products: "Products"
};
