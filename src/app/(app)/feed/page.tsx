import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import LikeFeedPostButton from '@/components/feed/LikeFeedPostButton'
import FeedComments from '@/components/feed/FeedComments'
import FeedPeopleSearch from '@/components/feed/FeedPeopleSearch'
import FeedStories from '@/components/feed/FeedStories'

export const metadata: Metadata = { title: 'Feed — Ministério Nova Aliança' }

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
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

export default async function FeedPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date().toISOString()

const [profileResult, postsResult, storiesResult] = await Promise.all([
  supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single(),

  supabase
    .from('feed_posts')
    .select(`
      id,
      content,
      post_type,
      image_url,
      video_url,
      created_at,
      author:profiles!inner (
        id,
        name,
        username,
        avatar_url,
        role,
        is_system
      ),
      likes:feed_likes (
        user_id
      ),
      comments:feed_comments (
        id,
        content,
        author_id,
        created_at,
        author:profiles (
          id,
          name,
          username,
          avatar_url
        )
      )
    `)
    .eq('author.is_system', false)
    .order('created_at', { ascending: false })
    .limit(10),

  supabase
    .from('feed_stories')
    .select(`
      id,
      image_url,
      video_url,
      content,
      created_at,
      expires_at,
      author:profiles!inner (
        id,
        name,
        username,
        avatar_url,
        is_system
      ),
      views:feed_story_views (
        user_id,
        viewer:profiles (
          id,
          name,
          username,
          avatar_url
        )
      ),
      likes:feed_story_likes (
        user_id,
        user:profiles (
          id,
          name,
          username,
          avatar_url
        )
      )
    `)
    .eq('author.is_system', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(30),
])

const perfilAtual = profileResult.data as { role?: string } | null
const listaPosts = (postsResult.data ?? []) as any[]
const listaStories = (storiesResult.data ?? []) as any[]

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
              Feed da Igreja
            </h1>
          </div>

          <Link
            href="/feed/criar"
            className="w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
          >
            <Plus size={19} />
          </Link>
        </div>

        <div className="px-4 space-y-4">
          <FeedPeopleSearch />

          <FeedStories stories={listaStories} currentUserId={user.id} />

          {listaPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-white/60 text-sm font-semibold">
                Nenhuma publicação ainda.
              </p>
              <p className="text-white/30 text-xs mt-1">
                Seja o primeiro a compartilhar algo no feed.
              </p>
            </div>
          ) : (
            listaPosts.map((post: any) => (
              <div
                key={post.id}
                className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

                <div className="relative p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/perfil/${post.author?.username}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/[0.08] overflow-hidden border border-brand-300/15 shadow-[0_0_18px_rgba(59,130,246,0.08)]">
                        {post.author?.avatar_url ? (
                          <img
                            src={post.author.avatar_url}
                            alt={post.author.name ?? 'Autor'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-bold">
                            {(post.author?.name ?? 'M').slice(0, 1)}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          {post.author?.name ?? 'Membro'}
                        </p>

                        {post.author?.username && (
                          <p className="text-[11px] text-white/35">
                            @{post.author.username}
                          </p>
                        )}

                        <p className="text-[11px] text-white/30">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <Link href={`/feed/${post.id}`} className="block">
                    <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400 mt-4">
                      {formatPostType(post.post_type)}
                    </p>

                    {post.content && (
                      <p className="text-[15px] text-white/78 leading-relaxed mt-2 whitespace-pre-line">
                        {post.content}
                      </p>
                    )}
                  </Link>
                </div>

                {post.image_url && (
                  <Link href={`/feed/${post.id}`} className="block">
                    <img
                      src={post.image_url}
                      alt="Imagem da publicação"
                      className="w-full max-h-[520px] object-cover border-t border-white/[0.06]"
                    />
                  </Link>
                )}

                {post.video_url && (
                  <div className="border-t border-white/[0.06]">
                    <video
                      src={post.video_url}
                      controls
                      playsInline
                      className="w-full max-h-[520px] object-cover bg-black"
                    />
                  </div>
                )}

                <div className="relative px-4 py-3 border-t border-white/[0.06] text-white/35">
                  <LikeFeedPostButton
                    postId={post.id}
                    liked={
                      post.likes?.some((like: any) => like.user_id === user.id) ??
                      false
                    }
                    likesCount={post.likes?.length ?? 0}
                  />
                </div>

                <FeedComments
                  postId={post.id}
                  comments={(post.comments ?? []) as any[]}
                  currentUserId={user.id}
                  currentUserRole={perfilAtual?.role}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}