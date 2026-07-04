import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/notifications/sendPush'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: 'Sem usuário logado' })
  }

  await sendPushToUser({
    userId: user.id,
    title: 'Teste de notificação',
    message: 'Se você recebeu isso, o push está funcionando.',
    href: '/inicio',
  })

  return NextResponse.json({
    ok: true,
    userId: user.id,
  })
}