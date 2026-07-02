import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function feelingLabel(feeling?: string | null) {
  const labels: Record<string, string> = {
    dificil: '😕 Difícil entender',
    boa: '🙂 Boa leitura',
    impactante: '🔥 Muito impactante',
    transformadora: '❤️ Transformadora',
  }

  return feeling ? labels[feeling] ?? feeling : null
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

export default async function DiarioEspiritualPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: reflections } = await supabase
    .from('journey_reflections')
    .select(`
      id,
      reflection,
      feeling,
      is_shared,
      created_at,
      day_number,
      journey:journeys (
        title,
        slug
      ),
      journey_day:journey_days (
        title,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalReflections = reflections?.length ?? 0
  const totalImpactantes =
    reflections?.filter((item: any) => item.feeling === 'impactante').length ?? 0
  const totalTransformadoras =
    reflections?.filter((item: any) => item.feeling === 'transformadora').length ?? 0
  const totalCompartilhadas =
    reflections?.filter((item: any) => item.is_shared).length ?? 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/biblia" />

        <header className="mt-4 mb-6">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Bíblia
          </p>

          <h1 className="text-[32px] font-black text-white mt-2 tracking-tight leading-tight">
            Diário Espiritual
          </h1>

          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Suas reflexões das jornadas ficam salvas aqui.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <PremiumCard className="p-4">
            <p className="relative text-white font-black text-2xl">
              {totalReflections}
            </p>
            <p className="relative text-white/35 text-xs mt-1">
              reflexões
            </p>
          </PremiumCard>

          <PremiumCard className="p-4">
            <p className="relative text-white font-black text-2xl">
              {totalCompartilhadas}
            </p>
            <p className="relative text-white/35 text-xs mt-1">
              compartilhadas
            </p>
          </PremiumCard>

          <PremiumCard className="p-4">
            <p className="relative text-white font-black text-2xl">
              {totalImpactantes}
            </p>
            <p className="relative text-white/35 text-xs mt-1">
              impactantes
            </p>
          </PremiumCard>

          <PremiumCard className="p-4">
            <p className="relative text-white font-black text-2xl">
              {totalTransformadoras}
            </p>
            <p className="relative text-white/35 text-xs mt-1">
              transformadoras
            </p>
          </PremiumCard>
        </div>

        {!reflections || reflections.length === 0 ? (
          <PremiumCard className="mt-8 p-7 text-center">
            <BookOpen size={30} className="relative text-white/25 mx-auto mb-3" />

            <p className="relative text-white font-bold">
              Nenhuma reflexão ainda
            </p>

            <p className="relative text-white/40 text-sm mt-2 leading-relaxed">
              Conclua um dia de jornada e registre o que Deus falou com você.
            </p>
          </PremiumCard>
        ) : (
          <div className="mt-8 space-y-4">
            {reflections.map((item: any) => {
              const feeling = feelingLabel(item.feeling)

              return (
                <PremiumCard key={item.id} className="p-5">
                  <p className="relative text-white/35 text-xs">
                    {formatDate(item.created_at)}
                  </p>

                  <p className="relative text-brand-400 text-xs font-black uppercase tracking-widest mt-3">
                    {item.journey?.title ?? 'Jornada'}
                  </p>

                  <h2 className="relative text-white font-bold text-lg mt-1">
                    Dia {item.day_number} — {item.journey_day?.title}
                  </h2>

                  {feeling && (
                    <p className="relative text-white/60 text-sm mt-3">
                      {feeling}
                    </p>
                  )}

                  {item.reflection && (
                    <p className="relative text-white/75 text-sm leading-relaxed mt-4 whitespace-pre-line">
                      “{item.reflection}”
                    </p>
                  )}

                  <div className="relative flex items-center justify-between mt-5">
                    <Link
                      href={`/biblia/jornada/${item.journey?.slug}/plano`}
                      className="text-brand-300 text-sm font-semibold"
                    >
                      Ver jornada →
                    </Link>

                    {item.is_shared && (
                      <span className="text-[11px] text-emerald-400 font-bold uppercase">
                        Compartilhada
                      </span>
                    )}
                  </div>
                </PremiumCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}