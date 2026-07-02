import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  Trophy,
  Crown,
  Sparkles,
  Lock,
  Medal,
  Flame,
  Target,
} from 'lucide-react'
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
      className={`relative overflow-hidden rounded-[28px] border border-app bg-app-card shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function rarityLabel(rarity?: string | null) {
  if (rarity === 'epic') return 'Épica'
  if (rarity === 'legendary') return 'Lendária'
  if (rarity === 'rare') return 'Rara'
  return 'Comum'
}

function rarityStyle(rarity?: string | null, isSuper?: boolean) {
  if (isSuper || rarity === 'legendary') {
    return {
      card: 'border-amber-300/30 bg-amber-500/10 shadow-[0_0_28px_rgba(245,158,11,0.12),0_20px_60px_rgba(0,0,0,0.16)]',
      icon: 'bg-amber-400/15 border-amber-300/25 shadow-[0_0_24px_rgba(245,158,11,0.24)]',
      label: 'text-amber-300',
      glow: 'bg-amber-400/20',
    }
  }

  if (rarity === 'epic') {
    return {
      card: 'border-purple-300/25 bg-purple-500/10 shadow-[0_0_24px_rgba(168,85,247,0.10),0_20px_60px_rgba(0,0,0,0.14)]',
      icon: 'bg-purple-400/15 border-purple-300/20',
      label: 'text-purple-300',
      glow: 'bg-purple-400/18',
    }
  }

  if (rarity === 'rare') {
    return {
      card: 'border-cyan-300/25 bg-cyan-500/10',
      icon: 'bg-cyan-400/15 border-cyan-300/20',
      label: 'text-cyan-300',
      glow: 'bg-cyan-400/14',
    }
  }

  return {
    card: 'border-brand-300/20 bg-brand-500/8',
    icon: 'bg-brand-500/15 border-brand-300/15',
    label: 'text-brand-400',
    glow: 'bg-brand-400/12',
  }
}

export default async function ConquistasPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('id, title, description, icon, code, is_super, rarity, visibility')
    .order('is_super', { ascending: false })
    .order('created_at', { ascending: true })

  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      achievement:achievements (
        id,
        title,
        description,
        icon,
        code,
        is_super,
        rarity
      )
    `)
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  const earnedIds = new Set(
    earnedAchievements?.map((item: any) => item.achievement?.id) ?? []
  )

  const total = allAchievements?.length ?? 0
  const earned = earnedAchievements?.length ?? 0
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0

  const superEarned =
    earnedAchievements?.filter((item: any) => item.achievement?.is_super)
      .length ?? 0

  const highlighted = earnedAchievements?.[0]

  const nextAchievement =
    allAchievements?.find((achievement: any) => !earnedIds.has(achievement.id)) ??
    null

  return (
    <div className="relative min-h-screen overflow-hidden bg-app text-app px-4 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[360px] -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/perfil" />

        <header className="mt-4 mb-6">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Perfil
          </p>

          <h1 className="text-[34px] font-black text-app mt-2 tracking-tight">
            Conquistas
          </h1>

          <p className="text-app-muted text-sm mt-2 leading-relaxed">
            Medalhas da sua caminhada espiritual no Nova Aliança.
          </p>
        </header>

        <PremiumCard className="p-5 border-amber-300/25 bg-amber-500/10">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl animate-pulse" />

          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-[22px] border border-amber-300/30 bg-amber-400/15 flex items-center justify-center shadow-[0_0_28px_rgba(245,158,11,0.25)]">
              <Trophy size={30} className="text-amber-300 animate-float" />
            </div>

            <div className="flex-1">
              <p className="text-app-muted text-xs font-bold uppercase tracking-widest">
                Progresso geral
              </p>

              <h2 className="text-app text-2xl font-black mt-1">
                {earned} de {total}
              </h2>

              <p className="text-amber-300 text-xs mt-1">
                {percent}% das conquistas desbloqueadas
              </p>
            </div>
          </div>

          <div className="relative mt-5 h-4 rounded-full bg-black/15 overflow-hidden border border-app">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 shadow-[0_0_22px_rgba(245,158,11,0.65)] transition-all duration-1000"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              {percent}% completo
            </span>
          </div>

          <div className="relative grid grid-cols-3 gap-2 mt-5">
            <div className="rounded-2xl bg-black/10 border border-app p-3 text-center">
              <Medal size={16} className="mx-auto text-brand-400 mb-2" />
              <p className="text-app font-black">{earned}</p>
              <p className="text-app-muted text-xs">conquistadas</p>
            </div>

            <div className="rounded-2xl bg-black/10 border border-app p-3 text-center">
              <Crown size={16} className="mx-auto text-amber-300 mb-2" />
              <p className="text-app font-black">{superEarned}</p>
              <p className="text-app-muted text-xs">super</p>
            </div>

            <div className="rounded-2xl bg-black/10 border border-app p-3 text-center">
              <Flame size={16} className="mx-auto text-orange-300 mb-2" />
              <p className="text-app font-black">{percent}%</p>
              <p className="text-app-muted text-xs">progresso</p>
            </div>
          </div>
        </PremiumCard>

        {highlighted?.achievement && (
          <PremiumCard className="mt-5 p-5 border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 via-emerald-500/6 to-transparent before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_60%)] before:pointer-events-none">
            <p className="relative text-emerald-400 text-xs font-black uppercase tracking-widest">
              Última conquista
            </p>

            <div className="relative flex items-center gap-4 mt-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-400/15 border border-emerald-300/20 flex items-center justify-center text-3xl shadow-[0_0_22px_rgba(16,185,129,0.18)]">
                {highlighted.achievement.icon ?? '🏆'}
              </div>

              <div>
                <h2 className="text-app font-black text-lg">
                  {highlighted.achievement.title}
                </h2>

                <p className="text-app-muted text-sm mt-1">
                  {highlighted.achievement.description}
                </p>
              </div>
            </div>
          </PremiumCard>
        )}

        {nextAchievement && (
          <PremiumCard className="mt-5 p-5 border-brand-300/20 bg-brand-500/8">
            <p className="relative text-brand-400 text-xs font-black uppercase tracking-widest">
              Próximo objetivo
            </p>

            <div className="relative mt-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-500/15 border border-orange-300/20 flex items-center justify-center shadow-[0_0_22px_rgba(251,146,60,0.14)]">
                <Target size={26} className="text-orange-300" />
              </div>

              <div className="flex-1">
                <h2 className="text-app font-black text-lg">
                  {nextAchievement.title}
                </h2>

                <p className="text-app-muted text-sm mt-1">
                  Continue sua jornada para desbloquear esta conquista.
                </p>
              </div>
            </div>
          </PremiumCard>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-app font-black text-lg">
              Todas as conquistas
            </h2>

            <p className="text-app-muted text-xs font-bold">
              {earned}/{total}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {allAchievements?.map((achievement: any) => {
              const unlocked = earnedIds.has(achievement.id)
              const earnedItem = earnedAchievements?.find(
                (item: any) => item.achievement?.id === achievement.id
              )
              const style = rarityStyle(achievement.rarity, achievement.is_super)

              return (
                <PremiumCard
                  key={achievement.id}
                  className={`p-5 ${
                    unlocked
                      ? `${style.card} hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]`
                      : 'opacity-60 grayscale'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.glow} blur-3xl`}
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 ${
                        unlocked
                          ? style.icon
                          : 'bg-app-card border-app'
                      }`}
                    >
                      {unlocked ? (
                        achievement.icon ?? '🏆'
                      ) : (
                        <Lock size={22} className="text-app-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-app font-black text-lg">
                          {achievement.title}
                        </h3>

                        {achievement.is_super && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                            <Crown size={11} />
                            Super
                          </span>
                        )}
                      </div>

                      <p className="text-app-muted text-sm mt-1 leading-relaxed">
                        {achievement.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className={`${style.label} text-[11px] uppercase tracking-widest font-black`}>
                          {rarityLabel(achievement.rarity)}
                        </span>

                        {unlocked ? (
                          <span className="text-emerald-400 text-[11px] uppercase tracking-widest font-black">
                            {earnedItem?.earned_at
                              ? new Date(earnedItem.earned_at).toLocaleDateString('pt-BR')
                              : 'Conquistada'}
                          </span>
                        ) : (
                          <span className="text-app-muted text-[11px] uppercase tracking-widest font-black">
                            Bloqueada
                          </span>
                        )}
                      </div>
                    </div>

                    {unlocked && (
                      <Sparkles
                        size={18}
                        className="text-amber-200/70 shrink-0 animate-pulse"
                      />
                    )}
                  </div>
                </PremiumCard>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}