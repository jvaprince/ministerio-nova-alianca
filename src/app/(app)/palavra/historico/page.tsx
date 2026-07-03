import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPalavrasHistorico } from '@/lib/palavra/actions'
import PalavraHistoricoClient from '@/components/palavra/PalavraHistoricoClient'

export const metadata: Metadata = {
  title: 'Histórico de Palavras — Ministério Nova Aliança',
}

export default async function PalavraHistoricoPage() {
  const { palavras } = await getPalavrasHistorico(0, 80)
  const lista = (palavras ?? []) as any[]

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
          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
            Biblioteca espiritual
          </p>

          <h1 className="mt-1 text-[30px] font-black tracking-tight text-white">
            Histórico
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-white/45">
            Busque palavras por autor, data, tema ou referência bíblica.
          </p>
        </header>

        <PalavraHistoricoClient palavras={lista} />
      </div>
    </div>
  )
}