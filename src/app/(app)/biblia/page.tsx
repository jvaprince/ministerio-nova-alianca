import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Compass,
  Heart,
  History,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OLD_TESTAMENT, NEW_TESTAMENT } from '@/lib/biblia'
import BibleBooksSearch from '@/components/biblia/BibleBooksSearch'

export const metadata: Metadata = {
  title: 'Bíblia — Ministério Nova Aliança',
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[26px]
        border border-white/[0.08]
        bg-white/[0.045]
        backdrop-blur-xl
        transition duration-300
        ${className}
      `}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {children}
    </div>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-3">
      <h2 className="text-[17px] font-black tracking-tight text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs leading-relaxed text-white/35">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default async function BibliaPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: lastRead } = await supabase
    .from('bible_reading_history')
    .select('*')
    .eq('user_id', user!.id)
    .order('last_read_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ultimaLeitura = lastRead as any

  const { data: favorites } = await supabase
    .from('bible_favorites')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const listaFavoritos = (favorites ?? []) as any[]

  const { data: history } = await supabase
    .from('bible_reading_history')
    .select('*')
    .eq('user_id', user!.id)
    .order('last_read_at', { ascending: false })
    .limit(3)

  const listaHistorico = (history ?? []) as any[]

  const { data: activeJourney } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        id,
        title,
        slug,
        total_days
      )
    `)
    .eq('user_id', user!.id)
    .eq('is_completed', false)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const jornadaAtiva = activeJourney as any
  const jornadaInfo = jornadaAtiva?.journey as any

  const progressPercent = jornadaInfo
    ? Math.min(
        100,
        Math.round(
          (jornadaAtiva.completed_days / jornadaInfo.total_days) * 100
        )
      )
    : 0

  const continueReadingHref = ultimaLeitura
    ? `/biblia/${ultimaLeitura.book}/${ultimaLeitura.chapter}`
    : '/biblia/João/1'

  const continueReadingTitle = ultimaLeitura
    ? `${ultimaLeitura.book} ${ultimaLeitura.chapter}`
    : 'João 1'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-5 pb-52 pt-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-brand-500/[0.10] blur-3xl" />

        <div className="absolute -right-32 top-[420px] h-80 w-80 rounded-full bg-blue-500/[0.08] blur-3xl" />

        <div className="absolute bottom-24 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-brand-500/[0.045] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-brand-400" />

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400/80">
              Bíblia compartilhada
            </p>
          </div>

          <h1 className="mt-3 text-[38px] font-black leading-none tracking-[-0.04em] text-white">
            Bíblia
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
            Encontre um livro, continue sua leitura e mantenha sua caminhada
            com Deus em um só lugar.
          </p>
        </header>

        <section className="mb-5">
          <BibleBooksSearch
            oldTestament={OLD_TESTAMENT}
            newTestament={NEW_TESTAMENT}
          />
        </section>

        <section className="mb-7">
          <Link href={continueReadingHref} className="group block">
            <div className="relative overflow-hidden rounded-[30px] border border-brand-300/20 bg-gradient-to-br from-brand-500/95 via-brand-600/85 to-[#153a90] p-5 transition duration-300 active:scale-[0.985]">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-blue-300/15 blur-3xl" />

              <div className="relative">
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md">
                    <BookOpen size={21} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/10 text-white/80 transition group-hover:translate-x-1">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                  {ultimaLeitura ? 'Continue lendo' : 'Comece sua leitura'}
                </p>

                <h2 className="mt-2 text-[28px] font-black tracking-tight text-white">
                  {continueReadingTitle}
                </h2>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/70">
                  <Clock3 size={14} />

                  <span>
                    {ultimaLeitura
                      ? 'Retomar do último capítulo'
                      : 'Uma boa forma de começar'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        <section className="mb-8">
          <SectionTitle
            title="Sua caminhada"
            subtitle="Acesse rapidamente os recursos que acompanham sua leitura."
          />

          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/biblia/jornada"
              className="group min-w-0 active:scale-[0.97]"
            >
              <GlassCard className="flex min-h-[112px] flex-col justify-between p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                  <Compass size={18} />
                </div>

                <div className="relative mt-4">
                  <p className="truncate text-[13px] font-bold text-white">
                    Jornadas
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Planos
                  </p>
                </div>
              </GlassCard>
            </Link>

            <Link
              href="/biblia/diario"
              className="group min-w-0 active:scale-[0.97]"
            >
              <GlassCard className="flex min-h-[112px] flex-col justify-between p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <PenLine size={18} />
                </div>

                <div className="relative mt-4">
                  <p className="truncate text-[13px] font-bold text-white">
                    Diário
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Reflexões
                  </p>
                </div>
              </GlassCard>
            </Link>

            <Link
              href="/biblia/favoritos"
              className="group min-w-0 active:scale-[0.97]"
            >
              <GlassCard className="flex min-h-[112px] flex-col justify-between p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                  <Heart size={18} />
                </div>

                <div className="relative mt-4">
                  <p className="truncate text-[13px] font-bold text-white">
                    Favoritos
                  </p>

                  <p className="mt-1 text-[10px] text-white/35">
                    Versículos
                  </p>
                </div>
              </GlassCard>
            </Link>
          </div>
        </section>

        {jornadaInfo && (
          <section className="mb-8">
            <SectionTitle title="Continue sua jornada" />

            <Link
              href={`/biblia/jornada/${jornadaInfo.slug}/plano`}
              className="group block active:scale-[0.99]"
            >
              <GlassCard className="p-5">
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-brand-500/15 text-brand-300">
                    <Sparkles size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-300/75">
                          Jornada atual
                        </p>

                        <h3 className="mt-1 truncate text-[17px] font-black text-white">
                          {jornadaInfo.title}
                        </h3>
                      </div>

                      <ChevronRight
                        size={19}
                        className="mt-1 shrink-0 text-white/35 transition group-hover:translate-x-1"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-white/45">
                        Dia {jornadaAtiva.current_day} de{' '}
                        {jornadaInfo.total_days}
                      </p>

                      <p className="text-xs font-bold text-brand-300">
                        {progressPercent}%
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-300 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-white/30">
                        {jornadaAtiva.total_points} XP conquistados
                      </p>

                      <p className="text-[11px] font-bold text-white/60">
                        Continuar
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </section>
        )}

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-300" />

                <h2 className="text-[17px] font-black tracking-tight text-white">
                  Favoritos recentes
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/35">
                Versículos que você guardou.
              </p>
            </div>

            {listaFavoritos.length > 0 && (
              <Link
                href="/biblia/favoritos"
                className="shrink-0 text-xs font-bold text-brand-300"
              >
                Ver todos
              </Link>
            )}
          </div>

          {listaFavoritos.length === 0 ? (
            <EmptyCard
              icon={<Heart size={19} />}
              title="Nenhum favorito ainda"
              text="Os versículos que você favoritar aparecerão aqui."
            />
          ) : (
            <div className="space-y-2.5">
              {listaFavoritos.map((favorite: any) => (
                <Link
                  key={favorite.id}
                  href={`/biblia/${favorite.book}/${favorite.chapter}`}
                  className="group block active:scale-[0.99]"
                >
                  <GlassCard className="p-4">
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                        <Heart size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                          Versículo favorito
                        </p>

                        <p className="mt-1 text-[15px] font-bold text-white">
                          {favorite.book} {favorite.chapter}:{favorite.verse}
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className="shrink-0 text-white/25 transition group-hover:translate-x-1"
                      />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <History size={16} className="text-brand-300" />

                <h2 className="text-[17px] font-black tracking-tight text-white">
                  Histórico recente
                </h2>
              </div>

              <p className="mt-1 text-xs text-white/35">
                Seus últimos capítulos acessados.
              </p>
            </div>

            {listaHistorico.length > 0 && (
              <Link
                href="/biblia/historico"
                className="shrink-0 text-xs font-bold text-brand-300"
              >
                Ver todos
              </Link>
            )}
          </div>

          {listaHistorico.length === 0 ? (
            <EmptyCard
              icon={<History size={19} />}
              title="Nenhuma leitura recente"
              text="Seu histórico aparecerá depois que você abrir um capítulo."
            />
          ) : (
            <div className="space-y-2.5">
              {listaHistorico.map((item: any) => {
                const formattedDate = new Date(
                  item.last_read_at
                ).toLocaleDateString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  day: '2-digit',
                  month: 'short',
                })

                const formattedTime = new Date(
                  item.last_read_at
                ).toLocaleTimeString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <Link
                    key={item.id}
                    href={`/biblia/${item.book}/${item.chapter}`}
                    className="group block active:scale-[0.99]"
                  >
                    <GlassCard className="p-4">
                      <div className="relative flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                          <BookOpen size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-white">
                            {item.book} {item.chapter}
                          </p>

                          <p className="mt-1 text-[11px] text-white/30">
                            Última leitura · {formattedDate} às {formattedTime}
                          </p>
                        </div>

                        <ChevronRight
                          size={17}
                          className="shrink-0 text-white/25 transition group-hover:translate-x-1"
                        />
                      </div>
                    </GlassCard>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function EmptyCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <GlassCard className="p-5">
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-white/35">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-white/70">
            {title}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-white/35">
            {text}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}