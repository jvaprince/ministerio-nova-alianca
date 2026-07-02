import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Music, Play, Eye, Edit2 } from 'lucide-react'
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const podeGerir = ['admin', 'leader'].includes(profile?.role ?? '')

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

  const songs = [...(set.songs ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  )

  const date = set.event?.event_date ?? set.worship_date

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/louvores" />

        <section className="mt-4 relative overflow-hidden rounded-[34px] border border-brand-300/20 bg-gradient-to-br from-brand-500/90 via-brand-500/70 to-brand-700/90 p-6 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <p className="text-white/75 text-[11px] uppercase tracking-[0.28em] font-black">
              Repertório
            </p>

            <h1 className="text-[30px] font-black text-white mt-2 tracking-tight leading-tight">
              {set.title}
            </h1>

            {set.description && (
              <p className="text-white/75 text-sm mt-3 leading-relaxed">
                {set.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-white/75 text-sm mt-5">
              <Calendar size={15} />

              <span>
                {set.event?.title
                  ? `${set.event.title} • ${formatDate(set.event.event_date)}`
                  : formatDate(date)}
              </span>
            </div>

            <p className="text-white/70 text-sm mt-2">
              {songs.length} louvor{songs.length === 1 ? '' : 'es'} preparado
              {songs.length === 1 ? '' : 's'}
            </p>
          </div>
        </section>

        {podeGerir && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link
              href={`/louvores/${set.id}/editar`}
              className="h-12 rounded-2xl border border-brand-300/20 bg-white/[0.04] text-white/75 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Edit2 size={16} />
              Editar
            </Link>

            <form action={excluirRepertorio.bind(null, set.id)}>
              <button
                type="submit"
                className="w-full h-12 rounded-2xl border border-red-400/20 bg-red-500/10 text-red-400 font-bold transition-all active:scale-[0.98]"
              >
                Excluir
              </button>
            </form>
          </div>
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
                (view: any) => view.user_id === user?.id
              )

              const userHasSeen = currentView?.status === 'seen'

              const seenCount =
                song.views?.filter((view: any) => view.status === 'seen')
                  .length ?? 0

              return (
                <PremiumCard key={song.id} className="p-4">
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-brand-400 text-xs font-black uppercase tracking-widest">
                          Louvor {index + 1}
                        </p>

                        <h2 className="text-white text-xl font-black mt-1">
                          {song.title}
                        </h2>
                      </div>

                      <div className="rounded-full bg-brand-500/15 border border-brand-300/20 px-3 py-1">
                        <p className="text-brand-300 text-xs font-bold">
                          {seenCount} viram
                        </p>
                      </div>
                    </div>

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
                        href={song.youtube_url}
                        target="_blank"
                        className="h-32 rounded-[22px] border border-brand-300/15 bg-white/[0.04] flex items-center justify-center text-brand-300 font-bold"
                      >
                        <Play size={18} className="mr-2" />
                        Abrir louvor
                      </Link>
                    )}

                    {song.description && (
                      <p className="text-white/60 text-sm leading-relaxed mt-4">
                        {song.description}
                      </p>
                    )}

                    <form
                      action={alternarLouvorVisto.bind(null, song.id)}
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