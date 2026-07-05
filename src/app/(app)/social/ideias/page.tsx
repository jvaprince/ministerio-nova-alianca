import Link from 'next/link'
import { ArrowRight, Lightbulb, Plus, Search, Sparkles } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const filters = [
  { label: 'Todas', value: 'todas', count: 0 },
  { label: 'Em análise', value: 'em_analise', count: 0 },
  { label: 'Desenvolvimento', value: 'em_desenvolvimento', count: 0 },
  { label: 'Selecionadas', value: 'selecionada', count: 0 },
  { label: 'Arquivadas', value: 'arquivada', count: 0 },
]

export default async function SocialIdeiasPage() {
  const supabase = await createSupabaseServerClient()

  const { data: ideasData } = await supabase
  .from('social_ideas')
  .select('*')
  .order('created_at', { ascending: false })

const ideas = (ideasData ?? []) as any[]

  const counts = {
    todas: ideas?.length ?? 0,
    em_analise: ideas?.filter((i) => i.status === 'em_analise').length ?? 0,
    em_desenvolvimento:
      ideas?.filter((i) => i.status === 'em_desenvolvimento').length ?? 0,
    selecionada: ideas?.filter((i) => i.status === 'selecionada').length ?? 0,
    arquivada: ideas?.filter((i) => i.status === 'arquivada').length ?? 0,
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-4 pb-40 pt-8 text-white">
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#E4572E]/25 blur-[130px]" />
      <div className="pointer-events-none absolute left-[-140px] top-[220px] h-[320px] w-[320px] rounded-full bg-[#FF6B35]/10 blur-[110px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="pt-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E4572E]/25 bg-[#E4572E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#FF6B35]">
            <Sparkles size={15} />
            Banco de ideias
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-white/35">
                Projeto Nova Aliança
              </p>

              <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] md:text-7xl">
                Ideias que podem virar{' '}
                <span className="text-[#E4572E]">impacto</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
                Toda ação começa com alguém enxergando uma necessidade. Envie
                sugestões de causas, visitas, campanhas e oportunidades de
                serviço.
              </p>
            </div>

            <Link
              href="/social/ideias/criar"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#E4572E] px-5 text-sm font-bold text-white shadow-[0_0_30px_rgba(228,87,46,0.35)] transition hover:bg-[#FF6B35]"
            >
              <Plus size={16} />
              Nova ideia
            </Link>
          </div>
        </header>

        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Search size={18} className="text-white/35" />
            <input
              placeholder="Buscar por título, categoria ou descrição..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter, index) => {
              const active = index === 0

              return (
                <button
                  key={filter.value}
                  className={`min-w-fit rounded-full px-4 py-2 text-xs font-bold transition ${
                    active
                      ? 'bg-[#E4572E] text-white'
                      : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 text-white/60">{counts[filter.value as keyof typeof counts]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {ideas && ideas.length > 0 ? (
  <div className="grid gap-4">
    {ideas.map((idea) => (
      <Link
        key={idea.id}
        href={`/social/ideias/${idea.id}`}
        className="
          group rounded-[2rem] border border-white/10 bg-[#111111]
          p-5 transition-all duration-300
          hover:border-[#E4572E]/40 hover:bg-[#151515]
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E4572E]/15 px-3 py-1 text-xs font-bold text-[#FF6B35]">
                {idea.status === 'em_analise'
                  ? 'Em análise'
                  : idea.status === 'em_desenvolvimento'
                    ? 'Em desenvolvimento'
                    : idea.status === 'selecionada'
                      ? 'Selecionada'
                      : 'Arquivada'}
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                {idea.category}
              </span>
            </div>

            <h2 className="text-xl font-black text-white transition-colors group-hover:text-[#FF6B35]">
              {idea.title}
            </h2>

            {idea.description && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/50">
                {idea.description}
              </p>
            )}
          </div>

          <ArrowRight
            size={20}
            className="mt-1 shrink-0 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-[#FF6B35]"
          />
        </div>
      </Link>
    ))}
  </div>
) : (
  <div className="rounded-[2rem] border border-dashed border-[#E4572E]/30 bg-[#E4572E]/[0.06] p-8 text-center">
    <Lightbulb className="mx-auto text-[#FF6B35]" size={38} />

    <p className="mt-5 text-lg font-black uppercase tracking-[-0.03em]">
      Nenhuma ideia enviada ainda
    </p>

    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/50">
      A próxima ação do Projeto Nova Aliança pode começar com uma simples
      sugestão.
    </p>

    <Link
      href="/social/ideias/criar"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E4572E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#FF6B35]"
    >
      Enviar primeira ideia
      <ArrowRight size={16} />
    </Link>
  </div>
)}
      </section>
    </main>
  )
}