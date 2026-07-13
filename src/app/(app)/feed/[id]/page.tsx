import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import DeleteFeedPostButton from '@/components/feed/DeleteFeedPostButton'
import LikeFeedPostButton from '@/components/feed/LikeFeedPostButton'
import FeedComments from '@/components/feed/FeedComments'

export const metadata: Metadata = {
  title: 'Publicação — Ministério Nova Aliança',
}

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

export default async function FeedPostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const perfilAtual = currentProfile as { role?: string } | null

  const { data: post } = await supabase
    .from('feed_posts')
    .select(`
      *,
      author:profiles (
        id,
        name,
        username,
        avatar_url,
        role
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
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  const publicacao = post as any

  const podeExcluir =
    publicacao.author_id === user.id || perfilAtual?.role === 'admin'

  const liked =
    publicacao.likes?.some((like: any) => like.user_id === user.id) ?? false

  const likesCount = publicacao.likes?.length ?? 0
  const commentsCount = publicacao.comments?.length ?? 0

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 bg-app text-app">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[420px] -right-28 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-12 pb-5">
          <Link
            href="/feed"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/20 bg-app-card/70 text-brand-300 backdrop-blur-xl shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all active:scale-95"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="mt-5">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-app-muted">
              Feed da Igreja
            </p>

            <h1 className="text-[26px] font-black text-app tracking-tight mt-1">
              Publicação
            </h1>
          </div>
        </div>

        <div className="px-4">
          <article className="relative overflow-hidden rounded-[32px] border border-app bg-app-card shadow-[0_0_34px_rgba(59,130,246,0.10),0_26px_90px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-brand-400/5 blur-3xl" />

            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/perfil/${publicacao.author?.username}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-11 h-11 rounded-full bg-white/[0.08] overflow-hidden border border-brand-300/15 shadow-[0_0_18px_rgba(59,130,246,0.10)] shrink-0">
                    {publicacao.author?.avatar_url ? (
                      <img
                        src={publicacao.author.avatar_url}
                        alt={publicacao.author.name ?? 'Autor'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-bold">
                        {(publicacao.author?.name ?? 'M').slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-app truncate">
                      {publicacao.author?.name ?? 'Membro'}
                    </p>

                    {publicacao.author?.username && (
                      <p className="text-[11px] text-app-muted">
                        @{publicacao.author.username}
                      </p>
                    )}

                    <p className="text-[11px] text-app-muted/80">
                      {formatDate(publicacao.created_at)}
                    </p>
                  </div>
                </Link>

                {podeExcluir && (
                  <div className="shrink-0">
                    <DeleteFeedPostButton postId={publicacao.id} />
                  </div>
                )}
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-300/15 bg-brand-500/10 px-3 py-1.5">
                <Sparkles size={13} className="text-brand-400" />
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-brand-400">
                  {formatPostType(publicacao.post_type)}
                </p>
              </div>

              {publicacao.content && (
                <p className="text-[16px] text-app leading-relaxed mt-4 whitespace-pre-line">
                  {publicacao.content}
                </p>
              )}
            </div>

            {publicacao.image_url && (
              <img
                src={publicacao.image_url}
                alt="Imagem da publicação"
                className="w-full max-h-[580px] object-cover border-t border-app"
              />
            )}

            {publicacao.video_url && (
              <video
                src={publicacao.video_url}
                controls
                playsInline
                className="w-full max-h-[580px] object-cover border-t border-app bg-black"
              />
            )}

            <div className="relative flex items-center justify-between gap-3 border-t border-app px-4 py-3">
              <LikeFeedPostButton
                postId={publicacao.id}
                liked={liked}
                likesCount={likesCount}
              />

              <span className="flex items-center gap-1.5 text-xs text-app-muted">
                <MessageCircle size={14} />
                {commentsCount > 0
                  ? `${commentsCount} comentário${commentsCount > 1 ? 's' : ''}`
                  : 'Sem comentários'}
              </span>
            </div>

            <FeedComments
              postId={publicacao.id}
              comments={(publicacao.comments ?? []) as any[]}
              currentUserId={user.id}
              currentUserRole={perfilAtual?.role}
            />
          </article>
        </div>
      </div>
    </div>
  )
}