'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, MessageCircle, Send, Trash2 } from 'lucide-react'
import {
  criarComentarioFeed,
  excluirComentarioFeed,
} from '@/lib/feed/actions'

export default function FeedComments({
  postId,
  comments,
  currentUserId,
  currentUserRole,
}: {
  postId: string
  comments: any[]
  currentUserId: string
  currentUserRole?: string | null
}) {
  const [showComments, setShowComments] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  async function handleCreate(formData: FormData) {
    if (submittingRef.current) return

    const content = String(formData.get('content') ?? '').trim()

    if (!content) {
      inputRef.current?.focus()
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      await criarComentarioFeed(postId, formData)

      formRef.current?.reset()
      setShowForm(false)
      setShowComments(true)
    } catch (err) {
      console.error('Erro ao publicar comentário:', err)
      setError('Não foi possível publicar o comentário. Tente novamente.')
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (deletingCommentId) return

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este comentário?'
    )

    if (!confirmed) return

    setDeletingCommentId(commentId)

    try {
      await excluirComentarioFeed(commentId)
    } catch (err) {
      console.error('Erro ao excluir comentário:', err)
      window.alert('Não foi possível excluir o comentário.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  return (
    <div className="border-t border-white/[0.06] px-4 py-3">
      <div className="flex items-center gap-5 text-white/35">
        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current)
            setError(null)
          }}
          className="flex items-center gap-2 text-xs"
        >
          <MessageCircle size={16} />
          Comentar
        </button>

        {comments.length > 0 && (
          <button
            type="button"
            onClick={() => setShowComments((current) => !current)}
            className="text-xs text-white/35"
          >
            {showComments
              ? 'Ocultar comentários'
              : `Mostrar ${comments.length} comentário${
                  comments.length > 1 ? 's' : ''
                }`}
          </button>
        )}
      </div>

      {showComments && comments.length > 0 && (
        <div className="mt-4 space-y-3">
          {comments.map((comment: any) => {
            const podeExcluir =
              comment.author_id === currentUserId ||
              currentUserRole === 'admin'

            const isDeleting = deletingCommentId === comment.id

            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <div className="flex min-w-0 gap-3">
                  <Link href={`/perfil/${comment.author?.username}`}>
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.08]">
                      {comment.author?.avatar_url ? (
                        <img
                          src={comment.author.avatar_url}
                          alt={comment.author?.name ?? 'Autor'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/40">
                          {(comment.author?.name ?? 'M').slice(0, 1)}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0">
                    <Link href={`/perfil/${comment.author?.username}`}>
                      <p className="text-[12px] font-bold text-white">
                        {comment.author?.name ?? 'Membro'}
                      </p>
                    </Link>

                    <p className="mt-1 break-words text-[13px] leading-relaxed text-white/65">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {podeExcluir && (
                  <button
                    type="button"
                    disabled={Boolean(deletingCommentId)}
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Excluir comentário"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-400/60 transition disabled:opacity-40"
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <form
          ref={formRef}
          action={handleCreate}
          className="mt-4"
          onSubmit={(event) => {
            if (submittingRef.current || isSubmitting) {
              event.preventDefault()
            }
          }}
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              name="content"
              disabled={isSubmitting}
              autoComplete="off"
              placeholder="Escreva um comentário..."
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-brand-500/50 focus:outline-none disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Publicando comentário' : 'Enviar comentário'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/15 text-brand-400 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  )
}