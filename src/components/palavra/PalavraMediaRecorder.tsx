'use client'

import { useEffect, useRef, useState } from 'react'
import { Video, Trash2, Upload } from 'lucide-react'

export default function PalavraMediaRecorder() {
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [videoName, setVideoName] = useState('')
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [videoPreview])

  function handleVideo(file?: File) {
    if (!file) return

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoPreview(URL.createObjectURL(file))
    setVideoName(file.name)
  }

  function clearVideo() {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoPreview(null)
    setVideoName('')

    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  return (
    <div className="relative space-y-4 overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />

      <div>
        <p className="text-[12px] font-black uppercase tracking-widest text-white/35">
          Vídeo
        </p>

        <p className="mt-1 text-xs text-white/40">
          Opcional. Selecione um vídeo do aparelho.
        </p>
      </div>

      <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4 text-center transition active:scale-[0.98]">
        <Video size={24} className="mb-3 text-brand-400" />

        <p className="text-sm font-bold text-white">
          Vídeo
        </p>

        <p className="mt-1 line-clamp-1 max-w-full text-[11px] text-white/40">
          {videoName || 'Selecionar vídeo'}
        </p>

        <input
          ref={videoInputRef}
          name="video_file"
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(event) => handleVideo(event.target.files?.[0])}
        />
      </label>

      <div className="flex items-center gap-2 text-[11px] text-white/30">
        <Upload size={14} />
        No computador será aberto o seletor de arquivos.
      </div>

      {videoPreview && (
        <div className="rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Video
                size={18}
                className="shrink-0 text-brand-400"
              />

              <p className="truncate text-sm font-bold text-white">
                {videoName || 'Vídeo selecionado'}
              </p>
            </div>

            <button
              type="button"
              onClick={clearVideo}
              aria-label="Remover vídeo"
              className="text-white/35 transition hover:text-red-400"
            >
              <Trash2 size={17} />
            </button>
          </div>

          <video
            controls
            playsInline
            src={videoPreview}
            className="max-h-[420px] w-full rounded-2xl bg-black object-contain"
          />
        </div>
      )}
    </div>
  )
}