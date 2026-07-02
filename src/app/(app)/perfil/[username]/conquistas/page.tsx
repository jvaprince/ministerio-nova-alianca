import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Crown,
  Medal,
  Star,
} from 'lucide-react'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    username: string
  }>
}

function getAchievementStyle(code?: string) {
  if (code === 'monthly_top_1' || code === 'weekly_top_1') {
    return {
      card: 'bg-gradient-to-br from-yellow-500/18 via-yellow-500/8 to-white/[0.03] border-yellow-300/45 shadow-[0_0_34px_rgba(250,204,21,0.16),0_22px_70px_rgba(0,0,0,0.32)]',
      icon: 'bg-yellow-400/18 border-yellow-300/25 shadow-[0_0_24px_rgba(250,204,21,0.18)]',
      label: 'text-yellow-300',
      badge: 'Lendária',
      glow: 'bg-yellow-400/20',
      score: 500,
    }
  }

  if (
    code === 'weekly_top_3' ||
    code === 'streak_30' ||
    code === 'journey_knowing_jesus'
  ) {
    return {
      card: 'bg-gradient-to-br from-purple-500/16 via-purple-500/8 to-white/[0.03] border-purple-300/35 shadow-[0_0_30px_rgba(168,85,247,0.14),0_22px_70px_rgba(0,0,0,0.30)]',
      icon: 'bg-purple-400/18 border-purple-300/25',
      label: 'text-purple-300',
      badge: 'Épica',
      glow: 'bg-purple-400/18',
      score: 250,
    }
  }

  if (code === 'streak_7' || code === 'streak_3') {
    return {
      card: 'bg-gradient-to-br from-cyan-500/14 via-cyan-500/7 to-white/[0.03] border-cyan-300/30',
      icon: 'bg-cyan-400/15 border-cyan-300/20',
      label: 'text-cyan-300',
      badge: 'Rara',
      glow: 'bg-cyan-400/14',
      score: 120,
    }
  }

  return {
    card: 'bg-gradient-to-br from-brand-500/14 via-brand-500/7 to-white/[0.03] border-brand-300/20',
    icon: 'bg-white/[0.08] border-white/[0.08]',
    label: 'text-emerald-400',
    badge: 'Comum',
    glow: 'bg-brand-400/12',
    score: 50,
  }
}

function rarityWeight(code?: string) {
  if (code === 'monthly_top_1' || code === 'weekly_top_1') return 4
  if (
    code === 'weekly_top_3' ||
    code === 'streak_30' ||
    code === 'journey_knowing_jesus'
  ) return 3
  if (code === 'streak_7' || code === 'streak_3') return 2
  return 1
}

