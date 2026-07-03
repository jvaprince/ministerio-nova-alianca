import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Heart,
} from 'lucide-react'
import { getPalavrasFavoritas } from '@/lib/palavra/actions'

export const metadata: Metadata = {
  title: 'Palavras Favoritas — Ministério Nova Aliança',
}

export default async function PalavraFavoritasPage() {
  const favoritas = (await getPalavrasFavoritas()) as any[]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Link
          href="/palavra"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/20 bg-white/[0.04] text-brand-300 backdrop-blur-xl"
        >
          <ArrowLeft size={19} />
        </Link>

        <header className="mt-5 mb-6">
          <div className="flex items-center gap-2">
            <Heart
              size={16}
              className="fill-amber-300 text-amber-300"
            />

            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              Biblioteca espiritual
            </p>
          </div>

          <h1 className="text-[30px] font-black text-white tracking-tight mt-1">
            Favoritas
          </h1>

          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Palavras que marcaram sua caminhada.
          </p>
        </header>

        {favoritas.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 text-center">
            <Heart
              size={28}
              className="mx-auto mb-3 text-white/25"
            />

            <p className="font-bold text-white">
              Nenhuma palavra salva ainda.
            </p>

            <p className="mt-2 text-sm text-white/40">
              Toque na estrela ⭐ de uma Palavra para
              salvá-la aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoritas.map((item: any) => {
              const palavra = item.palavra

              return (
                <Link
                  key={palavra.id}
                  href={`/palavra/${palavra.id}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.04] p-4 transition active:scale-[0.985]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/40 to-transparent" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[12px] text-white/35">
                          <CalendarDays size={14} />

                          {new Date(
                            palavra.scheduled_date + 'T12:00:00'
                          ).toLocaleDateString(
                            'pt-BR',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.05]">
                            {palavra.responsible?.avatar_url ? (
                              <img
                                src={
                                  palavra.responsible.avatar_url
                                }
                                alt={
                                  palavra.responsible.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/35 text-xs font-bold">
                                {(
                                  palavra.responsible
                                    ?.name ?? 'M'
                                )
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-[14px] font-black text-white">
                              {palavra.responsible?.name ??
                                'Responsável'}
                            </p>

                            {palavra.responsible
                              ?.username && (
                              <p className="text-[11px] text-white/35">
                                @
                                {
                                  palavra.responsible
                                    .username
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {palavra.verse && (
                          <p className="mt-4 line-clamp-3 text-[14px] leading-relaxed text-white/65">
                            "{palavra.verse}"
                          </p>
                        )}

                        {palavra.verse_ref && (
                          <p className="mt-3 text-[12px] font-black text-brand-300">
                            {palavra.verse_ref}
                          </p>
                        )}
                      </div>

                      <ChevronRight
                        size={18}
                        className="mt-1 shrink-0 text-white/25"
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}