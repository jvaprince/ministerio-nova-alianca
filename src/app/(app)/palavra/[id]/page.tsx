import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPalavraById } from '@/lib/palavra/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PalavraHoje from '@/components/palavra/PalavraHoje'
import PalavraHojeLoading from '@/components/palavra/PalavraHojeLoading'
import ComentariosSection from '@/components/palavra/ComentariosSection'
import { notFound } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'Palavra — Ministério Nova Aliança',
}

export default async function PalavraIdPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const podeGerir = ['admin', 'leader'].includes(profile?.role ?? '')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-4">
          <BackButton href="/palavra" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              ✦ Palavra do Dia
            </p>

            <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
              Palavra
            </h1>
          </div>
        </div>

        <Suspense fallback={<PalavraHojeLoading />}>
          <PalavraIdContent
            id={params.id}
            userId={user!.id}
            podeGerir={podeGerir}
          />
        </Suspense>
      </div>
    </div>
  )
}

async function PalavraIdContent({
  id,
  userId,
  podeGerir,
}: {
  id: string
  userId: string
  podeGerir: boolean
}) {
  const palavra = await getPalavraById(id)
  if (!palavra) notFound()

  return (
    <PalavraHoje
      palavra={palavra}
      userId={userId}
      podeGerir={podeGerir}
      comentariosSlot={
        <Suspense
          fallback={
            <p className="text-[13px] text-white/25 py-2">
              Carregando comentários…
            </p>
          }
        >
          <ComentariosSection palavraId={id} />
        </Suspense>
      }
    />
  )
}