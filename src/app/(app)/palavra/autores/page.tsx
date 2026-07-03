import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Library, Star, UsersRound } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Autores da Palavra — Ministério Nova Aliança',
}

export default async function PalavraAutoresPage() {
  const supabase = await createSupabaseServerClient()

  const { data: palavras } = await supabase
    .from('palavra_do_dia')
    .select(`
      id,
      responsible_id,
      scheduled_date,
      responsible:profiles!responsible_id (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .order('scheduled_date', { ascending: false })

  const lista = (palavras ?? []) as any[]

  const map = new Map<string, any>()

  lista.forEach((palavra) => {
    const author = palavra.responsible
    if (!author?.id) return

    const current = map.get(author.id)

    if (current) {
      current.total += 1
      current.ultima =
        palavra.scheduled_date > current.ultima
          ? palavra.scheduled_date
          : current.ultima
      current.palavraIds.push(palavra.id)
    } else {
      map.set(author.id, {
        ...author,
        total: 1,
        ultima: palavra.scheduled_date,
        palavraIds: [palavra.id],
        favoritas: 0,
      })
    }
  })

  const autores = Array.from(map.values())

  const allIds = autores.flatMap((autor) => autor.palavraIds)

  if (allIds.length > 0) {
    const { data: favorites } = await supabase
      .from('palavra_favorites')
      .select('palavra_id')
      .in('palavra_id', allIds)

    const favMap = new Map<string, number>()

    ;((favorites ?? []) as any[]).forEach((fav) => {
      favMap.set(fav.palavra_id, (favMap.get(fav.palavra_id) ?? 0) + 1)
    })

    autores.forEach((autor) => {
      autor.favoritas = autor.palavraIds.reduce(
        (sum: number, id: string) => sum + (favMap.get(id) ?? 0),
        0
      )
    })
  }

  autores.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total
    return b.favoritas - a.favoritas
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Link
          href="/palavra"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/20 bg-white/[0.04] text-brand-300 backdrop-blur-xl active:scale-95"
        >
          <ArrowLeft size={19} />
        </Link>

        <header className="mt-5 mb-6">
          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
            Biblioteca espiritual
          </p>

          <h1 className="text-[30px] font-black text-white tracking-tight mt-1">
            Autores
          </h1>

          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Encontre palavras por quem compartilhou a reflexão.
          </p>
        </header>

        {autores.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 text-center">
            <UsersRound size={28} className="mx-auto mb-3 text-white/25" />
            <p className="font-bold text-white">Nenhum autor encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {autores.map((autor: any, index) => (
              <Link
                key={autor.id}
                href={`/palavra/autor/${autor.id}`}
                className="block"
              >
                <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-4 transition active:scale-[0.985]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/40 to-transparent" />

                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-brand-400/40 bg-white/[0.05] shadow-[0_0_24px_rgba(59,130,246,0.18)]">
                        {autor.avatar_url ? (
                          <img
                            src={autor.avatar_url}
                            alt={autor.name ?? 'Autor'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-black text-white/45">
                            {(autor.name ?? 'A').slice(0, 1)}
                          </div>
                        )}
                      </div>

                      {index < 3 && (
                        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/30 bg-[#1a1406] text-[13px]">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-black text-white">
                        {autor.name}
                      </p>

                      {autor.username && (
                        <p className="text-[12px] text-white/35">
                          @{autor.username}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/15 bg-brand-500/10 px-3 py-1 text-[10px] font-black text-brand-300">
                          <Library size={12} />
                          {autor.total} palavra{autor.total === 1 ? '' : 's'}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-400/10 px-3 py-1 text-[10px] font-black text-amber-200">
                          <Star size={12} className="fill-amber-200 text-amber-200" />
                          {autor.favoritas} favorita{autor.favoritas === 1 ? '' : 's'}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-white/30">
                        Última publicação em{' '}
                        {new Date(autor.ultima + 'T12:00:00').toLocaleDateString(
                          'pt-BR',
                          { day: 'numeric', month: 'long' }
                        )}
                      </p>
                    </div>

                    <ChevronRight size={18} className="shrink-0 text-white/25" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}