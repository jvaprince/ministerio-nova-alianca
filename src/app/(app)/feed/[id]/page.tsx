import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import DeleteFeedPostButton from '@/components/feed/DeleteFeedPostButton'
import LikeFeedPostButton from '@/components/feed/LikeFeedPostButton'
import FeedComments from '@/components/feed/FeedComments'

export const metadata: Metadata = {
  title: 'Publicação — Ministério Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
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
    publicacao.author_id === user.id ||
    perfilAtual?.role === 'admin' ||
    perfilAtual?.role === 'leader'

  return (
    <div className="pb-8">
      <div className="px-4 pt-12 pb-4">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-white/45 text-sm mb-5"
        >
          <ArrowLeft size={16} />
          Voltar para o feed
        </Link>

        <h1 className="text-[22px] font-bold text-white">Publicação</h1>
      </div>

      <div className="px-4">
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/perfil/${publicacao.author?.username}`}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.08]">
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

                <div>
                  <p className="text-sm font-bold text-white">
                    {publicacao.author?.name ?? 'Membro'}
                  </p>

                  {publicacao.author?.username && (
                    <p className="text-[11px] text-white/35">
                      @{publicacao.author.username}
                    </p>
                  )}

                  <p className="text-[11px] text-white/30">
                    {formatDate(publicacao.created_at)}
                  </p>
                </div>
              </Link>

              {podeExcluir && <DeleteFeedPostButton postId={publicacao.id} />}
            </div>

            <p className="text-[11px] font-bold tracking-widest uppercase text-brand-400/80 mt-4">
              {formatPostType(publicacao.post_type)}
            </p>

            {publicacao.content && (
              <p className="text-[14px] text-white/75 leading-relaxed mt-2 whitespace-pre-line">
                {publicacao.content}
              </p>
            )}
          </div>

          {publicacao.image_url && (
            <img
              src={publicacao.image_url}
              alt="Imagem da publicação"
              className="w-full max-h-[520px] object-cover border-t border-white/[0.06]"
            />
          )}

          <div className="px-4 py-3 border-t border-white/[0.06] text-white/35">
            <LikeFeedPostButton
              postId={publicacao.id}
              liked={
                publicacao.likes?.some((like: any) => like.user_id === user.id) ??
                false
              }
              likesCount={publicacao.likes?.length ?? 0}
            />
          </div>

          <FeedComments
            postId={publicacao.id}
            comments={(publicacao.comments ?? []) as any[]}
            currentUserId={user.id}
            currentUserRole={perfilAtual?.role}
          />
        </div>
      </div>
    </div>
  )
}