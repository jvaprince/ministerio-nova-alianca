import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware-client'

// Rotas que NÃO precisam de autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/nova-senha',
  '/auth/callback',
]

// Rotas que só admins e líderes podem acessar
const ADMIN_ROUTES = [
  '/admin',
  '/eventos/criar',
  '/membros',
]

const LEADER_ROUTES = [
  '/palavra/criar',
  '/palavra/editar',
  '/escala',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabase = createSupabaseMiddlewareClient(request, response)

  // Atualizar sessão (OBRIGATÓRIO para manter cookies sincronizados)
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // ── Usuário NÃO autenticado tentando acessar rota protegida ──
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Usuário autenticado tentando acessar telas de auth ──
  if (user && isPublicRoute && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  // ── Verificar permissões de role para rotas especiais ──
  if (user) {
    const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
    const isLeaderRoute = LEADER_ROUTES.some(r => pathname.startsWith(r))

    if (isAdminRoute || isLeaderRoute) {
      // Buscar role do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role ?? 'member'

      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/inicio?acesso=negado', request.url))
      }

      if (isLeaderRoute && role === 'member') {
        return NextResponse.redirect(new URL('/inicio?acesso=negado', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Executar middleware em todas as rotas EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     * - arquivos de imagem públicos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
