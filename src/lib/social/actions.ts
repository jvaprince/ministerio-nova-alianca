'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createSocialIdea(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const category = String(formData.get('category') || 'outro').trim()

  if (!title) {
    throw new Error('Título obrigatório')
  }

  const socialIdeas = supabase.from('social_ideas') as any

  const { error } = await socialIdeas.insert({
    title,
    description,
    category,
    status: 'em_analise',
    created_by: user.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/social/ideias')
  redirect('/social/ideias')
}

export async function updateSocialIdeaStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const ideaId = String(formData.get('ideaId') || '')
  const status = String(formData.get('status') || '')

  const allowedStatus = [
    'em_analise',
    'em_desenvolvimento',
    'selecionada',
    'arquivada',
  ]

  if (!ideaId || !allowedStatus.includes(status)) {
    throw new Error('Dados inválidos')
  }

  const socialIdeas = supabase.from('social_ideas') as any

  const { error } = await socialIdeas
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ideaId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/social/ideias')
  revalidatePath(`/social/ideias/${ideaId}`)
}

export async function convertIdeaToProject(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const ideaId = String(formData.get('ideaId') || '')

  if (!ideaId) {
    throw new Error('Ideia inválida')
  }

  const socialIdeas = supabase.from('social_ideas') as any

  const { data: idea, error: ideaError } = await socialIdeas
    .select('*')
    .eq('id', ideaId)
    .single()

  if (ideaError || !idea) {
    throw new Error('Ideia não encontrada')
  }

  const socialProjects = supabase.from('social_projects') as any

  const { data: project, error: projectError } = await socialProjects
    .insert({
      idea_id: idea.id,
      title: idea.title,
      description: idea.description,
      beneficiary_type: idea.category,
      status: 'planned',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (projectError || !project) {
    throw new Error(projectError?.message || 'Erro ao criar projeto')
  }

  await socialIdeas
    .update({
      status: 'selecionada',
      updated_at: new Date().toISOString(),
    })
    .eq('id', idea.id)

  revalidatePath('/social/ideias')
  revalidatePath('/social/projetos')

  redirect(`/social/projetos/${project.id}`)
}