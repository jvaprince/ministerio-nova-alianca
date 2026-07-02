import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, Music, Plus } from 'lucide-react'
import AgendaCalendar from '@/components/agenda/AgendaCalendar'

export const metadata: Metadata = { title: 'Agenda — Ministério Nova Aliança' }

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

  const podeGerir = ['admin', 'leader'].includes(profile?.role ?? '')

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

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

  const nextWorshipSet =
    worshipSets?.find((set: any) => {
      const date = set.event?.event_date ?? set.worship_date
      return date && date >= today
    }) ?? null

  return (
    <div className="relative min-h-screen overflow-hidden pb-8 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-12 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
              Ministério Nova Aliança
            </p>

            <h1 className="text-[26px] font-black text-white leading-tight tracking-tight mt-1">
              Agenda
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <AgendaCalendar events={events ?? []} />

            {podeGerir && (
              <Link
                href="/agenda/criar"
                className="w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
              >
                <Plus size={19} />
              </Link>
            )}
          </div>
        </div>

        <div className="px-4 space-y-4">
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

                  <h2 className="text-[16px] font-black text-white">
                    {nextWorshipSet
                      ? nextWorshipSet.title
                      : 'Repertórios da igreja'}
                  </h2>

                  <p className="text-[12px] text-white/40 mt-1">
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
              </div>
            </PremiumCard>
          </Link>

          {!events || events.length === 0 ? (
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
            events.map((event: any) => (
              <Link
                key={event.id}
                href={`/agenda/${event.id}`}
                className="block transition-all duration-300 active:scale-[0.985]"
              >
                <PremiumCard className="p-4">
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400 mb-1">
                        {formatEventType(event.event_type)}
                      </p>

                      <h2 className="text-[17px] font-black text-white">
                        {event.title}
                      </h2>
                    </div>
                  </div>

                  <div className="relative mt-3 space-y-1.5">
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
                      <p className="flex items-center gap-2 text-[13px] text-white/55">
                        <MapPin size={13} className="text-brand-400" />
                        {event.location}
                      </p>
                    )}
                  </div>

                  {event.description && (
                    <p className="relative text-[13px] text-white/45 leading-relaxed mt-3">
                      {event.description}
                    </p>
                  )}
                </PremiumCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}