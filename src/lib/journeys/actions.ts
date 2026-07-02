'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function startJourney(formData: FormData) {
  const journeyId = String(formData.get('journey_id'))

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('user_journeys')
    .select('id')
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .maybeSingle()

  if (!existing) {
    await supabase.from('user_journeys').insert({
      user_id: user.id,
      journey_id: journeyId,
      current_day: 1,
      completed_days: 0,
      streak: 0,
      total_points: 0,
    })
  }

  revalidatePath('/biblia')
  revalidatePath('/biblia/jornada')
}

export async function completeJourneyDay(
  journeyId: string,
  dayNumber: number
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('user_journey_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (existing) {
    return {
      awarded: false,
      points: 0,
      message: 'Esse dia já estava concluído.',
    }
  }

  const { data: pointsResult } = await supabase.rpc('award_daily_points_once', {
    p_user_id: user.id,
    p_journey_id: journeyId,
    p_points: 100,
    p_action_type: 'journey_day_completed',
    p_reason: `Dia ${dayNumber} concluído`,
  })

  const reward = pointsResult?.[0] ?? {
    awarded: false,
    points: 0,
    message: 'Dia concluído.',
  }

  await supabase.from('user_journey_progress').insert({
    user_id: user.id,
    journey_id: journeyId,
    day_number: dayNumber,
    points_earned: reward.awarded ? reward.points : 0,
  })

  await supabase.rpc('increment_journey_progress', {
    p_user_id: user.id,
    p_journey_id: journeyId,
  })

  if (dayNumber === 1) {
    await grantAchievement(user.id, 'first_day')
  }

  revalidatePath('/biblia')
  revalidatePath('/biblia/jornada')

  return reward
}

export async function undoJourneyDay(
  journeyId: string,
  dayNumber: number
) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('user_journey_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .eq('day_number', dayNumber)

  await supabase
    .from('journey_points')
    .delete()
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .eq('reason', `Dia ${dayNumber} concluído`)

  const { data: userJourney } = await supabase
    .from('user_journeys')
    .select('completed_days, streak, total_points')
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .single()

  await supabase
    .from('user_journeys')
    .update({
      current_day: dayNumber,
      completed_days: Math.max((userJourney?.completed_days ?? 1) - 1, 0),
      streak: Math.max((userJourney?.streak ?? 1) - 1, 0),
      total_points: Math.max((userJourney?.total_points ?? 100) - 100, 0),
    })
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)

  revalidatePath('/biblia')
  revalidatePath('/biblia/jornada')
}

export async function grantAchievement(userId: string, code: string) {
  const supabase = await createSupabaseServerClient()

  const { data: achievement } = await supabase
    .from('achievements')
    .select('id')
    .eq('code', code)
    .single()

  if (!achievement) return

  await supabase.from('user_achievements').upsert({
    user_id: userId,
    achievement_id: achievement.id,
  })
}

export async function completeJourneyDayWithReflection(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const journeyId = String(formData.get('journey_id'))
  const journeyDayId = String(formData.get('journey_day_id'))
  const dayNumber = Number(formData.get('day_number'))
  const reflection = String(formData.get('reflection') ?? '').trim()
  const feeling = String(formData.get('feeling') ?? '').trim()
  const isShared = formData.get('is_shared') === 'on'

  if (!journeyId || !journeyDayId || !dayNumber) {
    throw new Error('Dados da jornada inválidos.')
  }

  await supabase.from('journey_reflections').upsert({
    user_id: user.id,
    journey_id: journeyId,
    journey_day_id: journeyDayId,
    day_number: dayNumber,
    reflection: reflection || null,
    feeling: feeling || null,
    is_shared: isShared,
    updated_at: new Date().toISOString(),
  })

  if (reflection) {
    await grantAchievement(user.id, 'first_reflection')
  }

  const reward = await completeJourneyDay(journeyId, dayNumber)

  if (isShared && reflection) {
    const { data: journey } = await supabase
      .from('journeys')
      .select('title')
      .eq('id', journeyId)
      .single()

    const { data: journeyDay } = await supabase
      .from('journey_days')
      .select('title')
      .eq('id', journeyDayId)
      .single()

    await supabase.from('feed_posts').insert({
      author_id: user.id,
      post_type: 'reflexao',
      content:
        `📖 Jornada: ${journey?.title ?? 'Jornada'}\n` +
        `Dia ${dayNumber}: ${journeyDay?.title ?? 'Leitura'}\n\n` +
        reflection,
    })

    await grantAchievement(user.id, 'first_shared_reflection')
  }

  revalidatePath('/feed')
  revalidatePath('/biblia')
  revalidatePath('/biblia/jornada')

  const { data: journey } = await supabase
    .from('journeys')
    .select('slug')
    .eq('id', journeyId)
    .single()

  const rewardParams = new URLSearchParams({
    awarded: String(reward?.awarded ?? false),
    points: String(reward?.points ?? 0),
    message: reward?.message ?? 'Dia concluído.',
  })

  redirect(`/biblia/jornada/${journey?.slug}/plano?${rewardParams.toString()}`)
}