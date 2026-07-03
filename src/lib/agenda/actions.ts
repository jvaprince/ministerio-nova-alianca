'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notificarTodosMembros } from '@/lib/notifications/actions'

export async function criarEvento(formData: FormData): Promise<void> {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const event_time = formData.get('event_time') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const cover = formData.get('cover') as File | null

  if (!title || !event_date || !event_type) {
    console.log('Preencha os campos obrigatórios.')
    return
  }

  let cover_url: string | null = null

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith('image/')) {
      console.log('O banner precisa ser uma imagem.')
      return
    }

    if (cover.size > 5 * 1024 * 1024) {
      console.log('O banner deve ter no máximo 5 MB.')
      return
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
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('event-covers').getPublicUrl(path)

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
    return
  }

  const evento = event as any

  revalidatePath('/agenda')
  revalidatePath('/inicio')

  if (evento) {
    await notificarTodosMembros({
      actorId: user.id,
      type: 'event_created',
      title: 'Novo evento na agenda',
      message: `${evento.title}${evento.event_time ? ` às ${evento.event_time.slice(0, 5)}` : ''}.`,
      href: `/agenda/${evento.id}`,
      metadata: {
        event_id: evento.id,
        event_date: evento.event_date,
      },
    })
  }

  redirect('/agenda')
}

export async function editarEvento(id: string, formData: FormData): Promise<void> {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile as { role?: string } | null)?.role

  const { data: event } = await supabase
    .from('events')
    .select('id, created_by')
    .eq('id', id)
    .maybeSingle()

  const evento = event as { id: string; created_by?: string | null } | null

  if (!evento) redirect('/agenda')

  const podeEditar =
    role === 'admin' ||
    role === 'leader' ||
    evento.created_by === user.id

  if (!podeEditar) redirect(`/agenda/${id}`)

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_date = formData.get('event_date') as string
  const event_time = formData.get('event_time') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const cover = formData.get('cover') as File | null

  if (!title || !event_date || !event_type) return

  let cover_url: string | null = null

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith('image/')) return

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
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('event-covers').getPublicUrl(path)

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

  if (error) {
    console.log('EVENT UPDATE ERROR:', error)
    return
  }

  revalidatePath('/agenda')
  revalidatePath(`/agenda/${id}`)
  revalidatePath(`/agenda/${id}/editar`)
  revalidatePath('/inicio')

  redirect(`/agenda/${id}`)
}

export async function excluirEvento(formData: FormData): Promise<void> {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const id = formData.get('id') as string

  if (!id) {
    console.log('Evento inválido.')
    return
  }

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    console.log('EVENT DELETE ERROR:', error)
    return
  }

  revalidatePath('/agenda')
  revalidatePath('/inicio')

  redirect('/agenda')
}