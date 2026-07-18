import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit2,
  ExternalLink,
  Eye,
  ListMusic,
  MapPin,
  Music2,
  Play,
  Trash2,
  UsersRound,
  XCircle,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'
import {
  alternarLouvorVisto,
  excluirRepertorio,
} from '@/lib/louvores/actions'

export const metadata: Metadata = {
  title: 'Repertório — Ministério Nova Aliança',
}

function getYoutubeId(url?: string | null) {
  if (!url) return null

  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/

  return url.match(regex)?.[1] ?? null
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

function MemberRow({ member }: { member: any }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.06]">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name ?? 'Membro'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/45">
            {(member.name ?? 'M').slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <p className="truncate text-[12px] font-semibold text-white/65">
        {member.name}
      </p>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-brand-400 transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

export default async function RepertorioPage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: set } = await supabase
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
        title,
        youtube_url,
        description,
        position,
        views:worship_song_views (
          user_id,
          status
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!set) {
    notFound()
  }

  const repertorio = set as any

  const songs = [...(repertorio.songs ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  )

  const { data: membersData } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, is_system')
    .neq('name', 'Administrador')
    .order('name', { ascending: true })

  const members = ((membersData ?? []) as any[]).filter(
    (member) =>
      member.is_system !== true &&
      member.name !== 'Administrador' &&
      member.username !== 'administrador'
  )

  const date = repertorio.event?.event_date ?? repertorio.worship_date

  const totalPossibleViews = songs.length * members.length

  const totalViews = songs.reduce((total: number, song: any) => {
    const viewed =
      song.views?.filter((view: any) => view.status === 'seen').length ?? 0

    return total + viewed
  }, 0)

  const generalProgress =
    totalPossibleViews > 0
      ? Math.round((totalViews / totalPossibleViews) * 100)
      : 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] pb-48">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-brand-500/[0.09] blur-3xl" />

        <div className="absolute -right-28 top-[420px] h-80 w-80 rounded-full bg-brand-400/[0.07] blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pt-10">
        <header>
          <div className="flex items-center justify-between gap-3">
            <BackButton href="/louvores" />

            {canManage && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/louvores/${repertorio.id}/editar`}
                  aria-label="Editar repertório"
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-full border border-white/[0.09]
                    bg-white/[0.045] text-white/60
                    backdrop-blur-xl transition
                    active:scale-95 active:bg-white/[0.08]
                  "
                >
                  <Edit2 size={17} />
                </Link>

                <form
                  action={excluirRepertorio.bind(null, repertorio.id) as any}
                >
                  <button
                    type="submit"
                    aria-label="Excluir repertório"
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-full border border-red-400/20
                      bg-red-500/10 text-red-400
                      backdrop-blur-xl transition
                      active:scale-95 active:bg-red-500/20
                    "
                  >
                    <Trash2 size={17} />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2">
              <Music2 size={14} className="text-brand-400" />

              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-400">
                Repertório
              </p>
            </div>

            <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight text-white">
              {repertorio.title}
            </h1>

            {repertorio.description && (
              <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-relaxed text-white/50">
                {repertorio.description}
              </p>
            )}

            <div className="mt-5 space-y-2">
              {repertorio.event?.title && (
                <p className="text-[14px] font-bold text-white/75">
                  {repertorio.event.title}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {date && (
                  <p className="flex items-center gap-2 text-[12px] font-medium text-white/45">
                    <Calendar
                      size={14}
                      className="shrink-0 text-brand-300"
                    />

                    <span className="first-letter:uppercase">
                      {formatDate(date)}
                    </span>
                  </p>
                )}

                {repertorio.event?.event_time && (
                  <p className="flex items-center gap-2 text-[12px] font-medium text-white/45">
                    <Clock
                      size={14}
                      className="shrink-0 text-brand-300"
                    />

                    {repertorio.event.event_time.slice(0, 5)}
                  </p>
                )}
              </div>

              {repertorio.event?.location && (
                <p className="flex items-center gap-2 truncate text-[12px] text-white/35">
                  <MapPin
                    size={14}
                    className="shrink-0 text-brand-300"
                  />

                  <span className="truncate">
                    {repertorio.event.location}
                  </span>
                </p>
              )}
            </div>
          </div>
        </header>

        <section
          className="
            mt-7 grid grid-cols-3 divide-x divide-white/[0.07]
            border-y border-white/[0.07] py-4
          "
        >
          <div className="px-2 text-center">
            <p className="text-[18px] font-black text-white">
              {songs.length}
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
              Louvores
            </p>
          </div>

          <div className="px-2 text-center">
            <p className="text-[18px] font-black text-white">
              {totalViews}
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
              Vistos
            </p>
          </div>

          <div className="px-2 text-center">
            <p className="text-[18px] font-black text-white">
              {generalProgress}%
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
              Progresso
            </p>
          </div>
        </section>

        {canManage && songs.length > 0 && (
          <section className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-400">
                  Acompanhamento
                </p>

                <p className="mt-1 text-sm font-bold text-white/70">
                  Progresso do repertório
                </p>
              </div>

              <p className="text-xl font-black text-white">
                {generalProgress}%
              </p>
            </div>

            <div className="mt-3">
              <ProgressBar value={generalProgress} />
            </div>

            <p className="mt-2 text-[11px] text-white/30">
              {totalViews} de {totalPossibleViews} visualizações possíveis
            </p>
          </section>
        )}

        <section className="mt-9">
          <div className="mb-5 flex items-end justify-between px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-400">
                Ordem do culto
              </p>

              <h2 className="mt-1 text-xl font-black text-white">
                Louvores
              </h2>
            </div>

            <p className="text-xs font-bold text-white/30">
              {songs.length}
            </p>
          </div>

          {songs.length === 0 ? (
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
                Nenhum louvor adicionado
              </p>

              <p className="mt-1 text-xs leading-relaxed text-white/30">
                Adicione as músicas que serão usadas neste repertório.
              </p>

              {canManage && (
                <Link
                  href={`/louvores/${repertorio.id}/editar`}
                  className="
                    mt-5 inline-flex h-10 items-center gap-2
                    rounded-full bg-brand-500/15 px-4
                    text-xs font-bold text-brand-300
                  "
                >
                  <Edit2 size={14} />
                  Adicionar louvores
                </Link>
              )}
            </div>
          ) : (
            <div className="border-y border-white/[0.07]">
              {songs.map((song: any, index: number) => {
                const youtubeId = getYoutubeId(song.youtube_url)

                const currentView = song.views?.find(
                  (view: any) => view.user_id === user.id
                )

                const userHasSeen = currentView?.status === 'seen'

                const seenCount =
                  song.views?.filter(
                    (view: any) => view.status === 'seen'
                  ).length ?? 0

                const seenUserIds = new Set(
                  (song.views ?? [])
                    .filter((view: any) => view.status === 'seen')
                    .map((view: any) => view.user_id)
                )

                const seenMembers = members.filter((member: any) =>
                  seenUserIds.has(member.id)
                )

                const notSeenMembers = members.filter(
                  (member: any) => !seenUserIds.has(member.id)
                )

                const songProgress =
                  members.length > 0
                    ? Math.round((seenCount / members.length) * 100)
                    : 0

                const isLastSong = index === songs.length - 1

                return (
                  <article
                    key={song.id}
                    className={`
                      py-6
                      ${
                        !isLastSong
                          ? 'border-b border-white/[0.07]'
                          : ''
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex h-9 w-9 shrink-0 items-center
                          justify-center rounded-full
                          border border-white/[0.08]
                          bg-white/[0.04]
                          text-[11px] font-black text-white/40
                        "
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-400">
                              Louvor {index + 1}
                            </p>

                            <h3 className="mt-1 text-[19px] font-black leading-tight text-white">
                              {song.title}
                            </h3>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xs font-black text-white/55">
                              {seenCount}/{members.length}
                            </p>

                            <p className="mt-0.5 text-[9px] text-white/25">
                              viram
                            </p>
                          </div>
                        </div>

                        {canManage && (
                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-[10px] font-semibold text-white/30">
                                Progresso
                              </p>

                              <p className="text-[10px] font-black text-white/45">
                                {songProgress}%
                              </p>
                            </div>

                            <ProgressBar value={songProgress} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      {youtubeId ? (
                        <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={song.title}
                            className="aspect-video w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : song.youtube_url ? (
                        <Link
                          href={song.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex h-28 items-center justify-center
                            rounded-[22px] border border-white/[0.08]
                            bg-white/[0.035]
                            text-sm font-bold text-brand-300
                            transition active:scale-[0.985]
                          "
                        >
                          <Play size={17} className="mr-2" />
                          Abrir louvor
                        </Link>
                      ) : (
                        <div
                          className="
                            flex h-24 items-center justify-center
                            rounded-[22px] border border-white/[0.07]
                            bg-white/[0.025]
                            text-xs font-semibold text-white/25
                          "
                        >
                          Vídeo não informado
                        </div>
                      )}
                    </div>

                    {song.youtube_url && (
                      <Link
                        href={song.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          mt-3 flex h-11 items-center justify-center gap-2
                          rounded-2xl border border-white/[0.08]
                          bg-white/[0.03]
                          text-[11px] font-black text-white/45
                          transition active:scale-[0.985]
                        "
                      >
                        <ExternalLink size={13} />
                        Abrir no YouTube
                      </Link>
                    )}

                    {song.description && (
                      <div className="mt-5 border-l-2 border-brand-400/30 pl-3">
                        <p className="whitespace-pre-line text-[13px] leading-relaxed text-white/50">
                          {song.description}
                        </p>
                      </div>
                    )}

                    <form
                      action={alternarLouvorVisto.bind(null, song.id) as any}
                      className="mt-5"
                    >
                      <button
                        type="submit"
                        className={`
                          flex h-12 w-full items-center justify-center gap-2
                          rounded-2xl border text-sm font-bold
                          transition active:scale-[0.985]
                          ${
                            userHasSeen
                              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-400'
                              : 'border-brand-300/20 bg-brand-500/15 text-brand-300'
                          }
                        `}
                      >
                        {userHasSeen ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                        {userHasSeen
                          ? 'Louvor marcado como visto'
                          : 'Marcar como visto'}
                      </button>
                    </form>

                    {canManage && (
                      <details className="group mt-4">
                        <summary
                          className="
                            flex cursor-pointer list-none items-center
                            justify-between rounded-2xl
                            border border-white/[0.07]
                            bg-white/[0.025] px-4 py-3
                            transition active:bg-white/[0.04]
                          "
                        >
                          <div className="flex items-center gap-2">
                            <UsersRound
                              size={14}
                              className="text-white/35"
                            />

                            <p className="text-[11px] font-bold text-white/45">
                              Ver acompanhamento dos membros
                            </p>
                          </div>

                          <ChevronDown
                            size={15}
                            className="
                              text-white/25 transition-transform
                              group-open:rotate-180
                            "
                          />
                        </summary>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.06] p-3">
                            <div className="mb-3 flex items-center gap-2">
                              <CheckCircle2
                                size={13}
                                className="text-emerald-400"
                              />

                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
                                Viram
                              </p>

                              <span className="ml-auto text-[10px] font-black text-emerald-300/70">
                                {seenMembers.length}
                              </span>
                            </div>

                            <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
                              {seenMembers.length === 0 ? (
                                <p className="text-[11px] text-white/30">
                                  Ninguém ainda.
                                </p>
                              ) : (
                                seenMembers.map((member: any) => (
                                  <MemberRow
                                    key={member.id}
                                    member={member}
                                  />
                                ))
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-red-400/10 bg-red-500/[0.05] p-3">
                            <div className="mb-3 flex items-center gap-2">
                              <XCircle
                                size={13}
                                className="text-red-400"
                              />

                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-300">
                                Pendentes
                              </p>

                              <span className="ml-auto text-[10px] font-black text-red-300/70">
                                {notSeenMembers.length}
                              </span>
                            </div>

                            <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
                              {notSeenMembers.length === 0 ? (
                                <p className="text-[11px] text-white/30">
                                  Todos viram.
                                </p>
                              ) : (
                                notSeenMembers.map((member: any) => (
                                  <MemberRow
                                    key={member.id}
                                    member={member}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </details>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}