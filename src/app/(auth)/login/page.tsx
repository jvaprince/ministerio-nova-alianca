import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Entrar — Ministério Nova Aliança',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; erro?: string }
}) {
  return (
    <Suspense>
      <LoginForm
        redirectTo={searchParams.redirect}
        errorFromUrl={searchParams.erro}
      />
    </Suspense>
  )
}
