import { api } from "./client";
import { purchaseProduct, type Product } from "./products";
import { readStoredLanguage, resolveLocalizedText, tx, type SupportedLocale } from "@/lib/localization";
import { normalizeMarketplaceTitle } from "@/lib/marketplaceNaming";
import { useAuthStore } from "@/store/auth";

type JsonObject = Record<string, any>;
type CartUpdateListener = (summary: CartSummary) => void;
type CommercePayloadEntity = Partial<Product> & JsonObject;

export type CheckoutMode = "cart" | "buynow";
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "CONFIRMED" | "FAILED";
export type CommerceItemKind = "product" | "service";

export interface ProductSnapshot {
  productId: string;
  id: string;
  kind: CommerceItemKind;
  title: string;
  thumbnail: string;
  price: number;
  currency: string;
  category?: string;
}

export interface CartItem extends ProductSnapshot {
  qty: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  counts: Record<CommerceItemKind, number>;
  subtotal: number;
  currency: string;
  updatedAt: string;
}

export interface AddCartItemPayload {
  productId: string;
  qty?: number;
  product?: CommercePayloadEntity;
}

export interface BuyNowSession {
  sid: string;
  item: CartItem;
  createdAt: string;
}

export interface OrderCreatePayload {
  mode: CheckoutMode;
  items: CartItem[];
  shippingAddress: string;
  phone: string;
  deliveryOption: string;
  paymentMethod: string;
}

export interface CheckoutPaymentMethod {
  code: string;
  displayName: string;
  group: string;
  provider?: string;
  checkoutDescription?: string;
}

export interface CommercePaymentCollection {
  id: string;
  orderId: string;
  paymentId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  status: string;
  amount: number;
  currency: string;
  methodCode: string;
  methodGroup?: string | null;
  provider?: string | null;
  displayName?: string | null;
  nextActionType?: string | null;
  nextActionLabel?: string | null;
  redirectUrl?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  expiresAt?: string | null;
  paidAt?: string | null;
  escrowHeldAt?: string | null;
  failureReason?: string | null;
  invoice?: {
    id: string;
    kind: string;
    status: string;
    referenceCode?: string | null;
    secureLinkUrl?: string | null;
    bankDetails?: Record<string, any> | null;
    instructionText?: string | null;
    expiresAt?: string | null;
  } | null;
  smsRequest?: {
    id: string;
    type: string;
    phoneMasked?: string | null;
    verificationState?: string | null;
    deliveryStatus?: string | null;
    referenceCode?: string | null;
    resendCount?: number;
    sentAt?: string | null;
    expiresAt?: string | null;
  } | null;
  bankTransfer?: {
    id: string;
    status: string;
    referenceCode?: string | null;
    bankDetails?: Record<string, any> | null;
    instructionText?: string | null;
    expiresAt?: string | null;
    receiptUrl?: string | null;
  } | null;
}

export interface CommerceOrder {
  id: string;
  mode: CheckoutMode;
  status: OrderStatus;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingFee?: number;
  total?: number;
  currency: string;
  shippingAddress: string;
  phone: string;
  deliveryOption: string;
  paymentMethod: string;
  paymentWorkflowStatus?: string;
  paymentCollectionStatus?: string;
  paymentIntentId?: string | null;
  paymentId?: string | null;
  trustNotice?: string | null;
  nextSteps?: string[];
  paymentCollection?: CommercePaymentCollection | null;
  createdAt: string;
  paidAt?: string;
}

export interface CheckoutSubmissionResult {
  order: CommerceOrder;
  paymentCollection: CommercePaymentCollection | null;
  trustNotice?: string | null;
}

const CART_KEY = "uniserve_cart_v1";
const BUY_NOW_KEY = "uniserve_buy_now_sessions_v1";
const ORDERS_KEY = "uniserve_local_orders_v1";
const ENDPOINT_MISSING_STATUSES = [404, 405, 422, 501];
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const COMMERCE_API_ONLY = ["1", "true", "yes", "on"].includes(
  String(process.env.NEXT_PUBLIC_COMMERCE_API_ONLY || "0").toLowerCase()
);
const cartListeners = new Set<CartUpdateListener>();

interface LocalCartState {
  items: CartItem[];
  updatedAt: string;
}

interface LocalBuyNowState {
  sessions: Record<string, BuyNowSession>;
}

interface LocalOrdersState {
  orders: CommerceOrder[];
}

