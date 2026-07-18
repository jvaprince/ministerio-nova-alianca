import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { claimAction } from '@/lib/actions/idempotency'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const formData = await request.formData()

  const post_type = String(formData.get('post_type') ?? 'outro')

  const content = String(formData.get('content') ?? '').trim()

  const image = formData.get('image') as File | null

  const video = formData.get('video') as File | null

  console.log('Imagem recebida:', image?.size)

  if (
    !content &&
    (!image || image.size === 0) &&
    (!video || video.size === 0)
  ) {
    return NextResponse.json(
      { error: 'Nada para publicar.' },
      { status: 400 }
    )
  }

  const allowed = await claimAction({
    supabase,
    userId: user.id,
    action: 'criar-post-feed',
    payload: {
      post_type,
      content,
      image: image?.size
        ? {
            name: image.name,
            size: image.size,
            type: image.type,
          }
        : null,
      video: video?.size
        ? {
            name: video.name,
            size: video.size,
            type: video.type,
          }
        : null,
    },
    ttlSeconds: 30,
  })

  if (!allowed) {
    return NextResponse.json({ success: true })
  }

  let image_url: string | null = null
  let video_url: string | null = null

  if (image && image.size > 0) {
    const ext = image.name.split('.').pop()

    const fileName = `${user.id}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('feed-posts')
      .upload(fileName, image)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    image_url =
      supabase.storage
        .from('feed-posts')
        .getPublicUrl(fileName).data.publicUrl
  }

  if (video && video.size > 0) {
    const ext = video.name.split('.').pop()

    const fileName = `${user.id}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('feed-posts')
      .upload(fileName, video)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    video_url =
      supabase.storage
        .from('feed-posts')
        .getPublicUrl(fileName).data.publicUrl
  }

  const { error } = await (supabase as any)
  .from('feed_posts')
  .insert({
    author_id: user.id,
    post_type,
    content: content || null,
    image_url,
    video_url,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  revalidatePath('/feed')

  return NextResponse.json({
    success: true,
  })
}