'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const messages: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos.',
      'Email not confirmed': 'Confirme seu email antes de entrar. Verifique sua caixa de entrada.',
      'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
    }

    return {
      error: messages[error.message] ?? 'Erro ao fazer login. Tente novamente.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/inicio')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const token = formData.get('invite_token') as string | null

  if (!email || !password || !name) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const supabase = await createSupabaseServerClient()
  const supabaseAny = supabase as any

  if (token && token.trim() !== '') {
    const { data: validation } = await supabaseAny.rpc('validate_invite_token', {
      p_token: token.trim(),
    })

    if (!validation?.valid) {
      return { error: validation?.message ?? 'Token de convite inválido.' }
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        invite_token: token?.trim() ?? null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    const messages: Record<string, string> = {
      'User already registered': 'Este email já está cadastrado. Tente fazer login.',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
      'Unable to validate email address: invalid format': 'Email inválido.',
    }

    return {
      error: messages[error.message] ?? 'Erro ao criar conta. Tente novamente.',
    }
  }

  if (token && token.trim() !== '' && data.user) {
    await supabaseAny.rpc('link_pending_profile', {
      p_user_id: data.user.id,
      p_invite_token: token.trim(),
    })
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/inicio')
  }

  return {
    success: true,
    message: 'Conta criada! Verifique seu email para confirmar o cadastro.',
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Informe seu email.' }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/nova-senha`,
  })

  if (error) {
    return { error: 'Erro ao enviar email. Verifique o endereço e tente novamente.' }
  }

  return {
    success: true,
    message: 'Email enviado! Verifique sua caixa de entrada para redefinir a senha.',
  }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (!password || !confirm) {
    return { error: 'Preencha todos os campos.' }
  }

  if (password !== confirm) {
    return { error: 'As senhas não coincidem.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Erro ao atualizar senha. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect('/inicio')
}

export async function getSession() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as any
}

export async function linkInviteToken(token: string) {
  if (!token?.trim()) {
    return { error: 'Token de convite não informado.' }
  }

  const supabase = await createSupabaseServerClient()
  const supabaseAny = supabase as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Você precisa estar logado para vincular um convite.' }
  }

  const { data, error } = await supabaseAny.rpc('link_pending_profile', {
    p_user_id: user.id,
    p_invite_token: token.trim(),
  })

  if (error || !data?.success) {
    return { error: data?.error ?? 'Erro ao vincular convite.' }
  }

  revalidatePath('/', 'layout')
  return { success: true, name: data.name }
}

export async function updateProfile(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const username = (formData.get('username') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const favorite_verse = (formData.get('favorite_verse') as string)?.trim()
  const favorite_verse_ref = (formData.get('favorite_verse_ref') as string)?.trim()

  if (!name) {
    return { error: 'O nome é obrigatório.' }
  }

  if (username && !/^[a-zA-Z0-9_.]+$/.test(username)) {
    return { error: 'Username inválido. Use apenas letras, números, _ ou .' }
  }

  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  if (username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      return { error: 'Este username já está em uso.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name,
      username: username || null,
      bio: bio || null,
      favorite_verse: favorite_verse || null,
      favorite_verse_ref: favorite_verse_ref || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Erro ao salvar perfil. Tente novamente.' }
  }

  revalidatePath('/perfil')
  redirect('/perfil')
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return { error: 'Nenhum arquivo enviado.' }
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'Apenas imagens são permitidas.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'A imagem deve ter no máximo 5 MB.' }
  }

  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar_${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { error: 'Erro ao enviar imagem. Tente novamente.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Imagem enviada, mas houve erro ao salvar no perfil.' }
  }

  revalidatePath('/perfil')
  revalidatePath('/perfil/editar')
}