const asRecord = (value: unknown): JsonObject | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonObject;
};

const asArray = <T = any>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeQty = (value: unknown) => {
  const qty = Math.floor(toNumber(value, 1));
  return Math.max(1, qty);
};

const normalizeKind = (value: unknown): CommerceItemKind => (String(value || "").trim().toLowerCase() === "service" ? "service" : "product");

const isRemoteCommerceId = (value: unknown) => OBJECT_ID_RE.test(String(value || "").trim());

const resolveCommerceProductId = (productId: unknown, product?: CommercePayloadEntity) => {
  const direct = String(productId || "").trim();
  if (OBJECT_ID_RE.test(direct)) return direct;

  const productRef = asRecord(product) || {};
  const nested = String(productRef._id || productRef.id || "").trim();
  if (OBJECT_ID_RE.test(nested)) return nested;

  return direct || nested;
};

const getStatus = (error: unknown) => {
  return (error as { response?: { status?: number } })?.response?.status;
};

const isAuthStatus = (error: unknown) => {
  const status = getStatus(error);
  return status === 401 || status === 403;
};

const shouldTryNextEndpoint = (error: unknown) => {
  const status = getStatus(error);
  return typeof status === "number" && ENDPOINT_MISSING_STATUSES.includes(status);
};

const makeApiOnlyError = () =>
  new Error("Commerce API-only mode is enabled, but required cart/checkout/order endpoint is unavailable");

const inBrowser = () => typeof window !== "undefined";
const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

const canUseRemoteCommerceProduct = (productId: unknown, product?: CommercePayloadEntity) =>
  isAuthenticated() && isRemoteCommerceId(resolveCommerceProductId(productId, product));

const canUseRemoteCommerceId = (value: unknown) => isAuthenticated() && isRemoteCommerceId(value);

export const getDefaultCheckoutPaymentMethods = (
  locale: SupportedLocale = readStoredLanguage()
): CheckoutPaymentMethod[] => [
  {
    code: "CARD",
    displayName: resolveLocalizedText(tx("Card", "Karta", "Карта", "카드"), locale),
    group: "INSTANT_ONLINE",
    provider: "MOCK_CARD",
    checkoutDescription: resolveLocalizedText(
      tx(
        "Instant online card payment.",
        "Onlayn karta orqali darhol to'lov.",
        "Мгновенная онлайн-оплата картой.",
        "즉시 온라인 카드 결제."
      ),
      locale
    )
  },
  {
    code: "PAYME",
    displayName: "Payme",
    group: "PLATFORM_LINKED",
    provider: "PAYME",
    checkoutDescription: resolveLocalizedText(
      tx("Continue with Payme.", "Payme orqali davom eting.", "Продолжить через Payme.", "Payme로 계속 진행하세요."),
      locale
    )
  },
  {
    code: "CLICK",
    displayName: "Click",
    group: "PLATFORM_LINKED",
    provider: "CLICK",
    checkoutDescription: resolveLocalizedText(
      tx("Continue with Click.", "Click orqali davom eting.", "Продолжить через Click.", "Click으로 계속 진행하세요."),
      locale
    )
  },
  {
    code: "KAKAOPAY",
    displayName: "KakaoPay",
    group: "PLATFORM_LINKED",
    provider: "KAKAOPAY",
    checkoutDescription: resolveLocalizedText(
      tx("Continue with KakaoPay.", "KakaoPay orqali davom eting.", "Продолжить через KakaoPay.", "KakaoPay로 계속 진행하세요."),
      locale
    )
  },
  {
    code: "SMS_PAYMENT_LINK",
    displayName: resolveLocalizedText(tx("SMS payment link", "SMS to'lov havolasi", "SMS-ссылка на оплату", "SMS 결제 링크"), locale),
    group: "SMS_LINK",
    provider: "UNISERVE_SMS",
    checkoutDescription: resolveLocalizedText(
      tx(
        "A secure payment link will be sent by SMS.",
        "Xavfsiz to'lov havolasi SMS orqali yuboriladi.",
        "Безопасная платежная ссылка будет отправлена по SMS.",
        "안전한 결제 링크가 SMS로 전송됩니다."
      ),
      locale
    )
  },
  {
    code: "SMS_INVOICE",
    displayName: resolveLocalizedText(tx("SMS invoice", "SMS invoice", "SMS-инвойс", "SMS 인보이스"), locale),
    group: "SMS_INVOICE",
    provider: "UNISERVE_SMS",
    checkoutDescription: resolveLocalizedText(
      tx(
        "Invoice details and requisites will be sent by SMS.",
        "Invoice va rekvizitlar SMS orqali yuboriladi.",
        "Инвойс и реквизиты будут отправлены по SMS.",
        "인보이스와 계좌 정보가 SMS로 전송됩니다."
      ),
      locale
    )
  },
  {
    code: "MANUAL_BANK_TRANSFER",
    displayName: resolveLocalizedText(tx("Manual bank transfer", "Qo'lda bank o'tkazmasi", "Ручной банковский перевод", "수동 은행 송금"), locale),
    group: "MANUAL_BANK_TRANSFER",
    provider: "UNISERVE_BANK",
    checkoutDescription: resolveLocalizedText(
      tx(
        "Bank requisites will be generated and the transfer will be verified later.",
        "Bank rekvizitlari yaratiladi va transfer keyin tekshiriladi.",
        "Банковские реквизиты будут сформированы, перевод проверят позже.",
        "은행 송금 정보가 생성되며 송금은 이후 확인됩니다."
      ),
      locale
    )
  }
];

