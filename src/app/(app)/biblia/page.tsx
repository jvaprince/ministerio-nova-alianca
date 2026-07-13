import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Clock,
  Heart,
  History,
  PenLine,
  Compass,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OLD_TESTAMENT, NEW_TESTAMENT } from '@/lib/biblia'
import BibleBooksSearch from '@/components/biblia/BibleBooksSearch'

export const metadata: Metadata = {
  title: 'Bíblia — Ministério Nova Aliança',
}

function PremiumCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
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
    .limit(5)

  const listaFavoritos = (favorites ?? []) as any[]

  const { data: history } = await supabase
    .from('bible_reading_history')
    .select('*')
    .eq('user_id', user!.id)
    .order('last_read_at', { ascending: false })
    .limit(5)

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

  const { data: lastReflection } = await supabase
    .from('journey_reflections')
    .select(`
      reflection,
      created_at,
      journey:journeys (
        title,
        slug
      ),
      journey_day:journey_days (
        title
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ultimaReflexao = lastReflection as any

  const progressPercent = jornadaInfo
    ? Math.round((jornadaAtiva.completed_days / jornadaInfo.total_days) * 100)
    : 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-5 pt-12 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-brand-400/80 font-black">
            Bíblia compartilhada
          </p>

          <h1 className="text-[36px] font-black text-white mt-2 leading-none tracking-tight">
            Bíblia
          </h1>

          <p className="text-white/45 text-sm mt-3 leading-relaxed">
            Leia, reflita, registre sua caminhada e cresça junto com a comunidade.
          </p>
        </header>

        <section className="mb-7">
          <p className="text-white font-black text-lg mb-3">
            Para você
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={
                ultimaLeitura
                  ? `/biblia/${ultimaLeitura.book}/${ultimaLeitura.chapter}`
                  : '/biblia/João/1'
              }
            >
              <PremiumCard className="p-4 h-[135px] sm:h-[150px] flex flex-col justify-between">
  <div>
    <Clock size={20} className="relative text-brand-400 mb-3" />

    <p className="relative text-white/45 text-xs">
      Continue lendo
    </p>

    <p className="relative text-white font-bold text-[20px] mt-1 leading-none">
      {ultimaLeitura
        ? `${ultimaLeitura.book} ${ultimaLeitura.chapter}`
        : 'João 1'}
    </p>
  </div>

  <p className="relative text-white/30 text-[11px]">
    Abrir capítulo →
  </p>
</PremiumCard>
            </Link>

            <Link href="/biblia/jornada">
              <PremiumCard className="p-4 h-[135px] sm:h-[150px] flex flex-col justify-between">
  <div>
    <Compass size={20} className="relative text-brand-400 mb-3" />

    <p className="relative text-white/45 text-xs">
      Jornadas
    </p>

    <p className="relative text-white font-bold text-[20px] mt-1 leading-tight">
      Explorar planos
    </p>
  </div>

  <p className="relative text-white/30 text-[11px]">
    Ver jornadas →
  </p>
</PremiumCard>
            </Link>
          </div>

          <Link href="/biblia/diario" className="block mt-3">
            <PremiumCard className="p-4">
              <div className="relative flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-400 shrink-0">
                  <PenLine size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-white/45 text-xs">
                    Última reflexão
                  </p>

                  <p className="text-white font-bold text-[15px] mt-1 line-clamp-2">
                    {ultimaReflexao?.reflection
                      ? `“${ultimaReflexao.reflection}”`
                      : 'Diário Espiritual'}
                  </p>

                  <p className="text-white/30 text-[11px] mt-2">
                    Ver diário →
                  </p>
                </div>
              </div>
            </PremiumCard>
          </Link>
        </section>

        {jornadaInfo && (
          <Link
            href={`/biblia/jornada/${jornadaInfo.slug}/plano`}
            className="relative block mb-6 rounded-[30px] overflow-hidden border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-5 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-300/20 blur-3xl" />

            <div className="relative">
              <p className="text-white/75 text-xs font-black uppercase tracking-widest">
                Jornada atual
              </p>

              <h2 className="text-white text-xl font-black mt-2">
                🌱 {jornadaInfo.title}
              </h2>

              <p className="text-white/75 text-sm mt-3">
                Dia {jornadaAtiva.current_day} de {jornadaInfo.total_days} •{' '}
                {jornadaAtiva.total_points} XP
              </p>

              <div className="mt-4 h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full shadow-[0_0_18px_rgba(255,255,255,0.55)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-white/75 text-sm font-semibold">
                  {progressPercent}% concluído
                </p>

                <p className="text-white font-bold text-sm">
                  Continuar →
                </p>
              </div>
            </div>
          </Link>
        )}

        <BibleBooksSearch oldTestament={OLD_TESTAMENT} newTestament={NEW_TESTAMENT} />

        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={17} className="text-brand-400" />
            <h2 className="text-[16px] font-bold text-white">
              Favoritos recentes
            </h2>
          </div>

          {listaFavoritos.length === 0 ? (
            <EmptyCard text="Nenhum versículo favorito ainda." />
          ) : (
            <div className="space-y-2">
              {listaFavoritos.map((favorite: any) => (
                <Link
                  key={favorite.id}
                  href={`/biblia/${favorite.book}/${favorite.chapter}`}
                >
                  <PremiumCard className="p-4">
                    <p className="relative text-sm font-semibold text-white">
                      {favorite.book} {favorite.chapter}:{favorite.verse}
                    </p>
                  </PremiumCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <History size={17} className="text-brand-400" />
            <h2 className="text-[16px] font-bold text-white">
              Histórico recente
            </h2>
          </div>

          {listaHistorico.length === 0 ? (
            <EmptyCard text="Nenhuma leitura registrada ainda." />
          ) : (
            <div className="space-y-2">
              {listaHistorico.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/biblia/${item.book}/${item.chapter}`}
                >
                  <PremiumCard className="p-4">
                    <p className="relative text-sm font-semibold text-white">
                      {item.book} {item.chapter}
                    </p>

                    <p className="relative text-[11px] text-white/30 mt-1">
  {new Date(item.last_read_at).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })}
</p>
                  </PremiumCard>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <PremiumCard className="p-4">
      <p className="relative text-sm text-white/45">
        {text}
      </p>
    </PremiumCard>
  )
}