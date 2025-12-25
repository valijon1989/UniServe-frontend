import Link from "next/link";
import { serviceAgents } from "@/data/serviceCatalog";

type PageProps = {
  params: { id: string };
};

const formatCount = (value: number) => value.toLocaleString("en-US");

export default function AgentDetailPage({ params }: PageProps) {
  const agent = serviceAgents.find((item) => item.id === params.id);

  if (!agent) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
        <p>Agent topilmadi.</p>
        <Link
          href="/agents?view=services"
          className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
        >
          Xizmatlar bo'limiga qaytish
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-start gap-4">
          <img
            src={agent.avatar.src}
            alt={agent.avatar.alt}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-50">{agent.name}</h1>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">@{agent.nickname}</p>
            <p className="mt-2 text-sm text-slate-300">{agent.specialty}</p>
            <p className="text-xs text-slate-500">
              {agent.location} · Tajriba: {agent.experienceYears} yil
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
            <p>Yulduz: {agent.rating.toFixed(1)}/5</p>
            <p>Baho: {formatCount(agent.reviewCount)}</p>
            <p>Mijozlar: {formatCount(agent.totalClients)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
            {agent.groupTitle}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
            {agent.categoryTitle}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
            Followerlar: {formatCount(agent.followers)}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
            Nice: {formatCount(agent.niceCount)}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
            Ulashish: {formatCount(agent.shareCount)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Nice</button>
          <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Follow</button>
          <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Ulashish</button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${
              agent.canRate ? "bg-emerald-400/20 text-emerald-200" : "bg-slate-800 text-slate-400"
            }`}
          >
            {agent.canRate ? "Agentga baho berish" : "Faqat foydalanganlar baholaydi"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Agent xizmatlari</h2>
          <Link href="/agents?view=services" className="text-xs text-sky-300">
            Xizmatlar ro'yxatiga qaytish
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {agent.services.map((service) => (
            <div key={service.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{service.title}</p>
                  <p className="text-xs text-slate-400">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-200">
                    {formatCount(service.price)} {service.currency}
                  </p>
                  <p className="text-[11px] text-slate-500">/{service.unit}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                {service.certificates.map((cert) => (
                  <span key={cert} className="rounded-full bg-slate-900 px-2 py-1">
                    {cert}
                  </span>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {service.images.map((image, idx) => (
                  <img
                    key={`${service.id}-${idx}`}
                    src={image.src}
                    alt={image.alt}
                    className="h-20 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-1">
                    Yulduz: {service.rating.toFixed(1)}/5
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-1">
                    Foydalanganlar: {formatCount(service.usedCount)}
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-1">
                    Baho: {formatCount(service.reviewCount)}
                  </span>
                </div>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${
                    service.canRate ? "bg-emerald-400/20 text-emerald-200" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {service.canRate ? "Baho berish" : "Faqat foydalanganlar baholaydi"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                  Nice ({formatCount(service.niceCount)})
                </button>
                <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                  Follow agent
                </button>
                <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                  Ulashish ({formatCount(service.shareCount)})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