const readStorage = <T>(key: string, fallback: T): T => {
  if (!inBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (!inBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

const readLocalCart = (): LocalCartState => {
  const initial: LocalCartState = { items: [], updatedAt: new Date().toISOString() };
  const state = readStorage<LocalCartState>(CART_KEY, initial);
  if (!Array.isArray(state.items)) return initial;
  const items = state.items
    .map((item) => normalizeCartItem(item))
    .filter((item): item is CartItem => Boolean(item));
  return {
    items,
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : new Date().toISOString()
  };
};

const writeLocalCart = (items: CartItem[]) => {
  const state: LocalCartState = {
    items,
    updatedAt: new Date().toISOString()
  };
  writeStorage(CART_KEY, state);
};

const emitCartUpdate = (summary: CartSummary) => {
  cartListeners.forEach((listener) => listener(summary));
};

const readLocalBuyNow = (): LocalBuyNowState => {
  const state = readStorage<LocalBuyNowState>(BUY_NOW_KEY, { sessions: {} });
  return {
    sessions: asRecord(state.sessions) || {}
  };
};

const writeLocalBuyNow = (state: LocalBuyNowState) => {
  writeStorage(BUY_NOW_KEY, state);
};

const readLocalOrders = (): LocalOrdersState => {
  const state = readStorage<LocalOrdersState>(ORDERS_KEY, { orders: [] });
  return {
    orders: asArray<CommerceOrder>(state.orders)
  };
};

const writeLocalOrders = (state: LocalOrdersState) => {
  writeStorage(ORDERS_KEY, state);
};

const makeSnapshotFromProduct = (productId: string, product?: CommercePayloadEntity): ProductSnapshot => {
  const productRef = asRecord(product) || {};
  const kind = normalizeKind(productRef.kind || productRef.type);
  const locale = readStoredLanguage();
  const localizedTitle = resolveLocalizedText(
    productRef.titleLocalized ||
      productRef.nameLocalized ||
      asRecord(productRef.localized)?.title ||
      asRecord(productRef.localized)?.name ||
      {
        en: productRef.title_en || productRef.name_en,
        uz: productRef.title_uz || productRef.name_uz,
        ru: productRef.title_ru || productRef.name_ru,
        ko: productRef.title_ko || productRef.name_ko
      },
    locale
  );
  const title =
    normalizeMarketplaceTitle(
      String(
      localizedTitle ||
        productRef.title ||
        productRef.name ||
        productRef.titleSnapshot ||
        productRef.serviceTitle ||
        productRef.label ||
        (kind === "service" ? "Service" : "Product")
      ).trim(),
      kind === "service" ? "Service" : "Product"
    ) || (kind === "service" ? "Service" : "Product");
  const thumbnail = String(
    productRef.thumbnail ||
      productRef.imageSnapshot ||
      productRef.cardImageUrl ||
      productRef.coverImageUrl ||
      productRef.imageUrl ||
      productRef.image ||
      asArray<string>(productRef.images)[0] ||
      "/placeholder.png"
  ).trim();
  const price = Math.max(0, toNumber(productRef.priceSnapshot ?? productRef.unitPrice ?? productRef.price, 0));

  return {
    productId,
    id: productId,
    kind,
    title,
    thumbnail: thumbnail || "/placeholder.png",
    price,
    currency: String(productRef.currency || "USD"),
    category: productRef.category ? String(productRef.category) : undefined
  };
};

const normalizeCartItem = (raw: unknown): CartItem | null => {
  const item = asRecord(raw);
  if (!item) return null;
  const nestedProduct = asRecord(item.product) || asRecord(item.productData) || null;
  const productId = String(item.productId || nestedProduct?._id || nestedProduct?.id || item._id || "").trim();
  if (!productId) return null;
  const snapshot = makeSnapshotFromProduct(productId, nestedProduct || item);
  return {
    ...snapshot,
    qty: normalizeQty(item.qty || item.quantity || 1)
  };
};

const toCartSummary = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const firstCurrency = items.find((item) => item.currency)?.currency || "USD";
  const counts = items.reduce<Record<CommerceItemKind, number>>(
    (acc, item) => {
      acc[item.kind] += item.qty;
      return acc;
    },
    { product: 0, service: 0 }
  );
  return {
    items,
    totalItems,
    counts,
    subtotal,
    currency: firstCurrency,
    updatedAt: new Date().toISOString()
  };
};

const getProfileDisplayName = () => {
  const name = useAuthStore.getState().profile?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Customer";
};

const buildOrderRequestBody = (payload: OrderCreatePayload) => {
  const firstItem = payload.items[0];
  const source = payload.mode === "buynow" ? "BUY_NOW" : "CART";

  return {
    source,
    shippingAddress: {
      name: getProfileDisplayName(),
      phone: payload.phone.trim(),
      address1: payload.shippingAddress.trim(),
      address2: "",
      postalCode: ""
    },
    phone: payload.phone.trim(),
    deliveryOption: payload.deliveryOption,
    paymentMethod: payload.paymentMethod,
    payment: {
      method: payload.paymentMethod,
      provider: "MOCK"
    },
    ...(source === "BUY_NOW" && firstItem
      ? {
          productId: firstItem.productId,
          qty: firstItem.qty
        }
      : {})
  };
};

const formatAddressValue = (value: unknown) => {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (!record) return "";
  return [record.name, record.phone, record.address1, record.address2, record.postalCode]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
};

const extractPaymentCollection = (raw: unknown): CommercePaymentCollection | null => {
  const root = asRecord(raw);
  if (!root) return null;
  const source = asRecord(root.paymentCollection) || root;
  const id = String(source.id || source._id || "").trim();
  if (!id) return null;
  return {
    id,
    orderId: String(source.orderId || ""),
    paymentId: source.paymentId ? String(source.paymentId) : null,
    sourceType: source.sourceType ? String(source.sourceType) : null,
    sourceId: source.sourceId ? String(source.sourceId) : null,
    status: String(source.status || "DRAFT"),
    amount: toNumber(source.amount, 0),
    currency: String(source.currency || "USD"),
    methodCode: String(source.methodCode || source.method || ""),
    methodGroup: source.methodGroup ? String(source.methodGroup) : null,
    provider: source.provider ? String(source.provider) : null,
    displayName: source.displayName ? String(source.displayName) : null,
    nextActionType: source.nextActionType ? String(source.nextActionType) : null,
    nextActionLabel: source.nextActionLabel ? String(source.nextActionLabel) : null,
    redirectUrl: source.redirectUrl ? String(source.redirectUrl) : null,
    phone: source.phone ? String(source.phone) : null,
    phoneVerified: Boolean(source.phoneVerified),
    expiresAt: source.expiresAt ? String(source.expiresAt) : null,
    paidAt: source.paidAt ? String(source.paidAt) : null,
    escrowHeldAt: source.escrowHeldAt ? String(source.escrowHeldAt) : null,
    failureReason: source.failureReason ? String(source.failureReason) : null,
    invoice: asRecord(source.invoice)
      ? {
          id: String(source.invoice.id || source.invoice._id || ""),
          kind: String(source.invoice.kind || ""),
          status: String(source.invoice.status || ""),
          referenceCode: source.invoice.referenceCode ? String(source.invoice.referenceCode) : null,
          secureLinkUrl: source.invoice.secureLinkUrl ? String(source.invoice.secureLinkUrl) : null,
          bankDetails: asRecord(source.invoice.bankDetails),
          instructionText: source.invoice.instructionText ? String(source.invoice.instructionText) : null,
          expiresAt: source.invoice.expiresAt ? String(source.invoice.expiresAt) : null
        }
      : null,
    smsRequest: asRecord(source.smsRequest)
      ? {
          id: String(source.smsRequest.id || source.smsRequest._id || ""),
          type: String(source.smsRequest.type || ""),
          phoneMasked: source.smsRequest.phoneMasked ? String(source.smsRequest.phoneMasked) : null,
          verificationState: source.smsRequest.verificationState ? String(source.smsRequest.verificationState) : null,
          deliveryStatus: source.smsRequest.deliveryStatus ? String(source.smsRequest.deliveryStatus) : null,
          referenceCode: source.smsRequest.referenceCode ? String(source.smsRequest.referenceCode) : null,
          resendCount: toNumber(source.smsRequest.resendCount, 0),
          sentAt: source.smsRequest.sentAt ? String(source.smsRequest.sentAt) : null,
          expiresAt: source.smsRequest.expiresAt ? String(source.smsRequest.expiresAt) : null
        }
      : null,
    bankTransfer: asRecord(source.bankTransfer)
      ? {
          id: String(source.bankTransfer.id || source.bankTransfer._id || ""),
          status: String(source.bankTransfer.status || ""),
          referenceCode: source.bankTransfer.referenceCode ? String(source.bankTransfer.referenceCode) : null,
          bankDetails: asRecord(source.bankTransfer.bankDetails),
          instructionText: source.bankTransfer.instructionText ? String(source.bankTransfer.instructionText) : null,
          expiresAt: source.bankTransfer.expiresAt ? String(source.bankTransfer.expiresAt) : null,
          receiptUrl: source.bankTransfer.receiptUrl ? String(source.bankTransfer.receiptUrl) : null
        }
      : null
  };
};

const extractCommerceOrder = (raw: unknown, fallbackId = ""): CommerceOrder | null => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  const order = asRecord(data.order) || data;
  const itemsRaw = asArray(order.items);
  const items = itemsRaw.map((item) => normalizeCartItem(item)).filter((item): item is CartItem => Boolean(item));
  if (!items.length) return null;
  const summary = toCartSummary(items);
  const paymentCollection = extractPaymentCollection(order.paymentCollection);
  const shippingAddress = formatAddressValue(order.shippingAddress || order.fulfillmentDetails?.deliveryAddress || order.address || "");
  const phone = String(order.phone || order.fulfillmentDetails?.phone || order.shippingAddress?.phone || "");
  return {
    id: String(order.id || order._id || fallbackId),
    mode: String(order.mode || order.source || "cart").toLowerCase() === "buy_now" || String(order.source || "").toUpperCase() === "BUY_NOW" ? "buynow" : "cart",
    status: extractOrderStatus(order) || "PENDING_PAYMENT",
    items,
    totalItems: toNumber(order.totalItems, summary.totalItems),
    subtotal: toNumber(order.subtotal ?? order.amount ?? order.totalAmount, summary.subtotal),
    shippingFee: toNumber(order.shippingFee, 0),
    total: toNumber(order.total, summary.subtotal + toNumber(order.shippingFee, 0)),
    currency: String(order.currency || summary.currency || "USD"),
    shippingAddress,
    phone,
    deliveryOption: String(order.deliveryOption || order.fulfillmentDetails?.deliveryType || "standard"),
    paymentMethod: String(order.paymentMethod || order.paymentCollectionMethod || paymentCollection?.methodCode || ""),
    paymentWorkflowStatus: order.paymentWorkflowStatus ? String(order.paymentWorkflowStatus) : undefined,
    paymentCollectionStatus: order.paymentCollectionStatus ? String(order.paymentCollectionStatus) : paymentCollection?.status,
    paymentIntentId: order.paymentIntentId ? String(order.paymentIntentId) : null,
    paymentId: order.paymentId ? String(order.paymentId) : paymentCollection?.paymentId || null,
    trustNotice: order.trustNotice ? String(order.trustNotice) : order.trustMessage ? String(order.trustMessage) : null,
    nextSteps: asArray<string>(order.nextSteps).map((item) => String(item)),
    paymentCollection,
    createdAt: String(order.createdAt || new Date().toISOString()),
    paidAt: paymentCollection?.paidAt || (order.paidAt ? String(order.paidAt) : undefined)
  };
};

const extractCheckoutSubmission = (raw: unknown, fallbackPayload?: OrderCreatePayload): CheckoutSubmissionResult | null => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  const order = extractCommerceOrder(data.order || data, "");
  const paymentCollection = extractPaymentCollection(data.paymentCollection);

  if (order) {
    return {
      order: {
        ...order,
        paymentCollection: paymentCollection || order.paymentCollection || null,
        trustNotice: order.trustNotice || (typeof data.trustNotice === "string" ? data.trustNotice : null)
      },
      paymentCollection: paymentCollection || order.paymentCollection || null,
      trustNotice: typeof data.trustNotice === "string" ? data.trustNotice : order.trustNotice || null
    };
  }

  if (!fallbackPayload) return null;
  const localOrder = makeLocalOrder(fallbackPayload);
  return {
    order: localOrder,
    paymentCollection: null,
    trustNotice: resolveLocalizedText(
      tx(
        "Funds are held securely until delivery or completion is confirmed.",
        "Mablag' yetkazish yoki bajarilish tasdiqlanguncha xavfsiz ushlab turiladi.",
        "Средства надежно удерживаются до подтверждения доставки или выполнения.",
        "배송 또는 완료가 확인될 때까지 결제 금액은 안전하게 보관됩니다."
      ),
      readStoredLanguage()
    )
  };
};

