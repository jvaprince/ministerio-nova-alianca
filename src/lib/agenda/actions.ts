'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notificarTodosMembros } from '@/lib/notifications/actions'

export async function criarEvento(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const event_time = formData.get('event_time') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const cover = formData.get('cover') as File | null

  if (!title || !event_date || !event_type) {
    return { error: 'Preencha os campos obrigatórios.' }
  }

  let cover_url: string | null = null

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith('image/')) {
      return { error: 'O banner precisa ser uma imagem.' }
    }

    if (cover.size > 5 * 1024 * 1024) {
      return { error: 'O banner deve ter no máximo 5 MB.' }
    }

    const ext = cover.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/event_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('event-covers')
      .upload(path, cover, {
        contentType: cover.type,
        upsert: true,
      })

    if (uploadError) {
  console.log('UPLOAD ERROR:', uploadError)
  return { error: uploadError.message }
}

    const { data: { publicUrl } } = supabase.storage
      .from('event-covers')
      .getPublicUrl(path)

    cover_url = publicUrl
  }

  const { data: event, error } = await supabase
  .from('events')
  .insert({
      created_by: user.id,
      title,
      description: description || null,
      event_date,
      event_time: event_time || null,
      location: location || null,
      event_type,
      cover_url,
    })
.select('id, title, event_date, event_time')
.single()

  if (error) {
  console.log('EVENT INSERT ERROR:', error)
  return { error: error.message }
}

  revalidatePath('/agenda')
  revalidatePath('/inicio')

  if (event) {
  await notificarTodosMembros({
    actorId: user.id,
    type: 'event_created',
    title: 'Novo evento na agenda',
    message: `${event.title}${event.event_time ? ` às ${event.event_time.slice(0, 5)}` : ''}.`,
    href: `/agenda/${event.id}`,
    metadata: {
      event_id: event.id,
      event_date: event.event_date,
    },
  })
}

  redirect('/agenda')
}

  export async function editarEvento(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const event_time = formData.get('event_time') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const cover = formData.get('cover') as File | null

  if (!title || !event_date || !event_type) {
    return { error: 'Preencha os campos obrigatórios.' }
  }

  let cover_url: string | null = null

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith('image/')) {
      return { error: 'O banner precisa ser uma imagem.' }
    }

    const ext = cover.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/event_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('event-covers')
      .upload(path, cover, {
        contentType: cover.type,
        upsert: true,
      })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('event-covers')
      .getPublicUrl(path)

    cover_url = publicUrl
  }

  const updateData: any = {
    title,
    description: description || null,
    event_date,
    event_time: event_time || null,
    location: location || null,
    event_type,
  }

  if (cover_url) updateData.cover_url = cover_url

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/agenda')
  revalidatePath(`/agenda/${id}`)
  revalidatePath('/inicio')

  redirect(`/agenda/${id}`)
}

export async function excluirEvento(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  if (!id) return { error: 'Evento inválido.' }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/agenda')
  revalidatePath('/inicio')

  redirect('/agenda')
}