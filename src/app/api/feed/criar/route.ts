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

  const image_url =
    String(formData.get('image_url') ?? '') || null

  const video_url =
    String(formData.get('video_url') ?? '') || null

  if (!content && !image_url && !video_url) {
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
      image_url,
      video_url,
    },
    ttlSeconds: 30,
  })

  if (!allowed) {
    return NextResponse.json({ success: true })
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