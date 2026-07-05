import Link from 'next/link'
import {
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  Package,
  Sparkles,
  Users,
} from 'lucide-react'

const stats = [
  { label: 'Ideias', value: '0', icon: Lightbulb },
  { label: 'Projetos', value: '0', icon: Package },
  { label: 'Ajudantes', value: '0', icon: Users },
  { label: 'Impacto', value: '0', icon: HeartHandshake },
]

export default function SocialPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-4 pb-40 pt-6 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#E4572E]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 bottom-20 h-[320px] w-[320px] rounded-full bg-[#FF6B35]/10 blur-[100px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E4572E]/30 bg-[#E4572E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#FF6B35]">
            <Sparkles size={15} />
            Movimento social da igreja
          </div>

          <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.06em] text-white md:text-7xl">
            Ideias geram{' '}
            <span className="text-[#E4572E]">impacto</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/58 md:text-base">
            O Projeto Nova Aliança organiza ações que nascem de ideias, se
            tornam projetos e alcançam pessoas através do serviço, da presença e
            do amor ao próximo.
          </p>

          <div className="mt-7 flex gap-3">
            <Link
              href="/social/ideias"
              className="inline-flex items-center gap-2 rounded-full bg-[#E4572E] px-5 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(228,87,46,0.35)] transition hover:bg-[#FF6B35]"
            >
              Enviar ideia
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/social/participantes"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.1]"
            >
              Quero ajudar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-[#111111]/90 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E4572E]/10 text-[#FF6B35]">
                  <Icon size={21} />
                </div>

                <strong className="mt-4 block text-3xl font-black text-white">
                  {item.value}
                </strong>

                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.28)]">
          <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">
            A igreja não termina no culto
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Estamos planejando o próximo impacto do Projeto Nova Aliança. Envie
            ideias, participe das campanhas e ajude a transformar necessidades
            em cuidado real.
          </p>

          <Link
            href="/social/ideias"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E4572E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#FF6B35]"
          >
            Sugerir uma ação
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-dashed border-[#E4572E]/30 bg-[#E4572E]/[0.06] p-6 text-center">
          <Package className="mx-auto text-[#FF6B35]" size={34} />

          <p className="mt-4 font-bold text-white">
            Nenhuma ação ativa no momento
          </p>

          <p className="mt-2 text-sm text-white/50">
            Estamos preparando a próxima campanha do Projeto Nova Aliança.
          </p>
        </div>
      </section>
    </main>
  )
}