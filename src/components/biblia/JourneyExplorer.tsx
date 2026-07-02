'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Clock,
  Flame,
  ChevronRight,
  Search,
  Sprout,
  Heart,
  Brain,
  HandHeart,
  Crown,
  Shield,
  BookOpen,
} from 'lucide-react'

const CATEGORIES: Record<number, any> = {
  1: { title: 'Começando na Fé', short: 'Começando', icon: Sprout },
  2: { title: 'Crescimento Espiritual', short: 'Crescimento', icon: Flame },
  3: { title: 'Conhecimento e Sabedoria', short: 'Sabedoria', icon: Brain },
  4: { title: 'Vida Prática', short: 'Vida Prática', icon: Heart },
  5: { title: 'Caráter Cristão', short: 'Caráter', icon: Shield },
  6: { title: 'Liderança', short: 'Liderança', icon: Crown },
  7: { title: 'Desafios Bíblicos', short: 'Desafios', icon: BookOpen },
}

export default function JourneyExplorer({ journeys }: { journeys: any[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all')

  const filtered = useMemo(() => {
    return journeys.filter((journey) => {
      const matchesQuery =
        journey.title.toLowerCase().includes(query.toLowerCase()) ||
        journey.description?.toLowerCase().includes(query.toLowerCase())

      const matchesCategory =
  activeCategory === 'all' || Number(journey.category) === activeCategory

      return matchesQuery && matchesCategory
    })
  }, [journeys, query, activeCategory])

  const grouped = filtered.reduce((acc: Record<number, any[]>, journey) => {
    const category = Number(journey.category ?? 1)
    if (!acc[category]) acc[category] = []
    acc[category].push(journey)
    return acc
  }, {})

  return (
    <>
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar jornada..."
          className="w-full h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 text-white placeholder:text-white/30 outline-none focus:border-brand-500/50"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-7 -mx-5 px-5 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`whitespace-nowrap h-10 px-4 rounded-full border text-sm font-semibold ${
            activeCategory === 'all'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white/[0.05] text-white/60 border-white/[0.08]'
          }`}
        >
          Todos
        </button>

        {Object.entries(CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(Number(key))}
            className={`whitespace-nowrap h-10 px-4 rounded-full border text-sm font-semibold ${
              activeCategory === Number(key)
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white/[0.05] text-white/60 border-white/[0.08]'
            }`}
          >
            {category.short}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([categoryKey, items]: any) => {
          const category = CATEGORIES[Number(categoryKey)]
          const Icon = category?.icon ?? HandHeart

          return (
            <section key={categoryKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-400">
                  <Icon size={21} />
                </div>

                <div>
                  <h2 className="text-white font-bold text-xl">
                    {category?.title ?? 'Jornadas'}
                  </h2>

                  <p className="text-white/35 text-sm">
                    {items.length} jornadas
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((journey: any) => (
                  <Link
                    key={journey.id}
                    href={`/biblia/jornada/${journey.slug}`}
                    className="group block rounded-[30px] bg-white/[0.045] border border-white/[0.08] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {journey.title}
                        </h3>

                        <p className="text-white/45 text-sm mt-2 leading-relaxed line-clamp-2">
                          {journey.description}
                        </p>
                      </div>

                      <ChevronRight size={20} className="text-white/25 group-hover:text-white/60" />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <div className="rounded-full bg-black/20 border border-white/[0.06] px-3 py-1.5 flex items-center gap-1.5">
                        <Clock size={13} className="text-white/35" />
                        <span className="text-white/55 text-xs font-semibold">
                          {journey.total_days} dias
                        </span>
                      </div>

                      <div className="rounded-full bg-black/20 border border-white/[0.06] px-3 py-1.5 flex items-center gap-1.5">
                        <Flame size={13} className="text-white/35" />
                        <span className="text-white/55 text-xs font-semibold">
                          Nível {journey.level}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-6 text-center">
            <p className="text-white font-bold">
              Nenhuma jornada encontrada.
            </p>
            <p className="text-white/40 text-sm mt-1">
              Tente pesquisar por outro tema.
            </p>
          </div>
        )}
      </div>
    </>
  )
}