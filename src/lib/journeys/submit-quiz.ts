'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitQuiz(formData: FormData) {
  const supabase = (await createSupabaseServerClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const quizId = String(formData.get('quiz_id') ?? '')
  const answer = String(formData.get('quiz_answer') ?? '')

  if (!quizId || !answer) return

  const { data: quizData } = await supabase
    .from('journey_day_quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  const quiz = quizData as any

  if (!quiz) return

  const isCorrect = answer === quiz.correct_option

  await supabase.from('user_quiz_answers').upsert(
    {
      user_id: user.id,
      quiz_id: quiz.id,
      selected_option: answer,
      is_correct: isCorrect,
    },
    {
      onConflict: 'user_id,quiz_id',
    }
  )

  await supabase.rpc('award_daily_points_once', {
    p_user_id: user.id,
    p_journey_id: quiz.journey_id ?? null,
    p_points: 25,
    p_action_type: 'quiz_completed',
    p_reason: 'Quiz concluído',
  })

  const { grantAchievement } = await import('@/lib/journeys/actions')

  await grantAchievement(user.id, 'first_quiz')

  revalidatePath('/', 'layout')
}