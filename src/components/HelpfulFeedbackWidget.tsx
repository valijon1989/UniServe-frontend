"use client";

import type { DetailFeedbackValue } from "@/api/detailInteractions";
import { FeedbackWidget } from "@/components/detail/FeedbackWidget";

export function HelpfulFeedbackWidget({
  helpfulCount,
  unhelpfulCount,
  activeValue,
  disabled,
  loading,
  onSelect,
  saved,
  onToggleSaved,
  onShare,
  reportReason,
  onReportReasonChange,
  onSubmitReport,
  reportSubmitting
}: {
  helpfulCount: number;
  unhelpfulCount: number;
  activeValue: DetailFeedbackValue | null;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (value: DetailFeedbackValue) => void;
  saved: boolean;
  onToggleSaved: () => void;
  onShare: () => void;
  reportReason: string;
  onReportReasonChange: (value: string) => void;
  onSubmitReport: () => void;
  reportSubmitting?: boolean;
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <FeedbackWidget
        title="Page utility feedback"
        description="Tavsif, galereya va seller ma'lumotlari xarid qaroriga yetarlimi, shuni baholang."
        actions={[
          { label: "Tavsif foydali", value: "helpful", count: helpfulCount },
          { label: "Tavsif yetarli emas", value: "unhelpful", count: unhelpfulCount }
        ]}
        activeValue={activeValue}
        disabled={disabled}
        loading={loading}
        onSelect={onSelect}
        saved={saved}
        onToggleSaved={onToggleSaved}
        onShare={onShare}
        reportReason={reportReason}
        onReportReasonChange={onReportReasonChange}
        onSubmitReport={onSubmitReport}
        reportSubmitting={reportSubmitting}
      />
    </section>
  );
}

