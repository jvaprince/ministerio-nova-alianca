import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Play,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  UsersRound,
  ListMusic,
  ExternalLink,
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_18px_45px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      {children}
    </div>
  )
}

function MemberRow({ member }: { member: any }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/[0.08] border border-white/[0.08]">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name ?? 'Membro'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/45">
            {(member.name ?? 'M').slice(0, 1)}
          </div>
        )}
      </div>

      <p className="truncate text-[12px] font-semibold text-white/70">
        {member.name}
      </p>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-400"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
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

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role
  const podeGerir = ['admin', 'leader'].includes(role ?? '')

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

  if (!set) notFound()

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
  const totalPossivel = songs.length * members.length

  const totalVisualizacoes = songs.reduce((total: number, song: any) => {
    const seenCount =
      song.views?.filter((view: any) => view.status === 'seen').length ?? 0

    return total + seenCount
  }, 0)

  const progressoGeral =
    totalPossivel > 0 ? Math.round((totalVisualizacoes / totalPossivel) * 100) : 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/louvores" />

        <section className="mt-4 relative overflow-hidden rounded-[34px] border border-brand-300/20 bg-gradient-to-br from-brand-500/90 via-brand-500/70 to-brand-700/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />

          <div className="relative">
            <p className="text-white/75 text-[11px] uppercase tracking-[0.28em] font-black">
              Repertório
            </p>

            <h1 className="text-[30px] font-black text-white mt-2 tracking-tight leading-tight">
              {repertorio.title}
            </h1>

            {repertorio.description && (
              <p className="text-white/75 text-sm mt-3 leading-relaxed">
                {repertorio.description}
              </p>
            )}

            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-2 text-white/75 text-sm">
                <Calendar size={15} />
                {repertorio.event?.title
                  ? `${repertorio.event.title} • ${formatDate(
                      repertorio.event.event_date
                    )}`
                  : formatDate(date)}
              </p>

              {repertorio.event?.event_time && (
                <p className="flex items-center gap-2 text-white/70 text-sm">
                  <Clock size={15} />
                  {repertorio.event.event_time.slice(0, 5)}
                </p>
              )}

              {repertorio.event?.location && (
                <p className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin size={15} />
                  {repertorio.event.location}
                </p>
              )}
            </div>
          </div>
        </section>

        {podeGerir && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link
              href={`/louvores/${repertorio.id}/editar`}
              className="h-12 rounded-2xl border border-brand-300/20 bg-white/[0.04] text-white/75 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Edit2 size={16} />
              Editar
            </Link>

            <form action={excluirRepertorio.bind(null, repertorio.id) as any}>
              <button
                type="submit"
                className="w-full h-12 rounded-2xl border border-red-400/20 bg-red-500/10 text-red-400 font-bold transition-all active:scale-[0.98]"
              >
                Excluir
              </button>
            </form>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <PremiumCard className="p-3 text-center">
            <ListMusic size={17} className="relative mx-auto text-brand-300 mb-1" />
            <p className="relative text-[18px] font-black text-white">
              {songs.length}
            </p>
            <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
              Louvores
            </p>
          </PremiumCard>

          <PremiumCard className="p-3 text-center">
            <Eye size={17} className="relative mx-auto text-emerald-300 mb-1" />
            <p className="relative text-[18px] font-black text-white">
              {totalVisualizacoes}
            </p>
            <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
              Vistos
            </p>
          </PremiumCard>

          <PremiumCard className="p-3 text-center">
            <UsersRound size={17} className="relative mx-auto text-amber-300 mb-1" />
            <p className="relative text-[18px] font-black text-white">
              {members.length}
            </p>
            <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
              Membros
            </p>
          </PremiumCard>
        </div>

        {podeGerir && songs.length > 0 && (
          <PremiumCard className="mt-4 p-4">
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-400">
                    Acompanhamento
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Progresso geral do repertório
                  </p>
                </div>

                <p className="text-white text-xl font-black">
                  {progressoGeral}%
                </p>
              </div>

              <ProgressBar value={progressoGeral} />

              <p className="text-white/35 text-[11px] mt-3">
                {totalVisualizacoes} de {totalPossivel} confirmações possíveis.
              </p>
            </div>
          </PremiumCard>
        )}

        {songs.length === 0 ? (
          <PremiumCard className="mt-5 p-8 text-center">
            <Music size={30} className="relative text-white/25 mx-auto mb-3" />

            <p className="relative text-white font-bold">
              Nenhum louvor adicionado
            </p>

            <p className="relative text-white/40 text-sm mt-1">
              Adicione músicas para este repertório.
            </p>
          </PremiumCard>
        ) : (
          <div className="mt-6 space-y-5">
            {songs.map((song: any, index: number) => {
              const youtubeId = getYoutubeId(song.youtube_url)

              const currentView = song.views?.find(
                (view: any) => view.user_id === user.id
              )

              const userHasSeen = currentView?.status === 'seen'

              const seenCount =
                song.views?.filter((view: any) => view.status === 'seen')
                  .length ?? 0

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

              const progressoMusica =
                members.length > 0
                  ? Math.round((seenCount / members.length) * 100)
                  : 0

              return (
                <PremiumCard key={song.id} className="p-4">
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-brand-400 text-xs font-black uppercase tracking-widest">
                          Louvor {index + 1}
                        </p>

                        <h2 className="text-white text-xl font-black mt-1 leading-tight">
                          {song.title}
                        </h2>
                      </div>

                      <div className="shrink-0 rounded-full bg-brand-500/15 border border-brand-300/20 px-3 py-1">
                        <p className="text-brand-300 text-xs font-bold">
                          {seenCount} viram
                        </p>
                      </div>
                    </div>

                    {podeGerir && (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[11px] text-white/35 font-bold">
                            Progresso
                          </p>

                          <p className="text-[11px] text-white/45 font-black">
                            {progressoMusica}%
                          </p>
                        </div>

                        <ProgressBar value={progressoMusica} />
                      </div>
                    )}

                    {youtubeId ? (
                      <div className="overflow-hidden rounded-[22px] border border-brand-300/15 bg-black shadow-[0_0_22px_rgba(59,130,246,0.10)]">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={song.title}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <Link
                        href={song.youtube_url ?? '#'}
                        target="_blank"
                        className="h-32 rounded-[22px] border border-brand-300/15 bg-white/[0.04] flex items-center justify-center text-brand-300 font-bold"
                      >
                        <Play size={18} className="mr-2" />
                        Abrir louvor
                      </Link>
                    )}

                    {song.youtube_url && (
                      <Link
                        href={song.youtube_url}
                        target="_blank"
                        className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] py-3 text-[12px] font-black text-white/55 active:scale-[0.98]"
                      >
                        <ExternalLink size={14} />
                        Abrir no YouTube
                      </Link>
                    )}

                    {song.description && (
                      <p className="text-white/60 text-sm leading-relaxed mt-4 whitespace-pre-line">
                        {song.description}
                      </p>
                    )}

                    <form
                      action={alternarLouvorVisto.bind(null, song.id) as any}
                      className="mt-4"
                    >
                      <button
                        type="submit"
                        className={`w-full h-12 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                          userHasSeen
                            ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-400'
                            : 'bg-brand-500/15 border-brand-300/20 text-brand-300'
                        }`}
                      >
                        <Eye size={16} />
                        {userHasSeen ? 'Desmarcar visto' : 'Marcar como visto'}
                      </button>
                    </form>

                    {podeGerir && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-3">
                          <p className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-300">
                            <CheckCircle2 size={14} />
                            Viram
                          </p>

                          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {seenMembers.length === 0 ? (
                              <p className="text-[12px] text-white/35">
                                Ninguém ainda.
                              </p>
                            ) : (
                              seenMembers.map((member: any) => (
                                <MemberRow key={member.id} member={member} />
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-red-400/15 bg-red-500/10 p-3">
                          <p className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red-300">
                            <XCircle size={14} />
                            Não viram
                          </p>

                          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {notSeenMembers.length === 0 ? (
                              <p className="text-[12px] text-white/35">
                                Todos viram.
                              </p>
                            ) : (
                              notSeenMembers.map((member: any) => (
                                <MemberRow key={member.id} member={member} />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}