'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { resetPassword } from '@/lib/auth/actions'

export default function RecuperarSenhaForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message ?? 'Email enviado!')
      }
    })
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 relative">
          <Image
            src="/logo.png"
            alt="Ministério Nova Aliança"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-white font-serif tracking-tight">
          Nova Aliança
        </h1>
        <p className="text-white/40 text-sm mt-1">Ministério de Jovens</p>
      </div>

      <div className="bg-surface-50 border border-white/8 rounded-3xl p-6 shadow-glass">
        {success ? (
          /* Estado de sucesso */
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Email enviado!</h2>
            <p className="text-white/40 text-sm mb-6">{success}</p>
            <Link
              href="/login"
              className="
                inline-flex items-center gap-2 text-brand-400
                hover:text-brand-300 text-sm font-medium transition-colors
              "
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">
              Recuperar senha
            </h2>
            <p className="text-white/40 text-sm mb-6">
              Enviaremos um link para redefinir sua senha.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-white/60 mb-1.5">
                  Email da sua conta
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    className="
                      w-full bg-surface-200 border border-white/8 rounded-xl
                      pl-10 pr-4 py-3 text-white placeholder:text-white/20
                      text-sm focus:outline-none focus:border-brand-500
                      focus:ring-1 focus:ring-brand-500/30 transition-all
                    "
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="
                  w-full bg-brand-gradient text-white font-semibold
                  py-3 rounded-xl flex items-center justify-center gap-2
                  shadow-brand hover:shadow-brand-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all active:scale-[0.98]
                "
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
