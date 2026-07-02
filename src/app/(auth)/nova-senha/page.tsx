'use client'

import { useState, useTransition } from 'react'
import { Loader2, Lock, CheckCircle } from 'lucide-react'
import { updatePassword } from '@/lib/auth/actions'
import Link from 'next/link'

export default function NovaSenhaPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface-50 border border-white/8 rounded-3xl p-6 shadow-glass">
        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Senha atualizada!</h2>
            <p className="text-white/40 text-sm mb-6">Sua senha foi redefinida com sucesso.</p>
            <Link href="/login" className="inline-flex bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-brand text-sm">
              Fazer login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">Nova senha</h2>
            <p className="text-white/40 text-sm mb-6">Digite sua nova senha abaixo.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Nova senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres"
                    className="w-full bg-surface-200 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input name="confirm_password" type="password" required minLength={6} placeholder="Repita a senha"
                    className="w-full bg-surface-200 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isPending}
                className="w-full bg-brand-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-brand disabled:opacity-50 transition-all active:scale-[0.98]">
                {isPending ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar nova senha'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
