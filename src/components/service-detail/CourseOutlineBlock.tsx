"use client";

type CourseOutlineBlockProps = {
  title: string;
  modules: string[];
  outcomes: string[];
  certificates: string[];
};

export function CourseOutlineBlock({
  title,
  modules,
  outcomes,
  certificates
}: CourseOutlineBlockProps) {
  return (
    <section className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/80">Curriculum</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h2>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-5">
          <p className="text-sm font-semibold text-slate-100">Modullar</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            {modules.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-5">
            <p className="text-sm font-semibold text-slate-100">Natijalar</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              {outcomes.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-5">
            <p className="text-sm font-semibold text-slate-100">Sertifikatlar</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {certificates.map((item) => (
                <span key={item} className="rounded-full bg-emerald-500/16 px-3 py-1 text-[11px] text-emerald-100 ring-1 ring-emerald-500/25">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
