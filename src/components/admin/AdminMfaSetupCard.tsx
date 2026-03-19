"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "@/context/i18n";

interface Props {
  loading?: boolean;
  onSetup: (method: "TOTP" | "EMAIL_OTP") => Promise<any>;
  onVerify: (payload: { method: "TOTP" | "EMAIL_OTP"; code: string }) => Promise<any>;
}

const normalizeError = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (responseMessage && responseMessage.trim()) return responseMessage;
  return (error as { message?: string })?.message || "Request failed";
};

export function AdminMfaSetupCard({ loading = false, onSetup, onVerify }: Props) {
  const { t } = useI18n();
  const [method, setMethod] = useState<"TOTP" | "EMAIL_OTP">("EMAIL_OTP");
  const [setupState, setSetupState] = useState<any>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const busy = loading || pending;
  const showOtpAuth = useMemo(() => method === "TOTP" && setupState?.otpAuthUrl, [method, setupState]);

  const handleSetup = async () => {
    setPending(true);
    try {
      const result = await onSetup(method);
      setSetupState(result);
      toast.success(
        method === "EMAIL_OTP"
          ? t({ en: "Verification code sent", uz: "Tasdiqlash kodi yuborildi", ru: "Код отправлен", ko: "인증 코드가 전송되었습니다" })
          : t({ en: "Scan the QR URL and enter code", uz: "QR URL ni skan qilib kodni kiriting", ru: "Сканируйте QR URL и введите код", ko: "QR URL을 스캔하고 코드를 입력하세요" })
      );
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async () => {
    if (code.trim().length < 6) {
      toast.error(t({ en: "Enter a valid code", uz: "To'g'ri kod kiriting", ru: "Введите корректный код", ko: "유효한 코드를 입력하세요" }));
      return;
    }
    setPending(true);
    try {
      const result = await onVerify({ method, code: code.trim() });
      const nextRecoveryCodes = Array.isArray(result?.recoveryCodes) ? result.recoveryCodes.map((item: unknown) => String(item)) : [];
      setRecoveryCodes(nextRecoveryCodes);
      toast.success(
        t({ en: "MFA enabled", uz: "MFA yoqildi", ru: "MFA включена", ko: "MFA가 활성화되었습니다" })
      );
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Security Required</p>
        <h1 className="mt-2 text-xl font-semibold text-amber-50">
          {t({
            en: "Set up MFA before using sensitive admin actions.",
            uz: "Muhim admin actionlardan oldin MFA sozlang.",
            ru: "Настройте MFA перед чувствительными действиями администратора.",
            ko: "민감한 관리자 작업 전에 MFA를 설정하세요."
          })}
        </h1>
        <p className="mt-2 text-sm text-amber-100/80">
          {t({
            en: "Read-only access is available, but approvals, suspensions, and role changes require MFA.",
            uz: "Ko'rish rejimi ochiq, lekin approve, suspend va role change uchun MFA kerak.",
            ru: "Просмотр доступен, но approve, suspend и смена ролей требуют MFA.",
            ko: "읽기 전용 접근은 가능하지만 승인, 정지, 역할 변경에는 MFA가 필요합니다."
          })}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod("EMAIL_OTP")}
            className={`rounded-xl border px-4 py-3 text-left ${method === "EMAIL_OTP" ? "border-sky-500 bg-sky-500/10 text-sky-100" : "border-slate-800 bg-slate-900/50 text-slate-300"}`}
          >
            <p className="text-sm font-medium">Email OTP</p>
            <p className="mt-1 text-xs text-slate-400">Quick setup using a verification code sent to your email.</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("TOTP")}
            className={`rounded-xl border px-4 py-3 text-left ${method === "TOTP" ? "border-sky-500 bg-sky-500/10 text-sky-100" : "border-slate-800 bg-slate-900/50 text-slate-300"}`}
          >
            <p className="text-sm font-medium">Authenticator App</p>
            <p className="mt-1 text-xs text-slate-400">Use Google Authenticator, 1Password, Authy, or similar.</p>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleSetup()}
            disabled={busy}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {busy ? t("form.saving") : method === "EMAIL_OTP" ? "Send code" : "Start setup"}
          </button>
        </div>

        {showOtpAuth && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-200">
            <p className="font-medium text-slate-100">OTPAuth URL</p>
            <p className="mt-2 break-all text-xs text-slate-400">{String(setupState.otpAuthUrl)}</p>
            {setupState.secretForDev && <p className="mt-2 text-xs text-slate-500">Dev secret: {String(setupState.secretForDev)}</p>}
          </div>
        )}

        {!!setupState && (
          <div className="mt-4 space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              placeholder={method === "EMAIL_OTP" ? "Enter email code" : "Enter authenticator code"}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            />
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={busy}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verify and enable MFA
            </button>
          </div>
        )}
      </section>

      {recoveryCodes.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <h2 className="text-lg font-semibold text-emerald-50">Recovery codes</h2>
          <p className="mt-1 text-sm text-emerald-100/80">Store these once. They may not be shown again.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {recoveryCodes.map((item) => (
              <code key={item} className="rounded-lg border border-emerald-500/20 bg-slate-950/70 px-3 py-2 text-sm text-emerald-100">
                {item}
              </code>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
