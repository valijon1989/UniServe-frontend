"use client";

import { useEffect, useRef } from "react";

type EventItem = {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice: number;
  off: number;
  tag: string;
};

type Props = {
  saleProducts: EventItem[];
  saleServices: EventItem[];
};

export function EventsSection({ saleProducts, saleServices }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let mounted = true;

    const setup = async () => {
      const gsap = (await import("gsap")).default;
      const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
      const scope = ref.current;

      if (!mounted || !scope) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const cards = scope.querySelectorAll<HTMLElement>("[data-lag]");
        cards.forEach((card) => {
          const lag = parseFloat(card.dataset.lag || "0");
          const shift = Math.min(1, Math.abs(lag) / 0.2) * 60; // px chegarasi
          const direction = Math.sign(lag) || 1;

          gsap.fromTo(
            card,
            { y: -shift * direction },
            {
              y: shift * direction,
              ease: "none",
              scrollTrigger: {
                trigger: scope,
                start: "top bottom",
                end: "bottom top",
                scrub: true
              }
            }
          );
        });
      }, scope);
    };

    setup();

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Events</p>
          <h3 className="text-2xl font-bold text-slate-50">Chegirmadagi mahsulotlar va xizmatlar</h3>
          <p className="text-sm text-slate-400">Sale Product va Sale Service bloklarida maxsus takliflar.</p>
        </div>
      </div>

      <div ref={ref} className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Sale Product", tone: "amber", data: saleProducts, baseLag: 0.12 },
          { title: "Sale Service", tone: "emerald", data: saleServices, baseLag: -0.12 }
        ].map((block) => (
          <div
            key={block.title}
            className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-50">{block.title}</h4>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  block.tone === "amber"
                    ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/40"
                }`}
              >
                Chegirma
              </span>
            </div>

            <div className="grid gap-3">
              {block.data.map((item, idx) => (
                <div
                  key={item.id}
                  className="event-card flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-md shadow-black/20"
                  data-lag={(block.baseLag + idx * 0.02).toFixed(2)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100 line-clamp-2">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-100">
                    <span className="text-lg font-semibold text-emerald-200">${item.price}</span>
                    <span className="text-xs text-slate-500 line-through">${item.oldPrice}</span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-100">
                      -{item.off}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