export default async function ConquistasPublicasPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      achievement:achievements (
        id,
        title,
        description,
        icon,
        code
      )
    `)
    .eq('user_id', profile.id)
    .order('earned_at', { ascending: false })

  const total = achievements?.length ?? 0

  const stats = {
    comum: 0,
    rara: 0,
    epica: 0,
    lendaria: 0,
    xp: 0,
  }

  achievements?.forEach((item: any) => {
    const style = getAchievementStyle(item.achievement?.code)

    stats.xp += style.score

    if (style.badge === 'Comum') stats.comum += 1
    if (style.badge === 'Rara') stats.rara += 1
    if (style.badge === 'Épica') stats.epica += 1
    if (style.badge === 'Lendária') stats.lendaria += 1
  })

  const featured =
    achievements
      ?.slice()
      .sort(
        (a: any, b: any) =>
          rarityWeight(b.achievement?.code) - rarityWeight(a.achievement?.code)
      )
      .slice(0, 3) ?? []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-12 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[360px] -right-24 h-80 w-80 rounded-full bg-yellow-400/8 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-purple-500/6 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/perfil/${profile.username}`}
            className="w-11 h-11 rounded-full border border-white/[0.08] bg-white/[0.05] flex items-center justify-center text-white/75 active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <p className="text-brand-400 text-[11px] uppercase tracking-[0.24em] font-black">
              Perfil de {profile.name ?? profile.username}
            </p>

            <h1 className="text-[32px] font-black text-white tracking-tight">
              Conquistas
            </h1>
          </div>
        </div>

        {total === 0 ? (
          <div className="rounded-[32px] bg-white/[0.04] border border-white/[0.08] p-8 text-center">
            <Trophy size={38} className="mx-auto text-white/25" />

            <h2 className="text-white font-bold text-xl mt-4">
              Nenhuma conquista ainda
            </h2>

            <p className="text-white/45 text-sm mt-2">
              Essa pessoa ainda não desbloqueou conquistas.
            </p>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[34px] border border-yellow-300/20 bg-gradient-to-br from-yellow-500/12 via-brand-500/8 to-white/[0.035] p-5 shadow-[0_0_34px_rgba(250,204,21,0.10),0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-400/16 blur-3xl animate-pulse" />

              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px] border border-yellow-300/25 bg-yellow-400/15 flex items-center justify-center shadow-[0_0_26px_rgba(250,204,21,0.18)]">
                  <Crown size={30} className="text-yellow-300" />
                </div>

                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-yellow-200/80">
                    Hall de conquistas
                  </p>

                  <h2 className="text-white text-3xl font-black mt-1">
                    {total} conquista{total === 1 ? '' : 's'}
                  </h2>

                  <p className="text-white/45 text-sm mt-1">
                    {stats.xp} pontos de conquistas
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-4 gap-2 mt-5">
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-center">
                  <p className="text-white text-lg font-black">{stats.comum}</p>
                  <p className="text-emerald-400 text-[10px] font-black uppercase">
                    Comum
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-center">
                  <p className="text-white text-lg font-black">{stats.rara}</p>
                  <p className="text-cyan-300 text-[10px] font-black uppercase">
                    Rara
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-center">
                  <p className="text-white text-lg font-black">{stats.epica}</p>
                  <p className="text-purple-300 text-[10px] font-black uppercase">
                    Épica
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-center">
                  <p className="text-white text-lg font-black">
                    {stats.lendaria}
                  </p>
                  <p className="text-yellow-300 text-[10px] font-black uppercase">
                    Lendária
                  </p>
                </div>
              </div>
            </section>

            {featured.length > 0 && (
              <section className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-yellow-300" />

                  <h2 className="text-white font-black text-lg">
                    Destaques
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {featured.map((item: any) => {
                    const style = getAchievementStyle(item.achievement?.code)

                    return (
                      <div
                        key={`featured-${item.achievement?.id}-${item.earned_at}`}
                        className={`relative overflow-hidden rounded-[24px] border p-3 text-center ${style.card}`}
                      >
                        <div
                          className={`pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full ${style.glow} blur-2xl`}
                        />

                        <div
                          className={`relative mx-auto w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl ${style.icon}`}
                        >
                          {item.achievement?.icon ?? '🏆'}
                        </div>

                        <p className="relative text-white text-[12px] font-black mt-2 line-clamp-2">
                          {item.achievement?.title}
                        </p>

                        <p
                          className={`relative text-[9px] font-black uppercase tracking-widest mt-2 ${style.label}`}
                        >
                          {style.badge}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Medal size={16} className="text-brand-400" />

                <h2 className="text-white font-black text-lg">
                  Todas as conquistas
                </h2>
              </div>

              <div className="space-y-3">
                {achievements?.map((item: any) => {
                  const style = getAchievementStyle(item.achievement?.code)

                  return (
                    <div
                      key={`${item.achievement?.id}-${item.earned_at}`}
                      className={`relative overflow-hidden rounded-[30px] border p-5 transition-all active:scale-[0.985] ${style.card}`}
                    >
                      <div
                        className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.glow} blur-3xl`}
                      />

                      <div className="relative flex items-start gap-4">
                        <div
                          className={`w-15 h-15 min-w-[60px] min-h-[60px] rounded-[22px] border flex items-center justify-center text-3xl ${style.icon}`}
                        >
                          {item.achievement?.icon ?? '🏆'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-white font-black text-lg leading-tight">
                              {item.achievement?.title}
                            </h2>

                            <span
                              className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${style.label}`}
                            >
                              {style.badge}
                            </span>
                          </div>

                          <p className="text-white/50 text-sm mt-1 leading-relaxed">
                            {item.achievement?.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p
                              className={`${style.label} text-[11px] font-black uppercase tracking-widest`}
                            >
                              {new Date(item.earned_at).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>

                            <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1">
                              <Star size={11} className={style.label} />
                              <span className="text-white/55 text-[10px] font-black">
                                {style.score} Pontos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}