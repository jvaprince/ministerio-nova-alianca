'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Send } from 'lucide-react'
import { criarFeedStory } from '@/lib/feed/story-actions'

export default function CreateStoryForm() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [text, setText] = useState('')

  function handleFile(file?: File) {
    if (!file) return

    setPreview(URL.createObjectURL(file))

    if (file.type.startsWith('video/')) {
      setMediaType('video')
    } else {
      setMediaType('image')
    }
  }

  return (
    <form action={criarFeedStory} className="px-4 pt-5 space-y-5">
      <input
  ref={inputRef}
  name="media"
  type="file"
  accept="image/*,video/*"
  className="sr-only"
  onChange={(e) => handleFile(e.target.files?.[0])}
/>

      <div className="mx-auto w-full max-w-[330px] aspect-[9/16] rounded-[30px] overflow-hidden border border-white/[0.10] bg-[#111827] relative">
        {preview ? (
          <>
            {mediaType === 'image' && (
              <img
                src={preview}
                alt="Preview do story"
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            )}

            {mediaType === 'video' && (
              <video
                src={preview}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            )}

            {text && (
              <div className="absolute inset-x-4 bottom-8 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-3">
                <p className="text-white text-lg font-bold text-center whitespace-pre-line">
                  {text}
                </p>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center text-center px-8"
          >
            <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 mb-4">
              <ImagePlus size={28} />
            </div>

            <p className="text-white font-bold text-lg">
              Escolher foto ou vídeo
            </p>

            <p className="text-white/35 text-sm mt-2">
              Veja como seu story ficará publicado.
            </p>
          </button>
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-3 text-center text-sm font-semibold text-brand-400"
        >
          Trocar foto ou vídeo
        </button>
      )}

      <textarea
        name="content"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva algo para aparecer no story..."
        className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 resize-none"
      />

      <button
        type="submit"
        className="w-full bg-brand-gradient text-white font-semibold py-3.5 rounded-xl shadow-brand text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Send size={16} />
        Publicar story
      </button>
    </form>
  )
}