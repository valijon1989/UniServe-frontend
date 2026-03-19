"use client";

import type { DetailInquiryMessage } from "@/api/detailInteractions";
import { InquiryComposer } from "@/components/detail/InquiryComposer";

export function QuickQuestionPanel({
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
  description: string;
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
    <section className="rounded-[1.8rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <InquiryComposer
        title={title}
        description={description}
        messages={messages}
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        loading={loading}
        sending={sending}
        currentUserId={currentUserId}
        existingThreadHint={existingThreadHint}
      />
    </section>
  );
}

