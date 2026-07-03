import type { Metadata } from 'next'
import Link from 'next/link'
import { Music, Plus, Calendar, ChevronRight } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Louvores — Ministério Nova Aliança',
}

function formatDate(date?: string | null) {
  if (!date) return null

  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
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

export default async function LouvoresPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const role = (profile as { role?: string } | null)?.role
  const podeGerir = ['admin', 'leader'].includes(role ?? '')

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const { data: sets } = await supabase
    .from('worship_sets')
    .select(`
      *,
      event:events (
        id,
        title,
        event_date,
        event_time
      ),
      songs:worship_songs (
        id
      )
    `)
    .order('worship_date', { ascending: false })
    .order('created_at', { ascending: false })

  const listaSets = (sets ?? []) as any[]

  const upcomingSets = listaSets.filter((set) => {
    const date = set.event?.event_date ?? set.worship_date
    return date && date >= today
  })

  const pastSets = listaSets.filter((set) => {
    const date = set.event?.event_date ?? set.worship_date
    return !date || date < today
  })

  const nextSet = upcomingSets[0]
  const otherSets = [...upcomingSets.slice(1), ...pastSets]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-12 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              Louvores
            </p>

            <h1 className="text-[26px] font-black text-white leading-tight tracking-tight mt-1">
              Repertórios
            </h1>

            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              Prepare-se para os cultos e acompanhe as músicas da semana.
            </p>
          </div>

          {podeGerir && (
            <Link
              href="/louvores/criar"
              className="w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
            >
              <Plus size={19} />
            </Link>
          )}
        </div>

        <div className="px-4 space-y-6">
          {nextSet ? (
            <Link
              href={`/louvores/${nextSet.id}`}
              className="block transition-all duration-300 active:scale-[0.985]"
            >
              <div className="relative overflow-hidden rounded-[30px] border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-5 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-300/20 blur-3xl" />

                <div className="relative">
                  <p className="text-white/75 text-xs font-black uppercase tracking-widest">
                    Próximo repertório
                  </p>

                  <h2 className="text-white text-2xl font-black mt-2">
                    🎵 {nextSet.title}
                  </h2>

                  <p className="text-white/75 text-sm mt-3">
                    {nextSet.event?.title
                      ? `${nextSet.event.title} • ${formatDate(nextSet.event.event_date)}`
                      : formatDate(nextSet.worship_date)}
                  </p>

                  <p className="text-white/75 text-sm mt-1">
                    {nextSet.songs?.length ?? 0} louvor
                    {(nextSet.songs?.length ?? 0) === 1 ? '' : 'es'} preparados
                  </p>

                  <p className="text-white font-bold text-sm mt-5">
                    Ver repertório →
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <PremiumCard className="p-6 text-center">
              <Music size={30} className="relative text-white/25 mx-auto mb-3" />

              <p className="relative text-white font-bold">
                Nenhum repertório programado
              </p>

              <p className="relative text-white/40 text-sm mt-1">
                Quando uma lista for criada, ela aparecerá aqui.
              </p>
            </PremiumCard>
          )}

          {otherSets.length > 0 && (
            <section>
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35 mb-3">
                Repertórios
              </p>

              <div className="space-y-3">
                {otherSets.map((set: any) => {
                  const date = set.event?.event_date ?? set.worship_date

                  return (
                    <Link
                      key={set.id}
                      href={`/louvores/${set.id}`}
                      className="block transition-all duration-300 active:scale-[0.985]"
                    >
                      <PremiumCard className="p-4">
                        <div className="relative flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300 shrink-0">
                            <Music size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">
                              {set.title}
                            </p>

                            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                              <Calendar size={12} />
                              {set.event?.title ?? formatDate(date)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-white/60 text-xs font-bold">
                              {set.songs?.length ?? 0}
                            </p>
                            <p className="text-white/25 text-[10px]">
                              músicas
                            </p>
                          </div>

                          <ChevronRight size={17} className="text-white/25" />
                        </div>
                      </PremiumCard>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}