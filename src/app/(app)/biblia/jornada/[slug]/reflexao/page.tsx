import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { completeJourneyDayWithReflection } from '@/lib/journeys/actions'
import { submitQuiz } from '@/lib/journeys/submit-quiz'
import BackButton from '@/components/ui/BackButton'

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

export default async function JourneyReflectionPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { day?: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dayNumber = Number(searchParams?.day ?? 1)

  const { data: journey } = await supabase
    .from('journeys')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!journey) notFound()

  const jornada = journey as any

  const { data: journeyDay } = await supabase
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
    .eq('day_number', dayNumber)
    .single()

  if (!journeyDay) notFound()

  const diaJornada = journeyDay as any

  const { data: devotional } = await supabase
    .from('journey_day_devotionals')
    .select(`
      summary,
      reflection_question_1,
      reflection_question_2,
      reflection_question_3
    `)
    .eq('journey_day_id', diaJornada.id)
    .maybeSingle()

  const devocional = devotional as any

  const { data: quiz } = await supabase
    .from('journey_day_quizzes')
    .select('*')
    .eq('journey_day_id', diaJornada.id)
    .maybeSingle()

  const quizAtual = quiz as any

  const { data: userAnswer } = quizAtual
    ? await supabase
        .from('user_quiz_answers')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizAtual.id)
        .maybeSingle()
    : { data: null }

  const respostaUsuario = userAnswer as any

  const reading = diaJornada.readings?.[0]

  function formatReading(reading: any) {
    if (!reading) return ''

    if (reading.verse_start && reading.verse_end) {
      return `${reading.book} ${reading.chapter_start}:${reading.verse_start}-${reading.verse_end}`
    }

    if (reading.chapter_end && reading.chapter_start !== reading.chapter_end) {
      return `${reading.book} ${reading.chapter_start}-${reading.chapter_end}`
    }

    return `${reading.book} ${reading.chapter_start}`
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href={`/biblia/jornada/${jornada.slug}/plano`} />

        <header className="mt-4">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Diário espiritual
          </p>

          <h1 className="text-[32px] font-black text-white mt-2 tracking-tight leading-tight">
            O que Deus falou com você hoje?
          </h1>
        </header>

        <PremiumCard className="mt-5 p-5">
          <p className="relative text-white/45 text-sm">{jornada.title}</p>

          <h2 className="relative text-white font-black text-xl mt-1">
            Dia {diaJornada.day_number} — {diaJornada.title}
          </h2>

          {reading && (
            <p className="relative text-brand-400 font-semibold mt-3">
              📖 {formatReading(reading)}
            </p>
          )}

          <p className="relative text-white/45 text-sm mt-2 leading-relaxed">
            Escreva uma reflexão, entendimento ou algo que essa leitura falou ao seu coração.
          </p>
        </PremiumCard>

        {devocional && (
          <PremiumCard className="mt-5 border-brand-300/20 bg-brand-500/10 p-5">
            <p className="relative text-brand-400 text-xs uppercase tracking-widest font-black">
              Entendendo a Palavra
            </p>

            <p className="relative text-white/75 text-sm leading-relaxed mt-3">
              {devocional.summary}
            </p>
          </PremiumCard>
        )}

        <form action={completeJourneyDayWithReflection} className="mt-5 space-y-5">
          <input type="hidden" name="journey_id" value={jornada.id} />
          <input type="hidden" name="journey_day_id" value={diaJornada.id} />
          <input type="hidden" name="day_number" value={diaJornada.day_number} />

          {quizAtual && (
            <details className="group">
              <summary className="cursor-pointer list-none">
                <PremiumCard className="p-5">
                  <div className="relative flex items-center justify-between">
                    <span className="text-brand-400 text-xs uppercase tracking-widest font-black">
                      Quiz opcional
                    </span>

                    <span className="text-emerald-400 text-xs font-bold">
                      Recompensa extra
                    </span>
                  </div>
                </PremiumCard>
              </summary>

              <PremiumCard className="mt-3 p-5">
                <h3 className="relative text-white font-bold">
                  {quizAtual.question}
                </h3>

                <div className="relative mt-4 space-y-2">
                  {[
                    ['a', quizAtual.option_a],
                    ['b', quizAtual.option_b],
                    ['c', quizAtual.option_c],
                    ['d', quizAtual.option_d],
                  ]
                    .filter(([, option]) => option)
                    .map(([value, option]) => (
                      <label
                        key={value}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-brand-300/10 p-3 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <input
                          type="radio"
                          name="quiz_answer"
                          value={value}
                          className="accent-blue-500"
                          disabled={!!respostaUsuario}
                        />

                        <span className="text-white/80 text-sm">{option}</span>
                      </label>
                    ))}
                </div>

                {!respostaUsuario && (
                  <>
                    <input type="hidden" name="quiz_id" value={quizAtual.id} />

                    <button
                      type="submit"
                      formAction={submitQuiz}
                      className="w-full mt-4 h-11 rounded-2xl bg-brand-gradient text-white font-semibold"
                    >
                      Verificar resposta
                    </button>
                  </>
                )}

                <p className="relative mt-4 text-white/40 text-xs">
                  Responda apenas se desejar reforçar o aprendizado.
                </p>

                {respostaUsuario && (
                  <div
                    className={`relative mt-4 rounded-2xl p-4 ${
                      respostaUsuario.is_correct
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    <p className="text-white font-bold">
                      {respostaUsuario.is_correct
                        ? '✅ Correto!'
                        : '❌ Resposta incorreta'}
                    </p>

                    {quizAtual.explanation && (
                      <p className="text-white/70 text-sm mt-2">
                        {quizAtual.explanation}
                      </p>
                    )}
                  </div>
                )}
              </PremiumCard>
            </details>
          )}

          <div>
            <label className="block text-[11px] font-black tracking-widest uppercase text-white/35 mb-2">
              Sua reflexão
            </label>

            {devocional && (
              <PremiumCard className="mb-3 border-brand-300/20 bg-brand-500/10 p-4">
                <p className="relative text-brand-400 text-xs uppercase tracking-widest font-black">
                  Para refletir
                </p>

                <div className="relative mt-2 space-y-2">
                  {[
                    devocional.reflection_question_1,
                    devocional.reflection_question_2,
                    devocional.reflection_question_3,
                  ]
                    .filter(Boolean)
                    .map((question, index) => (
                      <p key={index} className="text-white/60 text-sm">
                        • {question}
                      </p>
                    ))}
                </div>
              </PremiumCard>
            )}

            <textarea
              name="reflection"
              rows={7}
              placeholder="Ex: Hoje entendi que Jesus continua comigo mesmo quando estou em meio às tempestades..."
              className="w-full rounded-[24px] bg-white/[0.05] border border-brand-300/15 px-4 py-4 text-white text-sm placeholder:text-white/25 outline-none resize-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            />
          </div>

          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-white/35 mb-3">
              Como foi sua leitura hoje?
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['dificil', '😕 Difícil entender'],
                ['boa', '🙂 Boa leitura'],
                ['impactante', '🔥 Muito impactante'],
                ['transformadora', '❤️ Transformadora'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="rounded-2xl bg-white/[0.04] border border-brand-300/10 p-3 text-sm text-white/75 transition-all active:scale-[0.98]"
                >
                  <input
                    type="radio"
                    name="feeling"
                    value={value}
                    className="mr-2 accent-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-white/[0.04] border border-brand-300/10 p-4 transition-all active:scale-[0.98]">
            <input
              type="checkbox"
              name="is_shared"
              className="mt-1 accent-blue-500"
            />

            <div>
              <p className="text-white font-semibold text-sm">
                Compartilhar minha reflexão no feed
              </p>

              <p className="text-white/40 text-xs mt-1">
                Outros membros poderão ler, curtir e comentar sua reflexão.
              </p>
            </div>
          </label>

          <button
            type="submit"
            className="w-full h-13 rounded-2xl border border-brand-300/25 bg-brand-gradient text-white font-bold shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98]"
          >
            Finalizar dia
          </button>
        </form>
      </div>
    </div>
  )
}