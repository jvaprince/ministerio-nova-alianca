'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, Calendar, ChevronRight, Music, Search } from 'lucide-react'

function formatDate(date?: string | null) {
  if (!date) return null

  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

function PremiumCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_18px_45px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      {children}
    </div>
  )
}

export default function LouvoresBibliotecaClient({ sets }: { sets: any[] }) {
  const [search, setSearch] = useState('')

  const filtrados = useMemo(() => {
    const termo = search.trim().toLowerCase()

    if (!termo) return sets

    return sets.filter((set) => {
      const date = set.event?.event_date ?? set.worship_date

      const texto = [
        set.title,
        set.description,
        set.event?.title,
        set.event?.location,
        date,
        ...(set.songs ?? []).map((song: any) => song.title),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return texto.includes(termo)
    })
  }, [sets, search])

  return (
    <section>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por repertório, evento ou música..."
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-300/35"
        />
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between px-1">
        <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
          Biblioteca de repertórios
        </p>

        <p className="text-[11px] font-black text-white/30">
          {filtrados.length}
        </p>
      </div>

      {filtrados.length === 0 ? (
        <PremiumCard className="p-8 text-center">
          <Archive size={30} className="relative mx-auto mb-3 text-white/25" />

          <p className="relative font-bold text-white">
            Nenhum repertório encontrado
          </p>

          <p className="relative mt-1 text-sm text-white/40">
            Tente buscar por outro louvor, culto ou data.
          </p>
        </PremiumCard>
      ) : (
        <div className="space-y-3">
          {filtrados.map((set: any) => {
            const date = set.event?.event_date ?? set.worship_date
            const songs = set.songs ?? []

            return (
              <Link
                key={set.id}
                href={`/louvores/${set.id}`}
                className="block transition-all duration-300 active:scale-[0.985]"
              >
                <PremiumCard className="p-4">
                  <div className="relative flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-300/15 bg-brand-500/15 text-brand-300">
                      <Music size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-white">
                        {set.title}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                        <Calendar size={12} />
                        {set.event?.title
                          ? `${set.event.title} • ${formatDate(set.event.event_date)}`
                          : formatDate(date)}
                      </p>

                      {songs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {songs.slice(0, 4).map((song: any) => (
                            <span
                              key={song.id}
                              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/45"
                            >
                              {song.title}
                            </span>
                          ))}

                          {songs.length > 4 && (
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/35">
                              +{songs.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black text-white/70">
                        {songs.length}
                      </p>
                      <p className="text-[10px] text-white/25">músicas</p>
                    </div>

                    <ChevronRight size={17} className="mt-1 text-white/25" />
                  </div>
                </PremiumCard>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}