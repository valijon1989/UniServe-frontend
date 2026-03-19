"use client";

import type { DetailInquiryMessage } from "@/api/detailInteractions";

export function InquiryComposer({
  title,
  description,
  messages,
  draft,
  onDraftChange,
  onSend,
  loading,
  sending,
  currentUserId,
  existingThreadHint
}: {
  title: string;
  description?: string;
  messages: DetailInquiryMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  sending?: boolean;
  currentUserId?: string | null;
  existingThreadHint?: string | null;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        {existingThreadHint && <p className="mt-1 text-[11px] text-emerald-700">{existingThreadHint}</p>}
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {loading ? (
          <p className="text-xs text-slate-500">Suhbat yuklanmoqda...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-500">Birinchi xabarni siz yuboring.</p>
        ) : (
          messages.map((message) => {
            const mine = currentUserId && message.senderId === currentUserId;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    mine ? "bg-emerald-100 text-emerald-900" : "bg-white text-slate-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="Xabaringiz..."
        className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={sending || !draft.trim()}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
      >
        {sending ? "Yuborilmoqda..." : "Xabar yuborish"}
      </button>
    </div>
  );
}
