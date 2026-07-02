'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
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
  const formRef = useRef<HTMLFormElement>(null)

  async function handleCreate(formData: FormData) {
    await criarComentarioFeed(postId, formData)
    formRef.current?.reset()
    setShowForm(false)
    setShowComments(true)
  }

  async function handleDelete(commentId: string) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este comentário?'
    )

    if (!confirmed) return

    await excluirComentarioFeed(commentId)
  }

  return (
    <div className="px-4 py-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-5 text-white/35">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-xs"
        >
          <MessageCircle size={16} />
          Comentar
        </button>

        {comments.length > 0 && (
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-white/35"
          >
            {showComments
              ? 'Ocultar comentários'
              : `Mostrar ${comments.length} comentário${comments.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {showComments && comments.length > 0 && (
        <div className="mt-4 space-y-3">
          {comments.map((comment: any) => {
            const podeExcluir =
              comment.author_id === currentUserId ||
              currentUserRole === 'admin' ||
              currentUserRole === 'leader'

            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3"
              >
                <div className="flex gap-3">
                  <Link href={`/perfil/${comment.author?.username}`}>
                    <div className="w-8 h-8 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.08]">
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
                      <p className="text-[12px] font-bold text-white">
                        {comment.author?.name ?? 'Membro'}
                      </p>
                    </Link>

                    <p className="text-[13px] text-white/65 leading-relaxed mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {podeExcluir && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-400/60 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <form ref={formRef} action={handleCreate} className="flex gap-2 mt-4">
          <input
            name="content"
            placeholder="Escreva um comentário..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
          />

          <button
            type="submit"
            className="w-11 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-400"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  )
}