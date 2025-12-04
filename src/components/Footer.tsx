// use client
"use client";

import Link from "next/link";
import { useI18n } from "@/context/i18n";

function ContactIcon({ type }: { type: string }) {
  switch (type) {
    case "facebook":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M13 10h2.5l.5-3H13V5.5c0-.9.3-1.5 1.6-1.5H16V1.1C15.5 1 14.1 1 12.5 1 9.9 1 8 2.7 8 5.2V7H5.5v3H8v9h5v-9z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm12 1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );
    case "telegram":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M21.9 4.1a1.2 1.2 0 0 0-1.2-.2L2.7 10.9a1.2 1.2 0 0 0 .1 2.3l4.4 1.4 1.5 4.8a1.2 1.2 0 0 0 2 .5l2.8-2.5 4.3 3.2a1.2 1.2 0 0 0 1.9-.7l3-14a1.2 1.2 0 0 0-.8-1.4zM8.7 13.8 18 8.8l-7.6 6.4a.6.6 0 0 0-.2.4l-.4 2-1.1-3.6z" />
        </svg>
      );
    case "chat":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "mail":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M4 4h16a2 2 0 0 1 2 2v1l-10 6L2 7V6a2 2 0 0 1 2-2zm16 5.2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.2l8 4.8z" />
        </svg>
      );
    case "phone":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M6.6 2h2.2a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.5 1.1l-1.6.9a12.4 12.4 0 0 0 5.4 5.4l.9-1.6a1 1 0 0 1 1.1-.5l3 .7a1 1 0 0 1 .8 1v2.2a2 2 0 0 1-2.2 2A15.4 15.4 0 0 1 4.6 6.3 2 2 0 0 1 6.6 2z" />
        </svg>
      );
    case "location":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 6 11.4 6.3 11.7a1 1 0 0 0 1.4 0C13.9 20.4 19 14.2 19 9a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const { t } = useI18n();

  const contacts = [
    { label: t("contact.facebook"), href: "https://facebook.com/yourpage", icon: "facebook" },
    { label: t("contact.instagram"), href: "https://instagram.com/yourpage", icon: "instagram" },
    { label: t("contact.telegram"), href: "https://t.me/yourchannel", icon: "telegram" },
    { label: t("contact.kakao"), href: "https://open.kakao.com/o/yourlink", icon: "chat" },
    { label: t("contact.email"), href: "mailto:hello@uniserve.com", icon: "mail" },
    { label: t("contact.phone"), href: "tel:+998000000000", icon: "phone" },
    { label: t("contact.address"), href: "https://maps.google.com/?q=UniServe", icon: "location" }
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-black/60 text-slate-300">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/footer-bg.png')] bg-cover bg-center opacity-25"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-lg font-semibold text-slate-100">{t("footer.title")}</p>
          <p className="text-sm leading-relaxed text-slate-400">
            {t("footer.description")}
          </p>
        </div>

        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <Link
              key={contact.label}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-2 rounded-lg bg-slate-900/70 px-3 py-2 text-sm hover:bg-slate-800/80 hover:text-slate-100"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                <ContactIcon type={contact.icon} />
              </span>
              <span>{contact.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="relative border-t border-slate-800/80 bg-black/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {t("footer.title")}. {t("footer.rights")}</span>
          <span className="text-slate-400">{t("footer.tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
