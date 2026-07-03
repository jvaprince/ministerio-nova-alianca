import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import HighlightViewer from '@/components/feed/HighlightViewer'

export const metadata: Metadata = {
  title: 'Destaque — Ministério Nova Aliança',
}

export default async function HighlightPage({
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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .eq('username', username)
    .single()

  if (!profileData) notFound()

  const profile = profileData as any

  const { data: highlightData } = await supabase
    .from('story_highlights')
    .select('id, title, user_id')
    .eq('id', params.highlightId)
    .eq('user_id', profile.id)
    .single()

  if (!highlightData) notFound()

  const highlight = highlightData as any

  const { data: itemsData } = await supabase
    .from('story_highlight_items')
    .select(`
      id,
      created_at,
      story:feed_stories (
        id,
        image_url,
        video_url,
        content,
        created_at,
        expires_at
      )
    `)
    .eq('highlight_id', highlight.id)
    .order('created_at', { ascending: true })

  const items = (itemsData ?? []) as any[]

  const stories = items
    .map((item) => item.story)
    .filter(Boolean)
    .map((story) => ({
      ...story,
      author: profile,
    }))

  const isOwnProfile = profile.id === user.id

  return (
    <HighlightViewer
      title={highlight.title}
      username={profile.username}
      stories={stories}
      isOwnProfile={isOwnProfile}
      editHref={`/perfil/${profile.username}/destaques/${highlight.id}/editar`}
    />
  )
}