import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Heart,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BibleFavorites from '@/components/biblia/BibleFavorites'

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[26px]
        border border-white/[0.08]
        bg-white/[0.045]
        backdrop-blur-xl
        transition duration-300
        ${className}
      `}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-3">
      <h2 className="text-[17px] font-black tracking-tight text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs leading-relaxed text-white/35">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default async function BibliaFavoritosPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('bible_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const favorites = data ?? []

  const books = new Set(
    favorites.map((item: any) => item.book)
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-5 pb-52 pt-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-brand-500/[0.10] blur-3xl" />

        <div className="absolute -right-32 top-[420px] h-80 w-80 rounded-full bg-blue-500/[0.08] blur-3xl" />

        <div className="absolute bottom-24 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-brand-500/[0.045] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl">

        <Link
          href="/biblia"
          className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/[0.08]"
        >
          <ArrowLeft size={18} />
        </Link>

        <header className="mb-7">
          <div className="flex items-center gap-2">
            <Heart
              size={15}
              className="fill-rose-400 text-rose-400"
            />

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400/80">
              Bíblia compartilhada
            </p>
          </div>

          <h1 className="mt-3 text-[38px] font-black leading-none tracking-[-0.04em] text-white">
            Favoritos
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
            Todos os versículos que marcaram sua caminhada com Deus.
          </p>
        </header>

        {/* Estatísticas */}
        <section className="mb-8 grid grid-cols-2 gap-3">

          <GlassCard className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
              <Heart
                size={18}
                className="fill-current"
              />
            </div>

            <p className="mt-5 text-3xl font-black text-white">
              {favorites.length}
            </p>

            <p className="mt-1 text-xs text-white/35">
              Favoritos
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
              <BookOpen size={18} />
            </div>

            <p className="mt-5 text-3xl font-black text-white">
              {books.size}
            </p>

            <p className="mt-1 text-xs text-white/35">
              Livros
            </p>
          </GlassCard>

        </section>

        <section>

          <SectionTitle
            title="Sua coleção"
            subtitle="Pesquise, filtre e encontre rapidamente qualquer versículo favoritado."
          />

          <BibleFavorites favorites={favorites} />

        </section>

      </div>
    </main>
  )
}