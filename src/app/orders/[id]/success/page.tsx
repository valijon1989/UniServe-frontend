"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDefaultCheckoutPaymentMethods, getOrderById, type CommerceOrder } from "@/api/commerce";
import { Spinner } from "@/components/shared/Spinner";
import { useI18n } from "@/context/i18n";
import { formatMoneyByLocale } from "@/lib/localization";

export default function OrderSuccessPage() {
  const params = useParams();
  const { t, language } = useI18n();
  const orderId = useMemo(() => {
    const value = params?.id;
    if (!value) return "";
    return Array.isArray(value) ? value[0] : value;
  }, [params]);
  const [order, setOrder] = useState<CommerceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const paymentMethods = useMemo(() => getDefaultCheckoutPaymentMethods(language), [language]);
  const paymentMethodLabel = useMemo(() => {
    if (!order?.paymentMethod) return "—";
    return paymentMethods.find((item) => item.code === order.paymentMethod)?.displayName || order.paymentMethod;
  }, [order?.paymentMethod, paymentMethods]);
  const deliveryLabel = useMemo(() => {
    if (!order?.deliveryOption) return "—";
    if (order.deliveryOption === "express") {
      return t({ en: "Express", uz: "Express", ru: "Экспресс", ko: "익스프레스" });
    }
    if (order.deliveryOption === "standard") {
      return t({ en: "Standard", uz: "Standard", ru: "Стандарт", ko: "일반" });
    }
    return order.deliveryOption;
  }, [order?.deliveryOption, t]);
  const orderStatusLabel = useMemo(() => {
    switch (order?.status) {
      case "PENDING_PAYMENT":
        return t({ en: "Awaiting payment", uz: "To'lov kutilmoqda", ru: "Ожидается оплата", ko: "결제 대기 중" });
      case "PAID":
        return t({ en: "Paid", uz: "To'lov qabul qilindi", ru: "Оплачено", ko: "결제 완료" });
      case "CONFIRMED":
        return t({ en: "Confirmed", uz: "Tasdiqlangan", ru: "Подтверждено", ko: "확인됨" });
      case "FAILED":
        return t({ en: "Failed", uz: "Muvaffaqiyatsiz", ru: "Неуспешно", ko: "실패" });
      default:
        return order?.status || "—";
    }
  }, [order?.status, t]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let active = true;
    getOrderById(orderId)
      .then((result) => {
        if (!active) return;
        setOrder(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <Spinner
        label={t({
          en: "Checking order",
          uz: "Buyurtma tekshirilmoqda",
          ru: "Проверка заказа",
          ko: "주문 확인 중"
        })}
      />
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          {t({ en: "Order not found", uz: "Buyurtma topilmadi", ru: "Заказ не найден", ko: "주문을 찾을 수 없습니다" })}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {t({
            en: "If payment was completed, try refreshing the page.",
            uz: "Agar to'lov qilingan bo'lsa, sahifani qayta yuklab ko'ring.",
            ru: "Если оплата прошла, попробуйте обновить страницу.",
            ko: "결제가 완료되었다면 페이지를 새로고침해 보세요."
          })}
        </p>
        <div className="mt-6">
          <Link
            href="/my-orders"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow"
          >
            {t({ en: "My orders", uz: "Buyurtmalarim", ru: "Мои заказы", ko: "내 주문" })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-200 bg-white/85 p-6 shadow-sm">
      <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {t({ en: "Order accepted", uz: "Buyurtma qabul qilindi", ru: "Заказ принят", ko: "주문이 접수되었습니다" })}
        </p>
        <h1 className="text-2xl font-black text-slate-900">
          {t({ en: "Order", uz: "Buyurtma", ru: "Заказ", ko: "주문" })} #{order.id}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
            {t({ en: "Fulfillment", uz: "Yetkazish", ru: "Выполнение", ko: "이행 정보" })}
          </h2>
          <p className="mt-2 text-sm text-slate-800">{order.shippingAddress || "—"}</p>
          <p className="mt-1 text-sm text-slate-600">{order.phone || "—"}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t({ en: "Delivery", uz: "Yetkazish", ru: "Доставка", ko: "배송" })}: {deliveryLabel}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
            {t({ en: "Payment", uz: "To'lov", ru: "Оплата", ko: "결제" })}
          </h2>
          <p className="mt-2 text-sm text-slate-800">
            {t({ en: "Method", uz: "Usul", ru: "Способ", ko: "방식" })}: {paymentMethodLabel}
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {t({ en: "Status", uz: "Holat", ru: "Статус", ko: "상태" })}: {orderStatusLabel}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{formatMoneyByLocale(order.subtotal, order.currency, language)}</p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
          {t({ en: "Items", uz: "Mahsulotlar", ru: "Товары", ko: "항목" })}
        </h2>
        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.qty}`} className="flex items-center justify-between gap-3 text-sm">
              <p className="line-clamp-1 text-slate-800">
                {item.title} x{item.qty}
              </p>
              <p className="font-semibold text-slate-900">{formatMoneyByLocale(item.price * item.qty, item.currency, language)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/my-orders"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
        >
          {t({ en: "My orders", uz: "Buyurtmalarim", ru: "Мои заказы", ko: "내 주문" })}
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {t({ en: "Continue shopping", uz: "Xaridni davom ettirish", ru: "Продолжить покупки", ko: "쇼핑 계속하기" })}
        </Link>
      </div>
    </div>
  );
}
