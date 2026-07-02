import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-300 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4">🕊️</p>
      <h1 className="text-2xl font-bold text-white mb-2">Página não encontrada</h1>
      <p className="text-white/40 text-sm mb-6">Esta página não existe ou foi movida.</p>
      <Link href="/inicio" className="bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-brand">
        Voltar ao início
      </Link>
    </div>
  )
}
