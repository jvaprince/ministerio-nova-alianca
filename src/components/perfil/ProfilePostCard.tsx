'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import DeleteFeedPostButton from '@/components/feed/DeleteFeedPostButton'
import LikeFeedPostButton from '@/components/feed/LikeFeedPostButton'
import {
  criarComentarioFeed,
  excluirComentarioFeed,
} from '@/lib/feed/actions'

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

export default function ProfilePostCard({
  post,
  isOwnProfile,
  currentUserId,
  currentUserRole,
}: {
  post: any
  isOwnProfile: boolean
  currentUserId: string
  currentUserRole?: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const liked =
    post.likes?.some((like: any) => like.user_id === currentUserId) ?? false

  const likesCount = post.likes?.length ?? 0
  const comments = (post.comments ?? []) as any[]
  const commentsCount = comments.length

  async function handleCreate(formData: FormData) {
    await criarComentarioFeed(post.id, formData)
    formRef.current?.reset()
  }

  async function handleDeleteComment(commentId: string) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este comentário?'
    )

    if (!confirmed) return

    await excluirComentarioFeed(commentId)
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-[30px] border border-app bg-app-card
        shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.07)]
        backdrop-blur-xl transition-all duration-500
        ${expanded ? 'scale-[1.01] border-brand-300/25 shadow-[0_0_42px_rgba(59,130,246,0.16),0_28px_90px_rgba(0,0,0,0.26)]' : ''}
      `}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/55 to-transparent" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-brand-400/5 blur-2xl" />

      {isOwnProfile && (
        <div className="absolute top-4 right-4 z-20">
          <DeleteFeedPostButton postId={post.id} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="block w-full text-left"
      >
        <div className="relative p-5 pr-16">
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
      </button>

      {post.video_url && (
        <div className="border-t border-app">
          <video
            src={post.video_url}
            controls
            playsInline
            className="w-full max-h-[420px] object-cover bg-black"
          />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-3 border-t border-app px-4 py-3">
        <div className="flex items-center gap-3">
          <LikeFeedPostButton
            postId={post.id}
            liked={liked}
            likesCount={likesCount}
          />

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-app-muted transition-colors hover:text-brand-300"
          >
            <MessageCircle size={15} />
            {commentsCount > 0
              ? `${commentsCount} comentário${commentsCount > 1 ? 's' : ''}`
              : 'Comentar'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-app-muted transition-all duration-300 active:scale-95"
        >
          {expanded ? (
            <X size={15} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      <div
        className={`
          grid transition-all duration-500 ease-out
          ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-app bg-black/10 px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-black text-app">
                  Comentários
                </p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  Interaja com essa publicação
                </p>
              </div>

              <Link
                href={`/feed/${post.id}`}
                className="text-[11px] font-bold text-brand-400"
              >
                Ver completo
              </Link>
            </div>

            {comments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {comments.map((comment: any) => {
                  const canDelete =
                    comment.author_id === currentUserId ||
                    currentUserRole === 'admin'

                  return (
                    <div
                      key={comment.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
                    >
                      <div className="flex gap-3">
                        <Link href={`/perfil/${comment.author?.username}`}>
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/[0.08] border border-white/[0.08]">
                            {comment.author?.avatar_url ? (
                              <img
                                src={comment.author.avatar_url}
                                alt={comment.author?.name ?? 'Autor'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold">
                                {(comment.author?.name ?? 'M').slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </Link>

                        <div>
                          <Link href={`/perfil/${comment.author?.username}`}>
                            <p className="text-[12px] font-bold text-app">
                              {comment.author?.name ?? 'Membro'}
                            </p>
                          </Link>

                          <p className="text-[13px] text-app-muted leading-relaxed mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-red-400/60"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-5 text-center">
                <MessageCircle size={18} className="mx-auto text-app-muted mb-2" />
                <p className="text-[13px] font-semibold text-app">
                  Nenhum comentário ainda.
                </p>
                <p className="text-[11px] text-app-muted mt-1">
                  Seja o primeiro a comentar.
                </p>
              </div>
            )}

            <form ref={formRef} action={handleCreate} className="flex gap-2">
              <input
                name="content"
                placeholder="Escreva um comentário..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-app text-sm placeholder:text-app-muted focus:outline-none focus:border-brand-500/50"
              />

              <button
                type="submit"
                className="w-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-400 transition-all active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}