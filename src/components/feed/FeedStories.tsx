'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, Heart, Plus, Trash2, X } from 'lucide-react'
import {
  excluirFeedStory,
  registrarVisualizacaoStory,
  toggleLikeStory,
} from '@/lib/feed/story-actions'

type StoryProfile = {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
}

type StoryView = {
  user_id: string
  viewer: StoryProfile | null
}

type StoryLike = {
  user_id: string
  user: StoryProfile | null
}

type Story = {
  id: string
  image_url: string | null
  video_url: string | null
  content: string | null
  created_at: string
  expires_at: string
  author: StoryProfile | null
  views?: StoryView[]
  likes?: StoryLike[]
}

type StoryGroup = {
  authorId: string
  author: Story['author']
  stories: Story[]
}

type FeedStoriesProps = {
  stories: Story[]
  currentUserId: string
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  return `há ${Math.floor(diff / 3600)} h`
}

export default function FeedStories({
  stories,
  currentUserId,
}: FeedStoriesProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [viewed, setViewed] = useState<string[]>([])
  const [paused, setPaused] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isPending, startTransition] = useTransition()

  const viewedStorageKey = `viewed_stories_${currentUserId}`

  const groups = useMemo(() => {
    const map = new Map<string, StoryGroup>()

    stories.forEach((story) => {
      const authorId = story.author?.id
      if (!authorId) return

      if (!map.has(authorId)) {
        map.set(authorId, {
          authorId,
          author: story.author,
          stories: [],
        })
      }

      map.get(authorId)?.stories.push(story)
    })

    return Array.from(map.values()).map((group) => ({
      ...group,
      stories: group.stories.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }))
  }, [stories])

  const activeStory = activeGroup?.stories[activeIndex]
  const isOwner = activeStory?.author?.id === currentUserId

  const likedByMe =
    activeStory?.likes?.some((like) => like.user_id === currentUserId) ?? false

  const visibleViews =
    activeStory?.views?.filter((view) => view.user_id !== activeStory.author?.id) ??
    []

  const visibleLikes =
    activeStory?.likes?.filter((like) => like.user_id !== activeStory.author?.id) ??
    []

  const viewsCount = visibleViews.length
  const likesCount = visibleLikes.length

  useEffect(() => {
    const saved = localStorage.getItem(viewedStorageKey)
    setViewed(saved ? JSON.parse(saved) : [])
  }, [viewedStorageKey])

  useEffect(() => {
  if (!activeGroup) {
    document.body.style.overflow = ''
    document.body.classList.remove('story-viewer-open')
    return
  }

  document.body.style.overflow = 'hidden'
  document.body.classList.add('story-viewer-open')

  return () => {
    document.body.style.overflow = ''
    document.body.classList.remove('story-viewer-open')
  }
}, [activeGroup])

  useEffect(() => {
    setProgress(0)
    setShowDetails(false)
  }, [activeStory?.id])

  useEffect(() => {
    if (!activeStory) return

    markViewed(activeStory.id)

    if (!isOwner) {
      startTransition(async () => {
        await registrarVisualizacaoStory(activeStory.id)
      })
    }
  }, [activeStory?.id])

  useEffect(() => {
    if (!activeStory || paused || activeStory.video_url || showDetails) return

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
  }, [activeStory?.id, paused, showDetails])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeStory?.video_url) return

    if (paused || showDetails) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [paused, showDetails, activeStory?.id, activeStory?.video_url])

  function updateActiveStory(storyId: string, updater: (story: Story) => Story) {
    setActiveGroup((current) => {
      if (!current) return current

      return {
        ...current,
        stories: current.stories.map((story) =>
          story.id === storyId ? updater(story) : story
        ),
      }
    })
  }

  function markViewed(storyId: string) {
    const updated = Array.from(new Set([...viewed, storyId]))
    setViewed(updated)
    localStorage.setItem(viewedStorageKey, JSON.stringify(updated))
  }

  function openGroup(group: StoryGroup) {
    const firstUnviewedIndex = group.stories.findIndex(
      (story) => !viewed.includes(story.id)
    )

    const indexToOpen = firstUnviewedIndex >= 0 ? firstUnviewedIndex : 0

    setActiveGroup(group)
    setActiveIndex(indexToOpen)

    if (group.stories[indexToOpen]) {
      markViewed(group.stories[indexToOpen].id)
    }
  }

  function closeStory() {
    setActiveGroup(null)
    setActiveIndex(0)
    setProgress(0)
    setShowDetails(false)
    setPaused(false)
  }

  function goNext() {
    if (!activeGroup) return

    const nextIndex = activeIndex + 1
    const nextStory = activeGroup.stories[nextIndex]

    if (nextStory) {
      setActiveIndex(nextIndex)
      markViewed(nextStory.id)
      return
    }

    closeStory()
  }

  function goPrev() {
    if (!activeGroup) return

    const prevIndex = activeIndex - 1

    if (prevIndex >= 0) {
      setActiveIndex(prevIndex)
      markViewed(activeGroup.stories[prevIndex].id)
    }
  }

  function handleDeleteStory() {
    if (!activeStory) return

    const confirmed = window.confirm('Deseja excluir este story?')
    if (!confirmed) return

    const storyId = activeStory.id

    startTransition(async () => {
      await excluirFeedStory(storyId)

      if (!activeGroup) return

      const remainingStories = activeGroup.stories.filter(
        (story) => story.id !== storyId
      )

      if (remainingStories.length === 0) {
        closeStory()
        return
      }

      const nextIndex =
        activeIndex >= remainingStories.length
          ? remainingStories.length - 1
          : activeIndex

      setActiveGroup({
        ...activeGroup,
        stories: remainingStories,
      })

      setActiveIndex(nextIndex)
      setProgress(0)
      setShowDetails(false)
    })
  }

  function handleLikeStory() {
    if (!activeStory || isOwner) return

    const storyId = activeStory.id
    const alreadyLiked = likedByMe

    updateActiveStory(storyId, (story) => {
      const currentLikes = story.likes ?? []

      if (alreadyLiked) {
        return {
          ...story,
          likes: currentLikes.filter((like) => like.user_id !== currentUserId),
        }
      }

      return {
        ...story,
        likes: [
          ...currentLikes,
          {
            user_id: currentUserId,
            user: null,
          },
        ],
      }
    })

    startTransition(async () => {
      await toggleLikeStory(storyId)
    })
  }

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 pb-1">
          <Link
            href="/feed/stories/criar"
            className="shrink-0 w-[72px] text-center"
          >
            <div className="relative mx-auto w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400">
                <Plus size={20} />
              </div>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-white/70 truncate">
              Seu story
            </p>
          </Link>

          {groups.map((group) => {
            const allViewed = group.stories.every((story) =>
              viewed.includes(story.id)
            )

            return (
              <button
                key={group.authorId}
                type="button"
                onClick={() => openGroup(group)}
                className="shrink-0 w-[72px] text-center"
              >
                <div
                  className={`mx-auto w-16 h-16 rounded-full p-[2px] ${
                    allViewed
                      ? 'bg-white/20'
                      : 'bg-gradient-to-tr from-brand-500 via-blue-400 to-white/70'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-[#0b0b0b] p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white/[0.08]">
                      {group.author?.avatar_url ? (
                        <img
                          src={group.author.avatar_url}
                          alt={group.author.name ?? 'Perfil'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40 text-lg font-bold">
                          {(group.author?.name ?? 'M').slice(0, 1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-[11px] font-semibold text-white/60 truncate">
                  {group.author?.name ?? 'Membro'}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {activeGroup && activeStory && (
        <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center">
          <button
  type="button"
  onClick={closeStory}
  className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-4 z-[1000000] w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white"
>
  <X size={18} />
</button>

          <div
  className="relative w-full h-full max-w-[430px] sm:h-auto sm:max-w-[390px] sm:aspect-[9/16] bg-black overflow-hidden sm:rounded-[28px] select-none"
  style={{
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
  }}
  onPointerDown={(e) => {
    e.preventDefault()
    setPaused(true)
  }}
  onPointerUp={(e) => {
    e.preventDefault()
    setPaused(false)
  }}
  onPointerLeave={() => setPaused(false)}
  onPointerCancel={() => setPaused(false)}
  onContextMenu={(e) => e.preventDefault()}
  onDragStart={(e) => e.preventDefault()}
>
            <div className="absolute top-[calc(env(safe-area-inset-top)+8px)] left-3 right-3 z-40 flex gap-1">
              {activeGroup.stories.map((story, index) => (
                <div
                  key={story.id}
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

            <div className="absolute top-[calc(env(safe-area-inset-top)+44px)] left-4 right-16 z-40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10">
                {activeGroup.author?.avatar_url ? (
                  <img
                    src={activeGroup.author.avatar_url}
                    alt={activeGroup.author.name ?? 'Perfil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 font-bold">
                    {(activeGroup.author?.name ?? 'M').slice(0, 1)}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {activeGroup.author?.name ?? 'Membro'}
                </p>
                <p className="text-xs text-white/45">
                  {timeAgo(activeStory.created_at)}
                </p>
              </div>
            </div>

            {isOwner && (
              <button
  type="button"
  onClick={handleDeleteStory}
  disabled={isPending}
  className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-16 z-50 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white/80 disabled:opacity-40"
>
  <Trash2 size={17} />
</button>
            )}

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
  draggable={false}
  className="absolute inset-0 w-full h-full object-contain bg-black select-none"
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
              <div className="absolute inset-x-4 bottom-20 z-40 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-3">
                <p className="text-white text-lg font-bold text-center whitespace-pre-line">
                  {activeStory.content}
                </p>
              </div>
            )}

            <div className="absolute left-4 right-4 bottom-5 z-50 flex items-center justify-between gap-3 pb-[env(safe-area-inset-bottom)]">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md px-4 py-2 text-white text-xs font-semibold"
                >
                  <Eye size={16} />
                  {viewsCount} visualizações
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLikeStory}
                  disabled={isPending}
                  className={`ml-auto w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition ${
                    likedByMe
                      ? 'bg-red-500 text-white'
                      : 'bg-black/45 text-white'
                  }`}
                >
                  <Heart size={20} fill={likedByMe ? 'currentColor' : 'none'} />
                </button>
              )}

              {isOwner && likesCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md px-3 py-2 text-white text-xs font-semibold">
                  <Heart size={14} fill="currentColor" />
                  {likesCount}
                </div>
              )}
            </div>
          </div>

          {showDetails && isOwner && (
            <div className="fixed inset-0 z-[1000001] bg-black/55 flex items-end justify-center">
              <div className="w-full max-w-[430px] mx-auto rounded-t-[28px] bg-[#111] border-t border-white/10 px-4 pt-3 pb-8 h-[55vh] overflow-y-auto">
                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">
                      Atividade do story
                    </p>
                    <p className="text-white/40 text-xs">
                      {viewsCount} visualizações · {likesCount} curtidas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="space-y-3">
                  {visibleViews.length > 0 ? (
                    visibleViews.map((view) => {
                      const liked = activeStory.likes?.some(
                        (like) => like.user_id === view.user_id
                      )

                      return (
                        <div
                          key={view.user_id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                              {view.viewer?.avatar_url ? (
                                <img
                                  src={view.viewer.avatar_url}
                                  alt={view.viewer.name ?? 'Perfil'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 font-bold">
                                  {(view.viewer?.name ?? 'M').slice(0, 1)}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-white text-sm font-semibold">
                                {view.viewer?.name ?? 'Membro'}
                              </p>
                              {view.viewer?.username && (
                                <p className="text-white/35 text-xs">
                                  @{view.viewer.username}
                                </p>
                              )}
                            </div>
                          </div>

                          {liked && (
                            <Heart
                              size={17}
                              className="text-red-500"
                              fill="currentColor"
                            />
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-white/40 text-sm py-4 text-center">
                      Ninguém visualizou ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}