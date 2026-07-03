'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronRight,
  Library,
  Search,
} from 'lucide-react'

export default function PalavraHistoricoClient({ palavras }: { palavras: any[] }) {
  const [search, setSearch] = useState('')
  const [autor, setAutor] = useState('todos')
  const [mes, setMes] = useState('todos')

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const autores = useMemo(() => {
    const map = new Map<string, any>()

    palavras.forEach((item) => {
      const responsible = item.responsible
      if (!responsible?.name) return

      if (!map.has(responsible.name)) {
        map.set(responsible.name, responsible)
      }
    })

    return Array.from(map.values())
  }, [palavras])

  const filtradas = useMemo(() => {
    const termo = search.toLowerCase().trim()

    return palavras.filter((item) => {
      const texto = [
        item.responsible?.name,
        item.responsible?.username,
        item.verse,
        item.verse_ref,
        item.reflection,
        item.scheduled_date,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchBusca = !termo || texto.includes(termo)
      const matchAutor =
        autor === 'todos' || item.responsible?.name === autor

      const mesPalavra = new Date(
        item.scheduled_date + 'T12:00:00'
      ).getMonth()

      const matchMes = mes === 'todos' || mesPalavra === Number(mes)

      return matchBusca && matchAutor && matchMes
    })
  }, [palavras, search, autor, mes])

  return (
    <div>
      <div className="mb-5 space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por versículo, autor, tema..."
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-300/35"
          />
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => setAutor('todos')}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                autor === 'todos'
                  ? 'border-brand-300/30 bg-brand-500/15 text-brand-300'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/45'
              }`}
            >
              Todos
            </button>

            {autores.map((responsible: any) => (
              <button
                key={responsible.name}
                type="button"
                onClick={() => setAutor(responsible.name)}
                className={`shrink-0 flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-black transition ${
                  autor === responsible.name
                    ? 'border-brand-300/30 bg-brand-500/15 text-brand-300'
                    : 'border-white/[0.08] bg-white/[0.04] text-white/55'
                }`}
              >
                <div className="h-7 w-7 overflow-hidden rounded-full bg-white/[0.08] border border-white/[0.08]">
                  {responsible.avatar_url ? (
                    <img
                      src={responsible.avatar_url}
                      alt={responsible.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/45">
                      {responsible.name.slice(0, 1)}
                    </div>
                  )}
                </div>

                {responsible.name}
              </button>
            ))}
          </div>
        </div>

        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="w-full rounded-2xl border border-white/[0.08] bg-[#0b1020] px-3 py-3 text-xs font-bold text-white/70 outline-none"
        >
          <option value="todos">Todos os meses</option>

          {meses.map((nome, index) => (
            <option key={index} value={index}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 text-center">
          <Library size={28} className="mx-auto mb-3 text-white/25" />
          <p className="font-bold text-white">Nenhuma palavra encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((item: any) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.04] p-4 transition active:scale-[0.985]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/40 to-transparent" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/palavra/${item.id}`} className="block">
                    <div className="flex items-center gap-2 text-[12px] text-white/35">
                      <CalendarDays size={14} />
                      {new Date(
                        item.scheduled_date + 'T12:00:00'
                      ).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </Link>

                  {item.responsible?.id ? (
                    <Link
                      href={`/palavra/autor/${item.responsible.id}`}
                      className="mt-3 flex w-fit items-center gap-2"
                    >
                      <div className="h-7 w-7 overflow-hidden rounded-full bg-white/[0.08] border border-white/[0.08]">
                        {item.responsible?.avatar_url ? (
                          <img
                            src={item.responsible.avatar_url}
                            alt={item.responsible?.name ?? 'Responsável'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/45">
                            {(item.responsible?.name ?? 'R').slice(0, 1)}
                          </div>
                        )}
                      </div>

                      <p className="truncate text-[15px] font-black text-white">
                        {item.responsible?.name ?? 'Responsável'}
                      </p>
                    </Link>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-7 w-7 overflow-hidden rounded-full bg-white/[0.08] border border-white/[0.08]">
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-white/45">
                          R
                        </div>
                      </div>

                      <p className="truncate text-[15px] font-black text-white">
                        Responsável
                      </p>
                    </div>
                  )}

                  <Link href={`/palavra/${item.id}`} className="block">
                    {item.verse && (
                      <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-white/65">
                        “{item.verse}”
                      </p>
                    )}

                    {item.verse_ref && (
                      <p className="mt-3 text-[12px] font-black text-brand-300">
                        {item.verse_ref}
                      </p>
                    )}
                  </Link>
                </div>

                <Link href={`/palavra/${item.id}`} className="mt-1 shrink-0">
                  <ChevronRight size={18} className="text-white/25" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}