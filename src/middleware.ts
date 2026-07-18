import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware-client'

const PUBLIC_ROUTES = [
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/nova-senha',
  '/auth/callback',
]

const ADMIN_ROUTES = [
  '/admin',
  '/eventos/criar',
  '/membros',
]

const LEADER_ROUTES = [
  '/palavra/editar',
  '/escala',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabase = createSupabaseMiddlewareClient(request, response) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isPublicRoute && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  if (user) {
    const isAdminRoute = ADMIN_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    const isLeaderRoute = LEADER_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (isAdminRoute || isLeaderRoute) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profile = profileData as any
      const role = profile?.role ?? 'member'

      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(
          new URL('/inicio?acesso=negado', request.url)
        )
      }

      if (isLeaderRoute && role === 'member') {
        return NextResponse.redirect(
          new URL('/inicio?acesso=negado', request.url)
        )
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}