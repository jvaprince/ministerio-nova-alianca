import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import JourneyExplorer from '@/components/biblia/JourneyExplorer'

export default async function JornadasPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: journeys } = await supabase
    .from('journeys')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('level', { ascending: true })
    .order('total_days', { ascending: true })

  const { data: activeJourney } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        title,
        slug,
        total_days
      )
    `)
    .eq('user_id', user!.id)
    .eq('is_completed', false)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const jornadaAtiva = activeJourney as any
  const jornadaInfo = jornadaAtiva?.journey as any

  const progressPercent = jornadaInfo
    ? Math.round((jornadaAtiva.completed_days / jornadaInfo.total_days) * 100)
    : 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-5 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Link
          href="/biblia"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/20 bg-white/[0.04] text-brand-300 backdrop-blur-xl active:scale-95"
        >
          <ArrowLeft size={19} />
        </Link>

        <header className="mb-7">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Jornada Bíblica
          </p>

          <h1 className="text-[36px] font-black text-white mt-2 leading-none tracking-tight">
            Jornadas
          </h1>

          <p className="text-white/40 text-sm mt-3 leading-7">
            Escolha um caminho de leitura, registre suas reflexões e cresça um dia de cada vez.
          </p>
        </header>

        <section className="mb-7">
          {jornadaInfo ? (
            <Link
              href={`/biblia/jornada/${jornadaInfo.slug}/plano`}
              className="relative block overflow-hidden rounded-[30px] border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-6 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 active:scale-[0.985]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-300/20 blur-3xl" />

              <div className="relative">
                <p className="text-white/75 text-xs font-black uppercase tracking-widest">
                  Sua jornada em andamento
                </p>

                <h2 className="text-white text-2xl font-black mt-2">
                  🌱 {jornadaInfo.title}
                </h2>

                <p className="text-white/75 text-sm mt-3">
                  Dia {jornadaAtiva.current_day} de {jornadaInfo.total_days}
                </p>

                <div className="mt-4 h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full shadow-[0_0_18px_rgba(255,255,255,0.55)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="text-white font-bold text-sm mt-4">
                  Continuar jornada →
                </p>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-[30px] border border-brand-300/15 bg-white/[0.04] p-6 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

              <p className="relative text-brand-400 text-xs font-black uppercase tracking-widest">
                Comece uma jornada
              </p>

              <h2 className="relative text-white text-2xl font-black mt-2">
                🧭 Escolha seu caminho
              </h2>

              <p className="relative text-white/45 text-sm mt-3 leading-relaxed">
                Encontre um plano de leitura para sua fase atual.
              </p>
            </div>
          )}
        </section>

        <JourneyExplorer journeys={(journeys ?? []) as any[]} />
      </div>
    </div>
  )
}