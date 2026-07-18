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

function Avatar({
  user,
  size = 'h-14 w-14',
}: {
  user: any
  size?: string
}) {
  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.08] shadow-[0_0_20px_rgba(59,130,246,0.18)]`}
    >
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user?.name ?? 'Perfil'}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-black text-white/60">
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

  const { data: rankingProfiles } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, role, is_system')

  const listaProfiles = ((rankingProfiles ?? []) as any[]).filter(
    (profile) =>
      profile.is_system !== true &&
      profile.name !== 'Administrador' &&
      profile.username !== 'administrador',
  )

  const profilesMap = new Map(
    listaProfiles.map((profile) => [profile.id, profile]),
  )

  const rankingMap = new Map<string, any>()

  pontosRanking.forEach((item) => {
    const profile = profilesMap.get(item.user_id)

    if (!profile) return

    const existing = rankingMap.get(item.user_id)

    if (existing) {
      existing.points += item.points
    } else {
      rankingMap.set(item.user_id, {
        userId: item.user_id,
        user: profile,
        points: item.points,
      })
    }
  })

  const ranking = Array.from(rankingMap.values()).sort(
    (a, b) => b.points - a.points,
  )

  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  const minhaPosicaoIndex = ranking.findIndex(
    (item) => item.userId === user?.id,
  )

  const minhaPosicao =
    minhaPosicaoIndex >= 0 ? minhaPosicaoIndex + 1 : null

  const meusDados = ranking.find((item) => item.userId === user?.id)

  const nextUser =
    minhaPosicaoIndex > 0 ? ranking[minhaPosicaoIndex - 1] : null

  const pointsToNext =
    nextUser && meusDados
      ? Math.max(nextUser.points - meusDados.points + 1, 0)
      : 0

  const top3Limit = ranking[2]?.points ?? 0

  const pointsToTop3 =
    meusDados && minhaPosicao && minhaPosicao > 3
      ? Math.max(top3Limit - meusDados.points + 1, 0)
      : 0

  const now = new Date()
  const diffMs = fimSemana.getTime() - now.getTime()

  const remainingDays = Math.max(
    Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    0,
  )

  const remainingHours = Math.max(
    Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    0,
  )

  const podium = [
    {
      item: top2,
      place: 2,
      medal: '🥈',
      cardHeight: 'h-[230px]',
      avatarSize: 'h-[74px] w-[74px]',
      tone: 'from-slate-300/15 to-slate-500/5',
      border: 'border-slate-300/15',
      pointsColor: 'text-slate-200',
    },
    {
      item: top1,
      place: 1,
      medal: '🥇',
      cardHeight: 'h-[270px]',
      avatarSize: 'h-[86px] w-[86px]',
      tone: 'from-amber-300/25 to-orange-500/10',
      border: 'border-amber-300/25',
      pointsColor: 'text-amber-200',
    },
    {
      item: top3,
      place: 3,
      medal: '🥉',
      cardHeight: 'h-[215px]',
      avatarSize: 'h-[70px] w-[70px]',
      tone: 'from-orange-300/15 to-amber-700/5',
      border: 'border-orange-300/15',
      pointsColor: 'text-orange-200',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pb-52 pt-10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="absolute -right-24 top-[300px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <BackButton href="/" />

        <header className="mb-6 mt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-brand-400">
            Ranking
          </p>

          <h1 className="mt-2 text-[34px] font-black leading-tight tracking-tight text-white">
            Pódio da Semana
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-white/45">
            Ganhe pontos concluindo sua jornada diária e participando da
            Palavra.
          </p>
        </header>

        <PremiumCard className="border-amber-300/20 bg-amber-500/10 p-5">
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 shadow-[0_0_28px_rgba(245,158,11,0.25)]">
                <Crown size={24} className="text-amber-300" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-white/45">
                  Temporada atual
                </p>

                <h2 className="truncate text-lg font-black text-white">
                  Ranking semanal
                </h2>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                <Clock3 size={13} className="text-amber-200" />

                <span className="text-xs font-bold text-white/75">
                  {remainingDays}d {remainingHours}h
                </span>
              </div>
            </div>
          </div>
        </PremiumCard>

        <section className="mt-7">
          <div className="grid grid-cols-3 items-end gap-2">
            {podium.map(
              ({
                item,
                place,
                medal,
                cardHeight,
                avatarSize,
                tone,
                border,
                pointsColor,
              }) => (
                <div
                  key={place}
                  className="flex min-w-0 flex-col items-center"
                >
                  <div className="mb-2 flex h-7 items-center justify-center">
                    {place === 1 ? (
                      <div className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-200">
                        Campeão
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={`relative flex w-full ${cardHeight} flex-col items-center overflow-hidden rounded-[22px] border ${border} bg-gradient-to-br ${tone} px-2 py-4 text-center shadow-[0_16px_45px_rgba(0,0,0,0.24)]`}
                  >
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

                    <div className="mb-2 text-[26px] leading-none">
                      {medal}
                    </div>

                    {item ? (
                      <>
                        <Avatar
                          user={item.user}
                          size={avatarSize}
                        />

                        <div className="mt-3 w-full min-w-0">
                          <p className="w-full truncate px-1 text-center text-sm font-black leading-tight text-white">
                            {item.user?.name ?? 'Membro'}
                          </p>

                          <p className="mt-1 w-full truncate px-1 text-center text-[10px] text-white/35">
                            {item.user?.username
                              ? `@${item.user.username}`
                              : '\u00A0'}
                          </p>
                        </div>

                        <p
                          className={`mt-auto whitespace-nowrap pt-3 text-xs font-black ${pointsColor}`}
                        >
                          {item.points} pts
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-black text-white/30">
                          ?
                        </div>

                        <p className="mt-3 text-xs font-bold text-white/40">
                          Vaga livre
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          Entre na disputa
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <PremiumCard className="mt-8 border-brand-300/20 bg-brand-500/10 p-5">
          <p className="relative text-xs font-black uppercase tracking-widest text-brand-400">
            Sua posição
          </p>

          <div className="relative mt-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white">
                {minhaPosicao ? `#${minhaPosicao}` : 'Sem posição'}
              </h2>

              <p className="mt-1 text-sm text-white/50">
                {meusDados?.points ?? 0} pontos nesta semana
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-brand-300/15 bg-brand-500/15">
              <Trophy size={28} className="text-brand-400" />
            </div>
          </div>

          {minhaPosicao && minhaPosicao > 1 && (
            <div className="relative mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
              <p className="text-xs text-white/45">
                Faltam{' '}
                <span className="font-black text-white">
                  {pointsToNext}
                </span>{' '}
                pontos para alcançar o próximo colocado.
              </p>
            </div>
          )}

          {pointsToTop3 > 0 && (
            <div className="relative mt-2 rounded-2xl border border-amber-300/15 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-100/80">
                Faltam{' '}
                <span className="font-black text-white">
                  {pointsToTop3}
                </span>{' '}
                pontos para entrar no Top 3.
              </p>
            </div>
          )}
        </PremiumCard>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-white">
              Ranking completo
            </h2>

            <p className="text-xs font-bold text-white/35">
              {ranking.length} membros
            </p>
          </div>

          {ranking.length === 0 ? (
            <PremiumCard className="p-8 text-center">
              <Trophy
                size={38}
                className="relative mx-auto text-white/25"
              />

              <h2 className="relative mt-4 text-xl font-bold text-white">
                Ninguém pontuou ainda
              </h2>

              <p className="relative mt-2 text-sm text-white/45">
                Conclua um dia da jornada para aparecer no ranking.
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-2">
              {ranking.map((item, index) => {
                const isMe = item.userId === user?.id

                const medal =
                  index === 0
                    ? '🥇'
                    : index === 1
                      ? '🥈'
                      : index === 2
                        ? '🥉'
                        : null

                const profileHref = item.user?.username
                  ? `/perfil/${item.user.username}`
                  : '/perfil'

                return (
                  <Link
                    href={profileHref}
                    key={item.userId}
                    className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border p-4 transition-all active:scale-[0.98] ${
                      isMe
                        ? 'border-brand-300/25 bg-brand-500/12'
                        : 'border-white/[0.08] bg-white/[0.04]'
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-8 shrink-0 text-center text-lg font-black text-white/70">
                        {medal ?? `#${index + 1}`}
                      </div>

                      <Avatar
                        user={item.user}
                        size="h-11 w-11"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-black text-white">
                          {item.user?.name ?? 'Membro'}
                        </p>

                        {item.user?.username && (
                          <p className="truncate text-xs text-white/35">
                            @{item.user.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <p className="font-black text-brand-400">
                        {item.points}
                      </p>

                      <ChevronRight
                        size={16}
                        className="text-white/25 transition group-hover:text-white/45"
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
            <Sparkles
              size={20}
              className="mt-0.5 shrink-0 text-amber-300"
            />

            <div>
              <h2 className="font-black text-white">
                Como ganhar pontos?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/45">
                Conclua a jornada diária, responda quizzes opcionais e
                participe da Palavra do Dia. Os pontos da jornada são
                concedidos apenas uma vez por dia.
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}