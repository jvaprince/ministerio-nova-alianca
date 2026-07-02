import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ministério Nova Aliança',
  description: 'Entre na comunidade do Ministério Nova Aliança',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      {children}
    </div>
  )
}