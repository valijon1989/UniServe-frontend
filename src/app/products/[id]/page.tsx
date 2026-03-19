"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { addCartItem, createBuyNowSession, getLocalCartCount } from "@/api/commerce";
import {
  getDetailFeedbackSummary,
  isDetailSaved,
  reportDetailTarget,
  sendDetailInquiryMessage,
  startDetailInquiry,
  toggleDetailFeedback,
  toggleDetailSaved,
  type DetailInquiryMessage,
  type DetailInquiryThread
} from "@/api/detailInteractions";
import { addProductView, getProductDetail, toggleProductLike, type Product } from "@/api/products";
import { DetailActionSidebar, DetailSidebarCard } from "@/components/detail/DetailActionSidebar";
import { DetailPrimaryActions } from "@/components/detail/DetailPrimaryActions";
import { FeedbackWidget } from "@/components/detail/FeedbackWidget";
import { InquiryComposer } from "@/components/detail/InquiryComposer";
import { ProductGallery } from "@/components/ProductGallery";
import { RequestFormPanel } from "@/components/detail/RequestFormPanel";
import { SellerAgentCard } from "@/components/detail/SellerAgentCard";
import { Spinner } from "@/components/shared/Spinner";
import { useI18n } from "@/context/i18n";
import { formatMoneyByLocale, type SupportedLocale } from "@/lib/localization";
import { buildLoginRedirect, isUnauthorizedApiError, sanitizeInternalRedirect } from "@/lib/authRedirect";
import { useAuthStore } from "@/store/auth";

const PRODUCT_IMAGE_POOL_SIZE = 36;
const VIEW_STORAGE_KEY = "product-views-v1";
const LIKE_STORAGE_KEY = "product-likes-v1";
const ANON_VIEWER_KEY = "uniserve-anon-viewer-id";
const LOCALE_DATE_MAP: Record<SupportedLocale, string> = {
  en: "en-US",
  uz: "uz-UZ",
  ru: "ru-RU",
  ko: "ko-KR"
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const makeProductImages = (pool: string, seed: string, count = 8) => {
  const safeCount = Math.min(20, Math.max(5, count));
  const base = (hashString(`${pool}-${seed}`) % PRODUCT_IMAGE_POOL_SIZE) + 1;
  return Array.from({ length: safeCount }, (_, idx) => {
    const value = ((base + idx * 5) % PRODUCT_IMAGE_POOL_SIZE) + 1;
    return `/services/${pool}/${String(value).padStart(2, "0")}.jpg`;
  });
};

const resolveProductPool = (product: Product) => {
  const category = (product.category || "").toLowerCase();
  const id = (product.id || product._id || "").toString().toLowerCase();

  if (category.includes("oziq") || id.startsWith("ready-") || id.startsWith("semi") || id.startsWith("meat-") || id.startsWith("ex-")) {
    return "delivery";
  }
  if (category.includes("gozallik") || id.startsWith("frag-") || id.startsWith("skin-") || id.startsWith("hair-") || id.startsWith("bath-") || id.startsWith("sun-")) {
    return "marketing";
  }
  if (category.includes("elektronika") || id.startsWith("pc-") || id.startsWith("mobile-") || id.startsWith("tv-") || id.startsWith("cam-") || id.startsWith("oth-")) {
    return "technical";
  }
  if (id.startsWith("game-") || id.startsWith("console-")) {
    return "technical";
  }
  if (category.includes("avto") || id.startsWith("car-") || id.startsWith("carpart-") || id.startsWith("tools-") || id.startsWith("techpart-")) {
    return "taxi";
  }
  if (category.includes("maishiy") || id.startsWith("vac-") || id.startsWith("kitchen-") || id.startsWith("air-") || id.startsWith("otherhome-")) {
    return "cleaning";
  }
  if (category.includes("kiyim") || id.startsWith("men-") || id.startsWith("women-") || id.startsWith("kidswear-") || id.startsWith("elder-") || id.startsWith("spec-")) {
    return "sport";
  }
  return "technical";
};

const resolveProductImageCount = (product: Product) => {
  const id = (product.id || product._id || "").toString().toLowerCase();
  if (id.startsWith("mobile-")) return 8;
  return 3;
};

const getDeliveryMeta = (data: Product) => {
  const seed = (data._id || data.id || data.name || data.title || "").toString();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const options = [
    { key: "today", label: "Bugun" },
    { key: "tomorrow", label: "Ertaga" },
    { key: "standard", label: "Oddiy" }
  ];
  const delivery = options[Math.abs(hash) % options.length];
  return {
    delivery,
    free: (data.price ?? 0) >= 100 || Math.abs(hash) % 2 === 0
  };
};

const readRecordStorage = (key: string): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeRecordStorage = (key: string, value: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
};

const getAnonViewerId = () => {
  if (typeof window === "undefined") return "anon-server";
  const existing = window.localStorage.getItem(ANON_VIEWER_KEY);
  if (existing) return existing;
  const created = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(ANON_VIEWER_KEY, created);
  return created;
};

const resolveViewerKey = (userId?: string | null) => (userId ? `u:${userId}` : `a:${getAnonViewerId()}`);

const hasTrackedView = (productId: string, viewerKey: string) => {
  const store = readRecordStorage(VIEW_STORAGE_KEY);
  return Boolean(store[`${productId}:${viewerKey}`]);
};

const markTrackedView = (productId: string, viewerKey: string) => {
  const store = readRecordStorage(VIEW_STORAGE_KEY);
  store[`${productId}:${viewerKey}`] = true;
  writeRecordStorage(VIEW_STORAGE_KEY, store);
};

const readLikedState = (productId: string, viewerKey: string) => {
  const store = readRecordStorage(LIKE_STORAGE_KEY);
  return Boolean(store[`${productId}:${viewerKey}`]);
};

const writeLikedState = (productId: string, viewerKey: string, liked: boolean) => {
  const store = readRecordStorage(LIKE_STORAGE_KEY);
  store[`${productId}:${viewerKey}`] = liked;
  writeRecordStorage(LIKE_STORAGE_KEY, store);
};

const showAddCartToast = ({
  onGoCart,
  message,
  actionLabel
}: {
  onGoCart: () => void;
  message: string;
  actionLabel: string;
}) => {
  toast((instance) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-100">{message}</span>
      <button
        type="button"
        className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-900"
        onClick={() => {
          toast.dismiss(instance.id);
          onGoCart();
        }}
      >
        {actionLabel}
      </button>
    </div>
  ));
};

