import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import BackButton from '@/components/ui/BackButton'

function PremiumCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

export default async function SeguidoresPage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const username = decodeURIComponent(params.username).replace('@', '')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, username, name')
    .eq('username', username)
    .single()

  if (!profileData) notFound()

  const profile = profileData as any

  const { data: followersData } = await supabase
    .from('followers')
    .select(`
      follower:profiles!followers_follower_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('following_id', profile.id)
    .order('created_at', { ascending: false })

  const followers = (followersData ?? []) as any[]
  const hasFollowers = followers.length > 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href={`/perfil/${profile.username}`} />

        <header className="mt-4 mb-6">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Perfil
          </p>

          <h1 className="text-[32px] font-black text-white mt-2 tracking-tight">
            Seguidores
          </h1>
        </header>

        {!hasFollowers ? (
          <PremiumCard className="p-8 text-center">
            <Users size={30} className="relative text-white/25 mx-auto mb-3" />

            <p className="relative text-sm font-semibold text-white/70">
              Sem seguidores ainda
            </p>

            <p className="relative text-xs text-white/35 mt-1">
              Quando alguém seguir este perfil, aparecerá aqui.
            </p>
          </PremiumCard>
        ) : (
          <div className="space-y-3">
            {followers.map((item: any) => {
              const follower = Array.isArray(item.follower)
                ? item.follower[0]
                : item.follower

              if (!follower) return null

              return (
                <Link
                  key={follower.id}
                  href={`/perfil/${follower.username}`}
                  className="block transition-all duration-300 active:scale-[0.985]"
                >
                  <PremiumCard className="p-3">
                    <div className="relative flex items-center gap-3">
                      {follower.avatar_url ? (
                        <img
                          src={follower.avatar_url}
                          alt={follower.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-400/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold ring-2 ring-brand-400/30">
                          {getInitials(follower.name ?? 'NA')}
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-white">
                          {follower.name}
                        </p>

                        <p className="text-sm text-white/45">
                          @{follower.username}
                        </p>
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}