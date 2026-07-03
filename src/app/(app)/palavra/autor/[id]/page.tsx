import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Sparkles,
  Star,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Palavras do Autor — Ministério Nova Aliança',
}

export default async function PalavraAutorPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const { data: authorData } = await supabase
  .from('profiles')
  .select('id, name, username, avatar_url, role')
  .eq('id', params.id)
  .single()

if (!authorData) notFound()

const author = authorData as any

  const { data: palavras } = await supabase
    .from('palavra_do_dia')
    .select('*')
    .eq('responsible_id', params.id)
    .eq('is_published', true)
    .order('scheduled_date', { ascending: false })

  const lista = (palavras ?? []) as any[]
  const palavraIds = lista.map((item) => item.id)

  const { count: favoritosRecebidos } =
    palavraIds.length > 0
      ? await supabase
          .from('palavra_favorites')
          .select('*', { count: 'exact', head: true })
          .in('palavra_id', palavraIds)
      : { count: 0 }

  const ultimaPublicacao = lista[0]?.scheduled_date

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

        <section className="mt-6 mb-7 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-brand-400/50 bg-white/[0.05] shadow-[0_0_40px_rgba(59,130,246,0.25)]">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.name ?? 'Autor'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/45">
                {(author.name ?? 'A').slice(0, 1)}
              </div>
            )}
          </div>

          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.24em] text-brand-400">
            Palavras de
          </p>

          <h1 className="mt-1 text-[28px] font-black tracking-tight text-white">
            {author.name}
          </h1>

          {author.username && (
            <p className="mt-1 text-sm text-white/40">@{author.username}</p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[22px] font-black text-white">
                {lista.length}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Palavras
              </p>
            </div>

            <div className="rounded-[22px] border border-amber-300/15 bg-amber-400/10 p-4">
              <p className="text-[22px] font-black text-amber-200">
                {favoritosRecebidos ?? 0}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/45">
                Favoritas
              </p>
            </div>

            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[14px] font-black text-white">
                {ultimaPublicacao
                  ? new Date(
                      ultimaPublicacao + 'T12:00:00'
                    ).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : '--'}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                Última
              </p>
            </div>
          </div>
        </section>

        {lista.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-white/25" />
            <p className="font-bold text-white">
              Nenhuma palavra publicada ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map((item: any) => (
              <Link key={item.id} href={`/palavra/${item.id}`} className="block">
                <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.04] p-4 transition active:scale-[0.985]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/40 to-transparent" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
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
                    </div>

                    <ChevronRight
                      size={18}
                      className="mt-1 shrink-0 text-white/25"
                    />
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