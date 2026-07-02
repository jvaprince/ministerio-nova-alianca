'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function updateProfileCover(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cover = formData.get('cover') as File | null

  if (!cover || cover.size === 0) {
    redirect('/perfil/editar?error=Selecione uma imagem para a capa.')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(cover.type)) {
    redirect('/perfil/editar?error=Use uma imagem JPG, PNG ou WEBP.')
  }

  const fileExt = cover.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('profile-covers')
    .upload(fileName, cover, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('ERRO UPLOAD CAPA:', uploadError)
    redirect('/perfil/editar?error=Erro ao enviar capa.')
  }

  const { data } = supabase.storage
    .from('profile-covers')
    .getPublicUrl(fileName)

  const { error } = await supabase
    .from('profiles')
    .update({
      cover_url: data.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('ERRO AO SALVAR CAPA:', error)
    redirect('/perfil/editar?error=Erro ao salvar capa.')
  }

  revalidatePath('/perfil')
  revalidatePath('/perfil/editar')

  redirect('/perfil')
}