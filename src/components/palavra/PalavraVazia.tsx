import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'

interface PalavraVaziaProps {
  date: string
  podeGerir: boolean
}

export default function PalavraVazia({ date, podeGerir }: PalavraVaziaProps) {
  const label = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-brand-400/60" />
      </div>
      <h2 className="text-[17px] font-semibold text-white mb-2">
        Sem palavra publicada
      </h2>
      <p className="text-[13px] text-white/40 leading-relaxed mb-6">
        Nenhuma Palavra do Dia foi publicada para {label}.
      </p>
      {podeGerir && (
        <Link
          href="/palavra/criar"
          className="flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-3 rounded-xl shadow-brand text-[14px]"
        >
          <Plus size={16} />
          Publicar Palavra do Dia
        </Link>
      )}
    </div>
  )
}
