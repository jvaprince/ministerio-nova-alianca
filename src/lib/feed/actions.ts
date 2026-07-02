'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { criarNotificacao } from '@/lib/notifications/actions'

export async function criarPostFeed(formData: FormData) {
  const post_type = String(formData.get('post_type') ?? 'outro')
const content = String(formData.get('content') ?? '').trim()
const image = formData.get('image') as File | null
const video = formData.get('video') as File | null

if (
  !content &&
  (!image || image.size === 0) &&
  (!video || video.size === 0)
) {
  throw new Error('Escreva algo ou envie uma imagem ou vídeo.')
}

let image_url: string | null = null
let video_url: string | null = null

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('feed-posts')
      .upload(fileName, image, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
  console.error('ERRO UPLOAD FEED:', uploadError)

  throw new Error(
    `Erro ao enviar imagem: ${uploadError.message}`
  )
}

    const { data } = supabase.storage
      .from('feed-posts')
      .getPublicUrl(fileName)

    image_url = data.publicUrl
  }

  if (video && video.size > 0) {
  const fileExt = video.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('feed-posts')
    .upload(fileName, video, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('ERRO UPLOAD VÍDEO FEED:', uploadError)

    throw new Error(
      `Erro ao enviar vídeo: ${uploadError.message}`
    )
  }

  const { data } = supabase.storage
    .from('feed-posts')
    .getPublicUrl(fileName)

  video_url = data.publicUrl
}

  const { error } = await supabase.from('feed_posts').insert({
  author_id: user.id,
  post_type,
  content: content || null,
  image_url,
  video_url,
})

  if (error) {
    throw new Error('Erro ao criar publicação.')
  }

  revalidatePath('/feed')
  redirect('/feed')
}

export async function excluirPostFeed(postId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('feed_posts')
    .select('id, author_id')
    .eq('id', postId)
    .single()

  if (!post) {
    throw new Error('Publicação não encontrada.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const podeExcluir =
    post.author_id === user.id ||
    profile?.role === 'admin' ||
    profile?.role === 'leader'

  if (!podeExcluir) {
    throw new Error('Você não tem permissão para excluir esta publicação.')
  }

  const { error } = await supabase
    .from('feed_posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw new Error('Erro ao excluir publicação.')
  }

  revalidatePath('/feed')
}

export async function toggleLikeFeedPost(postId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existingLike } = await supabase
    .from('feed_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingLike) {
    await supabase
      .from('feed_likes')
      .delete()
      .eq('id', existingLike.id)
  } else {
    await supabase
      .from('feed_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })

    const { data: post } = await supabase
      .from('feed_posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    const { data: actor } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    if (post?.author_id) {
      await criarNotificacao({
        userId: post.author_id,
        actorId: user.id,
        type: 'feed_like',
        title: 'Nova curtida',
        message: `${actor?.name ?? 'Alguém'} curtiu sua publicação.`,
        href: `/feed/${postId}`,
      })
    }
  }

  revalidatePath('/feed')
  revalidatePath(`/feed/${postId}`)
}

export async function criarComentarioFeed(
  postId: string,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const content = String(formData.get('content') ?? '').trim()

  if (!content) return

  const { error } = await supabase
    .from('feed_comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
    })

  if (error) {
    throw new Error('Erro ao comentar.')
  }

  const { data: post } = await supabase
  .from('feed_posts')
  .select('author_id')
  .eq('id', postId)
  .single()

const { data: actor } = await supabase
  .from('profiles')
  .select('name')
  .eq('id', user.id)
  .single()

if (post?.author_id) {
  await criarNotificacao({
    userId: post.author_id,
    actorId: user.id,
    type: 'feed_comment',
    title: 'Novo comentário',
    message: `${actor?.name ?? 'Alguém'} comentou sua publicação.`,
    href: `/feed/${postId}`,
  })
}

  revalidatePath('/feed')
  revalidatePath(`/feed/${postId}`)
}

export async function excluirComentarioFeed(commentId: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: comment } = await supabase
    .from('feed_comments')
    .select('author_id, post_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    throw new Error('Comentário não encontrado.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const podeExcluir =
    comment.author_id === user.id ||
    profile?.role === 'admin' ||
    profile?.role === 'leader'

  if (!podeExcluir) {
    throw new Error('Sem permissão.')
  }

  await supabase
    .from('feed_comments')
    .delete()
    .eq('id', commentId)

  revalidatePath('/feed')
  revalidatePath(`/feed/${comment.post_id}`)
}