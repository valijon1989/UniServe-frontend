"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useState } from "react";

type CartIconButtonProps = {
  count: number;
  href?: string;
  label: string;
  active?: boolean;
  syncing?: boolean;
  className?: string;
};

type ShoppingBagIconProps = {
  className?: string;
};

export function ShoppingBagIcon({ className }: ShoppingBagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 8.5h11l-.7 9.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6.5 8.5Z" />
      <path d="M9 9V7.8a3 3 0 0 1 6 0V9" />
      <path d="M9 12.2v.2" />
      <path d="M15 12.2v.2" />
    </svg>
  );
}

export function CartIconButton({
  count,
  href = "/cart",
  label,
  active = false,
  syncing = false,
  className
}: CartIconButtonProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (count <= 0) return;
    setAnimationKey((value) => value + 1);
  }, [count]);

  const displayCount = count > 99 ? "99+" : String(count);
  const ariaLabel = count > 0 ? `${label}: ${displayCount}` : label;

  return (
    <Link
      href={href}
      title={label}
      aria-label={ariaLabel}
      className={clsx(
        "group relative inline-flex h-11 w-11 items-center justify-center rounded-full border text-slate-100 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        active
          ? "border-sky-300/80 bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20"
          : "border-slate-700/80 bg-slate-900/75 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-slate-900/90 active:translate-y-0",
        className
      )}
    >
      {syncing ? <span className="absolute inset-0 rounded-full ring-1 ring-sky-300/60 animate-pulse" aria-hidden="true" /> : null}
      <motion.span
        key={animationKey}
        className="relative flex items-center justify-center"
        animate={count > 0 ? { rotate: [0, -8, 6, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
      >
        <ShoppingBagIcon className="h-5 w-5" />
      </motion.span>

      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={displayCount}
            initial={{ opacity: 0, scale: 0.65, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.65, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.45rem] items-center justify-center rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black leading-none text-slate-950 shadow-lg shadow-amber-300/30"
          >
            {displayCount}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <span className="sr-only">{label}</span>
    </Link>
  );
}
