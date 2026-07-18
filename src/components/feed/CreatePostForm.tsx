'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import {
  Film,
  ImageIcon,
  Loader2,
  Send,
  Upload,
  X,
} from 'lucide-react'

type SelectedMedia = {
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function CreatePostForm() {
  const [text, setText] = useState('')
  const [media, setMedia] = useState<SelectedMedia | null>(null)
  const [dragging, setDragging] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [uploading, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (media?.preview) {
        URL.revokeObjectURL(media.preview)
      }
    }
  }, [media])

  const compressImage = async (file: File) => {
    if (file.size < 300 * 1024) {
      return file
    }

    return imageCompression(file, {
      maxSizeMB: 0.35,
      maxWidthOrHeight: 1800,
      useWebWorker: true,
      initialQuality: 0.85,
    })
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file) return

    if (media?.preview) {
      URL.revokeObjectURL(media.preview)
    }

    if (file.type.startsWith('video')) {
      setMedia({
        file,
        preview: URL.createObjectURL(file),
        type: 'video',
      })

      return
    }

    setCompressing(true)

    try {
      const compressed = await compressImage(file)

      setMedia({
        file: compressed,
        preview: URL.createObjectURL(compressed),
        type: 'image',
      })
    } finally {
      setCompressing(false)
    }
  }, [media])

  const onInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    await handleFile(file)
  }

  const onDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault()

    setDragging(false)

    const file = e.dataTransfer.files?.[0]

    if (!file) return

    await handleFile(file)
  }

  const publish = () => {
    startTransition(async () => {
      const form = new FormData()

      form.append('content', text)

      if (media) {
        form.append('image', media.file)
      }

      const response = await fetch('/api/feed/criar', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error)
      }

      window.location.href = '/feed'
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-white">
              Criar publicação
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Compartilhe algo com o ministério.
            </p>
          </div>

          <button
            disabled={uploading}
            onClick={publish}
            className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}

            Publicar
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="No que você está pensando?"
            className="min-h-[160px] w-full resize-none bg-transparent text-lg text-white outline-none placeholder:text-zinc-500"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => {
              setDragging(false)
            }}
            onDrop={onDrop}
            className={`mt-6 overflow-hidden rounded-3xl border-2 border-dashed transition-all ${
              dragging
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-white/10'
            }`}
          >
            {media ? (
              <div className="relative">
                {media.type === 'image' ? (
                  <Image
                    src={media.preview}
                    alt="Preview"
                    width={1200}
                    height={1200}
                    className="max-h-[520px] w-full object-cover"
                  />
                ) : (
                  <video
                    src={media.preview}
                    controls
                    className="max-h-[520px] w-full"
                  />
                )}

                <button
                  onClick={() => {
                    URL.revokeObjectURL(media.preview)

                    setMedia(null)

                    if (inputRef.current) {
                      inputRef.current.value = ''
                    }
                  }}
                  className="absolute right-4 top-4 rounded-full bg-black/60 p-3 backdrop-blur transition hover:scale-110"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                {compressing ? (
                  <>
                    <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-400" />

                    <p className="text-white">
                      Comprimindo imagem...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-5 rounded-full bg-white/5 p-5">
                      <Upload className="h-10 w-10 text-zinc-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      Arraste sua mídia aqui
                    </h3>

                    <p className="mt-2 text-center text-sm text-zinc-500">
                      ou clique abaixo para escolher
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:scale-105"
                      >
                        <ImageIcon className="h-5 w-5" />
                        Imagem
                      </button>

                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                      >
                        <Film className="h-5 w-5" />
                        Vídeo
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={onInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}