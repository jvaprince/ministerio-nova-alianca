import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Users,
  Crown,
  FileText,
  Trophy,
  BookOpen,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin — Ministério Nova Aliança',
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300 mb-4">
          {icon}
        </div>

        <p className="text-3xl font-black text-white">
          {value}
        </p>

        <p className="text-sm text-white/45 mt-1">
          {label}
        </p>
      </div>
    </div>
  )
}

function AdminCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-5 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl active:scale-[0.98] transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-lg">
            {title}
          </p>

          <p className="text-sm text-white/45 mt-1">
            {description}
          </p>
        </div>

        <ChevronRight size={20} className="text-white/25" />
      </div>
    </Link>
  )
}

export default async function AdminPage() {
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

  const [{ count: totalMembers }, { count: totalLeaders }, { count: totalPosts }, { count: totalAchievements }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'leader'),
      supabase.from('feed_posts').select('*', { count: 'exact', head: true }),
      supabase.from('user_achievements').select('*', { count: 'exact', head: true }),
    ])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pt-10 pb-52 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
          Painel Administrativo
        </p>

        <h1 className="text-[34px] font-black tracking-tight mt-2">
          Administração
        </h1>

        <p className="text-white/45 mt-2">
          Controle o aplicativo e acompanhe o crescimento do ministério.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <StatCard
            icon={<Users size={22} />}
            value={totalMembers ?? 0}
            label="Membros"
          />

          <StatCard
            icon={<Crown size={22} />}
            value={totalLeaders ?? 0}
            label="Líderes"
          />

          <StatCard
            icon={<FileText size={22} />}
            value={totalPosts ?? 0}
            label="Posts"
          />

          <StatCard
            icon={<Trophy size={22} />}
            value={totalAchievements ?? 0}
            label="Conquistas"
          />
        </div>

        <div className="space-y-4 mt-8">
          <AdminCard
            href="/admin/membros"
            title="Membros"
            description="Gerencie cargos e convites."
          />

          <AdminCard
            href="/admin/palavra"
            title="Palavra do Dia"
            description="Gerencie mensagens e reflexões."
          />

          <AdminCard
  href="/admin/escala"
  title="Escala da Palavra"
  description="Gere e ajuste os responsáveis automaticamente."
/>

          <AdminCard
            href="/admin/agenda"
            title="Agenda"
            description="Eventos e atividades da igreja."
          />

          <AdminCard
            href="/admin/moderacao"
            title="Moderação"
            description="Posts, comentários e stories."
          />

          <AdminCard
  href="/admin/conquistas"
  title="Conquistas"
  description="Crie e gerencie medalhas do app."
/>

<AdminCard
  href="/admin/atividade"
  title="Atividade"
  description="Veja tempo no app, engajamento e participação."
/>
        </div>
      </div>
    </div>
  )
}