"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  clearCart,
  getCart,
  removeCartItem,
  type CartSummary,
  updateCartItemQty
} from "@/api/commerce";
import { CartEmptyState } from "@/components/CartEmptyState";
import { CartItemCard } from "@/components/CartItemCard";
import { CartShell } from "@/components/CartShell";
import { CartSummaryCard } from "@/components/CartSummaryCard";
import { Spinner } from "@/components/shared/Spinner";
import { useI18n } from "@/context/i18n";

export default function CartPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const reloadCart = async () => {
    setLoading(true);
    try {
      const next = await getCart();
      setCart(next);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        t("cart.toast.load_error");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reloadCart();
  }, []);

  const shipping = useMemo(() => {
    const subtotal = cart?.subtotal ?? 0;
    if (subtotal <= 0) return 0;
    if (subtotal >= 100) return 0;
    return 7.5;
  }, [cart?.subtotal]);

  const total = (cart?.subtotal ?? 0) + shipping;

  const onIncrease = async (productId: string, qty: number) => {
    setPendingItemId(productId);
    try {
      const next = await updateCartItemQty(productId, qty + 1);
      setCart(next);
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
          t("cart.toast.increase_error")
      );
    } finally {
      setPendingItemId(null);
    }
  };

  const onDecrease = async (productId: string, qty: number) => {
    if (qty <= 1) return;
    setPendingItemId(productId);
    try {
      const next = await updateCartItemQty(productId, qty - 1);
      setCart(next);
    } catch (error: unknown) {
      toast.error(
        (error as { message?: string })?.message ||
          t("cart.toast.decrease_error")
      );
    } finally {
      setPendingItemId(null);
    }
  };

  const onRemove = async (productId: string) => {
    setPendingItemId(productId);
    try {
      const next = await removeCartItem(productId);
      setCart(next);
      toast.success(t("cart.toast.remove_success"));
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || t("cart.toast.remove_error"));
    } finally {
      setPendingItemId(null);
    }
  };

  const onClear = async () => {
    setClearing(true);
    try {
      const next = await clearCart();
      setCart(next);
      toast.success(t("cart.toast.clear_success"));
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || t("cart.toast.clear_error"));
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <Spinner
        label={t("common.loading")}
      />
    );
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("cart.title")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{t("cart.header.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("cart.header.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t("cart.actions.continue_shopping")}
            </Link>
            <button
              type="button"
              onClick={onClear}
              disabled={clearing}
              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {t("cart.actions.clear_all")}
            </button>
          </div>
        </div>
      </section>

      <CartShell
        items={
          <section className="space-y-4">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.productId}
                item={item}
                pending={pendingItemId === item.productId}
                onIncrease={() => void onIncrease(item.productId, item.qty)}
                onDecrease={() => void onDecrease(item.productId, item.qty)}
                onRemove={() => void onRemove(item.productId)}
              />
            ))}
          </section>
        }
        summary={
          <CartSummaryCard
            totalItems={cart.totalItems}
            productCount={cart.counts.product}
            serviceCount={cart.counts.service}
            subtotal={cart.subtotal}
            shipping={shipping}
            total={total}
            currency={cart.currency}
            onCheckout={() => router.push("/checkout")}
            onClear={() => void onClear()}
          />
        }
      />
    </div>
  );
}
