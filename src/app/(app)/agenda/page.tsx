import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Music2,
  Plus,
  UsersRound,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AgendaCalendar from '@/components/agenda/AgendaCalendar'

export const metadata: Metadata = {
  title: 'Agenda — Ministério Nova Aliança',
}

function createSafeDate(date?: string | null) {
  if (!date) return null

  return new Date(`${date}T12:00:00`)
}

function formatDate(date?: string | null) {
  const parsedDate = createSafeDate(date)

  if (!parsedDate) return null

  return parsedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatMonth(date?: string | null) {
  const parsedDate = createSafeDate(date)

  if (!parsedDate) return ''

  const formatted = parsedDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatDay(date?: string | null) {
  const parsedDate = createSafeDate(date)

  if (!parsedDate) return '--'

  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
  })
}

function formatWeekday(date?: string | null) {
  const parsedDate = createSafeDate(date)

  if (!parsedDate) return ''

  return parsedDate
    .toLocaleDateString('pt-BR', {
      weekday: 'short',
    })
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase()
}

function formatEventType(type?: string | null) {
  const types: Record<string, string> = {
    culto: 'Culto',
    santa_ceia: 'Santa Ceia',
    congresso: 'Congresso',
    visita: 'Visita',
    evento: 'Evento',
    outro: 'Outro',
  }

  return types[type ?? ''] ?? type ?? 'Evento'
}

function getDayDifference(from: string, to?: string | null) {
  if (!to) return null

  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number)
  const [toYear, toMonth, toDay] = to.split('-').map(Number)

  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay)
  const toTime = Date.UTC(toYear, toMonth - 1, toDay)

  return Math.round((toTime - fromTime) / 86_400_000)
}

function getAgendaMessage({
  eventsToday,
  nextEventDate,
  today,
}: {
  eventsToday: number
  nextEventDate?: string | null
  today: string
}) {
  if (eventsToday === 1) {
    return 'Você tem 1 evento hoje.'
  }

  if (eventsToday > 1) {
    return `Você tem ${eventsToday} eventos hoje.`
  }

  if (!nextEventDate) {
    return 'Nenhum evento agendado no momento.'
  }

  const difference = getDayDifference(today, nextEventDate)

  if (difference === 1) {
    return 'Seu próximo evento é amanhã.'
  }

  if (difference && difference > 1) {
    return `Seu próximo evento é em ${difference} dias.`
  }

  return 'Confira os próximos encontros.'
}

