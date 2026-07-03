import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Handler para callbacks do Supabase Auth:
// - Confirmação de email após cadastro
// - Login com OAuth (Google, etc.)
// - Links de recuperação de senha
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'

  if (code) {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const inviteToken = data.user.user_metadata?.invite_token

      if (inviteToken) {
        await (supabase as any).rpc('link_pending_profile', {
          p_user_id: data.user.id,
          p_invite_token: String(inviteToken),
        })
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=link_invalido`)
}