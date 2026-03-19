"use client";

export function ServiceDescriptionBlock({
  title,
  eyebrow,
  description,
  secondaryDescription,
  tags = [],
  highlightTitle,
  highlights = []
}: {
  title: string;
  eyebrow?: string;
  description: string;
  secondaryDescription?: string;
  tags?: string[];
  highlightTitle?: string;
  highlights?: string[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
        <div>
          <p className="text-sm leading-7 text-slate-300">{description}</p>
          {secondaryDescription ? <p className="mt-4 text-sm leading-7 text-slate-400">{secondaryDescription}</p> : null}
        </div>
        <div className="space-y-4">
          {tags.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Tags / features</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {highlights.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{highlightTitle || "Highlights"}</p>
              <div className="mt-3 space-y-2">
                {highlights.map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