export default async function AgendaPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role
  const canManage = ['admin', 'leader'].includes(role ?? '')

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

  const eventList = (events ?? []) as any[]

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

  const worshipSetList = (worshipSets ?? []) as any[]

  const nextEvent = eventList[0] ?? null

  const nextWorshipSet =
    worshipSetList.find((set) => {
      const date = set.event?.event_date ?? set.worship_date
      return date && date >= today
    }) ?? null

  const eventsToday = eventList.filter(
    (event) => event.event_date === today
  ).length

  const agendaMessage = getAgendaMessage({
    eventsToday,
    nextEventDate: nextEvent?.event_date,
    today,
  })

  const nextEventGoingCount =
    nextEvent?.rsvps?.filter((rsvp: any) => rsvp.status === 'going')
      .length ?? 0

  const groupedEvents = eventList.reduce<Record<string, any[]>>(
    (groups, event) => {
      const monthKey = event.event_date?.slice(0, 7) ?? 'sem-data'

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }

      groups[monthKey].push(event)

      return groups
    },
    {}
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] pb-48">
      {/* Luzes de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-brand-500/[0.09] blur-3xl" />

        <div className="absolute -right-32 top-[420px] h-80 w-80 rounded-full bg-brand-400/[0.07] blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Cabeçalho */}
        <header className="px-5 pb-6 pt-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-400">
                Ministério Nova Aliança
              </p>

              <h1 className="mt-1 text-[31px] font-black leading-tight tracking-tight text-white">
                Agenda
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-white/45">
                {agendaMessage}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/louvores"
                aria-label="Abrir repertórios"
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full border border-white/[0.09]
                  bg-white/[0.045] text-white/60
                  backdrop-blur-xl transition
                  active:scale-95 active:bg-white/[0.08]
                "
              >
                <Music2 size={18} />
              </Link>

              <AgendaCalendar events={eventList} />

              {canManage && (
                <Link
                  href="/agenda/criar"
                  aria-label="Criar evento"
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-full border border-brand-300/25
                    bg-brand-500/15 text-brand-300
                    backdrop-blur-xl transition
                    active:scale-95 active:bg-brand-500/25
                  "
                >
                  <Plus size={19} />
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-8 px-4">
          {/* Próximo evento */}
          {nextEvent && (
            <section>
              <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.23em] text-white/35">
                Próximo evento
              </p>

              <Link
                href={`/agenda/${nextEvent.id}`}
                className="block transition active:scale-[0.985]"
              >
                <article
                  className="
                    relative overflow-hidden rounded-[28px]
                    border border-brand-300/20
                    bg-gradient-to-br
                    from-brand-500/[0.22]
                    via-white/[0.055]
                    to-white/[0.025]
                    p-5 backdrop-blur-xl
                  "
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/55 to-transparent" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_10px_rgba(147,197,253,0.8)]" />

                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-300">
                            {nextEvent.event_date === today
                              ? 'Acontece hoje'
                              : formatEventType(nextEvent.event_type)}
                          </p>
                        </div>

                        <h2 className="text-[21px] font-black leading-tight text-white">
                          {nextEvent.title}
                        </h2>
                      </div>

                      <ChevronRight
                        size={18}
                        className="mt-1 shrink-0 text-white/30"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                      <p className="flex items-center gap-2 text-[13px] font-medium text-white/65">
                        <Calendar
                          size={14}
                          className="shrink-0 text-brand-300"
                        />

                        <span className="first-letter:uppercase">
                          {formatDate(nextEvent.event_date)}
                        </span>
                      </p>

                      {nextEvent.event_time && (
                        <p className="flex items-center gap-2 text-[13px] font-medium text-white/65">
                          <Clock
                            size={14}
                            className="shrink-0 text-brand-300"
                          />

                          {nextEvent.event_time.slice(0, 5)}
                        </p>
                      )}
                    </div>

                    {nextEvent.location && (
                      <p className="mt-2 flex items-center gap-2 truncate text-[13px] text-white/45">
                        <MapPin
                          size={14}
                          className="shrink-0 text-brand-300"
                        />

                        <span className="truncate">
                          {nextEvent.location}
                        </span>
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <div className="flex items-center gap-2">
                        <UsersRound
                          size={15}
                          className="text-white/35"
                        />

                        <p className="text-xs font-semibold text-white/45">
                          {nextEventGoingCount === 1
                            ? '1 confirmado'
                            : `${nextEventGoingCount} confirmados`}
                        </p>
                      </div>

                      <p className="text-xs font-bold text-brand-300">
                        Ver e confirmar
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          {/* Repertório compacto */}
          {nextWorshipSet && (
            <Link
              href="/louvores"
              className="
                flex items-center gap-3
                border-y border-white/[0.07]
                py-4 transition
                active:bg-white/[0.025]
              "
            >
              <div
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-2xl bg-brand-500/10 text-brand-300
                "
              >
                <Music2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">
                  Próximo repertório
                </p>

                <p className="mt-1 truncate text-sm font-bold text-white">
                  {nextWorshipSet.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-white/35">
                  {nextWorshipSet.event?.title ??
                    formatDate(nextWorshipSet.worship_date)}

                  {' • '}

                  {nextWorshipSet.songs?.length ?? 0}{' '}
                  {(nextWorshipSet.songs?.length ?? 0) === 1
                    ? 'louvor'
                    : 'louvores'}
                </p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-white/25"
              />
            </Link>
          )}

          {/* Linha do tempo */}
          <section>
            <div className="mb-5 flex items-end justify-between px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.23em] text-brand-400">
                  Calendário
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  Próximos eventos
                </h2>
              </div>

              <p className="text-xs font-bold text-white/30">
                {eventList.length}
              </p>
            </div>

            {eventList.length === 0 ? (
              <div
                className="
                  rounded-[26px] border border-white/[0.08]
                  bg-white/[0.035] px-6 py-10
                  text-center backdrop-blur-xl
                "
              >
                <div
                  className="
                    mx-auto flex h-14 w-14 items-center
                    justify-center rounded-2xl
                    bg-white/[0.05] text-white/25
                  "
                >
                  <Calendar size={24} />
                </div>

                <p className="mt-4 text-sm font-bold text-white/60">
                  Nenhum evento agendado
                </p>

                <p className="mt-1 text-xs leading-relaxed text-white/30">
                  Os próximos cultos e encontros aparecerão aqui.
                </p>

                {canManage && (
                  <Link
                    href="/agenda/criar"
                    className="
                      mt-5 inline-flex h-10 items-center gap-2
                      rounded-full bg-brand-500/15 px-4
                      text-xs font-bold text-brand-300
                    "
                  >
                    <Plus size={15} />
                    Criar evento
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedEvents).map(
                  ([monthKey, monthEvents]) => (
                    <div key={monthKey}>
                      <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/30">
                        {formatMonth(monthEvents[0]?.event_date)}
                      </p>

                      <div className="border-y border-white/[0.07]">
                        {monthEvents.map((event, index) => {
                          const goingCount =
                            event.rsvps?.filter(
                              (rsvp: any) => rsvp.status === 'going'
                            ).length ?? 0

                          const isToday = event.event_date === today
                          const isLast =
                            index === monthEvents.length - 1

                          return (
                            <Link
                              key={event.id}
                              href={`/agenda/${event.id}`}
                              className={`
                                group flex items-center gap-4
                                py-4 transition
                                active:bg-white/[0.025]
                                ${
                                  !isLast
                                    ? 'border-b border-white/[0.065]'
                                    : ''
                                }
                              `}
                            >
                              {/* Data */}
                              <div
                                className={`
                                  flex h-[58px] w-[58px] shrink-0
                                  flex-col items-center justify-center
                                  rounded-[18px] border
                                  ${
                                    isToday
                                      ? 'border-brand-300/25 bg-brand-500/15'
                                      : 'border-white/[0.08] bg-white/[0.035]'
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    text-[20px] font-black leading-none
                                    ${
                                      isToday
                                        ? 'text-brand-200'
                                        : 'text-white'
                                    }
                                  `}
                                >
                                  {formatDay(event.event_date)}
                                </span>

                                <span
                                  className={`
                                    mt-1 text-[9px] font-black tracking-[0.14em]
                                    ${
                                      isToday
                                        ? 'text-brand-300'
                                        : 'text-white/35'
                                    }
                                  `}
                                >
                                  {formatWeekday(event.event_date)}
                                </span>
                              </div>

                              {/* Informações */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <h3 className="truncate text-[16px] font-black text-white">
                                    {event.title}
                                  </h3>

                                  {isToday && (
                                    <span
                                      className="
                                        mt-0.5 shrink-0 rounded-full
                                        bg-brand-500/15 px-2 py-0.5
                                        text-[8px] font-black uppercase
                                        tracking-wider text-brand-300
                                      "
                                    >
                                      Hoje
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-[11px] font-bold text-white/30">
                                  {formatEventType(event.event_type)}
                                </p>

                                <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-white/45">
                                  {event.event_time && (
                                    <span className="font-semibold text-white/55">
                                      {event.event_time.slice(0, 5)}
                                    </span>
                                  )}

                                  {event.event_time &&
                                    event.location && (
                                      <span className="text-white/15">
                                        •
                                      </span>
                                    )}

                                  {event.location && (
                                    <span className="truncate">
                                      {event.location}
                                    </span>
                                  )}
                                </div>

                                {goingCount > 0 && (
                                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-white/30">
                                    <UsersRound size={12} />

                                    {goingCount === 1
                                      ? '1 confirmado'
                                      : `${goingCount} confirmados`}
                                  </p>
                                )}
                              </div>

                              <ChevronRight
                                size={17}
                                className="
                                  shrink-0 text-white/20
                                  transition group-active:translate-x-0.5
                                "
                              />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}