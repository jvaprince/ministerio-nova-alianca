'use client'

import { Trash2 } from 'lucide-react'
import { excluirPostFeed } from '@/lib/feed/actions'

export default function DeleteFeedPostButton({ postId }: { postId: string }) {
  async function handleDelete() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta publicação?'
    )

    if (!confirmed) return

    await excluirPostFeed(postId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400"
    >
      <Trash2 size={15} />
    </button>
  )
}