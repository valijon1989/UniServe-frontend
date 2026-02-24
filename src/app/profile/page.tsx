"use client";

import { useEffect, useState } from "react";
import { getMe, type MeResponse } from "@/api/auth";
import { useI18n } from "@/context/i18n";
import { UserRoute } from "@/components/guards/UserRoute";

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    (async () => {
      const res = await getMe();
      setMe(res);
    })();
  }, []);

  const displayName = me?.name?.trim() || me?.email?.split("@")[0] || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const content = !me ? (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
      {t("profile.loading")}
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-base font-semibold text-sky-300">
            {avatarInitial}
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-50">
              {displayName}
            </h1>
            <p className="text-xs text-slate-400">
              {me.email || "-"}
            </p>
            <p className="mt-1 inline-flex rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-400">
              {me.role}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {t("profile.about")}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
        <h2 className="mb-2 text-sm font-semibold text-slate-100">
          {t("profile.activityTitle")}
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("profile.roleItem")}: {me.role}</li>
          <li>{t("profile.privacyItem")}</li>
          <li>{t("profile.statsItem")}</li>
        </ul>
      </section>
    </div>
  );

  return (
    <UserRoute>
      {content}
    </UserRoute>
  );
}
