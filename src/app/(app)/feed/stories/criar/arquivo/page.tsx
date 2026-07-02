import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Archive } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CreateHighlightForm from '@/components/feed/CreateHighlightForm'
import BackButton from '@/components/ui/BackButton'

export const metadata: Metadata = {
  title: 'Meus Stories — Ministério Nova Aliança',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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

export default async function ArquivoStoriesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const { data: stories } = await supabase
    .from('feed_stories')
    .select(`
      id,
      image_url,
      video_url,
      content,
      created_at,
      expires_at
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const activeStories =
    stories?.filter((story) => new Date(story.expires_at).toISOString() > now) ??
    []

  const archivedStories =
    stories?.filter((story) => new Date(story.expires_at).toISOString() <= now) ??
    []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5">
          <BackButton href="/perfil" />

          <div className="mt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-300/20 flex items-center justify-center text-brand-300 shadow-[0_0_24px_rgba(59,130,246,0.08)]">
              <Archive size={21} />
            </div>

            <div>
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                Stories
              </p>

              <h1 className="text-[26px] font-black text-white tracking-tight">
                Meus Stories
              </h1>
            </div>
          </div>

          <p className="text-xs text-white/35 mt-3 leading-relaxed">
            Use stories ativos ou expirados para criar destaques no seu perfil.
          </p>
        </div>

        <div className="px-4">
          <CreateHighlightForm stories={stories ?? []} />

          {!stories || stories.length === 0 ? (
            <PremiumCard className="mt-4 p-8 text-center">
              <Archive size={28} className="relative text-white/25 mx-auto mb-3" />

              <p className="relative text-sm font-semibold text-white/60">
                Nenhum story encontrado.
              </p>

              <p className="relative text-xs text-white/30 mt-1">
                Publique um story para criar destaques.
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-8 mt-5">
              {activeStories.length > 0 && (
                <section>
                  <div className="mb-3">
                    <p className="text-[11px] font-black tracking-[0.24em] uppercase text-brand-400">
                      Stories ativos
                    </p>

                    <p className="text-xs text-white/35 mt-1">
                      Ainda aparecem no feed por 24 horas.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {activeStories.map((story) => (
                      <StoryCard key={story.id} story={story} active />
                    ))}
                  </div>
                </section>
              )}

              {archivedStories.length > 0 && (
                <section>
                  <div className="mb-3">
                    <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                      Stories expirados
                    </p>

                    <p className="text-xs text-white/30 mt-1">
                      Não aparecem mais no feed, mas podem virar destaque.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {archivedStories.map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StoryCard({
  story,
  active = false,
}: {
  story: {
    id: string
    image_url: string | null
    video_url: string | null
    content: string | null
    created_at: string
    expires_at: string
  }
  active?: boolean
}) {
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_22px_rgba(59,130,246,0.08),0_14px_40px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />

      {story.image_url && (
        <img
          src={story.image_url}
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {story.video_url && (
        <video
          src={story.video_url}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {!story.image_url && !story.video_url && (
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
          <p className="text-xs text-white/50 line-clamp-4">
            {story.content ?? 'Story'}
          </p>
        </div>
      )}

      {active && (
        <div className="absolute top-2 left-2 rounded-full bg-brand-500/90 px-2 py-1 shadow-[0_0_16px_rgba(59,130,246,0.35)]">
          <p className="text-[9px] font-black uppercase tracking-wider text-white">
            Ativo
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
        <p className="text-[10px] text-white/75 font-semibold leading-tight">
          {formatDate(story.created_at)}
        </p>

        {story.content && (
          <p className="text-[10px] text-white/90 line-clamp-2 mt-1">
            {story.content}
          </p>
        )}
      </div>
    </div>
  )
}