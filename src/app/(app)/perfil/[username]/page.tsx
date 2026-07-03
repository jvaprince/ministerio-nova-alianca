import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  Grid3X3,
  MessageCircle,
  Plus,
  Trash2,
  Users,
  Trophy,
  LayoutGrid,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import { excluirDestaqueStory } from '@/lib/feed/highlight-actions'
import FollowButton from '@/components/perfil/FollowButton'

export const metadata: Metadata = {
  title: 'Perfil público — Ministério Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })
}

function formatPostType(type: string) {
  const tipos: Record<string, string> = {
    aviso: 'Aviso',
    foto: 'Foto',
    testemunho: 'Testemunho',
    reflexao: 'Reflexão',
    outro: 'Publicação',
  }

  return tipos[type] ?? 'Publicação'
}

function formatRoleIcon(role?: string | null) {
  if (role === 'admin') return '👑'
  if (role === 'leader') return '✨'
  return '🙌'
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = decodeURIComponent(params.username).replace('@', '')

  const { data: profileData } = await supabase
    .from('profiles')
    .select(
      'id, name, username, bio, favorite_verse, favorite_verse_ref, avatar_url, cover_url, role, created_at'
    )
    .eq('username', username)
    .single()

  if (!profileData) notFound()

  const profile = profileData as any
  const isOwnProfile = profile.id === user.id

  const { data: postsData } = await supabase
    .from('feed_posts')
    .select('*')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })

  const posts = (postsData ?? []) as any[]

  const { count: followersCount } = await supabase
    .from('followers')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: achievementsCount } = await supabase
    .from('user_achievements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const { data: existingFollow } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', profile.id)
    .maybeSingle()

  const isFollowing = !!existingFollow

  const { data: highlightsData } = await supabase
    .from('story_highlights')
    .select(`
      id,
      title,
      cover_story_id,
      created_at,
      cover:feed_stories!story_highlights_cover_story_id_fkey (
        id,
        image_url,
        video_url,
        content
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: true })

  const highlights = (highlightsData ?? []) as any[]

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    leader: 'Líder',
    member: 'Membro',
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-8 bg-app text-app">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-28 -left-28 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[520px] -right-32 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 overflow-hidden pb-8 bg-[#050816]">
        {profile.cover_url ? (
          <>
            <img
              src={profile.cover_url}
              alt="Capa"
              className="absolute inset-x-0 top-0 w-full h-[390px] object-cover opacity-80"
            />

            <div className="absolute inset-x-0 top-0 h-[390px] bg-gradient-to-b from-[#050816]/10 via-[#050816]/35 to-[#050816]" />
          </>
        ) : (
          <div className="absolute inset-x-0 top-0 h-[390px] bg-[radial-gradient(circle_at_top,#1056B0_0%,#0f172a_45%,#050816_100%)]" />
        )}

        <div className="absolute inset-x-0 top-[230px] h-44 bg-gradient-to-b from-transparent via-[#050816]/80 to-[#050816]" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="relative z-10 px-4 pt-12">
          <Link
            href="/feed"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-300/20 bg-[#050816]/45 text-brand-300 backdrop-blur-xl shadow-[0_0_24px_rgba(59,130,246,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="mt-11 flex flex-col items-center text-center">
            <div className="relative z-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-brand-400/45 blur-2xl animate-pulse" />
              <div className="absolute -inset-3 rounded-full border border-brand-300/25" />

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="relative z-20 w-24 h-24 rounded-full object-cover border-4 border-brand-400/70 shadow-[0_0_45px_rgba(16,86,176,0.55)] transition-all duration-500 hover:scale-105"
                />
              ) : (
                <div className="relative z-20 w-24 h-24 rounded-full bg-brand-gradient flex items-center justify-center text-3xl font-black text-white border-4 border-brand-400/70 shadow-[0_0_45px_rgba(16,86,176,0.55)]">
                  {getInitials(profile.name ?? 'NA')}
                </div>
              )}
            </div>

            <h1 className="text-[25px] leading-tight font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              {profile.name}
            </h1>

            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              <p className="text-[13px] text-white/55">
                @{profile.username}
              </p>

              <div className="px-3 py-1 rounded-full border border-brand-400/25 bg-brand-500/15 backdrop-blur-xl shadow-[0_0_18px_rgba(59,130,246,0.18)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-300">
                  {formatRoleIcon(profile.role)} {roleLabel[profile.role ?? 'member']}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="mt-4">
                <FollowButton
                  profileId={profile.id}
                  username={profile.username}
                  isFollowing={isFollowing}
                />
              </div>
            )}

            {profile.bio && (
              <p className="text-[14px] text-white text-center mt-5 px-6 leading-relaxed font-medium">
                {profile.bio}
              </p>
            )}

            <p className="text-[12px] text-white/45 mt-4">
              Faz parte da comunidade desde{' '}
              {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {profile.favorite_verse && (
              <div className="relative mt-3 mx-2 overflow-hidden rounded-3xl border border-brand-400/20 bg-[#050816]/45 px-4 py-3 shadow-[0_0_22px_rgba(16,86,176,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />

                <p className="relative text-[13px] italic text-brand-300 leading-relaxed">
                  &quot;{profile.favorite_verse}&quot; —{' '}
                  {profile.favorite_verse_ref}
                </p>
              </div>
            )}

            <div className="relative mt-4 w-full overflow-hidden rounded-[30px] border border-brand-300/20 bg-[#050816]/50 px-3 py-3.5 shadow-[0_0_30px_rgba(59,130,246,0.12),0_24px_80px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-300 active:scale-[0.985]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.08] to-transparent" />

              <div className="relative grid grid-cols-3 divide-x divide-white/10">
                <div className="text-center">
                  <LayoutGrid size={20} className="mx-auto text-brand-400 mb-2" />
                  <p className="text-[28px] font-black text-white">
                    {posts.length}
                  </p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em] mt-1">
                    Posts
                  </p>
                </div>

                <Link
                  href={`/perfil/${profile.username}/seguidores`}
                  className="text-center transition-all duration-300 active:scale-95"
                >
                  <Users size={21} className="mx-auto text-brand-400 mb-2" />
                  <p className="text-[28px] font-black text-white">
                    {followersCount ?? 0}
                  </p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em] mt-1">
                    Seguidores
                  </p>
                </Link>

                <Link
                  href={`/perfil/${profile.username}/conquistas`}
                  className="text-center transition-all duration-300 active:scale-95"
                >
                  <Trophy size={20} className="mx-auto text-amber-300 mb-2" />
                  <p className="text-[28px] font-black text-white">
                    {achievementsCount ?? 0}
                  </p>
                  <p className="text-[10px] text-white/45 uppercase tracking-[0.22em] mt-1">
                    Conquistas
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(highlights.length > 0 || isOwnProfile) && (
        <>
          <div className="relative z-10 px-4 mt-5 flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-app-muted">
              Destaques
            </p>
          </div>

          <div className="relative z-10 px-4 mt-3">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-5 pb-1">
                {isOwnProfile && (
                  <Link
                    href="/feed/stories/criar/arquivo"
                    className="shrink-0 w-[78px] text-center transition-all duration-300 active:scale-95"
                  >
                    <div className="mx-auto w-[70px] h-[70px] rounded-full p-[2px] bg-gradient-to-br from-brand-400/80 to-brand-900/30 shadow-[0_0_18px_rgba(16,86,176,0.18)]">
                      <div className="w-full h-full rounded-full bg-app flex items-center justify-center">
                        <Plus size={24} className="text-brand-300" />
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] font-semibold text-app-muted truncate">
                      Novo
                    </p>
                  </Link>
                )}

                {highlights.map((highlight: any) => {
                  const cover = Array.isArray(highlight.cover)
                    ? highlight.cover[0]
                    : highlight.cover

                  return (
                    <div
                      key={highlight.id}
                      className="relative shrink-0 w-[78px] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {isOwnProfile && (
                        <form
                          action={excluirDestaqueStory.bind(null, highlight.id) as any}
                          className="absolute -top-1 -right-1 z-20"
                        >
                          <button
                            type="submit"
                            className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border border-black"
                          >
                            <Trash2 size={12} />
                          </button>
                        </form>
                      )}

                      <Link
                        href={`/perfil/${profile.username}/destaques/${highlight.id}`}
                        className="block text-center"
                      >
                        <div className="mx-auto w-[70px] h-[70px] rounded-full p-[2px] bg-gradient-to-br from-brand-300/90 via-brand-500/70 to-brand-900/10 shadow-[0_0_24px_rgba(16,86,176,0.24)]">
                          <div className="w-full h-full rounded-full bg-app p-[3px]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-app-card">
                              {cover?.image_url ? (
                                <img
                                  src={cover.image_url}
                                  alt={highlight.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : cover?.video_url ? (
                                <video
                                  src={cover.video_url}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-app-muted text-lg font-bold">
                                  {(highlight.title ?? 'D').slice(0, 1)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="mt-2 text-[11px] font-semibold text-app-muted truncate">
                          {highlight.title}
                        </p>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 px-4 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <Grid3X3 size={19} className="text-brand-400" />
            <div className="mt-1 h-1 w-6 rounded-full bg-brand-400" />
          </div>

          <h2 className="text-[22px] font-black text-app tracking-tight">
            Publicações
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="py-10 text-center bg-app-card border border-app rounded-[28px]">
            <MessageCircle size={24} className="text-app-muted mx-auto mb-2" />
            <p className="text-sm text-app-muted">
              Nenhuma publicação ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <div
                key={post.id}
                className="relative overflow-hidden rounded-[28px] border border-app bg-app-card shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.14),0_24px_80px_rgba(0,0,0,0.20)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

                <div className="relative p-5">
                  <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400">
                    {formatPostType(post.post_type)}
                  </p>

                  {post.content && (
                    <p className="text-[15px] text-app leading-relaxed mt-3 whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  <p className="text-[12px] text-app-muted mt-4">
                    {formatDate(post.created_at)}
                  </p>
                </div>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Imagem da publicação"
                    className="w-full max-h-[420px] object-cover border-t border-app"
                  />
                )}

                {post.video_url && (
                  <video
                    src={post.video_url}
                    controls
                    playsInline
                    className="w-full max-h-[420px] object-cover border-t border-app bg-black"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}