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
      // Se o usuário tem invite_token nos metadados (cadastrou com convite),
      // tentar vincular ao pending_profile agora
      const inviteToken = data.user.user_metadata?.invite_token
      if (inviteToken) {
        await supabase.rpc('link_pending_profile', {
          p_user_id:      data.user.id,
          p_invite_token: inviteToken,
        })
      }

      // Redirecionar para a rota solicitada
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Código inválido ou expirado — redirecionar para login com erro
  return NextResponse.redirect(
    `${origin}/login?erro=link_invalido`
  )
}
