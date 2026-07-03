import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, Music } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import EventCoverModal from '@/components/agenda/EventCoverModal'
import DeleteEventButton from '@/components/agenda/DeleteEventButton'
import AddToCalendarButton from '@/components/agenda/AddToCalendarButton'
import EventRsvpButtons from '@/components/agenda/EventRsvpButtons'

export const metadata: Metadata = { title: 'Evento — Ministério Nova Aliança' }

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

export default async function EventoPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const evento = event as any

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: repertorio } = await supabase
    .from('worship_sets')
    .select(`
      id,
      title,
      description,
      songs:worship_songs (
        id
      )
    `)
    .eq('event_id', evento.id)
    .maybeSingle()

  const repertorioAtual = repertorio as any

  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      user_id,
      status,
      user:profiles!event_rsvps_user_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('event_id', evento.id)

  const { data: members } = await supabase
  .from('profiles')
  .select('id, name, username, avatar_url, is_system')
  .neq('name', 'Administrador')

  const listaRsvps = ((rsvps ?? []) as any[]).filter(
  (rsvp) =>
    rsvp.user?.name !== 'Administrador' &&
    rsvp.user?.username !== 'administrador'
)
  const listaMembers = ((members ?? []) as any[]).filter(
  (member) =>
    member.is_system !== true &&
    member.name !== 'Administrador' &&
    member.username !== 'administrador'
)

  const currentUserRsvp = listaRsvps.find((rsvp) => rsvp.user_id === user?.id)

  const goingCount = listaRsvps.filter((rsvp) => rsvp.status === 'going').length

  const notGoingCount = listaRsvps.filter(
    (rsvp) => rsvp.status === 'not_going'
  ).length

  const role = (profile as { role?: string } | null)?.role

  const podeGerenciarEvento =
    role === 'admin' ||
    role === 'leader' ||
    evento.created_by === user?.id

  return (
    <div className="relative min-h-screen overflow-hidden pb-8 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/agenda" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              {formatEventType(evento.event_type)}
            </p>

            <h1 className="text-[28px] font-black text-white leading-tight tracking-tight mt-2">
              {evento.title}
            </h1>
          </div>

          {podeGerenciarEvento && (
            <div className="flex gap-2 mt-5">
              <Link
                href={`/agenda/${evento.id}/editar`}
                className="flex-1 text-center border border-brand-300/15 bg-white/[0.04] text-white/75 text-sm font-semibold py-3 rounded-2xl backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all active:scale-[0.98]"
              >
                Editar
              </Link>

              <DeleteEventButton eventId={evento.id} />
            </div>
          )}
        </div>

        {evento.cover_url && (
          <div className="px-4 mb-5">
            <div className="relative overflow-hidden rounded-[30px] border border-brand-300/15 shadow-[0_0_28px_rgba(59,130,246,0.10),0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />
              <EventCoverModal src={evento.cover_url} alt={evento.title} />
            </div>
          </div>
        )}

        <div className="px-4 space-y-4">
          <PremiumCard className="p-4 space-y-3">
            <p className="relative flex items-center gap-3 text-[14px] text-white/75">
              <Calendar size={16} className="text-brand-400" />
              {formatDate(evento.event_date)}
            </p>

            {evento.event_time && (
              <p className="relative flex items-center gap-3 text-[14px] text-white/75">
                <Clock size={16} className="text-brand-400" />
                {evento.event_time.slice(0, 5)}
              </p>
            )}

            {evento.location && (
              <p className="relative flex items-center gap-3 text-[14px] text-white/75">
                <MapPin size={16} className="text-brand-400" />
                {evento.location}
              </p>
            )}
          </PremiumCard>

          {repertorioAtual && (
            <Link
              href={`/louvores/${repertorioAtual.id}`}
              className="block transition-all duration-300 active:scale-[0.985]"
            >
              <PremiumCard className="p-4">
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-300/20 flex items-center justify-center text-brand-300 shrink-0">
                    <Music size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400 mb-1">
                      Repertório deste evento
                    </p>

                    <h2 className="text-[16px] font-black text-white truncate">
                      {repertorioAtual.title}
                    </h2>

                    <p className="text-[12px] text-white/40 mt-1">
                      {repertorioAtual.songs?.length ?? 0} louvor
                      {(repertorioAtual.songs?.length ?? 0) === 1 ? '' : 'es'} preparado
                      {(repertorioAtual.songs?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </Link>
          )}

          <EventRsvpButtons
            eventId={evento.id}
            currentStatus={currentUserRsvp?.status}
            goingCount={goingCount}
            notGoingCount={notGoingCount}
            rsvps={listaRsvps}
            members={listaMembers}
          />

          <AddToCalendarButton
            title={evento.title}
            description={evento.description}
            location={evento.location}
            date={evento.event_date}
            time={evento.event_time}
          />

          <p className="text-[11px] text-white/30 text-center -mt-1">
            Compatível com Google Agenda, Apple Calendário e Outlook.
          </p>

          {evento.description && (
            <PremiumCard className="p-4">
              <p className="relative text-[11px] font-black tracking-[0.24em] uppercase text-white/35 mb-2">
                Sobre o evento
              </p>

              <p className="relative text-[14px] text-white/70 leading-relaxed whitespace-pre-line">
                {evento.description}
              </p>
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
  )
}