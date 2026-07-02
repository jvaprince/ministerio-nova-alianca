import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  getPalavraDodia,
  getUltimaPalavraPublicada,
  getResponsavelPalavra,
} from '@/lib/palavra/actions'
import { Calendar, Bell, Newspaper } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Início — Ministério Nova Aliança',
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

export default async function InicioPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const [
    profileResult,
    palavra,
    ultimaPalavra,
    responsavelHoje,
    proximoEventoResult,
    ultimoPostResult,
    unreadNotificationsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    getPalavraDodia(hoje),
    getUltimaPalavraPublicada(),
    getResponsavelPalavra(hoje),
    supabase
      .from('events')
      .select('*')
      .gte('event_date', hoje)
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('feed_posts')
      .select(`
        *,
        author:profiles (
          name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user!.id)
      .is('read_at', null),
  ])

  const profile = profileResult.data
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const responsavelNome =
    responsavelHoje?.pending_profile?.name ?? responsavelHoje?.user?.name

  const responsavelUserId =
  responsavelHoje?.pending_profile?.linked_user_id ??
  responsavelHoje?.user?.id

const souResponsavelHoje = responsavelUserId === user?.id
  const palavraPendenteHoje = !palavra
  const proximoEvento = proximoEventoResult.data
  const ultimoPost = ultimoPostResult.data
  const unreadNotificationsCount = unreadNotificationsResult.data?.length ?? 0

  const { data: activeJourney } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        id,
        title,
        slug,
        total_days
      )
    `)
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  function formatEventDate(date: string) {
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
    })
  }

  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const { data: rankingPoints } = await supabase
    .from('journey_points')
    .select(`
      user_id,
      points,
      profile:profiles (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .gte('created_at', inicioSemana.toISOString())

  const rankingMap = new Map<string, any>()

  rankingPoints?.forEach((item: any) => {
    const existing = rankingMap.get(item.user_id)

    if (existing) {
      existing.points += item.points
    } else {
      rankingMap.set(item.user_id, {
        user: item.profile,
        points: item.points,
      })
    }
  })

  const rankingSemana = Array.from(rankingMap.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)

  return (
    <div className="relative min-h-screen overflow-hidden pb-6 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-5 pt-12 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-white/45 font-medium">
              {saudacao},
            </p>

            <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">
              {profile?.name?.split(' ')[0] ?? 'Bem-vindo'} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notificacoes"
              className="relative w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <Bell size={18} className="text-white/55" />

              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount > 9
                    ? '9+'
                    : unreadNotificationsCount}
                </span>
              )}
            </Link>

            <Link href="/perfil">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-400/50 shadow-[0_0_25px_rgba(16,86,176,0.35)]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white ring-2 ring-brand-400/50">
                  {getInitials(profile?.name ?? 'NA')}
                </div>
              )}
            </Link>
          </div>
        </div>

        {souResponsavelHoje && palavraPendenteHoje && (
          <div className="px-4 mb-4">
            <PremiumCard className="border-amber-300/20 bg-amber-500/10 p-4">
              <p className="relative text-[11px] font-bold tracking-widest uppercase text-amber-300 mb-1">
                📖 Palavra do Dia
              </p>
              <p className="relative text-[14px] font-semibold text-white">
                Hoje é o seu dia de compartilhar a Palavra.
              </p>
              <p className="relative text-[12px] text-white/60 mt-1">
                A igreja está aguardando sua reflexão.
              </p>
            </PremiumCard>
          </div>
        )}

        {!souResponsavelHoje &&
          palavraPendenteHoje &&
          responsavelNome &&
          ['admin', 'leader'].includes(profile?.role ?? '') && (
            <div className="px-4 mb-4">
              <PremiumCard className="border-red-300/20 bg-red-500/10 p-4">
                <p className="relative text-[11px] font-bold tracking-widest uppercase text-red-300 mb-1">
                  ⚠️ Palavra pendente
                </p>
                <p className="relative text-[14px] font-semibold text-white">
                  A Palavra de hoje ainda não foi publicada.
                </p>
                <p className="relative text-[12px] text-white/60 mt-1">
                  Responsável: {responsavelNome}
                </p>
              </PremiumCard>
            </div>
          )}

        <div className="px-4 mb-4">
          <Link href="/palavra" className="block">
            <div className="relative overflow-hidden rounded-[30px] border border-brand-300/25 bg-gradient-to-br from-brand-500/90 via-brand-500/75 to-brand-700/90 p-5 shadow-[0_0_35px_rgba(59,130,246,0.18),0_20px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-300/20 blur-3xl" />

              <p className="relative text-[10px] font-black tracking-[0.24em] uppercase text-white/65 mb-3">
                ✦ Palavra do Dia
              </p>

              {palavra ? (
                <>
                  <p className="relative text-[15px] font-medium text-white leading-relaxed line-clamp-2">
                    {palavra.verse
                      ? `"${palavra.verse}"`
                      : palavra.reflection ?? 'Toque para ler a palavra de hoje.'}
                  </p>

                  {palavra.verse_ref && (
                    <p className="relative text-[12px] text-white/65 mt-2 font-semibold">
                      {palavra.verse_ref}
                    </p>
                  )}
                </>
              ) : ultimaPalavra ? (
                <>
                  <p className="relative text-[13px] text-white/75 mb-3">
                    Palavra de hoje ainda não publicada.
                  </p>

                  {responsavelHoje && (
                    <div className="relative mb-4">
                      <p className="text-[11px] uppercase tracking-widest text-white/55 font-bold">
                        Responsável de hoje
                      </p>

                      <p className="text-[15px] font-semibold text-white mt-1">
                        {responsavelHoje.pending_profile?.name ??
                          responsavelHoje.user?.name ??
                          'Sem responsável'}
                      </p>

                      <p className="text-[12px] text-white/55 mt-1">
                        Aguardando publicação...
                      </p>
                    </div>
                  )}

                  <p className="relative text-[15px] font-medium text-white leading-relaxed line-clamp-2">
                    {ultimaPalavra.verse
                      ? `"${ultimaPalavra.verse}"`
                      : ultimaPalavra.reflection ?? 'Ver última palavra publicada.'}
                  </p>

                  <p className="relative text-[12px] text-white/65 mt-2 font-semibold">
                    Última publicada
                  </p>
                </>
              ) : (
                <p className="relative text-[14px] text-white/75">
                  Nenhuma palavra publicada ainda.
                </p>
              )}
            </div>
          </Link>
        </div>

        {activeJourney?.journey && (
          <div className="px-4 mb-5">
            <Link
              href={`/biblia/jornada/${activeJourney.journey.slug}/plano`}
              className="block"
            >
              <PremiumCard className="p-5">
                <p className="relative text-[10px] font-black tracking-[0.24em] uppercase text-brand-400 mb-2">
                  🔥 Sua Jornada
                </p>

                <p className="relative text-[19px] font-black text-white">
                  {activeJourney.journey.title}
                </p>

                <p className="relative text-[13px] text-white/50 mt-1">
                  Dia {activeJourney.current_day} de{' '}
                  {activeJourney.journey.total_days}
                </p>

                <div className="relative mt-4 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-400 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
                    style={{
                      width: `${Math.round(
                        (activeJourney.completed_days /
                          activeJourney.journey.total_days) *
                          100
                      )}%`,
                    }}
                  />
                </div>

                <div className="relative flex items-center justify-between mt-3">
                  <span className="text-[12px] text-white/45">
                    🔥 {activeJourney.streak} dias
                  </span>

                  <span className="text-[12px] text-brand-300 font-semibold">
                    Continuar →
                  </span>
                </div>
              </PremiumCard>
            </Link>
          </div>
        )}

        {rankingSemana.length > 0 && (
          <div className="px-4 mb-5">
            <PremiumCard className="p-5">
              <p className="relative text-[10px] font-black tracking-[0.24em] uppercase text-brand-400 mb-4">
                🏆 Pódio da Semana
              </p>

              <div className="relative space-y-3">
                {rankingSemana.map((item, index) => (
                  <div key={item.user?.id ?? index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-sm font-bold text-brand-300">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>

                    {item.user?.avatar_url ? (
                      <img
                        src={item.user.avatar_url}
                        alt={item.user.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-brand-400/30"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(item.user?.name ?? 'NA')}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {item.user?.name ?? 'Membro'}
                      </p>

                      <p className="text-xs text-white/40">
                        {item.points} pontos de jornada
                      </p>
                    </div>
                  </div>
                ))}

                <Link
                  href="/biblia/ranking"
                  className="block pt-2 text-[12px] text-brand-300 font-semibold"
                >
                  Ver ranking completo →
                </Link>
              </div>
            </PremiumCard>
          </div>
        )}

        {proximoEvento && (
          <div className="px-4 mb-5">
            <Link href="/agenda" className="block">
              <PremiumCard className="p-4">
                <p className="relative text-[10px] font-black tracking-[0.24em] uppercase text-white/35 mb-3">
                  Próximo evento
                </p>

                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-white">
                      {proximoEvento.title}
                    </p>

                    <p className="text-[12px] text-white/50 mt-1">
                      {formatEventDate(proximoEvento.event_date)}
                      {proximoEvento.event_time &&
                        ` • ${proximoEvento.event_time.slice(0, 5)}`}
                    </p>

                    {proximoEvento.location && (
                      <p className="text-[12px] text-white/35 mt-1 line-clamp-1">
                        {proximoEvento.location}
                      </p>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </Link>
          </div>
        )}

        {ultimoPost && (
          <div className="px-4 mb-5">
            <Link href="/feed" className="block">
              <PremiumCard className="p-4">
                <p className="relative text-[10px] font-black tracking-[0.24em] uppercase text-white/35 mb-3">
                  Última publicação
                </p>

                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 flex items-center justify-center shrink-0 overflow-hidden">
                    {ultimoPost.author?.avatar_url ? (
                      <img
                        src={ultimoPost.author.avatar_url}
                        alt={ultimoPost.author?.name ?? 'Autor'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Newspaper size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white">
                      {ultimoPost.author?.name ?? 'Membro'} publicou no feed
                    </p>

                    {ultimoPost.content && (
                      <p className="text-[13px] text-white/55 mt-1 line-clamp-2">
                        {ultimoPost.content}
                      </p>
                    )}

                    {!ultimoPost.content && ultimoPost.image_url && (
                      <p className="text-[13px] text-white/55 mt-1">
                        Compartilhou uma imagem.
                      </p>
                    )}

                    <p className="text-[12px] text-brand-300 mt-2 font-semibold">
                      Ver publicação →
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}