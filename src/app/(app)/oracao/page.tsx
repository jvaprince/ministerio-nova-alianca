import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Oração — Ministério Nova Aliança' }
export default function OracaoPage() {
  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="text-[22px] font-bold text-white mb-1">Mural de Oração</h1>
      <p className="text-white/40 text-sm">Em breve — pedidos e intercessão.</p>
    </div>
  )
}
