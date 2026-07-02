import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/auth/actions'
import { User, AtSign, AlignLeft, Sparkles, Save } from 'lucide-react'
import VersiculoSelector from '@/components/perfil/VersiculoSelector'
import AvatarUpload from '@/components/perfil/AvatarUpload'
import CoverUpload from '@/components/perfil/CoverUpload'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'Editar Perfil — Ministério Nova Aliança',
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
      className={`relative overflow-hidden rounded-[30px] border border-app bg-app-card shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  icon: Icon,
  maxLength,
  multiline = false,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  icon: React.ElementType
  maxLength?: number
  multiline?: boolean
  hint?: string
}) {
  const base =
    'w-full rounded-2xl border border-app bg-app-card pl-11 pr-4 text-[14px] text-app placeholder:text-app-muted/60 outline-none focus:border-brand-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 focus:shadow-[0_0_22px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'

  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-black tracking-widest uppercase text-app-muted mb-2">
        {label}
      </label>

      <div className="relative group">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-300/55 pointer-events-none transition-colors group-focus-within:text-brand-300"
          style={multiline ? { top: '16px', transform: 'none' } : {}}
        />

        {multiline ? (
          <textarea
            name={name}
            defaultValue={defaultValue ?? ''}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className={`${base} pt-4 pb-4 resize-none leading-relaxed`}
          />
        ) : (
          <input
            type="text"
            name={name}
            defaultValue={defaultValue ?? ''}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`${base} h-12`}
          />
        )}
      </div>

      {hint && <p className="text-[11px] text-app-muted px-1">{hint}</p>}
    </div>
  )
}

async function EditarPerfilForm({
  profile,
  error,
}: {
  profile: Record<string, string | null>
  error?: string
}) {
  return (
    <form action={updateProfile} className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      <PremiumCard className="p-4 space-y-4">
        <div className="relative flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-brand-400" />

          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
            Informações do perfil
          </p>
        </div>

        <Field
          label="Nome"
          name="name"
          defaultValue={profile.name}
          placeholder="Seu nome completo"
          icon={User}
          maxLength={80}
        />

        <Field
          label="Username"
          name="username"
          defaultValue={profile.username}
          placeholder="seuusername"
          icon={AtSign}
          maxLength={30}
          hint="Apenas letras, números, _ e . — sem espaços."
        />

        <Field
          label="Bio"
          name="bio"
          defaultValue={profile.bio}
          placeholder="Conte um pouco sobre você..."
          icon={AlignLeft}
          maxLength={200}
          multiline
        />
      </PremiumCard>

      <PremiumCard className="p-4">
        <div className="relative flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-brand-400" />

          <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
            Versículo favorito
          </p>
        </div>

        <VersiculoSelector
          initialVerse={profile.favorite_verse}
          initialRef={profile.favorite_verse_ref}
        />
      </PremiumCard>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full rounded-2xl border border-brand-300/25 bg-brand-gradient py-4 text-sm font-bold text-app shadow-[0_0_28px_rgba(59,130,246,0.18),0_18px_50px_rgba(0,0,0,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Salvar alterações
        </button>
      </div>
    </form>
  )
}

export default async function EditarPerfilPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username, bio, favorite_verse, favorite_verse_ref, avatar_url, cover_url')
    .eq('id', user!.id)
    .single()

  return (
    <div className="relative min-h-screen overflow-hidden bg-app text-app pb-52">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/perfil" />

          <div className="mt-4">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-app-muted">
              Minha Conta
            </p>

            <h1 className="text-[26px] font-black text-app tracking-tight mt-1">
              Editar Perfil
            </h1>

            <p className="text-[12px] text-app-muted mt-1">
              Atualize sua identidade no Ministério Nova Aliança
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <AvatarUpload
            currentUrl={profile?.avatar_url ?? null}
            name={profile?.name ?? 'NA'}
          />

          <CoverUpload currentUrl={profile?.cover_url ?? null} />
        </div>

        <div className="px-4 mt-5">
          <EditarPerfilForm
            profile={{
              name: profile?.name ?? null,
              username: profile?.username ?? null,
              bio: profile?.bio ?? null,
              favorite_verse: profile?.favorite_verse ?? null,
              favorite_verse_ref: profile?.favorite_verse_ref ?? null,
            }}
            error={searchParams.error}
          />
        </div>
      </div>
    </div>
  )
}