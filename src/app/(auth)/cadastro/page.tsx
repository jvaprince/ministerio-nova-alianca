import { Suspense } from 'react'
import type { Metadata } from 'next'
import CadastroForm from '@/components/auth/CadastroForm'

export const metadata: Metadata = {
  title: 'Criar Conta — Ministério Nova Aliança',
}

export default function CadastroPage({
  searchParams,
}: {
  searchParams: { convite?: string }
}) {
  return (
    <Suspense>
      <CadastroForm inviteToken={searchParams.convite} />
    </Suspense>
  )
}
