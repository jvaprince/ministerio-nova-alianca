'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
}

export default function FeedPeopleSearch() {
  const supabase = createSupabaseClient()
  const [search, setSearch] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      const term = search.trim()

      if (term.length < 2) {
        setProfiles([])
        return
      }

      setLoading(true)

      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .or(`name.ilike.%${term}%,username.ilike.%${term}%`)
        .eq('is_system', false)
        .not('username', 'is', null)
        .limit(8)

      setProfiles(data ?? [])
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, supabase])

  return (
    <div className="relative">
      <div className="h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center gap-3 px-4">
        <Search size={17} className="text-white/35" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar pessoas..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setProfiles([])
            }}
            className="text-white/35"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {search.trim().length >= 2 && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl bg-[#101010] border border-white/[0.08] overflow-hidden shadow-xl">
          {loading ? (
            <p className="px-4 py-4 text-sm text-white/40">Buscando...</p>
          ) : profiles.length === 0 ? (
            <p className="px-4 py-4 text-sm text-white/40">
              Nenhum perfil encontrado.
            </p>
          ) : (
            profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/perfil/${profile.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]"
                onClick={() => setSearch('')}
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.08]">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name ?? 'Perfil'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-bold">
                      {(profile.name ?? 'M').slice(0, 1)}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {profile.name ?? 'Membro'}
                  </p>
                  <p className="text-xs text-white/35">
                    @{profile.username}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}