import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  getPalavraDodia,
  getResponsavelPalavra,
} from '@/lib/palavra/actions'
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Music,
  Newspaper,
  Trophy,
} from 'lucide-react'
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
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_14px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function formatEventDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })
}

export default async function InicioPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const hoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const [
    profileResult,
    palavra,
    responsavelHojeResult,
    proximoEventoResult,
    unreadNotificationsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    getPalavraDodia(hoje),

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
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .is('read_at', null),
  ])

  const profile = profileResult.data as any
  const responsavelHoje = responsavelHojeResult as any
  const proximoEvento = proximoEventoResult.data as any

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const unreadNotificationsCount = unreadNotificationsResult.data?.length ?? 0

  const responsavelNome =
    responsavelHoje?.pending_profile?.name ?? responsavelHoje?.user?.name

  const responsavelUserId =
    responsavelHoje?.pending_profile?.linked_user_id ?? responsavelHoje?.user?.id

  const souResponsavelHoje = responsavelUserId === user.id
  const palavraPendenteHoje = !palavra

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

  const pontosRanking = (rankingPoints ?? []) as any[]
  const rankingMap = new Map<string, any>()

  pontosRanking.forEach((item) => {
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
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-32">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[360px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-white/45 font-medium">
              {saudacao},
            </p>

            <h1 className="text-[27px] font-black text-white leading-tight tracking-tight">
              {profile?.name?.split(' ')[0] ?? 'Bem-vindo'} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notificacoes"
              className="relative w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center"
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
        </header>

        {proximoEvento && (
          <div className="px-5 mb-4">
            <Link
              href="/agenda"
              className="flex items-center gap-2 text-sm text-white/60 active:opacity-80"
            >
              <Calendar size={15} className="text-amber-300 shrink-0" />

              <span className="font-semibold text-white/80 truncate">
                {proximoEvento.title}
              </span>

              <span className="text-white/35 shrink-0">
                • {formatEventDate(proximoEvento.event_date)}
              </span>

              {proximoEvento.event_time && (
                <span className="text-white/35 shrink-0">
                  • {proximoEvento.event_time.slice(0, 5)}
                </span>
              )}

              <ChevronRight size={14} className="text-white/25 ml-auto shrink-0" />
            </Link>
          </div>
        )}

        {(souResponsavelHoje && palavraPendenteHoje) ||
        (!souResponsavelHoje &&
          palavraPendenteHoje &&
          responsavelNome &&
          ['admin', 'leader'].includes(profile?.role ?? '')) ? (
          <div className="px-4 mb-4">
            <PremiumCard
              className={`p-4 ${
                souResponsavelHoje
                  ? 'border-amber-300/20 bg-amber-500/10'
                  : 'border-red-300/20 bg-red-500/10'
              }`}
            >
              <p
                className={`relative text-[11px] font-black tracking-[0.22em] uppercase mb-1 ${
                  souResponsavelHoje ? 'text-amber-300' : 'text-red-300'
                }`}
              >
                {souResponsavelHoje ? '📖 Sua vez hoje' : '⚠️ Palavra pendente'}
              </p>

              <p className="relative text-[14px] font-semibold text-white">
                {souResponsavelHoje
                  ? 'Hoje é o seu dia de compartilhar a Palavra.'
                  : 'A Palavra de hoje ainda não foi publicada.'}
              </p>

              <p className="relative text-[12px] text-white/55 mt-1">
                {souResponsavelHoje
                  ? 'A igreja está aguardando sua reflexão.'
                  : `Responsável: ${responsavelNome}`}
              </p>
            </PremiumCard>
          </div>
        ) : null}

        <section className="px-4 mb-5">
          <Link href="/palavra" className="block">
            <div className="relative overflow-hidden rounded-[34px] border border-brand-300/25 bg-gradient-to-br from-brand-500/95 via-brand-500/75 to-brand-700/95 p-5 shadow-[0_0_35px_rgba(59,130,246,0.18),0_24px_70px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-[0.985] transition">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-brand-300/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-black tracking-[0.24em] uppercase text-white/65">
                    ✦ Palavra do Dia
                  </p>

                  <p className="text-white/65 text-[12px] mt-1">
                    Reflexão diária da igreja
                  </p>
                </div>

                <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
              </div>

              {palavra ? (
  <>
    <p className="relative text-[16px] font-medium text-white leading-relaxed line-clamp-3">
      {palavra.verse
        ? `"${palavra.verse}"`
        : palavra.reflection ?? 'Toque para ler a palavra de hoje.'}
    </p>

    {palavra.verse_ref && (
      <p className="relative text-[12px] text-white/70 mt-3 font-black">
        {palavra.verse_ref}
      </p>
    )}
  </>
) : (
  <div className="relative rounded-[24px] border border-white/15 bg-black/10 p-4">
    <p className="text-[11px] uppercase tracking-widest text-white/55 font-black">
      Responsável de hoje
    </p>

    <p className="text-[15px] font-black text-white mt-1">
      {responsavelHoje?.pending_profile?.name ??
        responsavelHoje?.user?.name ??
        'Sem responsável'}
    </p>

    <p className="text-[12px] text-white/55 mt-1">
      Aguardando publicação...
    </p>
  </div>
)}

              <div className="relative mt-5 flex items-center justify-between">
                <span className="text-[12px] text-white/65 font-semibold">
                  Abrir Palavra
                </span>

                <ChevronRight size={18} className="text-white/75" />
              </div>
            </div>
          </Link>
        </section>

        <section className="px-4 mb-5 grid grid-cols-4 gap-2">
          <Link href="/feed" className="block">
            <PremiumCard className="p-3 text-center active:scale-[0.97]">
              <Newspaper size={18} className="relative mx-auto text-brand-300 mb-2" />
              <p className="relative text-[11px] font-bold text-white/70">
                Feed
              </p>
            </PremiumCard>
          </Link>

          <Link href="/agenda" className="block">
            <PremiumCard className="p-3 text-center active:scale-[0.97]">
              <Calendar size={18} className="relative mx-auto text-amber-300 mb-2" />
              <p className="relative text-[11px] font-bold text-white/70">
                Agenda
              </p>
            </PremiumCard>
          </Link>

          <Link href="/biblia" className="block">
            <PremiumCard className="p-3 text-center active:scale-[0.97]">
              <BookOpen size={18} className="relative mx-auto text-emerald-300 mb-2" />
              <p className="relative text-[11px] font-bold text-white/70">
                Bíblia
              </p>
            </PremiumCard>
          </Link>

          <Link href="/louvores" className="block">
            <PremiumCard className="p-3 text-center active:scale-[0.97]">
              <Music size={18} className="relative mx-auto text-brand-300 mb-2" />
              <p className="relative text-[11px] font-bold text-white/70">
                Louvores
              </p>
            </PremiumCard>
          </Link>
        </section>

        {rankingSemana.length > 0 && (
          <section className="px-4 mb-5">
            <PremiumCard className="p-5">
              <div className="relative flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black tracking-[0.24em] uppercase text-brand-400">
                    🏆 Pódio da Semana
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Quem mais avançou nas jornadas
                  </p>
                </div>

                <Trophy size={22} className="text-amber-300" />
              </div>

              <div className="relative flex items-end justify-center gap-4">
                {rankingSemana.map((item, index) => {
                  const height =
                    index === 0 ? 'h-32' : index === 1 ? 'h-24' : 'h-20'

                  return (
                    <div
                      key={item.user?.id ?? index}
                      className="flex flex-col items-center flex-1"
                    >
                      {item.user?.avatar_url ? (
                        <img
                          src={item.user.avatar_url}
                          alt={item.user.name}
                          className={`rounded-full object-cover ring-2 mb-2 ${
                            index === 0
                              ? 'w-14 h-14 ring-amber-300/50 shadow-[0_0_24px_rgba(251,191,36,0.22)]'
                              : 'w-11 h-11 ring-brand-400/35'
                          }`}
                        />
                      ) : (
                        <div
                          className={`rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white mb-2 ${
                            index === 0 ? 'w-14 h-14' : 'w-11 h-11'
                          }`}
                        >
                          {getInitials(item.user?.name ?? 'NA')}
                        </div>
                      )}

                      <div
                        className={`w-full ${height} rounded-t-[24px] border flex flex-col items-center justify-center ${
                          index === 0
                            ? 'border-amber-300/20 bg-amber-400/10'
                            : 'border-brand-300/15 bg-brand-500/15'
                        }`}
                      >
                        <p className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </p>

                        <p className="text-[11px] font-black text-white mt-1 truncate max-w-[70px]">
                          {item.user?.name?.split(' ')[0] ?? 'Membro'}
                        </p>

                        <p className="text-[10px] text-white/45 mt-1">
                          {item.points} pts
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link
                href="/biblia/ranking"
                className="relative mt-5 flex items-center justify-center gap-2 rounded-2xl border border-brand-300/15 bg-brand-500/10 py-3 text-[12px] font-black text-brand-300"
              >
                Ver ranking completo
                <ChevronRight size={15} />
              </Link>
            </PremiumCard>
          </section>
        )}
      </div>
    </div>
  )
}