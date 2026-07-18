'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type HighlightStory = {
  id: string
  image_url: string | null
  video_url: string | null
  content: string | null
  created_at: string
  expires_at: string
  author: {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

type HighlightViewerProps = {
  title: string
  username: string | null
  stories: HighlightStory[]
  isOwnProfile?: boolean
  editHref?: string
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`

  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

export default function HighlightViewer({
  title,
  username,
  stories,
  isOwnProfile = false,
  editHref,
}: HighlightViewerProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  const activeStory = stories[activeIndex]

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    setProgress(0)
  }, [activeStory?.id])

  useEffect(() => {
    if (!activeStory || paused || activeStory.video_url) return

    const duration = 5000
    const step = 100 / (duration / 100)

    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval)
          goNext()
          return 100
        }

        return current + step
      })
    }, 100)

    return () => clearInterval(interval)
  }, [activeStory?.id, paused])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeStory?.video_url) return

    if (paused) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [paused, activeStory?.id, activeStory?.video_url])

  function close() {
    if (username) {
      router.push(`/perfil/${username}`)
      return
    }

    router.back()
  }

  function goNext() {
    const nextIndex = activeIndex + 1

    if (nextIndex < stories.length) {
      setActiveIndex(nextIndex)
      return
    }

    close()
  }

  function goPrev() {
    const prevIndex = activeIndex - 1

    if (prevIndex >= 0) {
      setActiveIndex(prevIndex)
    }
  }

  if (!activeStory) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center px-6 text-center">
        <button
          type="button"
          onClick={close}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>

        <p className="text-white font-bold text-lg">Destaque vazio</p>

        <p className="text-white/45 text-sm mt-2">
          Esse destaque não possui stories para exibir.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center">
      <button
        type="button"
        onClick={close}
        className="absolute top-5 right-5 z-[1000000] w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
      >
        <X size={20} />
      </button>

      {isOwnProfile && editHref && (
        <Link
          href={editHref}
          className="absolute top-5 left-5 z-[1000000] h-10 px-4 rounded-full bg-white/10 flex items-center justify-center gap-2 text-white text-sm font-semibold"
        >
          <Pencil size={16} />
          Editar
        </Link>
      )}

      <div
        className="relative w-full h-full max-w-[430px] sm:h-auto sm:max-w-[390px] sm:aspect-[9/16] bg-black overflow-hidden sm:rounded-[28px]"
        onPointerDown={() => setPaused(true)}
onPointerUp={() => setPaused(false)}
onPointerLeave={() => setPaused(false)}
onPointerCancel={() => setPaused(false)}
onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute top-3 left-3 right-3 z-40 flex gap-1">
          {stories.map((story, index) => (
            <div
              key={`${story.id}-${index}`}
              className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    index < activeIndex
                      ? '100%'
                      : index === activeIndex
                        ? `${progress}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-7 left-4 right-14 z-40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10">
            {activeStory.author?.avatar_url ? (
              <img
                src={activeStory.author.avatar_url}
                alt={activeStory.author.name ?? 'Perfil'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 font-bold">
                {(activeStory.author?.name ?? 'M').slice(0, 1)}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-xs text-white/45">
              {timeAgo(activeStory.created_at)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-30"
        />

        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-30"
        />

        {activeStory.image_url && (
          <img
            src={activeStory.image_url}
            alt="Story"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}

        {activeStory.video_url && (
          <video
            ref={videoRef}
            key={activeStory.id}
            src={activeStory.video_url}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onTimeUpdate={(e) => {
              const video = e.currentTarget
              if (!video.duration || !Number.isFinite(video.duration)) return
              setProgress((video.currentTime / video.duration) * 100)
            }}
            onEnded={goNext}
          />
        )}

        {activeStory.content && (
          <div className="absolute inset-x-4 bottom-10 z-40 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-3">
            <p className="text-white text-lg font-bold text-center whitespace-pre-line">
              {activeStory.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}