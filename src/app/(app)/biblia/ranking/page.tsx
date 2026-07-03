import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Trophy,
  Crown,
  Clock3,
  Sparkles,
  ChevronRight,
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function Avatar({ user, size = 'h-14 w-14' }: { user: any; size?: string }) {
  return (
    <div
      className={`${size} overflow-hidden rounded-full border border-white/10 bg-white/[0.08] shadow-[0_0_20px_rgba(59,130,246,0.18)]`}
    >
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user?.name ?? 'Perfil'}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/60 font-black">
          {(user?.name ?? 'M').slice(0, 1)}
        </div>
      )}
    </div>
  )
}

export default async function RankingPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(fimSemana.getDate() + 7)

  const { data: rankingPoints } = await supabase
    .from('journey_points')
    .select('user_id, points')
    .gte('created_at', inicioSemana.toISOString())

  const pontosRanking = (rankingPoints ?? []) as any[]

  const rankingUserIds = Array.from(
    new Set(pontosRanking.map((item) => item.user_id))
  )

  const { data: rankingProfiles } =
    rankingUserIds.length > 0
      ? await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', rankingUserIds)
      : { data: [] }

  const listaProfiles = (rankingProfiles ?? []) as any[]

  const profilesMap = new Map(
    listaProfiles.map((profile) => [profile.id, profile])
  )

  const rankingMap = new Map<string, any>()

  pontosRanking.forEach((item) => {
    const existing = rankingMap.get(item.user_id)

    if (existing) {
      existing.points += item.points
    } else {
      rankingMap.set(item.user_id, {
        userId: item.user_id,
        user: profilesMap.get(item.user_id),
        points: item.points,
      })
    }
  })

  const ranking = Array.from(rankingMap.values()).sort(
    (a, b) => b.points - a.points
  )

  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  const minhaPosicaoIndex = ranking.findIndex((item) => item.userId === user?.id)
  const minhaPosicao = minhaPosicaoIndex >= 0 ? minhaPosicaoIndex + 1 : null
  const meusDados = ranking.find((item) => item.userId === user?.id)

  const nextUser =
    minhaPosicaoIndex > 0 ? ranking[minhaPosicaoIndex - 1] : null

  const pointsToNext =
    nextUser && meusDados ? Math.max(nextUser.points - meusDados.points + 1, 0) : 0

  const top3Limit = ranking[2]?.points ?? 0
  const pointsToTop3 =
    meusDados && minhaPosicao && minhaPosicao > 3
      ? Math.max(top3Limit - meusDados.points + 1, 0)
      : 0

  const now = new Date()
  const diffMs = fimSemana.getTime() - now.getTime()
  const remainingDays = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0)
  const remainingHours = Math.max(
    Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    0
  )

  const podium = [
    { item: top2, place: 2, medal: '🥈', height: 'h-40', tone: 'from-slate-300/20 to-slate-500/10' },
    { item: top1, place: 1, medal: '🥇', height: 'h-52', tone: 'from-amber-300/25 to-orange-500/10' },
    { item: top3, place: 3, medal: '🥉', height: 'h-36', tone: 'from-orange-300/20 to-amber-700/10' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[300px] -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/" />

        <header className="mt-4 mb-6">
          <p className="text-brand-400 text-[11px] uppercase tracking-[0.28em] font-black">
            Ranking
          </p>

          <h1 className="text-[34px] font-black text-white mt-2 tracking-tight leading-tight">
            Pódio da Semana
          </h1>

          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Ganhe pontos concluindo sua jornada diária e participando da Palavra.
          </p>
        </header>

        <PremiumCard className="p-5 border-amber-300/20 bg-amber-500/10">
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-amber-300/30 bg-amber-400/15 flex items-center justify-center shadow-[0_0_28px_rgba(245,158,11,0.25)]">
                <Crown size={24} className="text-amber-300" />
              </div>

              <div>
                <p className="text-white/45 text-xs font-bold uppercase tracking-widest">
                  Temporada atual
                </p>

                <h2 className="text-white font-black text-lg">
                  Ranking semanal
                </h2>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <Clock3 size={13} className="text-amber-200" />
                <span className="text-white/75 text-xs font-bold">
                  {remainingDays}d {remainingHours}h
                </span>
              </div>
            </div>
          </div>
        </PremiumCard>

        <section className="mt-7">
          <div className="grid grid-cols-3 gap-2 items-end">
            {podium.map(({ item, place, medal, height, tone }) => (
              <div key={place} className="flex flex-col items-center">
                {place === 1 && (
                  <div className="mb-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                    Campeão
                  </div>
                )}

                <div
                  className={`relative w-full ${height} rounded-[26px] border border-white/10 bg-gradient-to-br ${tone} p-3 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]`}
                >
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

                  <div className={place === 1 ? 'scale-110' : ''}>
                    <div className="text-3xl mb-2">{medal}</div>

                    {item ? (
                      <>
                        <Avatar user={item.user} size={place === 1 ? 'h-16 w-16' : 'h-13 w-13'} />

                        <p className="mt-3 text-white font-black text-sm line-clamp-1">
                          {item.user?.name ?? 'Membro'}
                        </p>

                        <p className="text-white/35 text-[11px] truncate max-w-full">
                          {item.user?.username ? `@${item.user.username}` : ''}
                        </p>

                        <p className="mt-2 text-amber-200 text-xs font-black">
                          {item.points} pts
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/30 font-black">
                          ?
                        </div>

                        <p className="text-white/40 font-bold text-xs mt-3">
                          Vaga livre
                        </p>

                        <p className="text-white/25 text-[11px]">
                          Entre na disputa
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <PremiumCard className="mt-7 p-5 border-brand-300/20 bg-brand-500/10">
          <p className="relative text-brand-400 text-xs uppercase tracking-widest font-black">
            Sua posição
          </p>

          <div className="relative flex items-center justify-between gap-4 mt-4">
            <div>
              <h2 className="text-white text-3xl font-black">
                {minhaPosicao ? `#${minhaPosicao}` : 'Sem posição'}
              </h2>

              <p className="text-white/50 text-sm mt-1">
                {meusDados?.points ?? 0} pontos nesta semana
              </p>
            </div>

            <div className="h-16 w-16 rounded-[22px] bg-brand-500/15 border border-brand-300/15 flex items-center justify-center">
              <Trophy size={28} className="text-brand-400" />
            </div>
          </div>

          {minhaPosicao && minhaPosicao > 1 && (
            <div className="relative mt-4 rounded-2xl bg-black/20 border border-white/[0.06] p-3">
              <p className="text-white/45 text-xs">
                Faltam{' '}
                <span className="text-white font-black">{pointsToNext}</span>{' '}
                pontos para alcançar o próximo colocado.
              </p>
            </div>
          )}

          {pointsToTop3 > 0 && (
            <div className="relative mt-2 rounded-2xl bg-amber-500/10 border border-amber-300/15 p-3">
              <p className="text-amber-100/80 text-xs">
                Faltam <span className="font-black text-white">{pointsToTop3}</span>{' '}
                pontos para entrar no Top 3.
              </p>
            </div>
          )}
        </PremiumCard>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-lg">
              Ranking completo
            </h2>

            <p className="text-white/35 text-xs font-bold">
              {ranking.length} membros
            </p>
          </div>

          {ranking.length === 0 ? (
            <PremiumCard className="p-8 text-center">
              <Trophy size={38} className="relative mx-auto text-white/25" />

              <h2 className="relative text-white font-bold text-xl mt-4">
                Ninguém pontuou ainda
              </h2>

              <p className="relative text-white/45 text-sm mt-2">
                Conclua um dia da jornada para aparecer no ranking.
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-2">
              {ranking.map((item, index) => {
                const isMe = item.userId === user?.id
                const medal =
                  index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null

                return (
                  <Link
                    href={`/perfil/${item.user?.username}`}
                    key={item.userId}
                    className={`group relative overflow-hidden rounded-2xl border p-4 flex items-center justify-between transition-all active:scale-[0.98] ${
                      isMe
                        ? 'bg-brand-500/12 border-brand-300/25'
                        : 'bg-white/[0.04] border-white/[0.08]'
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 text-center text-lg font-black text-white/70">
                        {medal ?? `#${index + 1}`}
                      </div>

                      <Avatar user={item.user} size="h-11 w-11" />

                      <div className="min-w-0">
                        <p className="text-white font-black truncate">
                          {item.user?.name ?? 'Membro'}
                        </p>

                        {item.user?.username && (
                          <p className="text-xs text-white/35 truncate">
                            @{item.user.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-brand-400 font-black">
                        {item.points}
                      </p>

                      <ChevronRight
                        size={16}
                        className="text-white/25 group-hover:text-white/45 transition"
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <PremiumCard className="mt-8 p-5">
          <div className="relative flex items-start gap-3">
            <Sparkles size={20} className="text-amber-300 shrink-0 mt-0.5" />

            <div>
              <h2 className="text-white font-black">
                Como ganhar pontos?
              </h2>

              <p className="text-white/45 text-sm mt-2 leading-relaxed">
                Conclua a jornada diária, responda quizzes opcionais e participe da Palavra do Dia.
                Os pontos da jornada são concedidos apenas uma vez por dia.
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}