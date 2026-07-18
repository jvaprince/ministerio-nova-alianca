import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Calendar,
  ChevronRight,
  Clock,
  ListMusic,
  MapPin,
  Music2,
  Plus,
  Sparkles,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'
import LouvoresBibliotecaClient from '@/components/louvores/LouvoresBibliotecaClient'

export const metadata: Metadata = {
  title: 'Louvores — Ministério Nova Aliança',
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

function formatShortDate(date?: string | null) {
  const parsedDate = createSafeDate(date)

  if (!parsedDate) return null

  return parsedDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

function getSetDate(set: any) {
  return set.event?.event_date ?? set.worship_date ?? null
}

function getSetTimestamp(set: any) {
  const date = getSetDate(set)

  if (!date) return Number.MAX_SAFE_INTEGER

  return createSafeDate(date)?.getTime() ?? Number.MAX_SAFE_INTEGER
}

function getPageMessage({
  upcomingCount,
  totalSets,
}: {
  upcomingCount: number
  totalSets: number
}) {
  if (upcomingCount === 1) {
    return 'Há 1 repertório preparado para o próximo encontro.'
  }

  if (upcomingCount > 1) {
    return `Há ${upcomingCount} repertórios preparados para os próximos encontros.`
  }

  if (totalSets > 0) {
    return 'Consulte os repertórios e louvores usados pela igreja.'
  }

  return 'Organize os louvores dos próximos encontros.'
}

export default async function LouvoresPage() {
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

  const setList = (sets ?? []) as any[]

  const upcomingSets = setList
    .filter((set) => {
      const date = getSetDate(set)
      return date && date >= today
    })
    .sort((a, b) => getSetTimestamp(a) - getSetTimestamp(b))

  const nextSet = upcomingSets[0] ?? null
  const nextSetSongs = nextSet?.songs ?? []

  const totalSongs = setList.reduce(
    (total: number, set: any) => total + (set.songs?.length ?? 0),
    0
  )

  const uniqueSongs = new Set(
    setList.flatMap((set: any) =>
      (set.songs ?? [])
        .map((song: any) => song.title?.trim().toLowerCase())
        .filter(Boolean)
    )
  ).size

  const pageMessage = getPageMessage({
    upcomingCount: upcomingSets.length,
    totalSets: setList.length,
  })

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] pb-48">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-brand-500/[0.09] blur-3xl" />

        <div className="absolute -right-28 top-[400px] h-80 w-80 rounded-full bg-brand-400/[0.07] blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="px-5 pb-6 pt-10">
          <div className="mb-5">
            <BackButton href="/agenda" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-400">
                Louvores
              </p>

              <h1 className="mt-1 text-[31px] font-black leading-tight tracking-tight text-white">
                Repertórios
              </h1>

              <p className="mt-2 max-w-[290px] text-sm leading-relaxed text-white/45">
                {pageMessage}
              </p>
            </div>

            {canManage && (
              <Link
                href="/louvores/criar"
                aria-label="Criar repertório"
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
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
        </header>

        <div className="space-y-8 px-4">
          {nextSet && (
            <section>
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.23em] text-white/35">
                  Próximo repertório
                </p>

                <p className="text-[10px] font-bold text-brand-300/75">
                  {nextSetSongs.length}{' '}
                  {nextSetSongs.length === 1 ? 'louvor' : 'louvores'}
                </p>
              </div>

              <Link
                href={`/louvores/${nextSet.id}`}
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
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex h-12 w-12 shrink-0 items-center
                          justify-center rounded-[18px]
                          border border-brand-300/15
                          bg-brand-500/15 text-brand-300
                        "
                      >
                        <Music2 size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />

                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-300">
                                Preparado
                              </p>
                            </div>

                            <h2 className="line-clamp-2 text-[20px] font-black leading-tight text-white">
                              {nextSet.title}
                            </h2>
                          </div>

                          <ChevronRight
                            size={18}
                            className="mt-1 shrink-0 text-white/25"
                          />
                        </div>

                        {nextSet.event?.title && (
                          <p className="mt-2 truncate text-[13px] font-semibold text-white/50">
                            {nextSet.event.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.07] pt-4">
                      <p className="flex items-center gap-2 text-[12px] font-medium text-white/55">
                        <Calendar
                          size={14}
                          className="shrink-0 text-brand-300"
                        />

                        <span className="first-letter:uppercase">
                          {formatDate(getSetDate(nextSet))}
                        </span>
                      </p>

                      {nextSet.event?.event_time && (
                        <p className="flex items-center gap-2 text-[12px] font-medium text-white/55">
                          <Clock
                            size={14}
                            className="shrink-0 text-brand-300"
                          />

                          {nextSet.event.event_time.slice(0, 5)}
                        </p>
                      )}
                    </div>

                    {nextSet.event?.location && (
                      <p className="mt-2 flex items-center gap-2 truncate text-[12px] text-white/35">
                        <MapPin
                          size={14}
                          className="shrink-0 text-brand-300"
                        />

                        <span className="truncate">
                          {nextSet.event.location}
                        </span>
                      </p>
                    )}

                    {nextSetSongs.length > 0 && (
                      <div className="mt-5 space-y-2">
                        {nextSetSongs.slice(0, 3).map(
                          (song: any, index: number) => (
                            <div
                              key={song.id}
                              className="flex min-w-0 items-center gap-3"
                            >
                              <span
                                className="
                                  flex h-6 w-6 shrink-0 items-center
                                  justify-center rounded-full
                                  bg-white/[0.05]
                                  text-[9px] font-black text-white/30
                                "
                              >
                                {index + 1}
                              </span>

                              <p className="truncate text-[12px] font-medium text-white/55">
                                {song.title}
                              </p>
                            </div>
                          )
                        )}

                        {nextSetSongs.length > 3 && (
                          <p className="pl-9 text-[11px] font-semibold text-brand-300/65">
                            +{nextSetSongs.length - 3}{' '}
                            {nextSetSongs.length - 3 === 1
                              ? 'outro louvor'
                              : 'outros louvores'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <p className="text-xs font-bold text-white/40">
                        Ver repertório completo
                      </p>

                      <span className="text-xs font-bold text-brand-300">
                        Abrir
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          <section
            className="
              grid grid-cols-3 divide-x divide-white/[0.07]
              border-y border-white/[0.07] py-4
            "
          >
            <div className="px-2 text-center">
              <p className="text-[18px] font-black text-white">
                {setList.length}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
                Repertórios
              </p>
            </div>

            <div className="px-2 text-center">
              <p className="text-[18px] font-black text-white">
                {uniqueSongs}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
                Louvores
              </p>
            </div>

            <div className="px-2 text-center">
              <p className="text-[18px] font-black text-white">
                {upcomingSets.length}
              </p>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
                Próximos
              </p>
            </div>
          </section>

          {setList.length === 0 ? (
            <section>
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
                  <ListMusic size={24} />
                </div>

                <p className="mt-4 text-sm font-bold text-white/60">
                  Nenhum repertório criado
                </p>

                <p className="mt-1 text-xs leading-relaxed text-white/30">
                  Os repertórios dos cultos e eventos aparecerão aqui.
                </p>

                {canManage && (
                  <Link
                    href="/louvores/criar"
                    className="
                      mt-5 inline-flex h-10 items-center gap-2
                      rounded-full bg-brand-500/15 px-4
                      text-xs font-bold text-brand-300
                    "
                  >
                    <Plus size={15} />
                    Criar repertório
                  </Link>
                )}
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-5 flex items-end justify-between px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-brand-400" />

                    <p className="text-[10px] font-black uppercase tracking-[0.23em] text-brand-400">
                      Biblioteca
                    </p>
                  </div>

                  <h2 className="mt-1 text-xl font-black text-white">
                    Todos os repertórios
                  </h2>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-white/40">
                    {totalSongs}
                  </p>

                  <p className="text-[9px] text-white/25">
                    usos de músicas
                  </p>
                </div>
              </div>

              <LouvoresBibliotecaClient sets={setList} />
            </section>
          )}
        </div>
      </div>
    </main>
  )
}