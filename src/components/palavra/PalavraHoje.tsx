'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  MessageCircle,
  Send,
  Edit2,
  Play,
  ChevronDown,
  Headphones,
  Sparkles,
    CheckCircle2,
  Star,
} from 'lucide-react'
import {
  togglePalavraInteraction,
  adicionarComentario,
  togglePalavraFavorite,
} from '@/lib/palavra/actions'
import type { PalavraDodia } from '@/types'
import { getInitials } from '@/lib/utils'

interface PalavraHojeProps {
  palavra: PalavraDodia
  userId: string
  podeGerir: boolean
  comentariosSlot: React.ReactNode
}

export default function PalavraHoje({
  palavra,
  userId,
  podeGerir,
  comentariosSlot,
}: PalavraHojeProps) {
  const [isPending, startTransition] = useTransition()
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroComentario, setErroComentario] = useState<string | null>(null)
  const [comentariosVisiveis, setComentariosVisiveis] = useState(true)
  const [mediaTab, setMediaTab] = useState<'audio' | 'video'>(
    palavra.audio_url ? 'audio' : 'video'
  )

  const [optState, setOptState] = useState({
    devotional: palavra.user_devotional ?? false,
    devotionalCount: palavra.devotional_count ?? 0,
  })

  const [favorite, setFavorite] = useState(Boolean((palavra as any).user_favorited))

  const responsible = palavra.responsible as
    | {
        id?: string
        name: string
        avatar_url: string | null
        role: string
      }
    | undefined

  const roleLabel =
    responsible?.role === 'admin'
      ? 'Admin'
      : responsible?.role === 'leader'
        ? 'Líder'
        : 'Membro'

  const hasAudio = Boolean(palavra.audio_url)
  const hasVideo = Boolean(palavra.video_url)
  const hasMedia = hasAudio || hasVideo

  function handleDevotional() {
    if (isPending) return

    startTransition(async () => {
      const previous = optState

      setOptState((prev) => ({
        devotional: !prev.devotional,
        devotionalCount: prev.devotional
          ? Math.max(prev.devotionalCount - 1, 0)
          : prev.devotionalCount + 1,
      }))

      const result = await togglePalavraInteraction(palavra.id, 'devotional')

      if (result?.error) {
        setOptState(previous)
      }
    })
  }

  function handleFavorite() {
  const previous = favorite
  setFavorite(!previous)

  startTransition(async () => {
    const result = await togglePalavraFavorite(palavra.id)

    if (result?.error) {
      setFavorite(previous)
    }
  })
}

  async function handleComentario(e: React.FormEvent) {
    e.preventDefault()
    if (!comentario.trim() || enviando) return

    setEnviando(true)
    setErroComentario(null)

    const result = await adicionarComentario(palavra.id, comentario)

    if (result?.error) {
      setErroComentario(result.error)
    } else {
      setComentario('')
    }

    setEnviando(false)
  }

  return (
    <div>
      <section className="mx-4 mt-2 overflow-hidden rounded-[34px] border border-brand-300/20 bg-white/[0.045] shadow-[0_0_34px_rgba(59,130,246,0.12),0_26px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        <div className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-500/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />

          <div className="relative flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-400">
                Palavra compartilhada
              </p>

              <p className="text-[12px] text-white/40 mt-1">
                {new Date(palavra.scheduled_date + 'T12:00:00').toLocaleDateString(
                  'pt-BR',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>
            </div>

            <button
  type="button"
  onClick={handleFavorite}
  disabled={isPending}
  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all active:scale-95 ${
    favorite
      ? 'border-amber-300/30 bg-amber-400/15 text-amber-200'
      : 'border-white/10 bg-white/[0.04] text-white/35'
  }`}
>
  <Star
    size={12}
    className={favorite ? 'fill-amber-200 text-amber-200' : ''}
  />
  <span className="text-[10px] font-black uppercase tracking-widest">
    {favorite ? 'Salva' : 'Salvar'}
  </span>
</button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            {responsible?.avatar_url ? (
              <img
                src={responsible.avatar_url}
                alt={responsible.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/35"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-black text-white shrink-0">
                {getInitials(responsible?.name ?? 'NA')}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-white truncate">
                {responsible?.name ?? 'Responsável'}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-white/40">
                  Responsável pela Palavra
                </span>

                <span className="rounded-full border border-brand-300/20 bg-brand-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-300">
                  {roleLabel}
                </span>
              </div>
            </div>

            {podeGerir && palavra.responsible?.id === userId && (
              <Link
                href={`/palavra/editar/${palavra.id}`}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              >
                <Edit2 size={15} />
              </Link>
            )}
          </div>

          {palavra.verse && (
            <div className="relative overflow-hidden rounded-[24px] border border-brand-300/15 bg-gradient-to-br from-brand-500/12 to-brand-500/4 p-5 shadow-[0_10px_35px_rgba(59,130,246,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]">

  <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-brand-400/70" />

  <p className="pl-4 text-[16px] leading-[1.75] font-medium text-white/95 tracking-[0.01em]">
    “{palavra.verse}”
  </p>

  {palavra.verse_ref && (
    <p className="pl-4 text-[13px] font-black text-brand-300 mt-4 tracking-wide">
      {palavra.verse_ref}
    </p>
  )}
</div>
          )}

          {palavra.reflection && (
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-brand-400/60" />

              <p className="text-[10px] font-black tracking-widest uppercase text-white/35 mb-3">
                Reflexão
              </p>

              <p className="text-[14px] leading-[1.8] text-white/75">
                {palavra.reflection}
              </p>
            </div>
          )}
        </div>
      </section>

      {hasMedia && (
        <section className="mx-4 mt-4 rounded-[34px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          {hasAudio && hasVideo && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMediaTab('audio')}
                className={`h-11 rounded-2xl text-sm font-black transition-all active:scale-[0.98] ${
                  mediaTab === 'audio'
                    ? 'bg-emerald-500/15 border border-emerald-300/25 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/40'
                }`}
              >
                🎧 Ouvir
              </button>

              <button
                type="button"
                onClick={() => setMediaTab('video')}
                className={`h-11 rounded-2xl text-sm font-black transition-all active:scale-[0.98] ${
                  mediaTab === 'video'
                    ? 'bg-brand-500/15 border border-brand-300/25 text-brand-300 shadow-[0_0_18px_rgba(59,130,246,0.16)]'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/40'
                }`}
              >
                🎥 Assistir
              </button>
            </div>
          )}

          {hasAudio && (!hasVideo || mediaTab === 'audio') && (
            <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />

              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                  <Headphones size={22} className="text-emerald-400" />
                </div>

                <div>
                  <p className="text-[14px] font-black text-white">
                    Devocional em áudio
                  </p>

                  <p className="text-[11px] text-white/40 mt-0.5">
                    Por {responsible?.name ?? 'responsável'}
                  </p>
                </div>
              </div>

              <audio
                controls
                preload="metadata"
                src={palavra.audio_url ?? ''}
                className="relative w-full"
              />
            </div>
          )}

          {hasVideo && (!hasAudio || mediaTab === 'video') && (
            <div className="relative overflow-hidden rounded-[28px] border border-brand-300/20 bg-brand-500/10 p-4">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent" />

              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-500/15 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.18)]">
                  <Play size={22} className="text-brand-400" />
                </div>

                <div>
                  <p className="text-[14px] font-black text-white">
                    Mensagem em vídeo
                  </p>

                  <p className="text-[11px] text-white/40 mt-0.5">
                    Por {responsible?.name ?? 'responsável'}
                  </p>
                </div>
              </div>

              <video
                controls
                src={palavra.video_url ?? ''}
                className="relative w-full rounded-[24px] bg-black shadow-[0_12px_45px_rgba(0,0,0,0.45)]"
              />
            </div>
          )}
        </section>
      )}

      <section className="mx-4 mt-4">
        <button
          type="button"
          onClick={handleDevotional}
          disabled={isPending}
          className={`w-full rounded-[24px] border px-4 py-3 transition-all active:scale-[0.98] ${
            optState.devotional
              ? 'bg-brand-500/15 border-brand-300/25 text-brand-300 shadow-[0_0_20px_rgba(59,130,246,0.14)]'
              : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.14)]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {optState.devotional ? (
              <CheckCircle2 size={18} />
            ) : (
              <BookOpen size={18} />
            )}

            <span className="text-[13px] font-black">
              {optState.devotional
                ? 'Devocional concluído'
                : 'Marcar devocional como feito'}
            </span>
          </div>

          <p className="text-[11px] opacity-55 mt-1">
            {optState.devotionalCount} pessoa{optState.devotionalCount === 1 ? '' : 's'} hoje
          </p>
        </button>
      </section>

      <section className="mx-4 mt-6">
        <button
          type="button"
          onClick={() => setComentariosVisiveis((v) => !v)}
          className="flex items-center justify-between gap-3 w-full text-left"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={15} className="text-brand-400" />

            <span className="text-[11px] font-black tracking-widest uppercase text-white/40">
              Comunidade
            </span>
          </div>

          <ChevronDown
            size={15}
            className={`text-white/25 transition-transform ${
              comentariosVisiveis ? 'rotate-180' : ''
            }`}
          />
        </button>

        {comentariosVisiveis && (
          <div className="mt-4">
            {comentariosSlot}
          </div>
        )}

        <form onSubmit={handleComentario} className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-black text-white shrink-0">
            Eu
          </div>

          <div className="flex-1 relative">
            <input
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Compartilhe uma reflexão..."
              maxLength={500}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-2xl px-4 py-3 pr-10 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50"
            />

            <button
              type="submit"
              disabled={!comentario.trim() || enviando}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-brand-400 disabled:opacity-40 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </form>

        {erroComentario && (
          <p className="text-red-400 text-[12px] mt-2">{erroComentario}</p>
        )}
      </section>
    </div>
  )
}