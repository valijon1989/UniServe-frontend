import { DeliveryServiceSection } from "@/components/services/DeliveryServiceSection";

export default function DeliveryServicePage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0b1210] text-slate-100"
      style={{ fontFamily: '"Space Grotesk", "SF Pro Display", system-ui' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),transparent_45%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.16),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-52 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10">
        <DeliveryServiceSection />
      </div>
    </div>
  );
}
