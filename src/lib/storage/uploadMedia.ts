'use client'

import { createSupabaseClient } from '@/lib/supabase/client'

export async function uploadMedia(
  file: File,
  folder: 'images' | 'videos'
) {
  const supabase = createSupabaseClient()

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  const fileName = `${crypto.randomUUID()}.${ext}`

  const path = `${folder}/${fileName}`

  console.log('[UPLOAD] Enviando:', path)

  const { error } = await supabase.storage
    .from('feed-posts')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[UPLOAD] Erro:', error)
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('feed-posts')
    .getPublicUrl(path)

  console.log('[UPLOAD] Concluído:', publicUrl)

  return publicUrl
}