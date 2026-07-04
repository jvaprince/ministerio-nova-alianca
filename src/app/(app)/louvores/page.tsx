import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Music,
  Plus,
  Calendar,
  ChevronRight,
  ListMusic,
  Clock,
  Sparkles
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'
import LouvoresBibliotecaClient from '@/components/louvores/LouvoresBibliotecaClient'

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

function formatShortDate(date?: string | null) {
  if (!date) return null

  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_18px_45px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      {children}
    </div>
  )
}

function SetCard({
  set,
  muted = false,
}: {
  set: any
  muted?: boolean
}) {
  const date = set.event?.event_date ?? set.worship_date
  const songs = set.songs ?? []

  return (
    <Link
      href={`/louvores/${set.id}`}
      className="block transition-all duration-300 active:scale-[0.985]"
    >
      <PremiumCard className="p-4">
        <div className="relative flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              muted
                ? 'bg-white/[0.05] border-white/[0.08] text-white/40'
                : 'bg-brand-500/15 border-brand-300/15 text-brand-300'
            }`}
          >
            <Music size={19} />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`font-black truncate ${
                muted ? 'text-white/80' : 'text-white'
              }`}
            >
              {set.title}
            </p>

            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
              <Calendar size={12} />
              {set.event?.title
                ? `${set.event.title} • ${formatShortDate(set.event.event_date)}`
                : formatDate(date)}
            </p>

            {set.event?.event_time && (
              <p className="text-white/30 text-[11px] mt-1">
                {set.event.event_time.slice(0, 5)}
              </p>
            )}

            {songs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {songs.slice(0, 3).map((song: any) => (
                  <span
                    key={song.id}
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/45"
                  >
                    {song.title}
                  </span>
                ))}

                {songs.length > 3 && (
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/35">
                    +{songs.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-white/70 text-xs font-black">{songs.length}</p>
            <p className="text-white/25 text-[10px]">músicas</p>
          </div>

          <ChevronRight size={17} className="text-white/25 mt-1" />
        </div>
      </PremiumCard>
    </Link>
  )
}

export default async function LouvoresPage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    status?: string
  }
}) {
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

  const query = (searchParams?.q ?? '').trim().toLowerCase()
  const status = searchParams?.status ?? 'todos'

  const { data: sets } = await supabase
    .from('worship_sets')
    .select(`
      *,
      event:events (
        id,
        title,
        event_date,
        event_time,
        location
      ),
      songs:worship_songs (
        id,
        title
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

  const totalSets = listaSets.length
  const totalSongs = listaSets.reduce(
    (acc, set: any) => acc + (set.songs?.length ?? 0),
    0
  )

  const baseList =
    status === 'proximos'
      ? upcomingSets
      : status === 'historico'
        ? pastSets
        : listaSets

  const filteredSets = baseList.filter((set: any) => {
    if (!query) return true

    const searchable = [
      set.title,
      set.description,
      set.event?.title,
      set.event?.location,
      set.worship_date,
      ...(set.songs ?? []).map((song: any) => song.title),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-10 pb-5">
          <div className="mb-5">
            <BackButton href="/agenda" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
                Louvores
              </p>

              <h1 className="text-[30px] font-black text-white leading-tight tracking-tight mt-1">
                Repertórios
              </h1>

              <p className="text-white/40 text-sm mt-2 leading-relaxed">
                Busque músicas já usadas, acompanhe os próximos cultos e organize os repertórios.
              </p>
            </div>

            {podeGerir && (
              <Link
                href="/louvores/criar"
                className="shrink-0 w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
              >
                <Plus size={19} />
              </Link>
            )}
          </div>
        </div>

        <div className="px-4 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <PremiumCard className="p-3 text-center">
              <ListMusic size={17} className="relative mx-auto mb-1 text-brand-300" />
              <p className="relative text-[18px] font-black text-white">
                {totalSets}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Repertórios
              </p>
            </PremiumCard>

            <PremiumCard className="p-3 text-center">
              <Music size={17} className="relative mx-auto mb-1 text-emerald-300" />
              <p className="relative text-[18px] font-black text-white">
                {totalSongs}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Músicas
              </p>
            </PremiumCard>

            <PremiumCard className="p-3 text-center">
              <Sparkles size={17} className="relative mx-auto mb-1 text-amber-300" />
              <p className="relative text-[18px] font-black text-white">
                {upcomingSets.length}
              </p>
              <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Próximos
              </p>
            </PremiumCard>
          </div>

          {nextSet && !query && status === 'todos' && (
            <Link
              href={`/louvores/${nextSet.id}`}
              className="block transition-all duration-300 active:scale-[0.985]"
            >
              <div className="relative overflow-hidden rounded-[34px] border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />

                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white/75 text-xs font-black uppercase tracking-widest">
                        Próximo repertório
                      </p>

                      <h2 className="text-white text-2xl font-black mt-2 leading-tight">
                        🎵 {nextSet.title}
                      </h2>
                    </div>

                    <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1">
                      <p className="text-white text-xs font-black">
                        {nextSet.songs?.length ?? 0} músicas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-white/75 text-sm">
                      <Calendar size={15} />
                      {nextSet.event?.title
                        ? `${nextSet.event.title} • ${formatDate(nextSet.event.event_date)}`
                        : formatDate(nextSet.worship_date)}
                    </p>

                    {nextSet.event?.event_time && (
                      <p className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock size={15} />
                        {nextSet.event.event_time.slice(0, 5)}
                      </p>
                    )}
                  </div>

                  {nextSet.description && (
                    <p className="text-white/70 text-sm mt-4 leading-relaxed line-clamp-3">
                      {nextSet.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-white font-bold text-sm">
                      Abrir repertório
                    </p>

                    <ChevronRight size={18} className="text-white/75" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          <LouvoresBibliotecaClient sets={listaSets} />

               </div>
      </div>
    </div>
  )
}