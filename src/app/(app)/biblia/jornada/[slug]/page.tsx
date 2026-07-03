import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { startJourney } from '@/lib/journeys/actions'
import { BookOpen, Clock, Flame, Sparkles, CheckCircle2 } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { notFound, redirect } from 'next/navigation'

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

export default async function JourneyDetailsPage({
  params,
}: {
  params: { slug: string }
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

  const { data: firstDays } = await supabase
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
        chapter_end
      )
    `)
    .eq('journey_id', jornada.id)
    .order('day_number', { ascending: true })
    .limit(5)

  const { data: userJourney } = await supabase
    .from('user_journeys')
    .select('*')
    .eq('user_id', user.id)
    .eq('journey_id', jornada.id)
    .maybeSingle()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/biblia/jornada" />

        <section className="mt-4 relative overflow-hidden rounded-[34px] border border-brand-300/20 bg-gradient-to-br from-brand-500/90 via-brand-500/70 to-brand-700/90 p-6 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-300/20 blur-3xl" />

          <div className="relative">
            <p className="text-white/75 text-[11px] uppercase tracking-[0.28em] font-black">
              Jornada Bíblica
            </p>

            <h1 className="text-[32px] font-black text-white mt-2 tracking-tight leading-tight">
              {jornada.title}
            </h1>

            <p className="text-white/75 mt-3 leading-relaxed">
              {jornada.description}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <PremiumCard className="p-3">
            <Clock size={17} className="relative text-brand-400 mb-2" />
            <p className="relative text-white font-black">{jornada.total_days}</p>
            <p className="relative text-white/35 text-xs">dias</p>
          </PremiumCard>

          <PremiumCard className="p-3">
            <BookOpen size={17} className="relative text-brand-400 mb-2" />
            <p className="relative text-white font-black">5–10</p>
            <p className="relative text-white/35 text-xs">min/dia</p>
          </PremiumCard>

          <PremiumCard className="p-3">
            <Flame size={17} className="relative text-brand-400 mb-2" />
            <p className="relative text-white font-black">Nível {jornada.level}</p>
            <p className="relative text-white/35 text-xs">início</p>
          </PremiumCard>
        </div>

        <section className="mt-8">
          <h2 className="text-white font-black text-lg mb-3">
            Como vai funcionar
          </h2>

          <div className="space-y-3">
            {[
              ['1', 'Leia o texto do dia', 'Você verá exatamente qual capítulo ler.'],
              ['2', 'Marque como concluído', 'Seu progresso, sequência e pontos serão atualizados.'],
              ['3', 'Avance na jornada', 'A cada dia você se aproxima de concluir a jornada.'],
            ].map(([number, title, description]) => (
              <PremiumCard key={number} className="p-4">
                <div className="relative flex gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-300 font-black shrink-0">
                    {number}
                  </div>

                  <div>
                    <p className="text-white font-bold">{title}</p>
                    <p className="text-white/45 text-sm mt-1">{description}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-white font-black text-lg mb-3">
            Primeiros dias
          </h2>

          <div className="space-y-3">
            {firstDays?.map((day: any) => {
              const reading = day.readings?.[0]

              return (
                <PremiumCard key={day.id} className="p-4">
                  <div className="relative flex gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-white/[0.05] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-brand-400" />
                    </div>

                    <div>
                      <p className="text-brand-400 text-xs font-black uppercase">
                        Dia {day.day_number}
                      </p>

                      <p className="text-white font-bold mt-1">
                        {day.title}
                      </p>

                      <p className="text-white/45 text-sm mt-1">
                        📖 {reading?.book} {reading?.chapter_start}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              )
            })}
          </div>
        </section>

        <div className="mt-8">
          {!userJourney ? (
            <form action={startJourney}>
              <input type="hidden" name="journey_id" value={jornada.id} />
              <input type="hidden" name="slug" value={jornada.slug} />

              <button
                type="submit"
                className="w-full h-14 rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
              >
                Começar Jornada
              </button>
            </form>
          ) : (
            <Link
              href={`/biblia/jornada/${jornada.slug}/plano`}
              className="w-full h-14 rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
            >
              <Sparkles size={18} />
              Ver meu plano
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}