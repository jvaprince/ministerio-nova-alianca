import { UserCheck, UserPlus } from 'lucide-react'
import { toggleFollowProfile } from '@/lib/perfil/follow-actions'

type FollowButtonProps = {
  profileId: string
  username: string
  isFollowing: boolean
}

export default function FollowButton({
  profileId,
  username,
  isFollowing,
}: FollowButtonProps) {
  return (
    <form
      action={async () => {
        'use server'
        await toggleFollowProfile(profileId, username)
      }}
      className="mt-4"
    >
      <button
        type="submit"
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
          isFollowing
            ? 'bg-white/[0.08] text-white border border-white/[0.12]'
            : 'bg-brand-500 text-white'
        }`}
      >
        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
    </form>
  )
}