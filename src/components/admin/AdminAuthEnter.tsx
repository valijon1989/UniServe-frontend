"use client";

import { useState } from "react";
import { useI18n } from "@/context/i18n";

interface Props {
  loading?: boolean;
  onSubmit: (payload: { totpCode?: string; passkeyAssertion?: string }) => Promise<void>;
  onPasskey?: () => Promise<void>;
}

export function AdminAuthEnter({ loading = false, onSubmit, onPasskey }: Props) {
  const { t } = useI18n();
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTotpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const normalized = totpCode.trim();
    if (normalized.length < 6) {
      setError(
        t({
          en: "Enter a valid 6-digit code.",
          uz: "To'g'ri 6 xonali kod kiriting.",
          ru: "Введите корректный 6-значный код.",
          ko: "유효한 6자리 코드를 입력하세요."
        })
      );
      return;
    }
    try {
      await onSubmit({ totpCode: normalized });
      setTotpCode("");
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || t("form.error"));
    }
  };

  const handlePasskey = async () => {
    if (!onPasskey) {
      setError(
        t({
          en: "Passkey flow is not enabled yet on this environment.",
          uz: "Ushbu muhitda passkey hali yoqilmagan.",
          ru: "В этом окружении Passkey пока не включен.",
          ko: "이 환경에서는 패스키가 아직 활성화되지 않았습니다."
        })
      );
      return;
    }
    setError(null);
    try {
      await onPasskey();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || t("form.error"));
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
      <h2 className="text-lg font-semibold text-slate-100">
        {t({ en: "Admin mode verification", uz: "Admin mode tasdiqlash", ru: "Проверка admin mode", ko: "관리자 모드 인증" })}
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        {t({
          en: "MFA is required to continue.",
          uz: "Davom etish uchun MFA talab qilinadi.",
          ru: "Для продолжения требуется MFA.",
          ko: "계속하려면 MFA가 필요합니다."
        })}
      </p>

      <form onSubmit={handleTotpSubmit} className="mt-4 space-y-3">
        <input
          value={totpCode}
          onChange={(event) => setTotpCode(event.target.value)}
          maxLength={8}
          inputMode="numeric"
          placeholder={t({ en: "Enter TOTP code", uz: "TOTP kodni kiriting", ru: "Введите TOTP код", ko: "TOTP 코드 입력" })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? t("form.saving") : t({ en: "Verify", uz: "Tasdiqlash", ru: "Подтвердить", ko: "확인" })}
          </button>
          <button
            type="button"
            onClick={() => void handlePasskey()}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t({ en: "Use Passkey", uz: "Passkey ishlatish", ru: "Использовать Passkey", ko: "패스키 사용" })}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
