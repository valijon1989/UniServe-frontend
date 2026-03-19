"use client";

import type { SystemGallerySection } from "@/components/service-detail/system/types";

export function ServiceProcessGallery({
  title,
  eyebrow,
  subtitle,
  sections
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  sections: SystemGallerySection[];
}) {
  if (sections.length === 0) return null;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p> : null}
      <div className="mt-5 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                {section.description ? <p className="mt-1 text-sm text-slate-400">{section.description}</p> : null}
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item, index) => (
                <article key={`${section.title}-${item.src}-${index}`} className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/45">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="aspect-[4/3] w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/fallback-service.png";
                    }}
                  />
                  {item.caption ? <p className="px-4 py-3 text-sm text-slate-300">{item.caption}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
