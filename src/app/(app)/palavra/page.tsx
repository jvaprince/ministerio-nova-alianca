import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Feather,
  Library,
  UserRound,
} from 'lucide-react'
import {
  getPalavraDodia,
  getResponsavelPalavra,
  getPalavrasHistorico,
} from '@/lib/palavra/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PalavraHoje from '@/components/palavra/PalavraHoje'
import PalavraHojeLoading from '@/components/palavra/PalavraHojeLoading'
import ComentariosSection from '@/components/palavra/ComentariosSection'

export const metadata: Metadata = {
  title: 'Palavra do Dia — Ministério Nova Aliança',
}

function getHojeBrasil() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
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
      className={`relative overflow-hidden rounded-[30px] border border-brand-300/15 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

export default async function PalavraPage({
  searchParams,
}: {
  searchParams: { data?: string }
}) {
  const targetDate = searchParams.data ?? getHojeBrasil()
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role
  const responsavelHoje = await getResponsavelPalavra(targetDate)

  const podeGerir =
    role === 'admin' ||
    responsavelHoje?.user?.id === user.id ||
    responsavelHoje?.pending_profile?.linked_user_id === user.id

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-10 pb-4">
          <Link
            href="/inicio"
            className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/20 bg-white/[0.04] text-brand-300 backdrop-blur-xl active:scale-95"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
                ✦ Palavra do Dia
              </p>

              <h1 className="text-[24px] font-black text-white leading-tight tracking-tight mt-1">
                {new Date(targetDate + 'T12:00:00').toLocaleDateString(
                  'pt-BR',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }
                )}
              </h1>
            </div>

            {podeGerir && (
              <Link
                href="/palavra/criar"
                className="shrink-0 h-10 px-4 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 text-sm font-black active:scale-95"
              >
                Publicar
              </Link>
            )}
          </div>
        </div>

        <div className="px-5 mb-5 grid grid-cols-2 gap-2">
          <Link
            href="/palavra/historico"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-bold text-white/75 backdrop-blur-xl active:scale-[0.98] transition-all"
          >
            <Library size={16} />
            Histórico
          </Link>

          <Link
            href="/palavra/calendario"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-brand-300/15 bg-brand-500/10 py-3 text-sm font-bold text-brand-300 backdrop-blur-xl active:scale-[0.98] transition-all"
          >
            📅 Calendário
          </Link>

          <Link
            href="/palavra/favoritas"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-amber-300/15 bg-amber-400/10 py-3 text-sm font-bold text-amber-200 backdrop-blur-xl active:scale-[0.98] transition-all"
          >
            ⭐ Favoritas
          </Link>

          <Link
            href="/palavra/autores"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-purple-300/15 bg-purple-500/10 py-3 text-sm font-bold text-purple-200 backdrop-blur-xl active:scale-[0.98] transition-all"
          >
            👥 Autores
          </Link>
        </div>

        <Suspense fallback={<PalavraHojeLoading />}>
          <PalavraContent
            date={targetDate}
            podeGerir={podeGerir}
            userId={user.id}
          />
        </Suspense>
      </div>
    </div>
  )
}

async function PalavraContent({
  date,
  podeGerir,
  userId,
}: {
  date: string
  podeGerir: boolean
  userId: string
}) {
  const [palavra, responsavelHoje, historicoResult] = await Promise.all([
    getPalavraDodia(date),
    getResponsavelPalavra(date),
    getPalavrasHistorico(0, 30),
  ])

  const listaHistorico = (historicoResult.palavras ?? []) as any[]

  const outrasPalavras = listaHistorico
    .filter((item: any) => item.id !== (palavra as any)?.id)
    .slice(0, 5)

  const autoresMap = new Map<string, any>()

  listaHistorico.forEach((item: any) => {
    const author = item.responsible
    if (!author?.id) return

    const current = autoresMap.get(author.id)

    if (current) {
      current.total += 1
    } else {
      autoresMap.set(author.id, {
        ...author,
        total: 1,
      })
    }
  })

  const autoresDestaque = Array.from(autoresMap.values()).slice(0, 10)

  const nomeResponsavel =
    (responsavelHoje as any)?.pending_profile?.name ??
    (responsavelHoje as any)?.user?.name ??
    'Sem responsável'

  return (
    <>
      {palavra ? (
        <PalavraHoje
          palavra={palavra as any}
          userId={userId}
          podeGerir={podeGerir}
          comentariosSlot={<ComentariosSection palavraId={(palavra as any).id} />}
        />
      ) : (
        <div className="px-4">
          <PremiumCard className="p-5">
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-12 h-12 rounded-[22px] bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300">
                  <Feather size={22} />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                  Aguardando
                </span>
              </div>

              <h2 className="text-white font-black text-[21px] leading-tight">
                A Palavra de hoje ainda está sendo preparada.
              </h2>

              <p className="text-white/45 text-[13px] mt-3 leading-relaxed">
                Assim que for publicada, ela aparecerá aqui para todos refletirem juntos.
              </p>

              <div className="mt-5 rounded-[24px] border border-white/[0.07] bg-black/15 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/45 shrink-0">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <p className="text-[11px] font-black tracking-[0.22em] uppercase text-white/35">
                      Responsável de hoje
                    </p>

                    <p className="text-white font-black text-[15px] mt-1">
                      {nomeResponsavel}
                    </p>
                  </div>
                </div>
              </div>

              {podeGerir && (
                <Link
                  href="/palavra/criar"
                  className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-brand-500/15 border border-brand-300/20 px-4 py-3 text-brand-300 text-sm font-black active:scale-[0.98]"
                >
                  Publicar Palavra agora
                  <ChevronRight size={15} />
                </Link>
              )}
            </div>
          </PremiumCard>
        </div>
      )}

      <div className="px-4 mt-5 space-y-5">
        {autoresDestaque.length > 0 && (
          <section>
            <div className="px-1 mb-3 flex items-center justify-between">
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                Autores em destaque
              </p>

              <Link
                href="/palavra/autores"
                className="text-[11px] font-black text-brand-300"
              >
                Ver todos
              </Link>
            </div>

            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 pb-2">
                {autoresDestaque.map((autor: any) => (
                  <Link
                    key={autor.id}
                    href={`/palavra/autor/${autor.id}`}
                    className="shrink-0 text-center w-[82px] active:scale-95 transition"
                  >
                    <div className="mx-auto h-[66px] w-[66px] overflow-hidden rounded-full border-2 border-brand-400/45 bg-white/[0.05] p-1 shadow-[0_0_24px_rgba(59,130,246,0.18)]">
                      <div className="h-full w-full overflow-hidden rounded-full">
                        {autor.avatar_url ? (
                          <img
                            src={autor.avatar_url}
                            alt={autor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/45">
                            {(autor.name ?? 'A').slice(0, 1)}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 truncate text-[12px] font-black text-white">
                      {autor.name}
                    </p>

                    <p className="text-[11px] text-white/40">
                      {autor.total} palavra{autor.total === 1 ? '' : 's'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {outrasPalavras.length > 0 && (
          <section>
            <div className="px-1 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Library size={14} className="text-brand-400" />
                <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                  Confira outras palavras
                </p>
              </div>

              <Link
                href="/palavra/historico"
                className="text-[11px] font-black text-brand-300"
              >
                Ver todas
              </Link>
            </div>

            <div className="space-y-2">
              {outrasPalavras.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/palavra/${item.id}`}
                  className="block"
                >
                  <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] px-4 py-3 active:scale-[0.985] transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-bold text-[13px] truncate">
                          {item.responsible?.name ?? 'Responsável'}
                        </p>

                        <p className="text-white/35 text-[11px] mt-0.5">
                          {new Date(
                            item.scheduled_date + 'T12:00:00'
                          ).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>

                        {item.verse_ref && (
                          <p className="text-brand-300 text-[11px] font-black mt-2">
                            {item.verse_ref}
                          </p>
                        )}
                      </div>

                      <ChevronRight
                        size={16}
                        className="text-white/20 shrink-0 mt-1"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}