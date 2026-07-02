'use client'

import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatEventType(type: string) {
  const tipos: Record<string, string> = {
    culto: 'Culto',
    santa_ceia: 'Santa Ceia',
    congresso: 'Congresso',
    visita: 'Visita',
    evento: 'Evento',
    outro: 'Outro',
  }

  return tipos[type] ?? type
}

function toDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export default function AgendaCalendar({ events }: { events: any[] }) {
  const today = toDateKey(new Date())

  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(
    events?.[0]?.event_date ?? today
  )
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = events?.[0]?.event_date
      ? new Date(events[0].event_date + 'T12:00:00')
      : new Date(today + 'T12:00:00')

    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })

  useEffect(() => {
  if (!open) return

  const originalOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = originalOverflow
  }
}, [open])

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const eventDates = useMemo(() => {
    const map = new Map<string, any[]>()

    events.forEach((event) => {
      const list = map.get(event.event_date) ?? []
      list.push(event)
      map.set(event.event_date, list)
    })

    return map
  }, [events])

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = firstDay.getDay()
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

    return Array.from({ length: totalCells }).map((_, index) => {
      const dayNumber = index - startOffset + 1

      if (dayNumber < 1 || dayNumber > lastDay.getDate()) return null

      const date = new Date(year, month, dayNumber)
      const dateKey = toDateKey(date)

      return {
        dayNumber,
        dateKey,
        events: eventDates.get(dateKey) ?? [],
      }
    })
  }, [eventDates, year, month])

  const selectedEvents = selectedDate
    ? eventDates.get(selectedDate) ?? []
    : []

  const monthName = visibleMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  function previousMonth() {
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() - 1, 1)
      setSelectedDate(toDateKey(next))
      return next
    })
  }

  function nextMonth() {
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + 1, 1)
      setSelectedDate(toDateKey(next))
      return next
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
        aria-label="Abrir calendário"
      >
        <Calendar size={19} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-[#02040C]/80 backdrop-blur-2xl px-4 pt-6 pb-28 animate-[calendarFade_.22s_ease-out] overflow-y-auto">
          <div className="mx-auto max-w-[370px] overflow-hidden rounded-[36px]
          animate-[calendarPop_.28s_cubic-bezier(.16,1,.3,1)]
           border border-brand-300/20 bg-[#070B18]/95 shadow-[0_0_45px_rgba(59,130,246,0.18),0_35px_120px_rgba(0,0,0,0.78)]">
            <div className="relative overflow-hidden border-b border-white/[0.06] p-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-brand-400 text-[11px] uppercase tracking-[0.25em] font-black">
                    Calendário
                  </p>

                  <h2 className="mt-1 text-[26px] font-black capitalize tracking-tight text-white">
                    {monthName}
                  </h2>

                  <p className="mt-2 text-xs text-white/40">
                    Toque em um dia para ver os eventos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.06] flex items-center justify-center text-white/70 transition active:scale-95"
                  aria-label="Fechar calendário"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/60 active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-400/10 px-3 py-1.5">
                  <Sparkles size={13} className="text-amber-200" />
                  <span className="text-xs font-bold text-amber-100/80">
                    {events.length} evento{events.length === 1 ? '' : 's'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/60 active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-7 gap-1.5">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="pb-2 text-center text-[10px] font-black uppercase tracking-widest text-white/25"
                  >
                    {day}
                  </div>
                ))}

                {days.map((day, index) => {
                  if (!day) {
                    return (
                      <div
                        key={index}
                        className="aspect-square rounded-full"
                      />
                    )
                  }

                  const hasEvents = day.events.length > 0
                  const isSelected = selectedDate === day.dateKey
                  const isToday = today === day.dateKey

                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() => setSelectedDate(day.dateKey)}
                      className={`group relative aspect-square rounded-full border text-sm font-black transition-all duration-300 hover:scale-105 active:scale-90 ${
                        isSelected
                          ? 'border-brand-300/60 bg-brand-500/35 text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] scale-[1.03]'
                          : hasEvents
                            ? 'border-amber-300/30 bg-amber-500/12 text-white hover:bg-amber-500/18'
                            : 'border-white/[0.06] bg-white/[0.03] text-white/35 hover:bg-white/[0.06]'
                      }`}
                    >
                      {hasEvents && (
                        <span className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/20 opacity-70 group-hover:scale-110 transition-transform" />
                      )}

                      <span className="relative z-10">
                        {day.dayNumber}
                      </span>

                      {isToday && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_10px_rgba(96,165,250,0.95)]" />
                      )}

                      {hasEvents && (
                        <span className="absolute inset-x-0 bottom-1.5 flex justify-center gap-0.5">
                          {day.events.slice(0, 3).map((event: any) => (
                            <span
                              key={event.id}
                              className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-white font-black text-lg capitalize">
                    {selectedDate ? formatDate(selectedDate) : 'Selecione um dia'}
                  </h3>

                  {selectedEvents.length > 0 && (
                    <span className="rounded-full border border-brand-300/20 bg-brand-500/10 px-3 py-1 text-[11px] font-black text-brand-300">
                      {selectedEvents.length} evento{selectedEvents.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {selectedEvents.length === 0 ? (
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05]">
                      <Calendar size={20} className="text-white/25" />
                    </div>

                    <p className="text-sm font-semibold text-white/45">
                      Nenhum evento neste dia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/agenda/${event.id}`} className="block active:scale-[0.985]">
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 transition-all">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/35 to-transparent" />

        <p className="text-[10px] font-black tracking-[0.22em] uppercase text-brand-400 mb-1">
          {formatEventType(event.event_type)}
        </p>

        <h4 className="text-white font-black">
          {event.title}
        </h4>

        <div className="mt-3 space-y-1.5">
          {event.event_time && (
            <p className="flex items-center gap-2 text-[13px] text-white/55">
              <Clock size={13} className="text-brand-400" />
              {event.event_time.slice(0, 5)}
            </p>
          )}

          {event.location && (
            <p className="flex items-center gap-2 text-[13px] text-white/55">
              <MapPin size={13} className="text-brand-400" />
              {event.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}