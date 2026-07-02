import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  atualizarTituloDestaque,
  adicionarStoryAoDestaque,
  removerStoryDoDestaque,
} from '@/lib/feed/highlight-actions'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

export default async function EditarDestaquePage({
  params,
}: {
  params: {
    username: string
    highlightId: string
  }
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = decodeURIComponent(params.username).replace('@', '')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single()

  if (!profile) notFound()
  if (profile.id !== user.id) redirect(`/perfil/${profile.username}`)

  const { data: highlight } = await supabase
    .from('story_highlights')
    .select('id, title, user_id')
    .eq('id', params.highlightId)
    .eq('user_id', user.id)
    .single()

  if (!highlight) notFound()

  const { data: items } = await supabase
    .from('story_highlight_items')
    .select(`
      id,
      story_id,
      story:feed_stories (
        id,
        image_url,
        video_url,
        content,
        created_at
      )
    `)
    .eq('highlight_id', highlight.id)
    .order('created_at', { ascending: true })

  const currentStoryIds = new Set(items?.map((item) => item.story_id) ?? [])

  const { data: allStories } = await supabase
    .from('feed_stories')
    .select('id, image_url, video_url, content, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const availableStories =
    allStories?.filter((story) => !currentStoryIds.has(story.id)) ?? []

  return (
    <div className="px-4 pt-12 pb-10">
      <Link
        href={`/perfil/${profile.username}`}
        className="inline-flex items-center gap-2 text-white/45 text-sm mb-5"
      >
        <ArrowLeft size={16} />
        Voltar para o perfil
      </Link>

      <h1 className="text-2xl font-bold text-white">
        Editar destaque
      </h1>

      <form
        action={async (formData) => {
          'use server'
          await atualizarTituloDestaque(
            highlight.id,
            String(formData.get('title') ?? '')
          )
        }}
        className="mt-5 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4"
      >
        <label className="block text-[11px] font-bold tracking-widest uppercase text-white/35 mb-2">
          Nome do destaque
        </label>

        <input
          name="title"
          defaultValue={highlight.title}
          className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-3 text-white text-sm outline-none"
        />

        <button
          type="submit"
          className="mt-3 w-full h-11 rounded-xl bg-brand-gradient text-white font-semibold"
        >
          Salvar nome
        </button>
      </form>

      <section className="mt-7">
        <h2 className="text-white font-bold mb-3">
          Stories neste destaque
        </h2>

        {!items || items.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4">
            <p className="text-sm text-white/45">
              Nenhum story neste destaque.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item: any) => {
              const story = Array.isArray(item.story)
                ? item.story[0]
                : item.story

              if (!story) return null

              return (
                <div
                  key={item.id}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]"
                >
                  <form
                    action={async () => {
                      'use server'
                      await removerStoryDoDestaque(highlight.id, story.id)
                    }}
                    className="absolute top-2 right-2 z-20"
                  >
                    <button
                      type="submit"
                      className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>

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

                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[10px] text-white/80 font-semibold">
                      {formatDate(story.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-white font-bold mb-3">
          Adicionar stories
        </h2>

        {availableStories.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4">
            <p className="text-sm text-white/45">
              Não há outros stories disponíveis para adicionar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {availableStories.map((story) => (
              <form
                key={story.id}
                action={async () => {
                  'use server'
                  await adicionarStoryAoDestaque(highlight.id, story.id)
                }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]"
              >
                <button
                  type="submit"
                  className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>

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

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-white/80 font-semibold">
                    {formatDate(story.created_at)}
                  </p>
                </div>
              </form>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}