"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  clearCart,
  confirmPayment,
  consumeBuyNowSession,
  createOrder,
  getCheckoutItems,
  getDefaultCheckoutPaymentMethods,
  syncPurchasedProductStats,
  type CartItem,
  type CheckoutMode
} from "@/api/commerce";
import { Spinner } from "@/components/shared/Spinner";
import { useI18n } from "@/context/i18n";
import { buildLoginRedirect, isUnauthorizedApiError, sanitizeInternalRedirect } from "@/lib/authRedirect";
import { formatMoneyByLocale, readStoredLanguage, resolveLocalizedText, tx } from "@/lib/localization";
import { useAuthStore } from "@/store/auth";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useI18n();
  const mode = (searchParams?.get("mode") || "cart").toLowerCase() === "buynow" ? "buynow" : "cart";
  const sid = searchParams?.get("sid") || "";
  const pathname = "/checkout";

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const currentPath = sanitizeInternalRedirect(
    `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
    "/checkout"
  );

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const redirectToLogin = () => {
    router.push(buildLoginRedirect(currentPath));
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Please sign in to continue with checkout.",
          uz: "Checkoutni davom ettirish uchun avval login qiling.",
          ru: "Войдите, чтобы продолжить checkout.",
          ko: "체크아웃을 계속하려면 로그인하세요."
        })
      );
      redirectToLogin();
      return;
    }
    let active = true;
    setLoading(true);
    getCheckoutItems(mode as CheckoutMode, sid)
      .then((loadedItems) => {
        if (!active) return;
        setItems(loadedItems);
      })
      .catch((error: unknown) => {
        if (isUnauthorizedApiError(error)) {
          toast.error(
            t({
              en: "An active session is required for checkout.",
              uz: "Checkout uchun login sessiyasi kerak.",
              ru: "Для checkout нужна активная сессия.",
              ko: "체크아웃에는 로그인 세션이 필요합니다."
            })
          );
          redirectToLogin();
          return;
        }
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (error as { message?: string })?.message ||
          t({
            en: "Could not open the checkout details.",
            uz: "Checkout ma'lumotini ochib bo'lmadi.",
            ru: "Не удалось открыть данные checkout.",
            ko: "체크아웃 정보를 불러오지 못했습니다."
          });
        toast.error(message);
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated, mode, router, searchParams, sid, t]);

  const paymentMethods = useMemo(() => getDefaultCheckoutPaymentMethods(language), [language]);
  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.code === paymentMethod) || paymentMethods[0],
    [paymentMethod, paymentMethods]
  );

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.qty, 0), [items]);
  const currency = useMemo(() => items.find((item) => item.currency)?.currency || "USD", [items]);
  const shippingCost = useMemo(() => {
    if (!items.length) return 0;
    if (subtotal >= 100) return 0;
    return deliveryOption === "express" ? 12 : 7.5;
  }, [deliveryOption, items.length, subtotal]);
  const total = subtotal + shippingCost;

  const placeOrderLabel = useMemo(() => {
    if (!selectedPaymentMethod) {
      return t({
        en: "Continue payment",
        uz: "To'lovni davom ettirish",
        ru: "Продолжить оплату",
        ko: "결제 계속하기"
      });
    }
    if (selectedPaymentMethod.group === "SMS_LINK") {
      return t({
        en: "Send SMS link",
        uz: "SMS havola yuborish",
        ru: "Отправить SMS-ссылку",
        ko: "SMS 링크 보내기"
      });
    }
    if (selectedPaymentMethod.group === "SMS_INVOICE") {
      return t({
        en: "Get invoice by SMS",
        uz: "SMS orqali invoice olish",
        ru: "Получить инвойс по SMS",
        ko: "SMS로 인보이스 받기"
      });
    }
    if (selectedPaymentMethod.group === "MANUAL_BANK_TRANSFER") {
      return t({
        en: "Get bank details",
        uz: "Rekvizitlarni olish",
        ru: "Получить реквизиты",
        ko: "계좌 정보를 받기"
      });
    }
    return t({
      en: "Continue payment",
      uz: "To'lovni davom ettirish",
      ru: "Продолжить оплату",
      ko: "결제 계속하기"
    });
  }, [selectedPaymentMethod, t]);

  const paymentGroupLabel = (group: string) => {
    if (group === "INSTANT_ONLINE") {
      return t({ en: "Instant online", uz: "Onlayn darhol", ru: "Мгновенно онлайн", ko: "즉시 온라인" });
    }
    if (group === "PLATFORM_LINKED") {
      return t({ en: "Platform linked", uz: "Platform linked", ru: "Связано с платформой", ko: "플랫폼 연동" });
    }
    if (group === "SMS_LINK") {
      return t({ en: "SMS link", uz: "SMS havola", ru: "SMS-ссылка", ko: "SMS 링크" });
    }
    if (group === "SMS_INVOICE") {
      return t({ en: "SMS invoice", uz: "SMS invoice", ru: "SMS-инвойс", ko: "SMS 인보이스" });
    }
    if (group === "MANUAL_BANK_TRANSFER") {
      return t({ en: "Manual transfer", uz: "Qo'lda o'tkazma", ru: "Ручной перевод", ko: "수동 송금" });
    }
    return group;
  };

  const placeOrder = async () => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Please sign in before placing an order.",
          uz: "Buyurtma berish uchun avval login qiling.",
          ru: "Войдите перед оформлением заказа.",
          ko: "주문 전에 로그인하세요."
        })
      );
      redirectToLogin();
      return;
    }
    if (!items.length) {
      toast.error(
        t({
          en: "No items found for checkout.",
          uz: "Checkout uchun mahsulot topilmadi.",
          ru: "Для checkout не найдено товаров.",
          ko: "체크아웃할 상품이 없습니다."
        })
      );
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error(
        t({
          en: "Enter the delivery address.",
          uz: "Yetkazish manzilini kiriting.",
          ru: "Введите адрес доставки.",
          ko: "배송 주소를 입력하세요."
        })
      );
      return;
    }
    if (!phone.trim()) {
      toast.error(
        t({
          en: "Enter the phone number.",
          uz: "Telefon raqamini kiriting.",
          ru: "Введите номер телефона.",
          ko: "전화번호를 입력하세요."
        })
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        mode: mode as CheckoutMode,
        items,
        shippingAddress: shippingAddress.trim(),
        phone: phone.trim(),
        deliveryOption,
        paymentMethod
      });
      await confirmPayment(order.id, paymentMethod);
      await syncPurchasedProductStats(items);

      if (mode === "buynow" && sid) {
        consumeBuyNowSession(sid);
      } else {
        await clearCart();
      }

      toast.success(
        t({
          en: "Order accepted",
          uz: "Buyurtma qabul qilindi",
          ru: "Заказ принят",
          ko: "주문이 접수되었습니다"
        })
      );
      router.replace(`/orders/${order.id}/success`);
    } catch (error: unknown) {
      if (isUnauthorizedApiError(error)) {
        toast.error(
          t({
            en: "Please sign in again to finish the order.",
            uz: "Buyurtmani yakunlash uchun qayta login qiling.",
            ru: "Чтобы завершить заказ, войдите снова.",
            ko: "주문을 완료하려면 다시 로그인하세요."
          })
        );
        redirectToLogin();
        return;
      }
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        t({
          en: "A checkout error occurred.",
          uz: "Checkout jarayonida xatolik yuz berdi.",
          ru: "Во время checkout произошла ошибка.",
          ko: "체크아웃 중 오류가 발생했습니다."
        });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        label={t({
          en: "Preparing checkout",
          uz: "Checkout tayyorlanmoqda",
          ru: "Подготовка checkout",
          ko: "체크아웃 준비 중"
        })}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          {t({
            en: "No items found for checkout",
            uz: "Checkout uchun mahsulot topilmadi",
            ru: "Для checkout товары не найдены",
            ko: "체크아웃할 항목이 없습니다"
          })}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {t({
            en: "Return to the cart or select the product again.",
            uz: "Savatchaga qayting yoki mahsulotni qaytadan tanlang.",
            ru: "Вернитесь в корзину или выберите товар заново.",
            ko: "장바구니로 돌아가거나 상품을 다시 선택하세요."
          })}
        </p>
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="mt-6 rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow"
        >
          {t({
            en: "Back to cart",
            uz: "Savatchaga qaytish",
            ru: "Вернуться в корзину",
            ko: "장바구니로 돌아가기"
          })}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {t({ en: "Checkout", uz: "Checkout", ru: "Checkout", ko: "체크아웃" })}
          </h1>
          <p className="text-sm text-slate-600">
            {t({ en: "Mode", uz: "Rejim", ru: "Режим", ko: "모드" })}:{" "}
            {mode === "buynow"
              ? t({ en: "Buy now", uz: "Darhol sotib olish", ru: "Купить сейчас", ko: "바로 구매" })
              : t({ en: "Cart", uz: "Savatcha", ru: "Корзина", ko: "장바구니" })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {t({ en: "Delivery address", uz: "Yetkazish manzili", ru: "Адрес доставки", ko: "배송 주소" })}
          </label>
          <textarea
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400"
            placeholder={t({
              en: "City, street, building, landmark",
              uz: "Shahar, ko'cha, uy, mo'ljal",
              ru: "Город, улица, дом, ориентир",
              ko: "도시, 거리, 건물, 랜드마크"
            })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {t({ en: "Phone", uz: "Telefon", ru: "Телефон", ko: "전화번호" })}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {t({ en: "Delivery type", uz: "Yetkazish turi", ru: "Тип доставки", ko: "배송 유형" })}
            </label>
            <select
              value={deliveryOption}
              onChange={(event) => setDeliveryOption(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400"
            >
              <option value="standard">{t({ en: "Standard", uz: "Standard", ru: "Стандарт", ko: "일반" })}</option>
              <option value="express">{t({ en: "Express", uz: "Express", ru: "Экспресс", ko: "익스프레스" })}</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="mb-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {t({ en: "Payment method", uz: "To'lov usuli", ru: "Способ оплаты", ko: "결제 수단" })}
            </label>
            <p className="mt-1 text-sm text-slate-500">
              {t({
                en: "All payments enter UniServe escrow first.",
                uz: "Har bir to'lov avval UniServe escrow oqimiga kiradi.",
                ru: "Любой платеж сначала попадает в escrow UniServe.",
                ko: "모든 결제는 먼저 UniServe 에스크로로 들어갑니다."
              })}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => (
              <button
                key={method.code}
                type="button"
                onClick={() => setPaymentMethod(method.code)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  paymentMethod === method.code
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{method.displayName}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {paymentGroupLabel(method.group)}
                  </span>
                </div>
                {method.checkoutDescription ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">{method.checkoutDescription}</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {t({ en: "Escrow protection", uz: "Escrow himoyasi", ru: "Escrow-защита", ko: "에스크로 보호" })}
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            {t({
              en: "Funds are held securely by UniServe until delivery or completion is confirmed.",
              uz: "Mablag' yetkazish yoki bajarilish tasdiqlanguncha UniServe tomonidan xavfsiz ushlab turiladi.",
              ru: "Средства надежно удерживаются UniServe до подтверждения доставки или выполнения.",
              ko: "배송 또는 완료가 확인될 때까지 결제 금액은 UniServe가 안전하게 보관합니다."
            })}
          </p>
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          {t({ en: "Order summary", uz: "Buyurtma xulosasi", ru: "Сводка заказа", ko: "주문 요약" })}
        </h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.qty}`} className="flex items-start justify-between gap-2 text-sm text-slate-700">
              <p className="line-clamp-2 flex-1">
                {item.title} x{item.qty}
              </p>
              <p className="font-semibold text-slate-900">{formatMoneyByLocale(item.price * item.qty, item.currency, language)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span>{t({ en: "Subtotal", uz: "Subtotal", ru: "Подытог", ko: "소계" })}</span>
            <span>{formatMoneyByLocale(subtotal, currency, language)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>{t({ en: "Delivery", uz: "Yetkazish", ru: "Доставка", ko: "배송" })}</span>
            <span>{shippingCost === 0 ? t({ en: "Free", uz: "Bepul", ru: "Бесплатно", ko: "무료" }) : formatMoneyByLocale(shippingCost, currency, language)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>{t({ en: "Payment", uz: "To'lov", ru: "Оплата", ko: "결제" })}</span>
            <span>{selectedPaymentMethod?.displayName || paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>{t({ en: "Total", uz: "Jami", ru: "Итого", ko: "합계" })}</span>
            <span>{formatMoneyByLocale(total, currency, language)}</span>
          </div>
        </div>

        {selectedPaymentMethod?.checkoutDescription ? (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t({ en: "Selected method", uz: "Tanlangan usul", ru: "Выбранный способ", ko: "선택된 수단" })}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPaymentMethod.displayName}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{selectedPaymentMethod.checkoutDescription}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void placeOrder()}
          disabled={submitting}
          className="mt-5 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:opacity-60"
        >
          {submitting
            ? t({ en: "Processing...", uz: "Bajarilmoqda...", ru: "Обработка...", ko: "처리 중..." })
            : placeOrderLabel}
        </button>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Spinner
          label={resolveLocalizedText(
            tx("Preparing checkout", "Checkout tayyorlanmoqda", "Подготовка checkout", "체크아웃 준비 중"),
            readStoredLanguage()
          )}
        />
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
