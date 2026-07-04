import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Plus,
  ChevronRight,
  Sparkles,
  ListChecks,
  UsersRound,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AgendaCalendar from '@/components/agenda/AgendaCalendar'

export const metadata: Metadata = { title: 'Agenda — Ministério Nova Aliança' }

function formatDate(date?: string | null) {
  if (!date) return null

  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatShortDate(date?: string | null) {
  if (!date) return null

  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

function formatEventType(type?: string | null) {
  const tipos: Record<string, string> = {
    culto: 'Culto',
    santa_ceia: 'Santa Ceia',
    congresso: 'Congresso',
    visita: 'Visita',
    evento: 'Evento',
    outro: 'Outro',
  }

  return tipos[type ?? ''] ?? type ?? 'Evento'
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_18px_45px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      {children}
    </div>
  )
}

export default async function AgendaPage() {
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

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      rsvps:event_rsvps (
        user_id,
        status
      )
    `)
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  const listaEvents = (events ?? []) as any[]

  const { data: worshipSets } = await supabase
    .from('worship_sets')
    .select(`
      id,
      title,
      worship_date,
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
    .order('worship_date', { ascending: true })
    .order('created_at', { ascending: false })

  const listaWorshipSets = (worshipSets ?? []) as any[]

  const nextEvent = listaEvents[0] ?? null

  const nextWorshipSet =
    listaWorshipSets.find((set) => {
      const date = set.event?.event_date ?? set.worship_date
      return date && date >= today
    }) ?? null

  const eventosHoje = listaEvents.filter((event: any) => event.event_date === today)

  const totalConfirmados = listaEvents.reduce((acc: number, event: any) => {
    return acc + ((event.rsvps ?? []).filter((rsvp: any) => rsvp.status === 'going').length ?? 0)
  }, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-12 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
                Ministério Nova Aliança
              </p>

              <h1 className="text-[30px] font-black text-white leading-tight tracking-tight mt-1">
                Agenda
              </h1>

              <p className="text-white/40 text-sm mt-2 leading-relaxed">
                Acompanhe cultos, eventos, repertórios e confirme sua presença.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AgendaCalendar events={listaEvents} />

              {podeGerir && (
                <Link
                  href="/agenda/criar"
                  className="shrink-0 w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
                >
                  <Plus size={19} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <PremiumCard className="p-3 text-center">
              <Calendar size={17} className="relative mx-auto mb-1 text-brand-300" />
              <p className="relative text-[18px] font-black text-white">
                {listaEvents.length}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Eventos
              </p>
            </PremiumCard>

            <PremiumCard className="p-3 text-center">
              <Sparkles size={17} className="relative mx-auto mb-1 text-amber-300" />
              <p className="relative text-[18px] font-black text-white">
                {eventosHoje.length}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Hoje
              </p>
            </PremiumCard>

            <PremiumCard className="p-3 text-center">
              <UsersRound size={17} className="relative mx-auto mb-1 text-emerald-300" />
              <p className="relative text-[18px] font-black text-white">
                {totalConfirmados}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Confirmados
              </p>
            </PremiumCard>
          </div>

          {nextEvent && (
            <Link
              href={`/agenda/${nextEvent.id}`}
              className="block transition-all duration-300 active:scale-[0.985]"
            >
              <div className="relative overflow-hidden rounded-[34px] border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />

                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white/75 text-xs font-black uppercase tracking-widest">
                        Próximo evento
                      </p>

                      <h2 className="text-white text-2xl font-black mt-2 leading-tight">
                        {nextEvent.title}
                      </h2>
                    </div>

                    <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1">
                      <p className="text-white text-xs font-black">
                        {formatEventType(nextEvent.event_type)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-white/75 text-sm">
                      <Calendar size={15} />
                      {formatDate(nextEvent.event_date)}
                    </p>

                    {nextEvent.event_time && (
                      <p className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock size={15} />
                        {nextEvent.event_time.slice(0, 5)}
                      </p>
                    )}

                    {nextEvent.location && (
                      <p className="flex items-center gap-2 text-white/70 text-sm">
                        <MapPin size={15} />
                        {nextEvent.location}
                      </p>
                    )}
                  </div>

                  {nextEvent.description && (
                    <p className="text-white/70 text-sm mt-4 leading-relaxed line-clamp-3">
                      {nextEvent.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-white font-bold text-sm">
                      Ver detalhes
                    </p>

                    <ChevronRight size={18} className="text-white/75" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          <Link
            href="/louvores"
            className="block transition-all duration-300 active:scale-[0.985]"
          >
            <PremiumCard className="p-4">
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-300/20 flex items-center justify-center text-brand-300 shrink-0">
                  <Music size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400 mb-1">
                    Louvores
                  </p>

                  <h2 className="text-[16px] font-black text-white truncate">
                    {nextWorshipSet ? nextWorshipSet.title : 'Repertórios da igreja'}
                  </h2>

                  <p className="text-[12px] text-white/40 mt-1 truncate">
                    {nextWorshipSet
                      ? `${
                          nextWorshipSet.event?.title ??
                          formatDate(nextWorshipSet.worship_date)
                        } • ${nextWorshipSet.songs?.length ?? 0} louvor${
                          (nextWorshipSet.songs?.length ?? 0) === 1 ? '' : 'es'
                        }`
                      : 'Veja os louvores preparados para os cultos.'}
                  </p>
                </div>

                <ChevronRight size={17} className="text-white/25" />
              </div>
            </PremiumCard>
          </Link>

          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-brand-400" />
                <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                  Próximos eventos
                </p>
              </div>

              <p className="text-[11px] font-black text-white/30">
                {listaEvents.length}
              </p>
            </div>

            {listaEvents.length === 0 ? (
              <PremiumCard className="p-8 text-center">
                <div className="relative w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
                  <Calendar size={24} className="text-white/30" />
                </div>

                <p className="relative text-white/60 text-sm font-semibold">
                  Nenhum evento agendado.
                </p>

                <p className="relative text-white/30 text-xs mt-1">
                  Quando houver eventos, eles aparecerão aqui.
                </p>
              </PremiumCard>
            ) : (
              <div className="space-y-3">
                {listaEvents.map((event: any) => {
                  const goingCount =
                    event.rsvps?.filter((rsvp: any) => rsvp.status === 'going')
                      .length ?? 0

                  return (
                    <Link
                      key={event.id}
                      href={`/agenda/${event.id}`}
                      className="block transition-all duration-300 active:scale-[0.985]"
                    >
                      <PremiumCard className="p-4">
                        <div className="relative flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300 shrink-0">
                            <Calendar size={19} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400 mb-1">
                              {formatEventType(event.event_type)}
                            </p>

                            <h2 className="text-[17px] font-black text-white truncate">
                              {event.title}
                            </h2>

                            <div className="mt-2 space-y-1">
                              <p className="flex items-center gap-2 text-[13px] text-white/55">
                                <Calendar size={13} className="text-brand-400" />
                                {formatDate(event.event_date)}
                              </p>

                              {event.event_time && (
                                <p className="flex items-center gap-2 text-[13px] text-white/55">
                                  <Clock size={13} className="text-brand-400" />
                                  {event.event_time.slice(0, 5)}
                                </p>
                              )}

                              {event.location && (
                                <p className="flex items-center gap-2 text-[13px] text-white/55 truncate">
                                  <MapPin size={13} className="text-brand-400 shrink-0" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-white/70 text-xs font-black">
                              {goingCount}
                            </p>
                            <p className="text-white/25 text-[10px]">
                              vão
                            </p>
                          </div>

                          <ChevronRight size={17} className="text-white/25 mt-1" />
                        </div>
                      </PremiumCard>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}