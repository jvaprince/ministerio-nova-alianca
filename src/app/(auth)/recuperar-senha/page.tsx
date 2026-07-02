import { Suspense } from 'react'
import type { Metadata } from 'next'
import RecuperarSenhaForm from '@/components/auth/RecuperarSenhaForm'

export const metadata: Metadata = {
  title: 'Recuperar Senha — Ministério Nova Aliança',
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense>
      <RecuperarSenhaForm />
    </Suspense>
  )
}
