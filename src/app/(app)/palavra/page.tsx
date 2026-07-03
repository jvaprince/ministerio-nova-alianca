import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getPalavraDodia,
  getUltimaPalavraPublicada,
  getResponsavelPalavra,
} from '@/lib/palavra/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PalavraHoje from '@/components/palavra/PalavraHoje'
import PalavraVazia from '@/components/palavra/PalavraVazia'
import PalavraHojeLoading from '@/components/palavra/PalavraHojeLoading'
import ComentariosSection from '@/components/palavra/ComentariosSection'
import { redirect } from 'next/navigation'

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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
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
  const podeGerir = ['admin', 'leader'].includes(role ?? '')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-12 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              ✦ Palavra do Dia
            </p>

            <h1 className="text-[26px] font-black text-white leading-tight tracking-tight mt-1">
              {new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h1>
          </div>

          {podeGerir && (
            <a
              href="/palavra/criar"
              className="w-11 h-11 rounded-full border border-brand-300/25 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 text-xl font-bold shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
              aria-label="Criar palavra do dia"
            >
              +
            </a>
          )}
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
  const palavraResult = await getPalavraDodia(date)
  const palavra = palavraResult as any

  if (!palavra) {
    const ultimaPalavraResult = await getUltimaPalavraPublicada()
    const responsavelHojeResult = await getResponsavelPalavra(date)

    const ultimaPalavra = ultimaPalavraResult as any
    const responsavelHoje = responsavelHojeResult as any

    return (
      <>
        <PalavraVazia date={date} podeGerir={podeGerir} />

        {responsavelHoje && (
          <div className="mx-4 mt-4 mb-2">
            <PremiumCard className="p-4">
              <p className="relative text-[11px] font-black tracking-[0.24em] uppercase text-white/35 mb-2">
                Responsável de hoje
              </p>

              <p className="relative text-[16px] font-bold text-white">
                {responsavelHoje.pending_profile?.name ??
                  responsavelHoje.user?.name ??
                  'Sem responsável'}
              </p>

              <p className="relative text-[12px] text-white/40 mt-1">
                Aguardando publicação da Palavra do Dia.
              </p>
            </PremiumCard>
          </div>
        )}

        {ultimaPalavra && (
          <div className="mt-6">
            <div className="px-4 mb-3">
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                Última palavra publicada
              </p>
            </div>

            <PalavraHoje
              palavra={ultimaPalavra}
              userId={userId}
              podeGerir={podeGerir}
              comentariosSlot={<ComentariosSection palavraId={ultimaPalavra.id} />}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <PalavraHoje
      palavra={palavra}
      userId={userId}
      podeGerir={podeGerir}
      comentariosSlot={<ComentariosSection palavraId={palavra.id} />}
    />
  )
}