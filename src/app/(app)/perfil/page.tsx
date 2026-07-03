import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/auth/actions'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import ThemeToggle from '@/components/theme/ThemeToggle'
import {
  Settings,
  LogOut,
  Edit2,
  Bell,
  BookOpen,
  Archive,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Perfil — Ministério Nova Aliança',
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
      className={`relative overflow-hidden rounded-[28px] border border-app bg-app-card shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function MenuItem({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <Link
      href={href}
      className="block transition-all duration-300 active:scale-[0.985]"
    >
      <PremiumCard className="group p-4 hover:-translate-y-0.5 hover:border-brand-300/30 hover:shadow-[0_0_28px_rgba(59,130,246,0.10),0_22px_65px_rgba(0,0,0,0.18)]">
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-300/15 flex items-center justify-center text-brand-300 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-500/20">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-app">{title}</p>

            {description && (
              <p className="text-[12px] text-app-muted mt-0.5">
                {description}
              </p>
            )}
          </div>

          <ChevronRight
            size={17}
            className="text-app-muted transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </div>
      </PremiumCard>
    </Link>
  )
}

export default async function PerfilPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    leader: 'Líder',
    member: 'Membro',
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-52 bg-app text-app">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-app-muted">
              Minha Conta
            </p>

            <h1 className="text-[26px] font-black text-app tracking-tight mt-1">
              Perfil
            </h1>

            <p className="text-[12px] text-app-muted mt-1">
              Sua jornada espiritual e comunidade
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/perfil/editar"
              className="w-11 h-11 rounded-full border border-brand-300/20 bg-brand-500/15 backdrop-blur-xl flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 active:scale-95"
            >
              <Edit2 size={17} />
            </Link>
          </div>
        </div>

        <div className="px-4 pb-6">
          <PremiumCard className="p-5 text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <div className="absolute inset-0 rounded-full bg-brand-400/35 blur-2xl animate-pulse" />
              <div className="absolute -inset-2 rounded-full border border-brand-300/20 animate-pulse" />

              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-brand-400/60 shadow-[0_0_45px_rgba(16,86,176,0.42)]"
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full bg-brand-gradient flex items-center justify-center text-3xl font-black text-white border-4 border-brand-400/60 shadow-[0_0_45px_rgba(16,86,176,0.42)]">
                  {getInitials(profile?.name ?? 'NA')}
                </div>
              )}
            </div>

            <h2 className="text-[24px] font-black text-app tracking-tight">
              {profile?.name}
            </h2>

            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-[12px] text-app-muted">
                {profile?.username ? `@${profile.username}` : ''}
              </p>

              <span className="rounded-full border border-brand-300/20 bg-brand-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-brand-300">
                {roleLabel[profile?.role ?? 'member']}
              </span>
            </div>

            {profile?.bio && (
              <p className="text-[13px] text-app-muted text-center mt-4 px-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {profile?.favorite_verse && (
              <div className="relative mt-5 overflow-hidden rounded-[26px] border border-brand-300/15 bg-brand-500/10 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-brand-400/70" />

                <div className="relative flex items-center gap-2 mb-2 pl-3">
                  <Sparkles size={13} className="text-brand-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-400">
                    Versículo favorito
                  </p>
                </div>

                <p className="relative pl-3 text-[14px] leading-[1.65] text-app">
                  &quot;{profile.favorite_verse}&quot;
                </p>

                {profile.favorite_verse_ref && (
                  <p className="relative pl-3 mt-3 text-[12px] font-black text-brand-400">
                    {profile.favorite_verse_ref}
                  </p>
                )}
              </div>
            )}
          </PremiumCard>
        </div>

        <div className="px-4 space-y-3">
          <MenuItem
            href="/perfil/editar"
            icon={<Settings size={18} />}
            title="Editar perfil"
            description="Foto, capa, bio e informações"
          />

          <MenuItem
            href="/perfil/conquistas"
            icon={<span className="text-lg">🏆</span>}
            title="Conquistas"
            description="Veja seu progresso e medalhas"
          />

          <MenuItem
            href="/feed/stories/criar/arquivo"
            icon={<Archive size={18} />}
            title="Meus Stories"
            description="Arquivo e destaques do perfil"
          />

          <MenuItem
            href="/notificacoes"
            icon={<Bell size={18} />}
            title="Notificações"
            description="Acompanhe interações e avisos"
          />

          <MenuItem
            href="/biblia/diario"
            icon={<BookOpen size={18} />}
            title="Diário Espiritual"
            description="Suas reflexões das jornadas"
          />

          {profile?.role === 'admin' && (
            <MenuItem
              href="/admin"
              icon={<ShieldCheck size={18} />}
              title="Administração"
              description="Gerenciar o ministério"
            />
          )}

          <form action={signOut as any}>
            <button
              type="submit"
              className="w-full relative overflow-hidden rounded-[28px] border border-red-400/20 bg-red-500/10 p-4 shadow-[0_0_24px_rgba(239,68,68,0.06),0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all active:scale-[0.985]"
            >
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-400/15 flex items-center justify-center shrink-0">
                  <LogOut size={18} className="text-red-400" />
                </div>

                <span className="text-[14px] font-bold text-red-400">
                  Sair
                </span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}