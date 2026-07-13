'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { criarDestaqueStory } from '@/lib/feed/highlight-actions'
import SubmitButton from '@/components/feed/SubmitButton'

type ArchivedStory = {
  id: string
  image_url: string | null
  video_url: string | null
  content: string | null
  created_at: string
}

type CreateHighlightFormProps = {
  stories: ArchivedStory[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

export default function CreateHighlightForm({
  stories,
}: CreateHighlightFormProps) {
  const [open, setOpen] = useState(false)

  if (stories.length === 0) return null

  return (
    <div className="mb-5">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-3.5 rounded-2xl shadow-brand text-sm"
        >
          <Plus size={17} />
          Criar destaque
        </button>
      ) : (
        <form
          action={criarDestaqueStory}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 space-y-4"
        >
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-white/35 mb-2">
              Nome do destaque
            </label>

            <input
              name="title"
              placeholder="Ex: Cultos, Família, Jovens..."
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/35 mb-3">
              Escolha os stories
            </p>

            <div className="grid grid-cols-3 gap-3">
              {stories.map((story) => (
                <label
                  key={story.id}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]"
                >
                  <input
                    type="checkbox"
                    name="story_ids"
                    value={story.id}
                    className="absolute top-2 left-2 z-20 w-5 h-5 accent-blue-500"
                  />

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
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] text-white/70 font-semibold py-3 rounded-xl text-sm"
            >
              Cancelar
            </button>

            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  )
}