import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BookOpen, CheckCircle2, Flame, Trophy } from 'lucide-react'
import { undoJourneyDay } from '@/lib/journeys/actions'
import BackButton from '@/components/ui/BackButton'
import PointsToast from '@/components/ui/PointsToast'

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

function formatReading(reading: any) {
  if (!reading) return ''

  const sameChapter = reading.chapter_start === reading.chapter_end

  if (reading.verse_start && reading.verse_end) {
    return `${reading.book} ${reading.chapter_start}:${reading.verse_start}-${reading.verse_end}`
  }

  if (!sameChapter && reading.chapter_end) {
    return `${reading.book} ${reading.chapter_start}-${reading.chapter_end}`
  }

  return `${reading.book} ${reading.chapter_start}`
}

export default async function JourneyPlanPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: {
    awarded?: string
    points?: string
    message?: string
  }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: journey } = await supabase
    .from('journeys')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!journey) notFound()

  const jornada = journey as any

  const { data: userJourney } = await supabase
    .from('user_journeys')
    .select('*')
    .eq('user_id', user.id)
    .eq('journey_id', jornada.id)
    .maybeSingle()

  const jornadaUsuario = userJourney as any

  if (!jornadaUsuario) redirect(`/biblia/jornada/${jornada.slug}`)

  const { data: days } = await supabase
    .from('journey_days')
    .select(`
      id,
      day_number,
      title,
      description,
      estimated_minutes,
      readings:journey_day_readings (
        book,
        chapter_start,
        chapter_end,
        verse_start,
        verse_end
      )
    `)
    .eq('journey_id', jornada.id)
    .order('day_number', { ascending: true })

  const { data: progress } = await supabase
    .from('user_journey_progress')
    .select('day_number')
    .eq('user_id', user.id)
    .eq('journey_id', jornada.id)

  const listaProgress = (progress ?? []) as any[]
  const listaDays = (days ?? []) as any[]

  const completedDays = new Set(listaProgress.map((p) => p.day_number))
  const currentDay = jornadaUsuario.current_day ?? 1

  const percent = Math.round(
    (jornadaUsuario.completed_days / jornada.total_days) * 100
  )

  const currentDayCompleted = completedDays.has(currentDay)
  const currentDayData = listaDays.find((d) => d.day_number === currentDay)
  const currentReading = currentDayData?.readings?.[0]

  const awarded = searchParams?.awarded === 'true'
  const rewardPoints = Number(searchParams?.points ?? 0)
  const rewardMessage = searchParams?.message

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52">
      {rewardMessage && (
        <PointsToast
          awarded={awarded}
          points={rewardPoints}
          message={rewardMessage}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/biblia/jornada" />

        <header className="mt-4">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Meu plano de leitura
          </p>

          <h1 className="text-[32px] font-black text-white mt-2 tracking-tight leading-tight">
            {jornada.title}
          </h1>
        </header>

        <PremiumCard className="mt-6 p-5">
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-white/45 text-sm">Progresso</p>
              <p className="text-white font-black text-2xl">{percent}%</p>
            </div>

            <div className="text-right">
              <p className="text-white/45 text-sm">Dia atual</p>
              <p className="text-white font-black text-2xl">
                {currentDay} de {jornada.total_days}
              </p>
            </div>
          </div>

          <div className="relative mt-4 w-full h-3 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-400 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="relative grid grid-cols-3 gap-2 mt-5">
            <div className="rounded-2xl bg-black/20 border border-white/[0.06] p-3">
              <BookOpen size={16} className="text-brand-400 mb-2" />
              <p className="text-white font-bold">{jornadaUsuario.completed_days}</p>
              <p className="text-white/35 text-xs">dias lidos</p>
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/[0.06] p-3">
              <Flame size={16} className="text-brand-400 mb-2" />
              <p className="text-white font-bold">{jornadaUsuario.streak}</p>
              <p className="text-white/35 text-xs">sequência</p>
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/[0.06] p-3">
              <Trophy size={16} className="text-brand-400 mb-2" />
              <p className="text-white font-bold">{jornadaUsuario.total_points}</p>
              <p className="text-white/35 text-xs">pontos</p>
            </div>
          </div>
        </PremiumCard>

        {jornadaUsuario.completed_days > 0 && (
          <PremiumCard className="mt-5 border-emerald-400/20 bg-emerald-500/10 p-5">
            <p className="relative text-emerald-400 text-xs font-black uppercase tracking-widest">
              Última conquista
            </p>

            <h2 className="relative text-white font-black text-xl mt-2">
              🎉 Dia {currentDay - 1} concluído
            </h2>

            <div className="relative grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-2xl bg-black/20 p-3 text-center">
                <p className="text-white font-bold">+100</p>
                <p className="text-white/35 text-xs">pontos</p>
              </div>

              <div className="rounded-2xl bg-black/20 p-3 text-center">
                <p className="text-white font-bold">{jornadaUsuario.streak}</p>
                <p className="text-white/35 text-xs">sequência</p>
              </div>

              <div className="rounded-2xl bg-black/20 p-3 text-center">
                <p className="text-white font-bold">{percent}%</p>
                <p className="text-white/35 text-xs">progresso</p>
              </div>
            </div>

            <form
              action={undoJourneyDay.bind(null, jornada.id, currentDay - 1)}
              className="relative mt-4"
            >
              <button
                type="submit"
                className="w-full h-11 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 font-semibold transition-all active:scale-[0.98]"
              >
                Desfazer conclusão
              </button>
            </form>
          </PremiumCard>
        )}

        {currentDayData && currentReading && (
          <PremiumCard className="mt-5 border-brand-300/20 bg-brand-500/10 p-5">
            <p className="relative text-brand-400 text-xs font-black uppercase tracking-widest">
              Leitura de hoje
            </p>

            <h2 className="relative text-white font-black text-xl mt-2">
              Dia {currentDay} — {currentDayData.title}
            </h2>

            <p className="relative text-white/50 text-sm mt-2 leading-relaxed">
              {currentDayData.description}
            </p>

            <p className="relative text-white font-bold mt-4">
              📖 {formatReading(currentReading)}
            </p>

            <p className="relative text-white/45 text-sm mt-1">
              ⏱️ {currentDayData.estimated_minutes} minutos
            </p>

            <Link
              href={`/biblia/${currentReading.book}/${currentReading.chapter_start}?backToJourney=${jornada.slug}`}
              className="relative mt-5 h-12 rounded-2xl border border-brand-300/25 bg-brand-gradient flex items-center justify-center text-white font-bold shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
            >
              Continuar leitura
            </Link>

            {currentDayCompleted ? (
              <div className="relative mt-3 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                ✓ Dia concluído
              </div>
            ) : (
              <Link
                href={`/biblia/jornada/${jornada.slug}/reflexao?day=${currentDay}`}
                className="relative mt-3 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.16)] transition-all active:scale-[0.98]"
              >
                ✓ Concluir Dia
              </Link>
            )}
          </PremiumCard>
        )}

        <details className="mt-8 group">
          <summary className="cursor-pointer list-none">
            <PremiumCard className="p-4">
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-lg">
                    Plano completo
                  </h2>

                  <p className="text-white/35 text-xs mt-1">
                    Ver todos os {jornada.total_days} dias da jornada
                  </p>
                </div>

                <span className="text-white/35 group-open:rotate-90 transition-transform">
                  →
                </span>
              </div>
            </PremiumCard>
          </summary>

          <div className="space-y-2 mt-3">
            {listaDays.map((day: any) => {
              const reading = day.readings?.[0]
              const completed = completedDays.has(day.day_number)
              const isCurrent = day.day_number === currentDay

              return (
                <div
                  key={day.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 ${
                    isCurrent
                      ? 'bg-brand-500/12 border-brand-500/25'
                      : completed
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-white/[0.04] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-brand-400 text-xs font-bold uppercase">
                        Dia {day.day_number}
                      </p>

                      <p className="text-white font-bold mt-1">
                        {day.title}
                      </p>

                      <p className="text-white/45 text-sm mt-1">
                        📖 {formatReading(reading)}
                      </p>
                    </div>

                    {completed && (
                      <CheckCircle2
                        size={20}
                        className="text-emerald-400 shrink-0"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      </div>
    </div>
  )
}