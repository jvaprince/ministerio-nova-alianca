'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Video, Upload, Square, Trash2, PlayCircle } from 'lucide-react'

export default function PalavraMediaRecorder() {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const [recording, setRecording] = useState<'audio' | 'video' | null>(null)
  const [audioName, setAudioName] = useState('')
  const [videoName, setVideoName] = useState('')
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [audioPreview, videoPreview])

  function setFileToInput(
    input: HTMLInputElement | null,
    file: File
  ) {
    if (!input) return

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    input.files = dataTransfer.files
  }

  async function startRecording(type: 'audio' | 'video') {
    if (recording) return

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video',
    })

    streamRef.current = stream
    chunksRef.current = []

    const recorder = new MediaRecorder(stream)
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onstop = () => {
      const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm'
      const file = new File(
        [new Blob(chunksRef.current, { type: mimeType })],
        `palavra-${type}-${Date.now()}.webm`,
        { type: mimeType }
      )

      const previewUrl = URL.createObjectURL(file)

      if (type === 'audio') {
        if (audioPreview) URL.revokeObjectURL(audioPreview)
        setFileToInput(audioInputRef.current, file)
        setAudioPreview(previewUrl)
        setAudioName(file.name)
      }

      if (type === 'video') {
        if (videoPreview) URL.revokeObjectURL(videoPreview)
        setFileToInput(videoInputRef.current, file)
        setVideoPreview(previewUrl)
        setVideoName(file.name)
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    recorder.start()
    setRecording(type)
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(null)
  }

  function handleVideoUpload(file?: File) {
    if (!file) return

    if (videoPreview) URL.revokeObjectURL(videoPreview)

    setVideoPreview(URL.createObjectURL(file))
    setVideoName(file.name)
  }

  function clearAudio() {
    if (audioPreview) URL.revokeObjectURL(audioPreview)

    setAudioPreview(null)
    setAudioName('')

    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  function clearVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)

    setVideoPreview(null)
    setVideoName('')

    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl space-y-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />

      <div className="relative">
        <p className="text-[12px] font-black tracking-widest uppercase text-white/35">
          Áudio ou vídeo
        </p>

        <p className="text-white/40 text-xs mt-1">
          Opcional. Você pode escrever, gravar áudio, gravar vídeo ou enviar um vídeo.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            recording === 'audio' ? stopRecording() : startRecording('audio')
          }
          disabled={recording === 'video'}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-white font-bold active:scale-[0.98] disabled:opacity-40"
        >
          {recording === 'audio' ? (
            <>
              <Square size={20} className="mx-auto mb-2 text-red-400" />
              Parar áudio
            </>
          ) : (
            <>
              <Mic size={20} className="mx-auto mb-2 text-emerald-400" />
              Gravar áudio
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            recording === 'video' ? stopRecording() : startRecording('video')
          }
          disabled={recording === 'audio'}
          className="rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4 text-white font-bold active:scale-[0.98] disabled:opacity-40"
        >
          {recording === 'video' ? (
            <>
              <Square size={20} className="mx-auto mb-2 text-red-400" />
              Parar vídeo
            </>
          ) : (
            <>
              <Video size={20} className="mx-auto mb-2 text-brand-400" />
              Gravar vídeo
            </>
          )}
        </button>
      </div>

      <label className="relative flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-white/70 text-sm font-bold active:scale-[0.98]">
        <Upload size={18} className="text-brand-400" />
        Enviar vídeo
        <input
          ref={videoInputRef}
          name="video_file"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleVideoUpload(e.target.files?.[0])}
        />
      </label>

      <input
        ref={audioInputRef}
        name="audio_file"
        type="file"
        accept="audio/*"
        className="hidden"
      />

      {recording && (
        <div className="relative rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
          <p className="text-red-300 text-xs font-bold">
            Gravando {recording === 'audio' ? 'áudio' : 'vídeo'}… toque em parar para finalizar.
          </p>
        </div>
      )}

      {audioPreview && (
        <div className="relative rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <PlayCircle size={18} className="text-emerald-400 shrink-0" />
              <p className="text-white font-bold text-sm truncate">
                {audioName || 'Áudio gravado'}
              </p>
            </div>

            <button
              type="button"
              onClick={clearAudio}
              className="text-white/35 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <audio controls src={audioPreview} className="w-full" />
        </div>
      )}

      {videoPreview && (
        <div className="relative rounded-2xl border border-brand-300/20 bg-brand-500/10 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Video size={18} className="text-brand-400 shrink-0" />
              <p className="text-white font-bold text-sm truncate">
                {videoName || 'Vídeo selecionado'}
              </p>
            </div>

            <button
              type="button"
              onClick={clearVideo}
              className="text-white/35 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <video
            controls
            src={videoPreview}
            className="w-full rounded-2xl bg-black"
          />
        </div>
      )}
    </div>
  )
}