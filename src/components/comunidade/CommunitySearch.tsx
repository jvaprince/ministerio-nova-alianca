'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Users } from 'lucide-react'

type Profile = {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  role: string | null
}

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  leader: 'Líder',
  member: 'Membro',
}

export default function CommunitySearch({
  profiles,
}: {
  profiles: Profile[]
}) {
  const [query, setQuery] = useState('')

  const filteredProfiles = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return profiles

    return profiles.filter((profile) => {
      const name = profile.name?.toLowerCase() ?? ''
      const username = profile.username?.toLowerCase() ?? ''

      return name.includes(search) || username.includes(search)
    })
  }, [query, profiles])

  return (
    <>
      <div className="px-4 mb-5">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar pessoas..."
            className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="py-12 text-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <Users size={26} className="text-white/25 mx-auto mb-3" />

            <p className="text-white/60 text-sm font-semibold">
              Nenhuma pessoa encontrada.
            </p>

            <p className="text-white/30 text-xs mt-1">
              Tente buscar por outro nome ou username.
            </p>
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/perfil/${profile.username}`}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 active:scale-[0.99] transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.08]">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name ?? 'Membro'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-bold">
                    {(profile.name ?? 'M').slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white truncate">
                  {profile.name ?? 'Membro'}
                </p>

                {profile.username && (
                  <p className="text-[12px] text-white/35 truncate">
                    @{profile.username}
                  </p>
                )}
              </div>

              <span className="text-[11px] text-brand-400/80 font-semibold">
                {roleLabel[profile.role ?? 'member']}
              </span>
            </Link>
          ))
        )}
      </div>
    </>
  )
}