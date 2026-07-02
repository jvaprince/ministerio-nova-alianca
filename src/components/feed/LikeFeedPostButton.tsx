'use client'

import { Heart } from 'lucide-react'
import { toggleLikeFeedPost } from '@/lib/feed/actions'

export default function LikeFeedPostButton({
  postId,
  liked,
  likesCount,
}: {
  postId: string
  liked: boolean
  likesCount: number
}) {
  async function handleLike() {
    await toggleLikeFeedPost(postId)
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      className={`flex items-center gap-2 text-xs transition-colors ${
        liked ? 'text-red-400' : 'text-white/35'
      }`}
    >
      <Heart
        size={16}
        className={liked ? 'fill-red-400 text-red-400' : ''}
      />
      {likesCount > 0 ? `${likesCount} curtida${likesCount > 1 ? 's' : ''}` : 'Curtir'}
    </button>
  )
}