const extractRemoteItems = (raw: unknown): CartItem[] => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  const list = asArray(data.items || data.cart?.items || data.results || data.data || []);
  return list.map((item) => normalizeCartItem(item)).filter((item): item is CartItem => Boolean(item));
};

const persistCartItems = (items: CartItem[]) => {
  writeLocalCart(items);
  const summary = toCartSummary(items);
  emitCartUpdate(summary);
  return summary;
};

const extractOrderId = (raw: unknown): string => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  const order = asRecord(data.order) || asRecord(data.result) || data;
  return String(order.id || order._id || data.orderId || "").trim();
};

const extractOrderStatus = (raw: unknown): OrderStatus | null => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  const statusRaw = String(data.status || data.orderStatus || "").trim().toUpperCase();
  if (statusRaw === "PENDING_PAYMENT" || statusRaw === "PAID" || statusRaw === "CONFIRMED" || statusRaw === "FAILED") {
    return statusRaw;
  }
  return null;
};

async function getByPaths(paths: string[]) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.get(path);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        if (COMMERCE_API_ONLY) {
          throw makeApiOnlyError();
        }
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

async function postByPaths(paths: string[], body: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.post(path, body);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        if (COMMERCE_API_ONLY) {
          throw makeApiOnlyError();
        }
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

async function patchByPaths(paths: string[], body: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.patch(path, body);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        if (COMMERCE_API_ONLY) {
          throw makeApiOnlyError();
        }
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

async function deleteByPaths(paths: string[]) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.delete(path);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        if (COMMERCE_API_ONLY) {
          throw makeApiOnlyError();
        }
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

const syncLocalCartWithRemote = (raw: unknown): CartSummary => {
  const items = extractRemoteItems(raw);
  return persistCartItems(items);
};

export const getLocalCartCount = () => {
  return getLocalCartSummary().totalItems;
};

export const getLocalCartSummary = (): CartSummary => {
  const cart = readLocalCart();
  return toCartSummary(cart.items);
};

export const subscribeCartUpdates = (listener: CartUpdateListener) => {
  cartListeners.add(listener);

  return () => {
    cartListeners.delete(listener);
  };
};

export async function getCart(): Promise<CartSummary> {
  if (isAuthenticated()) {
    try {
      const response = await getByPaths(["/cart"]);
      return syncLocalCartWithRemote(response.data);
    } catch (error) {
      if (isAuthStatus(error)) throw error;
      if (COMMERCE_API_ONLY) throw error;
      if (!shouldTryNextEndpoint(error)) {
        // remote cart is optional; keep local fallback
      }
    }
  }
  return getLocalCartSummary();
}

export async function addCartItem(payload: AddCartItemPayload): Promise<CartSummary> {
  const qty = normalizeQty(payload.qty || 1);
  const productId = resolveCommerceProductId(payload.productId, payload.product);
  if (!productId) throw new Error("productId is required");

  if (canUseRemoteCommerceProduct(productId, payload.product)) {
    try {
      const response = await postByPaths(["/cart/items"], { productId, qty });
      const synced = syncLocalCartWithRemote(response.data);
      if (synced) return synced;
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  const local = readLocalCart();
  const snapshot = makeSnapshotFromProduct(productId, payload.product);
  const nextItems = [...local.items];
  const idx = nextItems.findIndex((item) => item.productId === productId);
  if (idx >= 0) {
    nextItems[idx] = {
      ...nextItems[idx],
      ...snapshot,
      qty: nextItems[idx].qty + qty
    };
  } else {
    nextItems.push({ ...snapshot, qty });
  }
  return persistCartItems(nextItems);
}

export async function updateCartItemQty(productId: string, qty: number): Promise<CartSummary> {
  const safeId = String(productId || "").trim();
  const safeQty = normalizeQty(qty);
  if (!safeId) throw new Error("productId is required");

  if (canUseRemoteCommerceId(safeId)) {
    try {
      const response = await patchByPaths([`/cart/items/${safeId}`], { qty: safeQty });
      const synced = syncLocalCartWithRemote(response.data);
      if (synced) return synced;
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  const local = readLocalCart();
  const nextItems = local.items.map((item) => (item.productId === safeId ? { ...item, qty: safeQty } : item));
  return persistCartItems(nextItems);
}

export async function removeCartItem(productId: string): Promise<CartSummary> {
  const safeId = String(productId || "").trim();
  if (!safeId) throw new Error("productId is required");

  if (canUseRemoteCommerceId(safeId)) {
    try {
      const response = await deleteByPaths([`/cart/items/${safeId}`]);
      const synced = syncLocalCartWithRemote(response.data);
      if (synced) return synced;
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  const local = readLocalCart();
  const nextItems = local.items.filter((item) => item.productId !== safeId);
  return persistCartItems(nextItems);
}

export async function clearCart(): Promise<CartSummary> {
  if (isAuthenticated()) {
    try {
      await postByPaths(["/cart/clear"], {});
    } catch (error) {
      if (COMMERCE_API_ONLY) throw error;
      if (!shouldTryNextEndpoint(error)) {
        // keep local clear fallback
      }
    }
  }
  return persistCartItems([]);
}

const createSessionId = () =>
  `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export async function createBuyNowSession(payload: AddCartItemPayload): Promise<BuyNowSession> {
  const qty = normalizeQty(payload.qty || 1);
  const productId = resolveCommerceProductId(payload.productId, payload.product);
  if (!productId) throw new Error("productId is required");

  const snapshot = makeSnapshotFromProduct(productId, payload.product);
  let sid = "";

  if (canUseRemoteCommerceProduct(productId, payload.product)) {
    try {
      const response = await postByPaths(["/checkout/buy-now"], { productId, qty });
      const root = asRecord(response.data) || {};
      const data = asRecord(root.data) || root;
      sid = String(data.sid || data.sessionId || data.checkoutSessionId || "").trim();
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  if (!sid) sid = createSessionId();
  const session: BuyNowSession = {
    sid,
    item: { ...snapshot, qty },
    createdAt: new Date().toISOString()
  };
  const state = readLocalBuyNow();
  state.sessions[sid] = session;
  writeLocalBuyNow(state);
  return session;
}

export function getBuyNowSession(sid: string): BuyNowSession | null {
  const safeSid = String(sid || "").trim();
  if (!safeSid) return null;
  const state = readLocalBuyNow();
  const session = state.sessions[safeSid];
  return session || null;
}

export function consumeBuyNowSession(sid: string) {
  const safeSid = String(sid || "").trim();
  if (!safeSid) return;
  const state = readLocalBuyNow();
  delete state.sessions[safeSid];
  writeLocalBuyNow(state);
}

export async function getCheckoutItems(mode: CheckoutMode, sid?: string): Promise<CartItem[]> {
  if (mode === "buynow") {
    const session = getBuyNowSession(String(sid || ""));
    if (!session) throw new Error("Buy now session not found");
    return [session.item];
  }
  const cart = await getCart();
  return cart.items;
}

const makeLocalOrder = (payload: OrderCreatePayload): CommerceOrder => {
  const summary = toCartSummary(payload.items);
  return {
    id: `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    mode: payload.mode,
    status: "PENDING_PAYMENT",
    items: payload.items,
    totalItems: summary.totalItems,
    subtotal: summary.subtotal,
    currency: summary.currency,
    shippingAddress: payload.shippingAddress,
    phone: payload.phone,
    deliveryOption: payload.deliveryOption,
    paymentMethod: payload.paymentMethod,
    createdAt: new Date().toISOString()
  };
};

export async function createOrder(payload: OrderCreatePayload): Promise<CommerceOrder> {
  const canUseRemoteOrder = isAuthenticated() && payload.items.every((item) => isRemoteCommerceId(item.productId));
  if (canUseRemoteOrder) {
    try {
      const response = await postByPaths(["/orders"], buildOrderRequestBody(payload));

      const orderId = extractOrderId(response.data);
      if (orderId) {
        const summary = toCartSummary(payload.items);
        const remoteStatus = extractOrderStatus(response.data) || "PENDING_PAYMENT";
        return {
          id: orderId,
          mode: payload.mode,
          status: remoteStatus,
          items: payload.items,
          totalItems: summary.totalItems,
          subtotal: summary.subtotal,
          currency: summary.currency,
          shippingAddress: payload.shippingAddress,
          phone: payload.phone,
          deliveryOption: payload.deliveryOption,
          paymentMethod: payload.paymentMethod,
          createdAt: new Date().toISOString()
        };
      }
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  const local = readLocalOrders();
  const order = makeLocalOrder(payload);
  local.orders = [order, ...local.orders].slice(0, 200);
  writeLocalOrders(local);
  return order;
}

export async function confirmPayment(orderId: string, paymentMethod: string): Promise<OrderStatus> {
  const safeOrderId = String(orderId || "").trim();
  if (!safeOrderId) throw new Error("orderId is required");

  if (canUseRemoteCommerceId(safeOrderId)) {
    try {
      const response = await postByPaths(
        [`/payments/${safeOrderId}/confirm`, `/orders/${safeOrderId}/pay`, `/checkout/orders/${safeOrderId}/confirm`],
        { paymentMethod }
      );
      const remoteStatus = extractOrderStatus(response.data);
      if (remoteStatus) return remoteStatus;
    } catch (error) {
      if (!shouldTryNextEndpoint(error)) throw error;
    }
  }

  const local = readLocalOrders();
  const idx = local.orders.findIndex((order) => order.id === safeOrderId);
  if (idx >= 0) {
    local.orders[idx] = {
      ...local.orders[idx],
      status: "CONFIRMED",
      paymentMethod,
      paidAt: new Date().toISOString()
    };
    writeLocalOrders(local);
  }
  return "CONFIRMED";
}

export async function syncPurchasedProductStats(items: CartItem[]) {
  if (!isAuthenticated()) return;
  for (const item of items) {
    if (!isRemoteCommerceId(item.productId)) continue;
    const qty = Math.max(1, item.qty);
    const attempts = Math.min(qty, 20);
    for (let i = 0; i < attempts; i += 1) {
      try {
        await purchaseProduct(item.productId);
      } catch {
        break;
      }
    }
  }
}

export async function getOrderById(orderId: string): Promise<CommerceOrder | null> {
  const safeOrderId = String(orderId || "").trim();
  if (!safeOrderId) return null;
  if (canUseRemoteCommerceId(safeOrderId)) {
    try {
      const response = await getByPaths([
        `/orders/${safeOrderId}`,
        `/checkout/orders/${safeOrderId}`,
        `/commerce/orders/${safeOrderId}`
      ]);
      const root = asRecord(response.data) || {};
      const data = asRecord(root.data) || root;
      const order = asRecord(data.order) || data;
      const items = asArray(order.items).map((item) => normalizeCartItem(item)).filter((item): item is CartItem => Boolean(item));
      if (!items.length) return null;
      const summary = toCartSummary(items);
      const id = String(order.id || order._id || safeOrderId);
      const status = extractOrderStatus(order) || "CONFIRMED";
      return {
        id,
        mode: String(order.mode || "cart").toLowerCase() === "buynow" ? "buynow" : "cart",
        status,
        items,
        totalItems: toNumber(order.totalItems, summary.totalItems),
        subtotal: toNumber(order.subtotal ?? order.totalAmount, summary.subtotal),
        currency: String(order.currency || summary.currency || "USD"),
        shippingAddress: String(order.shippingAddress || order.address || ""),
        phone: String(order.phone || order.phoneNumber || ""),
        deliveryOption: String(order.deliveryOption || "standard"),
        paymentMethod: String(order.paymentMethod || ""),
        createdAt: String(order.createdAt || new Date().toISOString()),
        paidAt: order.paidAt ? String(order.paidAt) : undefined
      };
    } catch (error) {
      if (COMMERCE_API_ONLY) throw error;
      if (!shouldTryNextEndpoint(error)) {
        // remote order lookup is optional in fallback mode
      }
    }
  }
  const local = readLocalOrders();
  return local.orders.find((order) => order.id === safeOrderId) || null;
}
