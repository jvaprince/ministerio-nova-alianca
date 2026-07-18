'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Mic,
  Video,
  Trash2,
  PlayCircle,
  Upload,
} from 'lucide-react'

export default function PalavraMediaRecorder() {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [audioName, setAudioName] = useState('')
  const [videoName, setVideoName] = useState('')
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [audioPreview, videoPreview])

  function handleAudio(file?: File) {
    if (!file) return

    if (audioPreview) {
      URL.revokeObjectURL(audioPreview)
    }

    setAudioPreview(URL.createObjectURL(file))
    setAudioName(file.name)
  }

  function handleVideo(file?: File) {
    if (!file) return

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoPreview(URL.createObjectURL(file))
    setVideoName(file.name)
  }

  function clearAudio() {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview)
    }

    setAudioPreview(null)
    setAudioName('')

    if (audioInputRef.current) {
      audioInputRef.current.value = ''
    }
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

      <div className="relative">
        <p className="text-[12px] font-black uppercase tracking-widest text-white/35">
          Áudio ou vídeo
        </p>

        <p className="mt-1 text-xs text-white/40">
          Opcional. Grave pelo celular ou selecione um arquivo do aparelho.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-center transition active:scale-[0.98]">
          <Mic size={24} className="mb-3 text-emerald-400" />

          <p className="text-sm font-bold text-white">
            Áudio
          </p>

          <p className="mt-1 line-clamp-1 max-w-full text-[11px] text-white/40">
            {audioName || 'Gravar ou selecionar'}
          </p>

          <input
            ref={audioInputRef}
            name="audio_file"
            type="file"
            accept="audio/*"
            capture
            className="sr-only"
            onChange={(event) => handleAudio(event.target.files?.[0])}
          />
        </label>

        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4 text-center transition active:scale-[0.98]">
          <Video size={24} className="mb-3 text-brand-400" />

          <p className="text-sm font-bold text-white">
            Vídeo
          </p>

          <p className="mt-1 line-clamp-1 max-w-full text-[11px] text-white/40">
            {videoName || 'Gravar ou selecionar'}
          </p>

          <input
            ref={videoInputRef}
            name="video_file"
            type="file"
            accept="video/*"
            capture="user"
            className="sr-only"
            onChange={(event) => handleVideo(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="relative flex items-center gap-2 text-[11px] text-white/30">
        <Upload size={14} />
        No computador, será aberto o seletor de arquivos.
      </div>

      {audioPreview && (
        <div className="relative rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <PlayCircle
                size={18}
                className="shrink-0 text-emerald-400"
              />

              <p className="truncate text-sm font-bold text-white">
                {audioName || 'Áudio selecionado'}
              </p>
            </div>

            <button
              type="button"
              onClick={clearAudio}
              aria-label="Remover áudio"
              className="text-white/35 transition hover:text-red-400"
            >
              <Trash2 size={17} />
            </button>
          </div>

          <audio
            controls
            src={audioPreview}
            className="w-full"
          />
        </div>
      )}

      {videoPreview && (
        <div className="relative rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4">
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