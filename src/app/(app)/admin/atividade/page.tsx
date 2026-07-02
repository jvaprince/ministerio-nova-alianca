import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Activity,
  Clock3,
  Trophy,
  FileText,
  Heart,
  MessageCircle,
  BookOpen,
  Flame,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Atividade — Admin Nova Aliança',
}

function formatMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours > 0) return `${hours}h ${rest}min`
  return `${minutes}min`
}

function formatLastSeen(date?: string | null) {
  if (!date) return 'Nunca'

  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `há ${minutes}min`
  if (hours < 24) return `há ${hours}h`
  return `há ${days}d`
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-[24px] border border-brand-300/15 bg-white/[0.04] p-4">
      <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300 mb-3">
        {icon}
      </div>

      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  )
}

export default async function AdminAtividadePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .maybeSingle()

const role = (profile as { role?: string } | null)?.role

if (role !== 'admin') redirect('/inicio')

    const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const [
  membrosResult,
  sessoesResult,
  postsResult,
  comentariosResult,
  conquistasResult,
  pontosResult,
  favoritosResult,
] = await Promise.all([
  admin
    .from('profiles')
    .select('id, name, username, avatar_url, role')
    .order('name'),

  admin
    .from('app_sessions')
    .select('user_id, duration_seconds, started_at, last_seen_at'),

  admin
    .from('feed_posts')
    .select('author_id, created_at'),

  admin
    .from('palavra_comments')
    .select('author_id, created_at'),

  admin
    .from('user_achievements')
    .select('user_id, achievement_id, earned_at'),

  admin
    .from('journey_points')
    .select('user_id, points, created_at'),

  admin
    .from('bible_favorites')
    .select('user_id, created_at'),
])

  const membros = membrosResult.data ?? []
  const sessoes = sessoesResult.data ?? []
  const posts = postsResult.data ?? []
  const comentarios = comentariosResult.data ?? []
  const conquistas = conquistasResult.data ?? []
  const pontos = pontosResult.data ?? []
  const favoritos = favoritosResult.data ?? []

  const stats = membros.map((membro: any) => {
    const userSessions = sessoes.filter((s: any) => s.user_id === membro.id)
    const userPosts = posts.filter((p: any) => p.author_id === membro.id)
    const userComentarios = comentarios.filter((c: any) => c.author_id === membro.id)
    const userConquistas = conquistas.filter(
  (c: any) => String(c.user_id) === String(membro.id)
)
    const userPontos = pontos.filter((p: any) => p.user_id === membro.id)
    const userFavoritos = favoritos.filter((f: any) => f.user_id === membro.id)

    const totalSeconds = userSessions.reduce(
      (sum: number, s: any) => sum + (s.duration_seconds ?? 0),
      0
    )

    const weekSeconds = userSessions
      .filter((s: any) => new Date(s.started_at) >= inicioSemana)
      .reduce((sum: number, s: any) => sum + (s.duration_seconds ?? 0), 0)

    const todaySeconds = userSessions
      .filter((s: any) => new Date(s.started_at) >= hoje)
      .reduce((sum: number, s: any) => sum + (s.duration_seconds ?? 0), 0)

    const lastSeen = userSessions
      .map((s: any) => s.last_seen_at)
      .filter(Boolean)
      .sort()
      .at(-1)

    const journeyPoints = userPontos.reduce(
      (sum: number, p: any) => sum + (p.points ?? 0),
      0
    )

    const activityScore =
      Math.floor(totalSeconds / 60) +
      userPosts.length * 10 +
      userComentarios.length * 4 +
      userConquistas.length * 15 +
      journeyPoints +
      userFavoritos.length * 2

    return {
      membro,
      totalSeconds,
      weekSeconds,
      todaySeconds,
      lastSeen,
      posts: userPosts.length,
      comentarios: userComentarios.length,
      conquistas: userConquistas.length,
      pontos: journeyPoints,
      favoritos: userFavoritos.length,
      activityScore,
    }
  })

  const ranking = [...stats].sort((a, b) => b.activityScore - a.activityScore)
  const totalTempo = stats.reduce((sum, item) => sum + item.totalSeconds, 0)
  const totalPosts = stats.reduce((sum, item) => sum + item.posts, 0)
  const totalConquistas = stats.reduce((sum, item) => sum + item.conquistas, 0)
  const totalPontos = stats.reduce((sum, item) => sum + item.pontos, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-7">
          <Link
            href="/admin"
            className="w-11 h-11 rounded-full border border-brand-300/20 bg-white/[0.04] flex items-center justify-center text-brand-300"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
              Painel Admin
            </p>

            <h1 className="text-[28px] font-black tracking-tight">
              Atividade
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-7">
          <StatBox
            icon={<Clock3 size={19} />}
            label="Tempo total"
            value={formatMinutes(totalTempo)}
          />

          <StatBox
            icon={<FileText size={19} />}
            label="Posts"
            value={totalPosts}
          />

          <StatBox
            icon={<Trophy size={19} />}
            label="Conquistas"
            value={totalConquistas}
          />

          <StatBox
            icon={<Flame size={19} />}
            label="Pontos"
            value={totalPontos}
          />
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-brand-300" />

            <h2 className="text-[18px] font-black">
              Ranking de atividade
            </h2>
          </div>

          <div className="space-y-3">
            {ranking.map((item, index) => (
              <div
                key={item.membro.id}
                className="rounded-[26px] border border-brand-300/15 bg-white/[0.04] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center text-sm font-black text-brand-300">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  {item.membro.avatar_url ? (
                    <img
                      src={item.membro.avatar_url}
                      alt={item.membro.name}
                      className="w-11 h-11 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center text-sm font-black">
                      {(item.membro.name ?? 'NA').slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-black truncate">
                      {item.membro.name}
                    </p>

                    <p className="text-xs text-white/40 truncate">
                      @{item.membro.username ?? 'sem-username'} · {formatLastSeen(item.lastSeen)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-brand-300">
                      {item.activityScore}
                    </p>
                    <p className="text-[10px] text-white/35 uppercase tracking-widest">
                      score
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <Clock3 size={14} className="text-brand-300 mb-1" />
                    <p className="text-sm font-bold">
                      {formatMinutes(item.totalSeconds)}
                    </p>
                    <p className="text-[10px] text-white/35">tempo</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <FileText size={14} className="text-brand-300 mb-1" />
                    <p className="text-sm font-bold">{item.posts}</p>
                    <p className="text-[10px] text-white/35">posts</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <Trophy size={14} className="text-amber-300 mb-1" />
                    <p className="text-sm font-bold">{item.conquistas}</p>
                    <p className="text-[10px] text-white/35">conquistas</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <MessageCircle size={14} className="text-brand-300 mb-1" />
                    <p className="text-sm font-bold">{item.comentarios}</p>
                    <p className="text-[10px] text-white/35">comentários</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <BookOpen size={14} className="text-brand-300 mb-1" />
                    <p className="text-sm font-bold">{item.pontos}</p>
                    <p className="text-[10px] text-white/35">pontos</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <Heart size={14} className="text-red-300 mb-1" />
                    <p className="text-sm font-bold">{item.favoritos}</p>
                    <p className="text-[10px] text-white/35">favoritos</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-brand-300/10 bg-brand-500/10 p-3">
                  <p className="text-xs text-white/45">
                    Hoje: <span className="text-white font-bold">{formatMinutes(item.todaySeconds)}</span>
                    {' '}· Semana: <span className="text-white font-bold">{formatMinutes(item.weekSeconds)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}