export default function ProductDetailPage() {
  const { t, language } = useI18n();
  const params = useParams();
  const id = useMemo(() => {
    if (!params?.id) return null;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [likePending, setLikePending] = useState(false);
  const [cartPending, setCartPending] = useState(false);
  const [buyNowPending, setBuyNowPending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState<"helpful" | "unhelpful" | null>(null);
  const [unhelpfulCount, setUnhelpfulCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [sellerThread, setSellerThread] = useState<DetailInquiryThread | null>(null);
  const [sellerMessages, setSellerMessages] = useState<DetailInquiryMessage[]>([]);
  const [sellerChatDraft, setSellerChatDraft] = useState("");
  const [sellerChatLoading, setSellerChatLoading] = useState(false);
  const [sellerChatSending, setSellerChatSending] = useState(false);
  const sellerThreadRequestRef = useRef<Promise<DetailInquiryThread> | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestNote, setRequestNote] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const userId = useAuthStore((s) => s.userId);
  const token = useAuthStore((s) => s.token);
  const currentPath = sanitizeInternalRedirect(
    `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
    "/"
  );
  const interactionProductId = useMemo(
    () => String(data?._id || data?.id || id || "").trim(),
    [data?._id, data?.id, id]
  );

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    sellerThreadRequestRef.current = null;
    setSellerThread(null);
    setSellerMessages([]);
    setSellerChatDraft("");
  }, [interactionProductId]);

  useEffect(() => {
    if (!id) return;
    const cached = loadCachedProduct(id);
    if (cached) {
      setData((prev) => mergeProductData(cached, prev));
    }
    let active = true;
    setLoading(true);
    getProductDetail(id)
      .then((res) => {
        if (active) setData((prev) => mergeProductData(cached, res ?? prev ?? undefined));
      })
      .catch((err) => {
        if (cached) {
          console.warn("Product detail API failed; using cached preview", { id, error: err?.message || err });
          if (active) setData((prev) => prev ?? cached);
          return;
        }
        console.error("Product detail load error", err);
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const stats = data.stats || { views: data.views ?? 0, likes: data.likes ?? 0, purchases: data.orders ?? 0 };
    setViewCount(Math.max(0, stats.views ?? 0));
    setLikeCount(Math.max(0, stats.likes ?? 0));
    setPurchaseCount(Math.max(0, stats.purchases ?? 0));
  }, [data]);

  useEffect(() => {
    if (!id) return;
    const viewerKey = resolveViewerKey(userId);
    setLiked(readLikedState(id, viewerKey));
  }, [id, userId]);

  useEffect(() => {
    const feedbackTarget = String(interactionProductId || id || "").trim();
    if (!feedbackTarget) return;
    setSaved(isDetailSaved("product", feedbackTarget));
    getDetailFeedbackSummary("product", feedbackTarget, token)
      .then((summary) => {
        setLiked(summary.feedback === "helpful");
        setFeedbackValue(summary.feedback);
        setLikeCount(summary.helpfulCount);
        setUnhelpfulCount(summary.unhelpfulCount);
      })
      .catch(() => {
        // keep optimistic local defaults
      });
  }, [id, interactionProductId, token]);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getLocalCartCount());
    syncCartCount();
    if (typeof window === "undefined") return;
    window.addEventListener("storage", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    const viewerKey = resolveViewerKey(userId);
    if (hasTrackedView(id, viewerKey)) return;

    let active = true;
    const timer = window.setTimeout(() => {
      markTrackedView(id, viewerKey);
      addProductView(interactionProductId || id)
        .then((stats) => {
          if (!active) return;
          if (typeof stats?.views === "number") {
            setViewCount(Math.max(0, stats.views));
            return;
          }
          setViewCount((prev) => prev + 1);
        })
        .catch((err) => {
          console.warn("Product view increment skipped", { id, error: err?.message || err });
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [id, interactionProductId, userId]);

  const redirectToAuth = () => {
    router.push(buildLoginRedirect(currentPath));
  };

  const handleLike = async () => {
    await handleFeedbackSelect("helpful");
  };

  const handleFeedbackSelect = async (value: "helpful" | "unhelpful") => {
    if (!isAuthenticated || !token) {
      redirectToAuth();
      return;
    }
    if (!id || !interactionProductId) return;
    const viewerKey = resolveViewerKey(userId);
    const previousLiked = liked;
    const previousCount = likeCount;
    const previousUnhelpful = unhelpfulCount;
    const nextLiked = value === "helpful" ? !previousLiked || previousUnhelpful > 0 : false;

    if (value === "helpful") {
      const optimisticLiked = !previousLiked || previousUnhelpful > 0;
      setLiked(optimisticLiked);
      setFeedbackValue(optimisticLiked ? "helpful" : null);
      setLikeCount(Math.max(0, previousCount + (optimisticLiked ? 1 : -1)));
      if (previousUnhelpful > 0) setUnhelpfulCount(Math.max(0, previousUnhelpful - 1));
      writeLikedState(id, viewerKey, optimisticLiked);
    } else {
      const switchingFromHelpful = previousLiked;
      setLiked(false);
      setFeedbackValue("unhelpful");
      if (switchingFromHelpful) setLikeCount(Math.max(0, previousCount - 1));
      setUnhelpfulCount(previousUnhelpful + 1);
      writeLikedState(id, viewerKey, false);
    }

    try {
      setLikePending(true);
      const summary = await toggleDetailFeedback("product", interactionProductId, value, token);
      const finalLiked = summary.feedback === "helpful";
      writeLikedState(id, viewerKey, finalLiked);
      setLiked(finalLiked);
      setFeedbackValue(summary.feedback);
      setLikeCount(summary.helpfulCount);
      setUnhelpfulCount(summary.unhelpfulCount);
    } catch (err) {
      console.error("Like error", err);
      writeLikedState(id, viewerKey, previousLiked);
      setLiked(previousLiked);
      setFeedbackValue(previousLiked ? "helpful" : previousUnhelpful > 0 ? "unhelpful" : null);
      setLikeCount(previousCount);
      setUnhelpfulCount(previousUnhelpful);
      toast.error(
        t({
          en: "Could not update feedback",
          uz: "Fikrni yangilab bo'lmadi",
          ru: "Не удалось обновить отзыв",
          ko: "피드백을 업데이트할 수 없습니다"
        })
      );
    } finally {
      setLikePending(false);
    }
  };

  const handleAddToCart = async () => {
    if (!id || !data) return;
    if (!isHydrated) return;
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in before adding to cart",
          uz: "Savatchaga qo'shishdan oldin login qiling",
          ru: "Войдите, чтобы добавить товар в корзину",
          ko: "장바구니에 담기 전에 로그인하세요"
        })
      );
      redirectToAuth();
      return;
    }
    const commerceProductId = String(data._id || data.id || id).trim();
    try {
      setCartPending(true);
      const cart = await addCartItem({
        productId: commerceProductId,
        qty: 1,
        product: data
      });
      setCartCount(cart.totalItems);
      showAddCartToast({
        onGoCart: () => router.push("/cart"),
        message: t({
          en: "Added to cart",
          uz: "Savatchaga qo'shildi",
          ru: "Товар добавлен в корзину",
          ko: "장바구니에 담았습니다"
        }),
        actionLabel: t({
          en: "Open cart",
          uz: "Savatchani ochish",
          ru: "Открыть корзину",
          ko: "장바구니 열기"
        })
      });
    } catch (err: unknown) {
      if (isUnauthorizedApiError(err)) {
        toast.error(
          t({
            en: "Sign in to use the cart",
            uz: "Savatchadan foydalanish uchun login qiling",
            ru: "Войдите, чтобы пользоваться корзиной",
            ko: "장바구니를 사용하려면 로그인하세요"
          })
        );
        redirectToAuth();
        return;
      }
      console.error("Add cart error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t({
          en: "Could not add to cart",
          uz: "Savatchaga qo'shib bo'lmadi",
          ru: "Не удалось добавить в корзину",
          ko: "장바구니에 추가할 수 없습니다"
        });
      toast.error(message);
    } finally {
      setCartPending(false);
    }
  };

  const handleBuyNow = async () => {
    if (!id || !data) return;
    if (!isHydrated) return;
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in before buying now",
          uz: "Darhol sotib olishdan oldin login qiling",
          ru: "Войдите перед мгновенной покупкой",
          ko: "바로 구매 전에 로그인하세요"
        })
      );
      redirectToAuth();
      return;
    }
    const commerceProductId = String(data._id || data.id || id).trim();
    try {
      setBuyNowPending(true);
      const session = await createBuyNowSession({
        productId: commerceProductId,
        qty: 1,
        product: data
      });
      router.push(`/checkout?mode=buynow&sid=${encodeURIComponent(session.sid)}`);
    } catch (err: unknown) {
      if (isUnauthorizedApiError(err)) {
        toast.error(
          t({
            en: "Sign in to continue checkout",
            uz: "Checkoutni davom ettirish uchun login qiling",
            ru: "Войдите, чтобы продолжить оформление",
            ko: "체크아웃을 계속하려면 로그인하세요"
          })
        );
        redirectToAuth();
        return;
      }
      console.error("Buy now error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t({
          en: "Could not start buy now",
          uz: "Darhol sotib olishni boshlab bo'lmadi",
          ru: "Не удалось начать мгновенную покупку",
          ko: "바로 구매를 시작할 수 없습니다"
        });
      toast.error(message);
    } finally {
      setBuyNowPending(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.name || "Mahsulot",
          text: data?.description || "",
          url
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(
          t({
            en: "Link copied",
            uz: "Havola nusxalandi",
            ru: "Ссылка скопирована",
            ko: "링크가 복사되었습니다"
          })
        );
        return;
      }
      toast.error(
        t({
          en: "Sharing is not supported on this device",
          uz: "Qurilmangiz ulashish funksiyasini qo'llamaydi",
          ru: "Это устройство не поддерживает функцию отправки",
          ko: "이 기기에서는 공유 기능을 지원하지 않습니다"
        })
      );
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") return;
      toast.error(
        t({
          en: "Could not share this product",
          uz: "Mahsulotni ulashib bo'lmadi",
          ru: "Не удалось поделиться товаром",
          ko: "상품을 공유할 수 없습니다"
        })
      );
    }
  };

  const resolveSellerTarget = () => {
    const ownerId = String(data?.createdBy?._id || data?.agent?.id || data?.vendor?._id || "").trim();
    return {
      targetType: "product" as const,
      targetId: String(data?._id || "").trim() || null,
      targetIdentifier: String(id || "").trim() || null,
      targetTitle: data?.name || data?.title || "Mahsulot",
      ownerId: ownerId || null
    };
  };

  const ensureSellerThread = async () => {
    if (!token) {
      throw new Error(
        t({
          en: "Login required",
          uz: "Login talab qilinadi",
          ru: "Требуется вход",
          ko: "로그인이 필요합니다"
        })
      );
    }
    if (sellerThread) return sellerThread;
    if (sellerThreadRequestRef.current) return sellerThreadRequestRef.current;
    const target = resolveSellerTarget();
    if (!target.ownerId) {
      throw new Error(
        t({
          en: "Seller information is unavailable",
          uz: "Sotuvchi ma'lumoti topilmadi",
          ru: "Информация о продавце недоступна",
          ko: "판매자 정보를 찾을 수 없습니다"
        })
      );
    }
    setSellerChatLoading(true);
    const request = startDetailInquiry(target, token).then((payload) => {
      setSellerThread(payload.thread);
      setSellerMessages(payload.messages);
      return payload.thread;
    });
    sellerThreadRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (sellerThreadRequestRef.current === request) {
        sellerThreadRequestRef.current = null;
      }
      setSellerChatLoading(false);
    }
  };

  const handleOpenSellerChat = async () => {
    if (!isAuthenticated || !token) {
      redirectToAuth();
      return;
    }
    try {
      await ensureSellerThread();
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
          t({
            en: "Could not open chat",
            uz: "Suhbatni ochib bo'lmadi",
            ru: "Не удалось открыть чат",
            ko: "채팅을 열 수 없습니다"
          })
      );
    }
  };

  const handleSendSellerMessage = async () => {
    if (!sellerChatDraft.trim()) return;
    if (!isAuthenticated || !token) {
      redirectToAuth();
      return;
    }
    try {
      setSellerChatSending(true);
      const thread = sellerThread || (await ensureSellerThread());
      const message = await sendDetailInquiryMessage(thread.id, sellerChatDraft.trim(), token);
      setSellerMessages((prev) => [...prev, message]);
      setSellerChatDraft("");
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
          t({
            en: "Message was not sent",
            uz: "Xabar yuborilmadi",
            ru: "Сообщение не отправлено",
            ko: "메시지를 보낼 수 없습니다"
          })
      );
    } finally {
      setSellerChatSending(false);
    }
  };

  const handleSubmitPurchaseRequest = async () => {
    if (!isAuthenticated || !token) {
      redirectToAuth();
      return;
    }
    try {
      setRequestSubmitting(true);
      const thread = sellerThread || (await ensureSellerThread());
      const message = [
        `Purchase request: ${data?.name || data?.title || "Product"}`,
        `Soni: ${Math.max(1, requestQty)}`,
        requestNote.trim() ? `Izoh: ${requestNote.trim()}` : null
      ]
        .filter(Boolean)
        .join("\n");
      const sent = await sendDetailInquiryMessage(thread.id, message, token);
      setSellerMessages((prev) => [...prev, sent]);
      setRequestNote("");
      toast.success(
        t({
          en: "Request sent to seller",
          uz: "So'rov sotuvchiga yuborildi",
          ru: "Запрос отправлен продавцу",
          ko: "요청을 판매자에게 보냈습니다"
        })
      );
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
          t({
            en: "Could not send request",
            uz: "So'rov yuborilmadi",
            ru: "Не удалось отправить запрос",
            ko: "요청을 보낼 수 없습니다"
          })
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleToggleSaved = () => {
    const feedbackTarget = String(interactionProductId || id || "").trim();
    if (!feedbackTarget) return;
    const next = toggleDetailSaved("product", feedbackTarget);
    setSaved(next);
    toast.success(
      next
        ? t({
            en: "Saved",
            uz: "Saqlab qo'yildi",
            ru: "Сохранено",
            ko: "저장되었습니다"
          })
        : t({
            en: "Removed from saved",
            uz: "Saqlash olib tashlandi",
            ru: "Удалено из сохранённых",
            ko: "저장에서 제거되었습니다"
          })
    );
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    if (!isAuthenticated || !token) {
      redirectToAuth();
      return;
    }
    try {
      setReportSubmitting(true);
      await reportDetailTarget("product", String(interactionProductId || id || ""), {
        reason: reportReason.trim()
      }, token);
      setReportReason("");
      toast.success(
        t({
          en: "Report submitted",
          uz: "Shikoyat yuborildi",
          ru: "Жалоба отправлена",
          ko: "신고가 접수되었습니다"
        })
      );
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          t({
            en: "Could not submit report",
            uz: "Shikoyat yuborilmadi",
            ru: "Не удалось отправить жалобу",
            ko: "신고를 보낼 수 없습니다"
          })
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        label={t({
          en: "Loading product",
          uz: "Mahsulot yuklanmoqda",
          ru: "Загрузка товара",
          ko: "상품 불러오는 중"
        })}
      />
    );
  }
  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600 shadow-sm">
        {t({
          en: "Product not found.",
          uz: "Mahsulot topilmadi.",
          ru: "Товар не найден.",
          ko: "상품을 찾을 수 없습니다."
        })}
      </div>
    );
  }

  const title =
    data.name ||
    data.title ||
    t({
      en: "Product",
      uz: "Mahsulot",
      ru: "Товар",
      ko: "상품"
    });
  const shortDescription =
    data.shortDescription ||
    data.card?.subtitle ||
    data.description ||
    t({
      en: "Product information is being prepared.",
      uz: "Mahsulot ma'lumoti tayyorlanmoqda.",
      ru: "Информация о товаре готовится.",
      ko: "상품 정보가 준비 중입니다."
    });
  const fullDescription = data.fullDescription || data.description || shortDescription;
  const realImages = collectRealProductImages(data);
  const gallery = realImages.length ? realImages : [data.primaryImage || data.thumbnail || "/placeholder.png"];
  const priceValue = typeof data.currentPrice === "number" ? data.currentPrice : data.price ?? null;
  const price =
    priceValue !== null
      ? formatMoneyByLocale(priceValue, data.currency || "USD", language)
      : t({
          en: "Contact for price",
          uz: "Narxni aniqlashtiring",
          ru: "Цена по запросу",
          ko: "가격 문의"
        });
  const oldPriceValue = typeof data.oldPrice === "number" ? data.oldPrice : typeof (data as any).originalPrice === "number" ? (data as any).originalPrice : null;
  const oldPrice =
    typeof oldPriceValue === "number" ? formatMoneyByLocale(oldPriceValue, data.currency || "USD", language) : null;
  const discount =
    priceValue !== null && oldPriceValue !== null && oldPriceValue > 0 ? Math.round(((oldPriceValue - priceValue) / oldPriceValue) * 100) : null;
  const ratingValue = Number(data.rating?.avg ?? data.card?.trust?.ratingAverage ?? 0);
  const reviewCount = Number(data.reviewCount ?? data.rating?.count ?? data.card?.trust?.reviewCount ?? 0);
  const soldCount = Number(data.soldCount ?? data.orders ?? data.stats?.purchases ?? data.card?.trust?.soldCount ?? 0);
  const categoryDisplay =
    data.categoryDisplay ||
    data.card?.categoryLabel ||
    data.category ||
    t({
      en: "Products",
      uz: "Mahsulotlar",
      ru: "Товары",
      ko: "상품"
    });
  const subcategoryDisplay = data.subcategoryDisplay || (data as any).subCategory || "";
  const brandLabel = data.brand || "";
  const stockLabel =
    data.stockStatus ||
    data.card?.logistics?.stockLabel ||
    t({
      en: "Stock status unavailable",
      uz: "Zaxira holati aniqlanmagan",
      ru: "Статус наличия неизвестен",
      ko: "재고 상태를 확인할 수 없습니다"
    });
  const shippingLabel =
    data.shippingInfo?.promise ||
    data.shippingInfo?.deliveryLabel ||
    data.card?.logistics?.deliveryLabel ||
    t({
      en: "Shipping information is updating.",
      uz: "Yetkazish ma'lumoti yangilanmoqda.",
      ru: "Информация о доставке обновляется.",
      ko: "배송 정보가 업데이트 중입니다."
    });
  const returnLabel =
    data.returnPolicy?.summary ||
    data.card?.logistics?.returnLabel ||
    t({
      en: "Return policy available after purchase.",
      uz: "Qaytarish shartlari xariddan keyin ko'rinadi.",
      ru: "Условия возврата доступны после покупки.",
      ko: "반품 정책은 구매 후 확인할 수 있습니다."
    });
  const sellerName =
    data.sellerSummary?.name ||
    data.agent?.name ||
    data.vendor?.name ||
    data.createdBy?.name ||
    t({
      en: "UniServe seller",
      uz: "UniServe sotuvchisi",
      ru: "Продавец UniServe",
      ko: "UniServe 판매자"
    });
  const sellerUsername = data.vendor?.username || data.createdBy?.username || data.createdBy?.name;
  const sellerAvatar = data.sellerSummary?.avatarUrl || data.agent?.avatarUrl || data.vendor?.avatarUrl || data.createdBy?.avatarUrl;
  const sellerVerified = Boolean(data.sellerSummary?.verified || data.card?.trust?.verifiedSeller);
  const visibleBadges = collectVisibleBadges(data, language);
  const specEntries = getSpecificationEntries(data);
  const relatedProducts = collectRecommendationItems((data as any).recommendations);
  const breadcrumbItems = [
    { label: t({ en: "Home", uz: "Bosh sahifa", ru: "Главная", ko: "홈" }), href: "/" },
    { label: t({ en: "Products", uz: "Mahsulotlar", ru: "Товары", ko: "상품" }), href: "/products" },
    { label: categoryDisplay, href: data.category ? `/products?category=${encodeURIComponent(String(data.category))}` : "/products" },
    { label: title }
  ];
  const sellerMeta = [
    { label: t({ en: "Shipping", uz: "Yetkazish", ru: "Доставка", ko: "배송" }), value: data.shippingInfo?.deliveryLabel || shippingLabel },
    { label: t({ en: "Stock", uz: "Zaxira", ru: "Наличие", ko: "재고" }), value: stockLabel },
    { label: t({ en: "Returns", uz: "Qaytarish", ru: "Возврат", ko: "반품" }), value: returnLabel }
  ];
  const sellerMetrics = [
    { label: t({ en: "Views", uz: "Ko'rish", ru: "Просмотры", ko: "조회" }), value: String(viewCount) },
    { label: t({ en: "Sold", uz: "Sotilgan", ru: "Продано", ko: "판매" }), value: String(soldCount) },
    { label: t({ en: "Rating", uz: "Reyting", ru: "Рейтинг", ko: "평점" }), value: ratingValue > 0 ? ratingValue.toFixed(1) : "—" }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {breadcrumbItems.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-slate-900">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900">{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)_360px]">
        <ProductGallery images={gallery} alt={title} title={brandLabel || categoryDisplay} />

        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2">
                {visibleBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {badge}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                {[brandLabel, categoryDisplay, subcategoryDisplay].filter(Boolean).join(" / ")}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{shortDescription}</p>
            </div>
            <RatingBadge
              rating={ratingValue}
              count={reviewCount}
              onClick={() => {
                const node = document.getElementById("reviews");
                if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t({ en: "Price", uz: "Narx", ru: "Цена", ko: "가격" })}
              </p>
              <p className="text-4xl font-extrabold text-slate-900">{price}</p>
              <div className="flex items-center gap-2">
                {oldPrice && <p className="text-sm text-slate-400 line-through">{oldPrice}</p>}
                {discount !== null && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">-{discount}%</span>}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard label={t({ en: "Availability", uz: "Mavjudlik", ru: "Наличие", ko: "재고 상태" })} value={stockLabel} compact />
              <InfoCard label={t({ en: "Shipping", uz: "Yetkazish", ru: "Доставка", ko: "배송" })} value={data.shippingInfo?.deliveryLabel || shippingLabel} compact />
              <InfoCard label={t({ en: "Returns", uz: "Qaytarish", ru: "Возврат", ko: "반품" })} value={returnLabel} compact />
              <InfoCard
                label={t({ en: "Seller trust", uz: "Sotuvchi ishonchi", ru: "Доверие к продавцу", ko: "판매자 신뢰" })}
                value={sellerVerified ? t({ en: "Verified seller", uz: "Tasdiqlangan sotuvchi", ru: "Проверенный продавец", ko: "인증 판매자" }) : sellerName}
                compact
              />
            </div>
          </div>

          {specEntries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {specEntries.slice(0, 6).map((entry) => (
                <div key={`${entry.label}-${entry.value}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{entry.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{entry.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <DetailActionSidebar className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg xl:sticky xl:top-24">
          <DetailSidebarCard title={t({ en: "Seller", uz: "Sotuvchi", ru: "Продавец", ko: "판매자" })}>
            <SellerAgentCard
              avatarSrc={sellerAvatar}
              fallbackText={sellerName}
              name={sellerName}
              username={sellerUsername}
              badge={sellerVerified ? t({ en: "Verified", uz: "Tasdiqlangan", ru: "Проверен", ko: "인증됨" }) : null}
              trustLine={shippingLabel}
              metaRows={sellerMeta}
              metrics={sellerMetrics}
            />
          </DetailSidebarCard>

          <DetailSidebarCard
            title={t({ en: "Buy box", uz: "Xarid paneli", ru: "Панель покупки", ko: "구매 패널" })}
            subtitle={
              cartCount > 0
                ? t({
                    en: `${cartCount} items already in cart`,
                    uz: `${cartCount} ta item savatchada`,
                    ru: `${cartCount} товаров уже в корзине`,
                    ko: `장바구니에 ${cartCount}개 상품`
                  })
                : t({
                    en: "Clear actions with trust-first purchase information",
                    uz: "Xarid uchun kerakli actionlar bir joyda",
                    ru: "Все основные действия для покупки в одном блоке",
                    ko: "구매에 필요한 핵심 액션이 한 곳에"
                  })
            }
          >
            <DetailPrimaryActions
              actions={[
                {
                  label: t({ en: "Add to cart", uz: "Savatchaga qo'shish", ru: "В корзину", ko: "장바구니 담기" }),
                  onClick: () => void handleAddToCart(),
                  busy: cartPending
                },
                {
                  label: t({ en: "Buy now", uz: "Darhol sotib olish", ru: "Купить сейчас", ko: "바로 구매" }),
                  onClick: () => void handleBuyNow(),
                  busy: buyNowPending
                },
                {
                  label: t({ en: "Message seller", uz: "Sotuvchiga yozish", ru: "Написать продавцу", ko: "판매자에게 문의" }),
                  onClick: () => void handleOpenSellerChat(),
                  busy: sellerChatLoading,
                  tone: "secondary"
                }
              ]}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleToggleSaved}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                {saved
                  ? t({ en: "Saved", uz: "Saqlangan", ru: "Сохранено", ko: "저장됨" })
                  : t({ en: "Save", uz: "Saqlash", ru: "Сохранить", ko: "저장" })}
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                {t({ en: "Share", uz: "Ulashish", ru: "Поделиться", ko: "공유" })}
              </button>
            </div>
          </DetailSidebarCard>

          <DetailSidebarCard title={t({ en: "Trust signals", uz: "Ishonch signallari", ru: "Сигналы доверия", ko: "신뢰 신호" })}>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoCard label={t({ en: "Shipping", uz: "Yetkazish", ru: "Доставка", ko: "배송" })} value={data.shippingInfo?.deliveryLabel || shippingLabel} compact />
              <InfoCard label={t({ en: "Returns", uz: "Qaytarish", ru: "Возврат", ko: "반품" })} value={returnLabel} compact />
              <InfoCard label={t({ en: "Stock", uz: "Ombor", ru: "Склад", ko: "재고" })} value={stockLabel} compact />
              <InfoCard
                label={t({ en: "Verified seller", uz: "Tasdiqlangan sotuvchi", ru: "Проверенный продавец", ko: "인증 판매자" })}
                value={sellerVerified ? t({ en: "Available", uz: "Mavjud", ru: "Доступно", ko: "제공됨" }) : t({ en: "Check profile", uz: "Profilni tekshiring", ru: "Проверьте профиль", ko: "프로필 확인" })}
                compact
              />
            </div>
          </DetailSidebarCard>

          <DetailSidebarCard>
            <FeedbackWidget
              title={t({ en: "Was this product info helpful?", uz: "Mahsulot ma'lumoti foydalimi?", ru: "Информация о товаре полезна?", ko: "상품 정보가 도움이 되었나요?" })}
              description={t({
                en: "Rate the quality of product information and report issues if something looks inconsistent.",
                uz: "Mahsulot ma'lumoti sifatini baholang va nomuvofiqlik bo'lsa xabar bering.",
                ru: "Оцените качество информации о товаре и сообщите, если есть несоответствия.",
                ko: "상품 정보의 품질을 평가하고 불일치가 있으면 신고하세요."
              })}
              actions={[
                { label: t({ en: "Helpful", uz: "Foydali", ru: "Полезно", ko: "도움됨" }), value: "helpful", count: likeCount },
                { label: t({ en: "Needs work", uz: "To'liq emas", ru: "Нужно доработать", ko: "보완 필요" }), value: "unhelpful", count: unhelpfulCount }
              ]}
              activeValue={feedbackValue}
              disabled={!isAuthenticated}
              loading={likePending}
              onSelect={(value) => void handleFeedbackSelect(value)}
              saved={saved}
              onToggleSaved={handleToggleSaved}
              onShare={() => void handleShare()}
              reportReason={reportReason}
              onReportReasonChange={setReportReason}
              onSubmitReport={() => void handleSubmitReport()}
              reportSubmitting={reportSubmitting}
            />
          </DetailSidebarCard>

          <DetailSidebarCard>
            <RequestFormPanel
              title={t({ en: "Purchase assist", uz: "Xarid bo'yicha yordam", ru: "Помощь с покупкой", ko: "구매 요청" })}
              description={t({
                en: "Send quantity, delivery, or variant preferences to the seller in a structured format.",
                uz: "Sotuvchiga soni, yetkazish yoki variant bo'yicha structured so'rov yuboring.",
                ru: "Отправьте продавцу структурированный запрос по количеству, доставке или варианту.",
                ko: "수량, 배송 또는 옵션 요구사항을 판매자에게 구조화된 형태로 보내세요."
              })}
              submitLabel={t({ en: "Send request", uz: "So'rov yuborish", ru: "Отправить запрос", ko: "요청 보내기" })}
              onSubmit={() => void handleSubmitPurchaseRequest()}
              submitting={requestSubmitting}
            >
              <div className="grid gap-2 sm:grid-cols-[96px_1fr]">
                <input
                  type="number"
                  min={1}
                  value={requestQty}
                  onChange={(event) => setRequestQty(Math.max(1, Number(event.target.value) || 1))}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
                <textarea
                  value={requestNote}
                  onChange={(event) => setRequestNote(event.target.value)}
                  placeholder={t({
                    en: "Write delivery, variant, or extra requirements",
                    uz: "Yetkazish, variant yoki qo'shimcha talab yozing",
                    ru: "Укажите доставку, вариант или дополнительные требования",
                    ko: "배송, 옵션 또는 추가 요구사항을 작성하세요"
                  })}
                  className="min-h-[88px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                />
              </div>
            </RequestFormPanel>
          </DetailSidebarCard>

          <DetailSidebarCard>
            <InquiryComposer
              title={t({ en: "Quick question", uz: "Tezkor savol-javob", ru: "Быстрый вопрос", ko: "빠른 문의" })}
              description={t({
                en: "Ask about price, variants, delivery, or warranty before checkout.",
                uz: "Narx, variant, yetkazish yoki kafolat bo'yicha savol yozing.",
                ru: "Задайте вопрос о цене, вариантах, доставке или гарантии до покупки.",
                ko: "구매 전에 가격, 옵션, 배송 또는 보증에 대해 문의하세요."
              })}
              messages={sellerMessages}
              draft={sellerChatDraft}
              onDraftChange={setSellerChatDraft}
              onSend={() => void handleSendSellerMessage()}
              loading={sellerChatLoading}
              sending={sellerChatSending}
              currentUserId={userId}
              existingThreadHint={
                sellerThread
                  ? t({
                      en: "You are continuing an existing conversation.",
                      uz: "Oldingi suhbatni davom ettiryapsiz.",
                      ru: "Вы продолжаете предыдущий диалог.",
                      ko: "기존 대화를 이어가는 중입니다."
                    })
                  : null
              }
            />
          </DetailSidebarCard>
        </DetailActionSidebar>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Description text={fullDescription} />
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">
            {t({ en: "Delivery & returns", uz: "Yetkazish va qaytarish", ru: "Доставка и возврат", ko: "배송 및 반품" })}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoCard label={t({ en: "Delivery type", uz: "Yetkazish turi", ru: "Тип доставки", ko: "배송 유형" })} value={data.shippingInfo?.deliveryLabel || shippingLabel} />
            <InfoCard label={t({ en: "Estimated", uz: "Muddat", ru: "Срок", ko: "예상 일정" })} value={data.shippingInfo?.estimated || shippingLabel} />
            <InfoCard label={t({ en: "Origin", uz: "Jo'nash joyi", ru: "Отправка из", ko: "출발지" })} value={data.shippingInfo?.origin || sellerName} />
            <InfoCard label={t({ en: "Return policy", uz: "Qaytarish", ru: "Возврат", ko: "반품 정책" })} value={returnLabel} />
          </div>
        </section>
      </div>

      <Specifications data={(data as any).specs || data.specifications} />
      <ReviewsPreview rating={ratingValue} count={reviewCount} />
      <RelatedProducts items={relatedProducts} />

      <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700"
        >
          {t({ en: "Cart", uz: "Savatga", ru: "В корзину", ko: "장바구니" })}
        </button>
        <button
          type="button"
          onClick={() => void handleBuyNow()}
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-white"
        >
          {t({ en: "Buy now", uz: "Tez sotib olish", ru: "Купить сейчас", ko: "바로 구매" })}
        </button>
        <button
          type="button"
          onClick={() => void handleLike()}
          disabled={likePending || !isAuthenticated}
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs"
        >
          {liked ? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}

function ImageSlider({ images, alt }: { images?: string[]; alt?: string }) {
  const safeImages = useMemo(() => normalizeImagesList(images), [images]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= safeImages.length) setActive(0);
  }, [active, safeImages.length]);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg">
      <div className="overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={safeImages[active]}
          alt={alt || "Product image"}
          className="h-[420px] w-full cursor-zoom-in object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`overflow-hidden rounded-xl border transition ${
                active === idx ? "border-emerald-500 shadow-md" : "border-slate-200 hover:border-emerald-400"
              }`}
            >
              <img
                src={src}
                alt={`Image ${idx + 1}`}
                className="h-20 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingBadge({
  rating,
  count,
  onClick
}: {
  rating: number;
  count: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm"
    >
      ⭐ {rating.toFixed(1)} ({count})
    </button>
  );
}

type DetailSpecEntry = {
  label: string;
  value: string;
};

type RelatedProductCardItem = {
  id: string;
  route: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  reasonLabel?: string | null;
};

function InfoCard({
  label,
  value,
  compact = false
}: {
  label: string;
  value?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 ${compact ? "px-4 py-3" : "px-4 py-4"}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>{value || "—"}</p>
    </div>
  );
}

function collectVisibleBadges(product: Product, locale: SupportedLocale) {
  const localizedDefault = {
    verified: {
      en: "Verified seller",
      uz: "Tasdiqlangan sotuvchi",
      ru: "Проверенный продавец",
      ko: "인증 판매자"
    },
    freeDelivery: {
      en: "Free delivery",
      uz: "Bepul yetkazish",
      ru: "Бесплатная доставка",
      ko: "무료 배송"
    },
    fastShipping: {
      en: "Fast shipping",
      uz: "Tez yetkazish",
      ru: "Быстрая доставка",
      ko: "빠른 배송"
    },
    limited: {
      en: "Limited stock",
      uz: "Omborda kam qoldi",
      ru: "Мало в наличии",
      ko: "재고 한정"
    }
  } as const;

  const badgeLabels = [
    ...(product.card?.badges?.map((badge) => badge.label).filter(Boolean) || []),
    ...(((product.badges || []) as string[]).map((badge) => String(badge || "").trim()).filter(Boolean) || [])
  ];

  if (product.sellerSummary?.verified || product.card?.trust?.verifiedSeller) {
    badgeLabels.push(localizedDefault.verified[locale]);
  }
  if (product.shippingInfo?.freeDelivery || product.card?.logistics?.freeDelivery) {
    badgeLabels.push(localizedDefault.freeDelivery[locale]);
  }
  if (product.shippingInfo?.fastShipping || product.card?.logistics?.fastShipping) {
    badgeLabels.push(localizedDefault.fastShipping[locale]);
  }
  if (product.card?.logistics?.limitedStock || product.stockStatus === "low_stock") {
    badgeLabels.push(localizedDefault.limited[locale]);
  }

  return Array.from(new Set(badgeLabels.filter(Boolean))).slice(0, 6);
}

function getSpecificationEntries(product: Product): DetailSpecEntry[] {
  const seen = new Set<string>();
  const pushEntry = (entries: DetailSpecEntry[], label: string | undefined, value: unknown) => {
    const safeLabel = String(label || "").trim();
    const safeValue = String(value || "").trim();
    if (!safeLabel || !safeValue) return;
    const key = safeLabel.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ label: safeLabel, value: safeValue });
  };

  const entries: DetailSpecEntry[] = [];
  pushEntry(entries, "Brand", product.brand);
  pushEntry(entries, "Category", product.categoryDisplay || product.category);
  pushEntry(entries, "Subcategory", product.subcategoryDisplay || (product as any).subCategory);
  pushEntry(entries, "Condition", product.condition);
  pushEntry(entries, "Audience", product.audience);
  pushEntry(entries, "Size", product.size);
  pushEntry(entries, "Season", product.season);
  pushEntry(entries, "Stock", product.stockStatus);

  if (Array.isArray((product as any).specs)) {
    ((product as any).specs as Array<{ label?: string; value?: string }>).forEach((item) => {
      pushEntry(entries, item?.label, item?.value);
    });
  }

  if (product.specifications && typeof product.specifications === "object") {
    Object.entries(product.specifications).forEach(([label, value]) => {
      pushEntry(entries, label, value);
    });
  }

  return entries;
}

function collectRecommendationItems(recommendations: unknown): RelatedProductCardItem[] {
  if (!Array.isArray(recommendations)) return [];
  const items = recommendations.flatMap((module) => {
    const moduleRecord = module && typeof module === "object" ? (module as Record<string, any>) : null;
    const moduleItems = Array.isArray(moduleRecord?.items) ? moduleRecord.items : [];
    return moduleItems
      .filter((item) => item && typeof item === "object")
      .map((item) => item as Record<string, any>)
      .filter((item) => String(item.entityType || "").toUpperCase() === "PRODUCT");
  });

  const seen = new Set<string>();
  const normalized: RelatedProductCardItem[] = [];

  items.forEach((item) => {
    const id = String(item.entityId || item.entityIdentifier || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    normalized.push({
      id,
      route: String(item.route || `/products/${item.entityIdentifier || item.entityId || ""}`),
      title: String(item.title || "").trim() || "Product",
      subtitle: typeof item.subtitle === "string" ? item.subtitle : null,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
      price: typeof item.price === "number" ? item.price : null,
      currency: typeof item.currency === "string" ? item.currency : null,
      reasonLabel: typeof item.reasonLabel === "string" ? item.reasonLabel : null
    });
  });

  return normalized.slice(0, 8);
}

function InteractionRow({
  views,
  likes,
  purchases,
  liked,
  likePending,
  cartCount,
  onLike,
  onShare
}: {
  views: number;
  likes: number;
  purchases: number;
  liked: boolean;
  likePending: boolean;
  cartCount: number;
  onLike: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
      <span className="rounded-full bg-slate-100 px-3 py-2">👁 {views}</span>
      <button
        type="button"
        onClick={onLike}
        disabled={likePending}
        className={`rounded-full border px-3 py-2 transition ${
          liked
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
        } disabled:opacity-60`}
      >
        {liked ? "❤️" : "🤍"} {likes}
      </button>
      <span className="rounded-full bg-slate-100 px-3 py-2">🛒 {cartCount}</span>
      <span className="rounded-full bg-slate-100 px-3 py-2">📦 {purchases}</span>
      <button
        type="button"
        onClick={onShare}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
      >
        🔗 Ulashish
      </button>
    </div>
  );
}

function Description({ text }: { text?: string }) {
  const { t } = useI18n();
  if (!text) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">
        {t({ en: "Description", uz: "Tavsif", ru: "Описание", ko: "상품 설명" })}
      </h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{text}</p>
    </div>
  );
}

function Specifications({ data }: { data?: Record<string, string> | DetailSpecEntry[] }) {
  const { t } = useI18n();
  const entries = Array.isArray(data)
    ? data.filter((item) => item?.label && item?.value)
    : data && typeof data === "object"
      ? Object.entries(data)
          .map(([label, value]) => ({ label, value: String(value || "").trim() }))
          .filter((item) => item.label && item.value)
      : [];
  if (entries.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">
        {t({ en: "Specifications", uz: "Xususiyatlar", ru: "Характеристики", ko: "상품 사양" })}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={`${entry.label}-${entry.value}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            <span className="font-semibold text-slate-800">{entry.label}</span>
            <span className="text-right">{entry.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsPreview({ rating, count }: { rating: number; count: number }) {
  const { t } = useI18n();
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const safeCount = Math.max(0, Math.round(count || 0));
  const hasReviews = safeCount > 0;

  return (
    <section id="reviews" className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t({ en: "Reviews", uz: "Sharhlar", ru: "Отзывы", ko: "리뷰" })}
        </h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          ⭐ {safeRating.toFixed(1)} · {safeCount}{" "}
          {t({ en: "reviews", uz: "ta sharh", ru: "отзывов", ko: "개 리뷰" })}
        </span>
      </div>

      {hasReviews ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoCard
            label={t({ en: "Average rating", uz: "O'rtacha reyting", ru: "Средний рейтинг", ko: "평균 평점" })}
            value={safeRating.toFixed(1)}
          />
          <InfoCard
            label={t({ en: "Total reviews", uz: "Jami sharhlar", ru: "Всего отзывов", ko: "전체 리뷰" })}
            value={String(safeCount)}
          />
          <InfoCard
            label={t({ en: "Review state", uz: "Sharh holati", ru: "Статус отзывов", ko: "리뷰 상태" })}
            value={t({
              en: "Detailed review feed is loading from marketplace data",
              uz: "To'liq sharhlar bo'limi marketplace ma'lumotlari bilan yangilanadi",
              ru: "Подробная лента отзывов загружается из маркетплейса",
              ko: "상세 리뷰 목록은 마켓플레이스 데이터로 업데이트됩니다"
            })}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          {t({
            en: "No reviews yet. The first buyer review will appear here.",
            uz: "Hozircha sharh yo'q. Birinchi xaridor sharhi shu yerda ko'rinadi.",
            ru: "Пока нет отзывов. Первый отзыв покупателя появится здесь.",
            ko: "아직 리뷰가 없습니다. 첫 구매자 리뷰가 여기에 표시됩니다."
          })}
        </div>
      )}
    </section>
  );
}

function RelatedProducts({ items }: { items?: RelatedProductCardItem[] }) {
  const { t, language } = useI18n();
  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t({ en: "Related products", uz: "O'xshash mahsulotlar", ru: "Похожие товары", ko: "관련 상품" })}
        </h2>
        <Link href="/products" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
          {t({ en: "Browse more", uz: "Yana ko'rish", ru: "Смотреть ещё", ko: "더 보기" })}
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.route}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl || "/placeholder.png"}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
            <div className="space-y-2 p-4">
              {item.reasonLabel ? (
                <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {item.reasonLabel}
                </span>
              ) : null}
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h3>
              {item.subtitle ? <p className="line-clamp-2 text-xs text-slate-500">{item.subtitle}</p> : null}
              {typeof item.price === "number" ? (
                <p className="text-base font-extrabold text-slate-900">
                  {formatMoneyByLocale(item.price, item.currency || "USD", language)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Badges({
  brand,
  condition,
  audience,
  size,
  season,
  createdAt
}: {
  brand?: string;
  condition?: string;
  audience?: string;
  size?: string;
  season?: string;
  createdAt?: string;
}) {
  const items = [
    brand ? `Brend: ${brand}` : null,
    condition ? `Holati: ${condition}` : null,
    audience ? `Auditoriya: ${audience}` : null,
    size ? `O'lcham: ${size}` : null,
    season ? `Mavsum: ${season}` : null,
    createdAt ? `Joylandi: ${formatDate(createdAt)}` : null
  ].filter(Boolean);

  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function QuickFacts({ data }: { data: Product }) {
  const facts = [
    { label: "Kategoriya", value: data.category },
    { label: "Brend", value: data.brand },
    { label: "Holati", value: data.condition },
    { label: "O'lcham", value: data.size },
    { label: "Mavsum", value: data.season },
    { label: "Auditoriya", value: data.audience },
    { label: "Tashkil etilgan", value: data.createdAt ? formatDate(data.createdAt) : undefined },
    { label: "ID", value: data.id || data._id }
  ].filter((item) => item.value);

  if (facts.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Asosiy ma'lumotlar</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{fact.label}</p>
            <p className="mt-1 font-semibold text-slate-900">{fact.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorBox({ vendor }: { vendor?: Product["vendor"] }) {
  if (!vendor) return null;
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <p className="text-xs uppercase tracking-[0.15em] text-emerald-600">Sotuvchi</p>
      <div className="mt-1 font-semibold text-emerald-900">{vendor.name || vendor.username}</div>
      <div className="flex flex-wrap gap-3 text-xs text-emerald-700">
        {vendor.rating && <span>⭐ {vendor.rating.toFixed(1)}</span>}
        {vendor.location && <span>📍 {vendor.location}</span>}
        {vendor.contact && <span>☎️ {vendor.contact}</span>}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" });
}

function loadCachedProduct(id: string): Product | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `product-preview-${id}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Product;
  } catch {
    return null;
  }
}

function mergeProductData(base?: Product | null, next?: Product | null): Product | null {
  if (!base && !next) return null;
  const combined: Product = { ...(base || {}), ...(next || {}) };
  combined.slug = next?.slug || base?.slug || combined.slug || null;
  combined.route =
    next?.route ||
    next?.card?.route ||
    base?.route ||
    base?.card?.route ||
    (combined.slug || combined.id || combined._id ? `/products/${combined.slug || combined.id || combined._id}` : undefined);
  combined.card = next?.card || base?.card || combined.card;
  combined.rating = next?.rating || base?.rating;
  combined.stats = next?.stats || base?.stats || {
    views: next?.views ?? base?.views ?? 0,
    likes: next?.likes ?? base?.likes ?? 0,
    purchases: (next?.orders ?? base?.orders) || 0
  };
  combined.shippingInfo = next?.shippingInfo || base?.shippingInfo || combined.shippingInfo;
  combined.returnPolicy = next?.returnPolicy || base?.returnPolicy || combined.returnPolicy;
  combined.sellerSummary = next?.sellerSummary || base?.sellerSummary || combined.sellerSummary;
  combined.gallery = normalizeImagesList([
    ...collectRealProductImages(next || combined),
    ...collectRealProductImages(base || combined)
  ]);
  combined.images = combined.gallery;
  combined.primaryImage = combined.gallery[0] || next?.primaryImage || base?.primaryImage || "/placeholder.png";
  combined.thumbnail = combined.primaryImage;
  combined.name = next?.name || next?.title || base?.name || base?.title;
  combined.title = combined.name || next?.title || base?.title;
  combined.shortDescription = next?.shortDescription || base?.shortDescription || combined.shortDescription;
  combined.fullDescription = next?.fullDescription || base?.fullDescription || combined.fullDescription;
  combined.description = next?.description || base?.description;
  combined.currentPrice = next?.currentPrice ?? base?.currentPrice ?? combined.currentPrice;
  combined.price = next?.price ?? base?.price;
  combined.oldPrice = next?.oldPrice ?? base?.oldPrice;
  combined.category = next?.category || base?.category;
  return combined;
}

function normalizeImagesList(images?: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  (images || []).forEach((value) => {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });
  return result.length ? result : ["/placeholder.png"];
}

function collectRealProductImages(product?: Product | null) {
  if (!product) return [];
  const candidates = [
    product.primaryImage,
    ...((product.gallery || []) as string[]),
    (product as any)?.coverImageUrl,
    ...((product.images || []) as string[]),
    product.thumbnail,
    product.card?.primaryImage,
    ...((product.card?.gallery || []) as string[]),
    (product as any)?.imageUrl
  ].filter(Boolean);
  return normalizeImagesList(candidates as string[]).filter((img) => img !== "/placeholder.png");
}

function getCategoryHighlights(category?: string) {
  if (!category) return [];
  const key = category.toLowerCase();
  const presets: Record<string, { title: string; desc: string; icon: string }[]> = {
    electronics: [
      { title: "Texnik", desc: "Energiyani tejovchi va yuqori unumli protsessor", icon: "🔋" },
      { title: "Monitor", desc: "Yorqin va ravshan displey, ko'z uchun qulay", icon: "🖥️" }
    ],
    fashion: [
      { title: "Material", desc: "Yumshoq va havo o'tkazuvchi mato", icon: "🧵" },
      { title: "Dizayn", desc: "Kundalik va bayramona uslubda mos keladi", icon: "👗" }
    ],
    grocery: [
      { title: "Yangi", desc: "Mahalliy fermadan yetkazilgan yangiligi tekshirilgan", icon: "🥬" },
      { title: "Paket", desc: "Sertifikatlangan va xavfsiz o'ralgan", icon: "📦" }
    ],
    beauty: [
      { title: "Tarkib", desc: "Paraben va sulfatlarsiz muloyim formula", icon: "🧴" },
      { title: "Natija", desc: "Namlikni ushlab turadi va jiloni tiklaydi", icon: "✨" }
    ]
  };

  return presets[key] || [
    { title: "Kategoriya", desc: `${category} uchun asosiy afzalliklar to'plangan.`, icon: "📌" }
  ];
}
