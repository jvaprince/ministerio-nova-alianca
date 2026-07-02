import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json().catch(() => ({}))

  const action = body.action as 'start' | 'update' | 'end'
  const sessionId = body.session_id as string | undefined
  const durationSeconds = Number(body.duration_seconds ?? 0)

  if (action === 'start') {
    const { data, error } = await admin
      .from('app_sessions')
      .insert({
        user_id: user.id,
        started_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        duration_seconds: 0,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ session_id: data.id })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 400 })
  }

  const { error } = await admin
    .from('app_sessions')
    .update({
      last_seen_at: new Date().toISOString(),
      duration_seconds: Math.max(0, durationSeconds),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}