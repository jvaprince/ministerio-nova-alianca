import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ArrowLeft,
  Calendar,
  Lightbulb,
  User,
  Workflow,
} from 'lucide-react'
import { notFound } from 'next/navigation'
import {
  updateSocialIdeaStatus,
  convertIdeaToProject,
} from '@/lib/social/actions'

const statusLabel: Record<string, string> = {
  em_analise: 'Em análise',
  em_desenvolvimento: 'Em desenvolvimento',
  selecionada: 'Selecionada',
  arquivada: 'Arquivada',
}

export default async function SocialIdeiaDetalhePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const { data: ideaData } = await supabase
  .from('social_ideas')
  .select('*')
  .eq('id', params.id)
  .single()

const idea = ideaData as any

  if (!idea) notFound()

  const {
  data: { user },
} = await supabase.auth.getUser()

const profileResult = user
  ? await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
  : null

const profile = profileResult?.data as {
  role?: string
} | null

const canManageSocial =
  profile?.role === 'admin' ||
  profile?.role === 'leader'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] px-4 pb-40 pt-6 text-white">
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#E4572E]/25 blur-[130px]" />
      <div className="pointer-events-none absolute left-[-140px] top-[260px] h-[320px] w-[320px] rounded-full bg-[#FF6B35]/10 blur-[110px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <Link
            href="/social/ideias"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.1] hover:text-white"
            aria-label="Voltar para ideias"
          >
            <ArrowLeft size={20} />
          </Link>

          <span className="rounded-full border border-[#E4572E]/25 bg-[#E4572E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B35]">
            Ideia enviada
          </span>
        </div>

        <header className="pt-3">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#E4572E]/15 px-3 py-1 text-xs font-bold text-[#FF6B35]">
              {statusLabel[idea.status] ?? idea.status}
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
              {idea.category}
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] md:text-7xl">
            {idea.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/45">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-[#FF6B35]" />
              {new Date(idea.created_at).toLocaleDateString('pt-BR')}
            </span>

            <span className="inline-flex items-center gap-2">
              <User size={16} className="text-[#FF6B35]" />
              Membro da igreja
            </span>
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4572E] shadow-[0_0_30px_rgba(228,87,46,0.35)]">
            <Lightbulb size={24} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
            Descrição da ideia
          </p>

          <p className="mt-3 text-sm leading-relaxed text-white/60 md:text-base">
            {idea.description || 'Nenhuma descrição foi adicionada.'}
          </p>
        </section>

        <section className="rounded-[2rem] border border-[#E4572E]/25 bg-gradient-to-br from-[#1A0905] via-[#111111] to-[#090909] p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4572E]/15 text-[#FF6B35]">
            <Workflow size={24} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B35]">
            Próximo passo
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
            Desenvolver, selecionar ou transformar em projeto
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/50">
            A liderança pode analisar esta sugestão, levantar informações,
            mudar o status e futuramente criar uma campanha a partir dela.
          </p>

          {canManageSocial && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'em_analise', label: 'Em análise' },
                  { value: 'em_desenvolvimento', label: 'Desenvolvimento' },
                  { value: 'selecionada', label: 'Selecionada' },
                  { value: 'arquivada', label: 'Arquivar' },
                ].map((status) => (
                  <form key={status.value} action={updateSocialIdeaStatus}>
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <input type="hidden" name="status" value={status.value} />

                    <button
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        idea.status === status.value
                          ? status.value === 'arquivada'
                            ? 'bg-red-500 text-white'
                            : 'bg-[#E4572E] text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {status.label}
                    </button>
                  </form>
                ))}
              </div>

              <form action={convertIdeaToProject}>
                <input type="hidden" name="ideaId" value={idea.id} />

                <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#E4572E] px-5 text-sm font-bold text-white shadow-[0_0_30px_rgba(228,87,46,0.35)] transition hover:bg-[#FF6B35]">
                  Transformar em projeto
                </button>
              </form>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}