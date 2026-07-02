import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  UserRound,
  Clock3,
  ShieldCheck,
} from 'lucide-react'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getResponsavelPalavra } from '@/lib/palavra/actions'

export const metadata: Metadata = {
  title: 'Escala da Palavra',
}

function addDays(days: number) {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'pt-BR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  )
}

const ORDEM = [
  'João Victor',
  'Millena',
  'Matheus',
  'Nathalia',
  'Mirella',
  'Kelvin',
  'Klara',
  'Mariana',
  'Arthur',
  'Enzo',
  'Giovana',
]

export default async function EscalaAdminPage() {
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

  if (profile?.role !== 'admin') {
    redirect('/inicio')
  }

  const hoje = await getResponsavelPalavra(addDays(0))
  const amanha = await getResponsavelPalavra(addDays(1))

  const proximos = await Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      getResponsavelPalavra(addDays(i + 2))
    )
  )

  return (
    <div className="min-h-screen bg-[#050816] px-4 pt-10 pb-40 text-white">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin"
          className="w-11 h-11 rounded-full border border-brand-300/20 bg-white/[0.04] flex items-center justify-center text-brand-300"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-brand-400">
            Painel Admin
          </p>

          <h1 className="text-[30px] font-black">
            Escala da Palavra
          </h1>
        </div>
      </div>

      <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-500/5 p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck
            size={18}
            className="text-emerald-400"
          />

          <p className="font-bold text-emerald-300">
            Escala automática ativa
          </p>
        </div>

        <p className="text-sm text-white/55 leading-relaxed">
          O sistema calcula automaticamente quem é o
          responsável do dia. Você só precisa intervir
          quando alguém não puder participar.
        </p>
      </div>

      <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock3
            size={18}
            className="text-brand-300"
          />

          <h2 className="font-black text-lg">
            Hoje
          </h2>
        </div>

        <p className="text-2xl font-black">
          {hoje?.pending_profile?.name ??
            hoje?.user?.name ??
            'Sem responsável'}
        </p>

        <p className="text-sm text-white/40 mt-2">
          {formatDate(addDays(0))}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <button className="rounded-2xl border border-brand-300/15 bg-white/[0.04] py-3 text-xs font-bold">
            👤 Substituir
          </button>

          <button className="rounded-2xl border border-brand-300/15 bg-white/[0.04] py-3 text-xs font-bold">
            🔄 Próximo
          </button>

          <button className="rounded-2xl border border-red-400/20 bg-red-500/10 py-3 text-xs font-bold text-red-300">
            ❌ Cancelar
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserRound
            size={18}
            className="text-brand-300"
          />

          <h2 className="font-black text-lg">
            Amanhã
          </h2>
        </div>

        <p className="text-xl font-bold">
          {amanha?.pending_profile?.name ??
            amanha?.user?.name}
        </p>

        <p className="text-sm text-white/40 mt-2">
          {formatDate(addDays(1))}
        </p>
      </div>

      <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays
            size={18}
            className="text-brand-300"
          />

          <h2 className="font-black text-lg">
            Próximos responsáveis
          </h2>
        </div>

        <div className="space-y-3">
          {proximos.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4"
            >
              <div>
                <p className="font-semibold">
                  {item?.pending_profile?.name ??
                    item?.user?.name}
                </p>

                <p className="text-xs text-white/40 mt-1">
                  {formatDate(addDays(index + 2))}
                </p>
              </div>

              <CalendarDays
                size={16}
                className="text-white/30"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5 mt-6">
        <p className="text-[12px] font-black tracking-[0.22em] uppercase text-brand-400 mb-4">
          Ordem atual
        </p>

        <div className="grid grid-cols-2 gap-2">
          {ORDEM.map((nome, index) => (
            <div
              key={nome}
              className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3 text-sm"
            >
              {index + 1}. {nome}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}