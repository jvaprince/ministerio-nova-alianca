import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'Calendário Espiritual — Ministério Nova Aliança',
}

function getHojeBrasil() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

export default async function PalavraCalendarioPage({
  searchParams,
}: {
  searchParams: { mes?: string }
}) {
  const hoje = getHojeBrasil()
  const baseDate = searchParams.mes
    ? new Date(searchParams.mes + '-01T12:00:00')
    : new Date(hoje + 'T12:00:00')

  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const firstDay = new Date(year, month, 1, 12)
  const lastDay = new Date(year, month + 1, 0, 12)

  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const monthStart = toDateKey(firstDay)
  const monthEnd = toDateKey(lastDay)

  const supabase = await createSupabaseServerClient()

  const { data: palavras } = await supabase
    .from('palavra_do_dia')
    .select(`
      id,
      scheduled_date,
      verse_ref,
      responsible:profiles!responsible_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .gte('scheduled_date', monthStart)
    .lte('scheduled_date', monthEnd)

  const palavrasMap = new Map(
    ((palavras ?? []) as any[]).map((palavra) => [
      palavra.scheduled_date,
      palavra,
    ])
  )

  const prevMonth = new Date(year, month - 1, 1, 12)
  const nextMonth = new Date(year, month + 1, 1, 12)

  const cells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1
      const date = new Date(year, month, day, 12)
      return toDateKey(date)
    }),
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mb-5">
  <BackButton href="/palavra" />
</div>

        <header className="mt-5 mb-6">
          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
            Biblioteca espiritual
          </p>

          <h1 className="text-[30px] font-black text-white tracking-tight mt-1">
            Calendário
          </h1>

          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Acompanhe as Palavras publicadas em cada dia.
          </p>
        </header>

        <section className="rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-5">
            <Link
              href={`/palavra/calendario?mes=${toDateKey(prevMonth).slice(0, 7)}`}
              className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/45"
            >
              <ChevronLeft size={18} />
            </Link>

            <div className="text-center">
              <p className="text-white font-black text-[18px] capitalize">
                {baseDate.toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              <p className="text-white/35 text-[11px] mt-1">
                {palavrasMap.size} palavra
                {palavrasMap.size === 1 ? '' : 's'} publicada
                {palavrasMap.size === 1 ? '' : 's'}
              </p>
            </div>

            <Link
              href={`/palavra/calendario?mes=${toDateKey(nextMonth).slice(0, 7)}`}
              className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/45"
            >
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="text-center text-[10px] font-black text-white/30"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const palavra = palavrasMap.get(date)
              const isToday = date === hoje
              const dayNumber = Number(date.split('-')[2])

              return (
                <Link
                  key={date}
                  href={`/palavra?data=${date}`}
                  className={`
                    relative aspect-square rounded-2xl border flex flex-col items-center justify-center transition active:scale-95
                    ${
                      palavra
                        ? 'border-brand-300/25 bg-brand-500/15 text-white shadow-[0_0_18px_rgba(59,130,246,0.12)]'
                        : 'border-white/[0.06] bg-white/[0.025] text-white/35'
                    }
                    ${
                      isToday
                        ? 'ring-2 ring-amber-300/50'
                        : ''
                    }
                  `}
                >
                  <span className="text-[15px] font-black">
                    {dayNumber}
                  </span>

                  {palavra && (
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-300" />
                  )}

                  {isToday && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-brand-300/15 bg-brand-500/10 px-3 py-3">
              <p className="text-[15px] font-black text-white">
                {palavrasMap.size}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mt-1">
                Publicadas
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-amber-400/10 px-3 py-3">
              <p className="text-[15px] font-black text-amber-200">
                {hoje.slice(8)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100/45 mt-1">
                Hoje
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3">
              <p className="text-[15px] font-black text-white">
                {totalDays}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mt-1">
                Dias
              </p>
            </div>
          </div>
        </section>

        {palavrasMap.size > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={14} className="text-brand-400" />
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                Palavras do mês
              </p>
            </div>

            <div className="space-y-2">
              {((palavras ?? []) as any[])
                .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
                .map((palavra) => (
                  <Link
                    key={palavra.id}
                    href={`/palavra?data=${palavra.scheduled_date}`}
                    className="block rounded-[22px] border border-white/[0.07] bg-white/[0.035] px-4 py-3 active:scale-[0.985] transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-bold text-[13px]">
                          {new Date(
                            palavra.scheduled_date + 'T12:00:00'
                          ).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>

                        <p className="text-white/35 text-[11px] mt-0.5">
                          {palavra.responsible?.name ?? 'Responsável'}
                        </p>

                        {palavra.verse_ref && (
                          <p className="text-brand-300 text-[11px] font-black mt-2">
                            {palavra.verse_ref}
                          </p>
                        )}
                      </div>

                      <ChevronRight size={16} className="text-white/20 shrink-0" />
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}